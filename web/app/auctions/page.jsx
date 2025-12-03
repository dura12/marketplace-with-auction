// import { AuctionGrid } from "components/auction/auction-grid"
// import { CategoryFilter } from "components/auction/category-filter"
// import { PriceFilter } from "components/auction/price-filter"
// import { SearchBar } from "components/auction/search-bar"
// import { StatusFilter } from "components/auction/status-filter"
// import { AuctionSlider } from "@/components/auction-slider"

// export default function Home() {
  
//   return (
//     <div className="container mx-auto px-4 py-8 justify-between">
//       <div className="grid grid-cols-1 gap-6">
//         <div className="mb-8">
//           <SearchBar />
//         </div>
//         <div className="mb-8">
//           <AuctionSlider/>
//         </div>
//       </div>  
        
//         <main>
//           <AuctionGrid />
//         </main>
        
//     </div>
//   )
// }

"use client";

import React, { useState, useEffect, useRef } from "react";
import { AuctionGrid } from "components/auction/auction-grid";
import { PriceFilter } from "components/auction/price-filter";
import { SearchBar } from "components/auction/search-bar";
import { StatusFilter } from "components/auction/status-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { AuctionSlider } from "@/components/auction-slider";

export default function Auctions() {
  const [itemsPerPage, setItemsPerPage] = useState(10);

  

  // Dynamically set items per page: 6 for mobile/tablet (<1024px), else 10
  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 1024 ? 6 : 10);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // State for filters and pagination
  const [auctionData, setAuctionData] = useState([]);
  const [totalAuctions, setTotalAuctions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRefs = useRef({});

  // Fetch auction data (mock implementation; replace with your API endpoint)
  const fetchAuctions = async (page = 1, limit = itemsPerPage) => {
    try {
      const response = await fetch(`/api/auctions?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch auctions");
      const data = await response.json();
      setAuctionData(data.auctions || []);
      setTotalAuctions(data.total || 0);
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setAuctionData([]);
      setTotalAuctions(0);
    }
  };


  useEffect(() => {
    fetchAuctions(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = (current, total, onChange) => (
    <div className="flex justify-center mt-4 gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="flex items-center px-2">
        Page {current} of {total}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  const totalPages = Math.ceil(totalAuctions / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8 justify-between min-h-screen">
      <div className="grid grid-cols-1 gap-6">

        {/* Search Form */}
        <div className="mb-8">
          <form className="flex gap-4 max-w-2xl w-full mx-auto">
            <Input
              type="search"
              placeholder="Search auctions..."
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Slider */}
        <div className="mb-8">
          <AuctionSlider/> {/* Adjust if using AuctionSlider */}
        </div>

        {/* Navigation */}
        <nav className="my-8">
          
          {totalPages > 1 &&
            renderPagination(currentPage, totalPages, setCurrentPage)}
        </nav>

        {/* Main Content */}
        <div className="space-y-12">
          <section ref={sectionRefs.current.all} className="scroll-mt-[90px]">
            <AuctionGrid auctions={auctionData} />
            {totalPages > 1 &&
              renderPagination(currentPage, totalPages, setCurrentPage)}
          </section>

          {/* Optional Filters (if needed) */}
          
        </div>

        {/* Scroll to Top Button */}
        <div className="fixed bottom-6 right-4 z-50">
          <Button variant="outline" size="icon" onClick={scrollToTop}>
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}