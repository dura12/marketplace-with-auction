"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

interface Auction {
  id: string;
  productId: string;
  merchantId: string;
  description: string;
  condition: "new" | "used";
  startTime: string;
  endTime: string;
  itemImg: string[];
  startingPrice: number;
  reservedPrice: number;
  bidIncrement: number;
  status: "pending" | "active" | "ended" | "cancelled";
  adminApproval: "pending" | "approved" | "rejected";
  paymentDuration: number;
  totalQuantity: number;
  remainingQuantity: number;
  buyByParts: boolean;
  category: string;
  productName?: string;
  merchantName?: string;
  currentBid?: number;
  bidCount?: number;
  banReason?: { reason: string; description: string };
}

interface AuctionDetailsDialogProps {
  auction: Auction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuctionDetailsDialog({
  auction,
  open,
  onOpenChange,
}: AuctionDetailsDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionCategory, setRejectionCategory] =
    useState("policy_violation");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      // Simulate approveAuction (no API)
      console.log("Approving auction:", auction.id);
      setShowApproveDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      // Simulate rejectAuction (no API)
      console.log("Rejecting auction:", auction.id, {
        reason: rejectionCategory,
        description: rejectionReason,
      });
      setShowRejectDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Rejection failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const nextImage = () => {
    if (auction.itemImg && auction.itemImg.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % auction.itemImg.length);
    }
  };

  const prevImage = () => {
    if (auction.itemImg && auction.itemImg.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + auction.itemImg.length) % auction.itemImg.length
      );
    }
  };

  const statusProps = {
    pending: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <Clock className="h-4 w-4 mr-1" />,
    },
    active: {
      color: "bg-green-100 text-green-800 border-green-300",
      icon: <CheckCircle className="h-4 w-4 mr-1" />,
    },
    ended: {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <CheckCircle className="h-4 w-4 mr-1" />,
    },
    cancelled: {
      color: "bg-red-100 text-red-800 border-red-300",
      icon: <XCircle className="h-4 w-4 mr-1" />,
    },
  };

  const approvalProps = {
    pending: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <Clock className="h-4 w-4 mr-1" />,
    },
    approved: {
      color: "bg-green-100 text-green-800 border-green-300",
      icon: <CheckCircle className="h-4 w-4 mr-1" />,
    },
    rejected: {
      color: "bg-red-100 text-red-800 border-red-300",
      icon: <XCircle className="h-4 w-4 mr-1" />,
    },
  };

  return (
    <>
      <Dialog
        open={open && !showRejectDialog && !showApproveDialog}
        onOpenChange={onOpenChange}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Auction Details</span>
              <div className="flex gap-2">
                <Badge
                  className={`${
                    statusProps[auction.status].color
                  } flex items-center px-2 py-1 text-xs`}
                >
                  {statusProps[auction.status].icon}
                  {auction.status.charAt(0).toUpperCase() +
                    auction.status.slice(1)}
                </Badge>
                <Badge
                  className={`${
                    approvalProps[auction.adminApproval].color
                  } flex items-center px-2 py-1 text-xs`}
                >
                  {approvalProps[auction.adminApproval].icon}
                  {auction.adminApproval.charAt(0).toUpperCase() +
                    auction.adminApproval.slice(1)}
                </Badge>
              </div>
            </DialogTitle>
            <DialogDescription>
              View and manage auction information
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="bids">Bids</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Product ID</Label>
                  <div className="text-sm mt-1">{auction.productId}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Merchant ID</Label>
                  <div className="text-sm mt-1">{auction.merchantId}</div>
                </div>
                {auction.productName && (
                  <div>
                    <Label className="text-sm font-medium">Product Name</Label>
                    <div className="text-sm mt-1">{auction.productName}</div>
                  </div>
                )}
                {auction.merchantName && (
                  <div>
                    <Label className="text-sm font-medium">Merchant Name</Label>
                    <div className="text-sm mt-1">{auction.merchantName}</div>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="text-sm mt-1 capitalize">
                    {auction.category}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Condition</Label>
                  <div className="text-sm mt-1 capitalize">
                    {auction.condition}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Start Time</Label>
                  <div className="text-sm mt-1">
                    {new Date(auction.startTime).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">End Time</Label>
                  <div className="text-sm mt-1">
                    {new Date(auction.endTime).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Starting Price</Label>
                  <div className="text-sm mt-1">
                    ${auction.startingPrice.toFixed(2)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reserved Price</Label>
                  <div className="text-sm mt-1">
                    ${auction.reservedPrice.toFixed(2)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Bid Increment</Label>
                  <div className="text-sm mt-1">
                    ${auction.bidIncrement.toFixed(2)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Payment Duration
                  </Label>
                  <div className="text-sm mt-1">
                    {auction.paymentDuration} hours
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Quantity</Label>
                  <div className="text-sm mt-1">{auction.totalQuantity}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Remaining Quantity
                  </Label>
                  <div className="text-sm mt-1">
                    {auction.remainingQuantity}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Buy by Parts</Label>
                  <div className="text-sm mt-1">
                    {auction.buyByParts ? "Yes" : "No"}
                  </div>
                </div>
                {auction.currentBid && (
                  <div>
                    <Label className="text-sm font-medium">Current Bid</Label>
                    <div className="text-sm mt-1">
                      ${auction.currentBid.toFixed(2)} ({auction.bidCount || 0}{" "}
                      bids)
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <div className="text-sm mt-1 p-3 bg-muted rounded-md">
                  {auction.description}
                </div>
              </div>

              {auction.adminApproval === "rejected" && auction.banReason && (
                <div className="mt-4 border border-red-200 bg-red-50 p-4 rounded-md">
                  <Label className="text-sm font-medium text-red-800">
                    Rejection Reason
                  </Label>
                  <div className="text-sm mt-2 text-red-700">
                    <div className="font-medium">
                      Category:{" "}
                      {auction.banReason.reason
                        .replace("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </div>
                    <div className="mt-1">{auction.banReason.description}</div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="images">
              <div className="relative">
                {auction.itemImg && auction.itemImg.length > 0 ? (
                  <div className="relative border rounded-md overflow-hidden">
                    <img
                      src={
                        auction.itemImg[currentImageIndex] || "/placeholder.svg"
                      }
                      alt={`Auction image ${currentImageIndex + 1}`}
                      className="w-full h-64 md:h-80 object-contain bg-gray-50"
                    />
                    {auction.itemImg.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous image</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next image</span>
                        </Button>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                          {currentImageIndex + 1} / {auction.itemImg.length}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                    <span className="text-muted-foreground">
                      No images available
                    </span>
                  </div>
                )}
                {auction.itemImg && auction.itemImg.length > 1 && (
                  <div className="flex mt-4 gap-2 overflow-x-auto pb-2">
                    {auction.itemImg.map((img, index) => (
                      <button
                        key={index}
                        className={`relative flex-shrink-0 w-16 h-16 border-2 rounded-md overflow-hidden ${
                          index === currentImageIndex
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bids">
              {["active", "ended"].includes(auction.status) &&
              auction.bidCount &&
              auction.bidCount > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Bid History</h3>
                    <span className="text-sm text-muted-foreground">
                      {auction.bidCount} bids total
                    </span>
                  </div>
                  <div className="border rounded-md divide-y">
                    {Array.from({ length: Math.min(auction.bidCount, 5) }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="p-3 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">
                              Bidder{" "}
                              {auction.bidCount ? auction.bidCount - i : 0}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(
                                new Date(auction.endTime).getTime() -
                                  i * 3600000
                              ).toLocaleString()}
                            </div>
                          </div>
                          <div className="font-medium text-green-600">
                            $
                            {(
                              auction.currentBid! -
                              i * auction.bidIncrement
                            ).toFixed(2)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {auction.status === "pending"
                    ? "Bids cannot be placed until the auction is approved."
                    : auction.status === "cancelled"
                    ? "This auction was cancelled and cannot receive bids."
                    : auction.bidCount === 0
                    ? "No bids have been placed on this auction yet."
                    : "Bid history is unavailable."}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
            {auction.adminApproval === "pending" && (
              <>
                <Button
                  onClick={() => setShowApproveDialog(true)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Auction
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Auction
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Auction</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this auction. This
              information will be recorded and may be shared with the merchant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="rejection-category">Rejection Category</Label>
              <Select
                value={rejectionCategory}
                onValueChange={setRejectionCategory}
              >
                <SelectTrigger id="rejection-category">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="policy_violation">
                    Policy Violation
                  </SelectItem>
                  <SelectItem value="inappropriate_content">
                    Inappropriate Content
                  </SelectItem>
                  <SelectItem value="pricing_issue">Pricing Issue</SelectItem>
                  <SelectItem value="product_quality">
                    Product Quality
                  </SelectItem>
                  <SelectItem value="incomplete_information">
                    Incomplete Information
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Provide detailed reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this auction? This will make it
              active and allow bidding to begin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? "Approving..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
