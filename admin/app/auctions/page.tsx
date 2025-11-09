"use client";

import { useState, useEffect, Key } from "react";
import {
  Search,
  Calendar,
  DollarSign,
  X,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Sidebar } from "@/components/sidebar";
import { AuctionDetailsDialog } from "@/components/auctions/auction-details-dialog";
import { PaginationControls } from "@/components/auctions/pagination-controls";
import { Auction } from "@/utils/typeDefinitions";

export default function AuctionsPageClient() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [adminApproval, setAdminApproval] = useState("all");
  const [condition, setCondition] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [priceRange, setPriceRange] = useState([0, 1000000000]);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  const itemsPerPage = 10;

  const fetchAuctions = async () => {
    try {
      const res = await fetch("/api/manageAuctions");
      if (!res.ok) throw new Error("Failed to fetch auctions");
      const data = await res.json();
      console.log("Auction data: ", data);
      setAuctions(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching auctions:", error.message);
      } else {
        console.error("Unknown error:", error);
      }
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch("/api/manageAuctions");
        if (!res.ok) throw new Error("Failed to fetch auctions");
        const data = await res.json();
        console.log("Auction data: ", data);
        setAuctions(data);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching auctions:", error.message);
        } else {
          console.error("Unknown error:", error);
        }
      }
    };

    fetchAuctions();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = auctions;

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (auction) =>
          auction.description.toLowerCase().includes(lowerSearch) ||
          auction.category.toLowerCase().includes(lowerSearch) ||
          auction.productName.toLowerCase().includes(lowerSearch)
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((auction) => auction.status === status);
    }

    if (adminApproval !== "all") {
      filtered = filtered.filter(
        (auction) => auction.adminApproval === adminApproval
      );
    }

    if (condition !== "all") {
      filtered = filtered.filter((auction) => auction.condition === condition);
    }

    if (dateRange.from) {
      filtered = filtered.filter((auction) => {
        const start = new Date(auction.startTime);
        const end = new Date(auction.endTime);
        const from = dateRange.from!;
        const to = dateRange.to || from;
        return start >= from && end <= to;
      });
    }

    filtered = filtered.filter(
      (auction) =>
        auction.startingPrice >= priceRange[0] &&
        auction.startingPrice <= priceRange[1]
    );

    setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
    if (currentPage > Math.ceil(filtered.length / itemsPerPage)) {
      setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    setFilteredAuctions(filtered.slice(startIndex, startIndex + itemsPerPage));
  }, [
    auctions,
    search,
    status,
    adminApproval,
    condition,
    dateRange,
    priceRange,
    currentPage,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
    setCurrentPage(1);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setSelectedAuction(null);
    if (!open) {
      fetchAuctions(); // Refetch auctions when dialog closes
    }
  };

  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setAdminApproval("all");
    setCondition("all");
    setDateRange({});
    setPriceRange([0, 1000000000]);
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Sidebar />
      <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">
              Auction Management
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                <span className="hidden md:inline">Total </span>Auctions:{" "}
                {auctions.length}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <form
                onSubmit={handleSearch}
                className="flex flex-1 items-center gap-2"
              >
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by description, category, product..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm">
                  Search
                </Button>
              </form>

              <div className="grid md:grid-cols-5 grid-cols-2 items-center gap-2">
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={adminApproval}
                  onValueChange={(value) => {
                    setAdminApproval(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Admin Approval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Approvals</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={condition}
                  onValueChange={(value) => {
                    setCondition(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL d, y")} -{" "}
                            {format(dateRange.to, "LLL d, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL d, y")
                        )
                      ) : (
                        "Date Range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={handleDateChange}
                      initialFocus
                      required className={undefined} classNames={undefined}                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Price Range
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">
                          Price Range
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Set the minimum and maximum price
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="price-min">Min</Label>
                            <Input
                              id="price-min"
                              value={priceRange[0]}
                              onChange={(e) =>
                                handlePriceRangeChange([
                                  Number(e.target.value),
                                  priceRange[1],
                                ])
                              }
                              type="number"
                              min={0}
                            />
                          </div>
                          <div>
                            <Label htmlFor="price-max">Max</Label>
                            <Input
                              id="price-max"
                              value={priceRange[1]}
                              onChange={(e) =>
                                handlePriceRangeChange([
                                  priceRange[0],
                                  Number(e.target.value),
                                ])
                              }
                              type="number"
                              min={0}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {(search ||
                  status !== "all" ||
                  adminApproval !== "all" ||
                  condition !== "all" ||
                  dateRange.from ||
                  priceRange[0] !== 0 ||
                  priceRange[1] !== 1000000000) && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader className="p-4">
              <CardTitle>All Auctions</CardTitle>
              <CardDescription>
                Manage all auctions in the marketplace system
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auction</TableHead>
                    <TableHead>
                      <span className="inline md:hidden">Price</span>
                      <span className="hidden md:inline">Start Price</span>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Reserved Price
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Start/End Time
                    </TableHead>
                    <TableHead>
                      <span className="inline md:hidden">Bid</span>
                      <span className="hidden md:inline">Current Bid</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuctions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No auctions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAuctions.map((auction) => (
                      <TableRow
                        key={auction._id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedAuction(auction)}
                      >
                        <TableCell className="font-medium">
                          {auction.auctionTitle || "N/A"}
                        </TableCell>
                        <TableCell>
                          ${auction.startingPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          ${auction.reservedPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {auction.status === "pending" && (
                            <span className="flex items-center text-yellow-500">
                              <Clock className="mr-1 h-4 w-4" /> Pending
                            </span>
                          )}
                          {auction.status === "active" && (
                            <span className="flex items-center text-green-500">
                              <CheckCircle className="mr-1 h-4 w-4" /> Active
                            </span>
                          )}
                          {auction.status === "ended" && (
                            <span className="flex items-center text-blue-500">
                              <CheckCircle className="mr-1 h-4 w-4" /> Ended
                            </span>
                          )}
                          {auction.status === "cancelled" && (
                            <span className="flex items-center text-red-500">
                              <XCircle className="mr-1 h-4 w-4" /> Cancelled
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(auction.startTime).toLocaleDateString()} -{" "}
                          {new Date(auction.endTime).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {auction.currentBid
                            ? `$${auction.currentBid.toFixed(2)} (${
                                auction.bidCount || 0
                              } bids)`
                            : "No bids"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <PaginationControls
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}

          {selectedAuction && (
            <AuctionDetailsDialog
              auction={selectedAuction}
              open={!!selectedAuction}
              onOpenChange={handleDialogOpenChange}
              onAction={function (
                type: "approve" | "reject",
                auctionId: string,
                rejectionReason?: string
              ): void {
                throw new Error("Function not implemented.");
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
