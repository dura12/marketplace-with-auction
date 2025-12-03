"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"
import { MyAuctionCard } from "@/components/auction/my-auctions-card"
import { useRouter } from "next/navigation"

export default function MyAuctionsPage() {
  const [searchQuery, setSearchQuery] = useState(() => {
    console.log("Initializing searchQuery state: ", "");
    return "";
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    console.log("Initializing statusFilter state: ", "all");
    return "all";
  });
  const [sortOption, setSortOption] = useState(() => {
    console.log("Initializing sortOption state: ", "ending-soon");
    return "ending-soon";
  });
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(() => {
    console.log("Initializing showFilters state: ", false);
    return false;
  });
  const [data, setData] = useState(() => {
    console.log("Initializing data state: ", { participated: [], activeBids: [], won: [], lost: [] });
    return { participated: [], activeBids: [], won: [], lost: [] };
  });
  const [loading, setLoading] = useState(() => {
    console.log("Initializing loading state: ", true);
    return true;
  });

  useEffect(() => {
    async function fetchAuctions() {
      setLoading(true);
      const res = await fetch("/api/fetchAuctions/auctionById");
      if (res.ok) {
        const json = await res.json();
        console.log("datann: ", data);
        setData(json);
      }
      setLoading(false);
    }
    fetchAuctions();
  }, []);

  // Define baseArray with "ended" combining won and lost auctions
  const baseArray = (() => {
    const result = {
      all: data.participated,
      active: data.activeBids,
      won: data.won,
      lost: data.lost,
      ended: [...(data.won || []), ...(data.lost || [])],
    }[statusFilter] || [];
    return result;
  })();

  // Filter by search query
  const filtered = (() => {
    const result = baseArray.filter(auction => {
      const matchesSearch =
        (auction.auctionTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (auction.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    return result;
  })();

  // Sort according to sortOption
  const sorted = (() => {
    const result = filtered.sort((a, b) => {
      if (sortOption === "ending-soon") {
        if (a.status !== "active" && b.status === "active") return 1;
        if (a.status === "active" && b.status !== "active") return -1;
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      }
      if (sortOption === "newest") {
        return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
      }
      if (sortOption === "highest-bid") {
        return (b.highestBid || 0) - (a.highestBid || 0);
      }
      if (sortOption === "most-bids") {
        return (b.totalQuantity || 0) - (a.totalQuantity || 0);
      }
      return 0;
    });
    console.log("Sorted auctions: ", result);
    return result;
  })();

  const handleAuctionClick = (auction) => {
    router.push(`/auctions/${auction._id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Auctions</h1>
        <p className="text-muted-foreground mt-1">Track and manage auctions you're participating in</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your auctions..."
            className="pl-9 pr-4"
            value={searchQuery}
            onChange={(e) => {
              console.log("Search query changed to: ", e.target.value);
              setSearchQuery(e.target.value);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            onClick={() => {
              console.log("Toggling filters, new state: ", !showFilters);
              setShowFilters(!showFilters);
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <div className={`flex-1 sm:flex items-center gap-2 ${showFilters ? "flex" : "hidden"}`}>
            <Select value={statusFilter} onValueChange={(val) => {
              console.log("Status filter changed to: ", val);
              setStatusFilter(val);
            }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Auctions</SelectItem>
                <SelectItem value="active">Active Bids</SelectItem>
                <SelectItem value="won">Won Auctions</SelectItem>
                <SelectItem value="lost">Lost Auctions</SelectItem>
                <SelectItem value="ended">Ended Auctions</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={(val) => {
              console.log("Sort option changed to: ", val);
              setSortOption(val);
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="highest-bid">Highest Bid</SelectItem>
                <SelectItem value="most-bids">Most Bids</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        onValueChange={(val) => {
          console.log("Tabs value changed to: ", val);
          setStatusFilter(val);
        }}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Auctions</TabsTrigger>
          <TabsTrigger value="active">Active Bids</TabsTrigger>
          <TabsTrigger value="won">Won</TabsTrigger>
          <TabsTrigger value="lost">Lost</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="text-center py-12">
            <p>Rendering loading state...</p>
          </div>
        ) : sorted.length > 0 ? (
          <TabsContent value={statusFilter} className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {sorted.map((auction) => (
                <MyAuctionCard
                  key={auction._id}
                  auction={auction}
                  onClick={() => handleAuctionClick(auction)}
                />
              ))}
            </div>
          </TabsContent>
        ) : (
          <TabsContent value={statusFilter} className="mt-0 text-center py-12">
            <h3 className="text-lg font-medium">No auctions found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
            <p>Rendering no auctions for tab: {statusFilter}</p>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}