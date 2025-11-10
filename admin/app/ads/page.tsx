"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdsTable } from "@/components/ads/ads-table";
import { AdsFilter } from "@/components/ads/ads-filter";
import { Sidebar } from "@/components/sidebar";

interface LocationData {
  center: { lat: number; lng: number };
  radius: number;
}

export default function AdsManagementPage() {
  const [allAds, setAllAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    approvalStatus: "",
    paymentStatus: "",
    merchantName: "",
    searchTerm: "",
    isActive: "",
    dateRange: {
      from: "",
      to: "",
    },
  });
  const [activeTab, setActiveTab] = useState("all");
  const [location, setLocation] = useState<LocationData | null>(null);

  const fetchAds = async (params: any = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append("status", params.status);
      if (params.center) queryParams.append("center", params.center);
      if (params.radius) queryParams.append("radius", params.radius.toString());
      queryParams.append("page", "1");
      queryParams.append("limit", "100");

      const response = await fetch(`/api/manageAds?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch ads");
      const data = await response.json();
      return data.ads || [];
    } catch (error) {
      console.error("Error fetching ads:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadAds = async () => {
      setIsLoading(true);
      try {
        let fetchParams: any = {};
        if (location) {
          fetchParams.center = `${location.center.lat}-${location.center.lng}`;
          fetchParams.radius = location.radius;
        }
        const adsData = await fetchAds(fetchParams);
        setAllAds(adsData);
      } catch (error) {
        console.error("Failed to fetch ads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAds();
  }, [location]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      let fetchParams: any = {};
      if (location) {
        fetchParams.center = `${location.center.lat}-${location.center.lng}`;
        fetchParams.radius = location.radius;
      }
      const adsData = await fetchAds(fetchParams);
      setAllAds(adsData);
    } catch (error) {
      console.error("Failed to fetch ads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = ({ center, radius }: LocationData) => {
    if (
      location?.center.lat !== center.lat ||
      location?.center.lng !== center.lng ||
      location?.radius !== radius
    ) {
      setLocation({ center, radius });
    }
  };
  
  const filteredAds = useMemo(() => {
    return allAds.filter((ad) => {
      // Filter by tab
      if (activeTab === "pending" && ad.approvalStatus !== "PENDING") return false;
      if (activeTab === "approved" && ad.approvalStatus !== "APPROVED") return false;
      if (activeTab === "rejected" && ad.approvalStatus !== "REJECTED") return false;
  
      // Approval Status filter (for 'all' tab mostly)
      if (
        filters.approvalStatus &&
        filters.approvalStatus !== "ALL" &&
        ad.approvalStatus !== filters.approvalStatus
      ) return false;
  
      // Payment Status filter
      if (
        filters.paymentStatus &&
        filters.paymentStatus !== "ALL" &&
        ad.paymentStatus !== filters.paymentStatus
      ) return false;
  
      // Merchant name filter
      if (
        filters.merchantName &&
        !ad.merchantDetail?.merchantName?.toLowerCase().includes(filters.merchantName.toLowerCase())
      ) return false;
  
      // Active Status filter (only apply if it's specifically set)
      if (
        filters.isActive !== undefined &&
        filters.isActive !== "" &&
        filters.isActive !== "ALL"
      ) {
        const isActiveBool = filters.isActive === "true";
        if (ad.isActive !== isActiveBool) return false;
      }
  
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesProduct = ad.product?.productName?.toLowerCase()?.includes(searchLower) || false;
        const matchesMerchant = ad.merchantDetail?.merchantName?.toLowerCase()?.includes(searchLower) || false;
        if (!matchesProduct && !matchesMerchant) return false;
      }
  
      // From date filter
      if (filters.dateRange.from && ad.createdAt) {
        const fromDate = new Date(filters.dateRange.from);
        const adDate = new Date(ad.createdAt);
        if (adDate < fromDate) return false;
      }
  
      // To date filter
      if (filters.dateRange.to && ad.createdAt) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Include the whole day
        const adDate = new Date(ad.createdAt);
        if (adDate > toDate) return false;
      }
  
      return true;
    });
  }, [allAds, filters, activeTab]);
  

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Sidebar />
      <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
        <main className="flex flex-1 flex-col gap-4 p-2 sm:p-4 md:gap-8 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ads Management</h1>
            <div className="flex items-center gap-2">
              {/* <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh
              </Button> */}
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between overflow-auto">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All Ads</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
                <TabsTrigger value="approved" className="text-xs sm:text-sm">Approved</TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs sm:text-sm">Rejected</TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-4">
              <AdsFilter onFilterChange={handleFilterChange} isLoading={isLoading} onLocationChange={handleLocationChange} />
            </div>

            <div className="mt-4">
              <TabsContent value="all">
                <AdsTable ads={filteredAds} isLoading={isLoading} onRefresh={handleRefresh} />
              </TabsContent>
              <TabsContent value="pending">
                <AdsTable ads={filteredAds} isLoading={isLoading} onRefresh={handleRefresh} />
              </TabsContent>
              <TabsContent value="approved">
                <AdsTable ads={filteredAds} isLoading={isLoading} onRefresh={handleRefresh} />
              </TabsContent>
              <TabsContent value="rejected">
                <AdsTable ads={filteredAds} isLoading={isLoading} onRefresh={handleRefresh} />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}