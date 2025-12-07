"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CreateAuctionDialog } from "./create-auction";
import { FilterBar } from "../filterBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/libs/utils";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditAuctionForm } from "./editAuctionForm";
import { useToast } from "@/components/ui/use-toast";

export default function MerchantAuctions() {
  const router = useRouter();
  const { toast } = useToast();
  const [sortColumn, setSortColumn] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [sortDirection, setSortDirection] = useState("asc");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isEditAuctionOpen, setIsEditAuctionOpen] = useState(false);
  const [auctionToEdit, setAuctionToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/auctions", { credentials: "include" });
      const data = await response.json();
      if (response.ok) {
        setAuctions(data);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch auctions",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred while fetching auctions",
        variant: "destructive",
      });
      setError(err.message);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch = (auction.productName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || auction.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesApproval = approvalFilter === "all" || auction.adminApproval.toLowerCase() === approvalFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const handleSearch = (query) => setSearchQuery(query);
  const handleStatusFilterChange = (value) => setStatusFilter(value);
  const handleApprovalFilterChange = (value) => setApprovalFilter(value);

  const statusFilters = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "cancelled", label: "Cancelled" },
    { value: "ended", label: "Ended" },
  ];

  const approvalFilters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
    { value: "approved", label: "Approved" },
  ];

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleAuctionClick = (auction) => router.push(`/dashboard/auctions/${auction._id}`);
  const handleDeleteAuction = (auction, e) => {
    e.stopPropagation();
    setSelectedAuction(auction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    const payload = { auctionId: selectedAuction._id };
    try {
      const response = await fetch('/api/auctions', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setAuctions(auctions.filter((auction) => auction._id !== selectedAuction._id));
        toast({ title: "Success", description: `${selectedAuction.productName} auction has been deleted successfully.` });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete auction");
      }
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to delete auction", variant: "destructive" });
    }
    setIsDeleteDialogOpen(false);
    setSelectedAuction(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-success/10 text-success";
      case "ended": return "bg-muted";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted";
    }
  };

  const getApprovalBadgeClass = (approval) => {
    switch (approval?.toLowerCase()) {
      case "approved": return "bg-success/10 text-success";
      case "pending": return "bg-warning/10 text-warning";
      case "rejected": return "bg-destructive/10 text-destructive";
      default: return "bg-muted";
    }
  };

  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "N/A");

  if (loading) {
    return (
      <div className="container p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-4">Loading auctions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-6">
        <div className="bg-destructive/10 p-4 rounded-lg flex flex-col items-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => { setLoading(true); fetchAuctions(); }} variant="outline">Retry Loading</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Auctions</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your upcoming and active auctions</p>
      </div>
      <FilterBar
        placeholder="Search auctions..."
        filters={statusFilters}
        approvalFilters={approvalFilters}
        onSearch={handleSearch}
        onFilterChange={handleStatusFilterChange}
        onApprovalFilterChange={handleApprovalFilterChange}
      />
      <div className="rounded-xl border bg-card p-4 md:p-6 mt-4">
        <div className="flex sm:flex-row items-center justify-end mb-4">
          <CreateAuctionDialog onAuctionCreated={() => fetchAuctions()} />
        </div>
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[600px] w-full">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead onClick={() => handleSort("condition")}>Condition</TableHead>
                <TableHead onClick={() => handleSort("status")}>Status</TableHead>
                <TableHead onClick={() => handleSort("adminApproval")}>Approval</TableHead>
                <TableHead onClick={() => handleSort("startingPrice")}>Starting Price</TableHead>
                <TableHead onClick={() => handleSort("endTime")}>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {filteredAuctions.map((auction) => (
                <TableRow
                  key={auction._id}
                  onClick={() => handleAuctionClick(auction)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <Image
                        src={auction.itemImg?.[0] || "/placeholder.svg"}
                        alt={auction.productName || "Auction item"}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                      <span className="font-medium text-sm sm:text-base">{auction.productName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{auction.condition}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs sm:text-sm font-medium", getStatusBadgeClass(auction.status))}>
                      {auction.status}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs sm:text-sm font-medium", getApprovalBadgeClass(auction.adminApproval))}>
                      {auction.adminApproval}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${auction.startingPrice.toFixed(2)}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(auction.endTime)}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); setAuctionToEdit(auction); setIsEditAuctionOpen(true); }}
                          disabled={auction.adminApproval === "approved"}
                          className={auction.adminApproval === "approved" ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit Auction
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteAuction(auction, e)}>
                          <Trash className="mr-2 h-4 w-4" /> Cancel Auction
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to cancel this auction?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently cancel the auction for "{selectedAuction?.productName}" and notify any bidders.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {auctionToEdit && (
          <EditAuctionForm
            open={isEditAuctionOpen}
            onOpenChange={setIsEditAuctionOpen}
            auction={auctionToEdit}
            onAuctionUpdated={() => { setLoading(true); fetchAuctions(); }}
          />
        )}
      </div>
    </div>
  );
}