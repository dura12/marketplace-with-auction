"use client";

import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

const refundReasons = [
  "Product not as described",
  "Product damaged",
  "Wrong item received",
  "Product not received",
  "Better price found elsewhere",
  "Changed mind",
  "Other",
];

const statusColors = {
  Pending: "yellow",
  Dispatched: "blue",
  Received: "green",
  "Pending Refund": "red",
  Refunded: "gray",
  Paid: "green",
  "Paid To Merchant": "green",
};

export default function OrderDetailPage({ params }) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundDescription, setRefundDescription] = useState("");
  const [updatedCustomerDetails, setUpdatedCustomerDetails] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        const data = await response.json();
        if (data.success) {
          setOrder(data.order);
          setUpdatedCustomerDetails(data.order.customerDetail);
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to fetch order",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        toast({
          title: "Error",
          description: "Failed to fetch order",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id, toast]);

  const handleMarkAsReceived = async () => {
    try {
      const response = await fetch(`/api/order`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: order._id,
          status: "Received",
        }),
      });

      const data = await response.json();
      if (data.message === "Order updated successfully") {
        setOrder((prev) => ({
          ...prev,
          status: "Received",
        }));
        toast({
          title: "Success",
          description: "Order marked as received",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to mark order as received",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to mark order as received:", error);
      toast({
        title: "Error",
        description: "Failed to mark order as received",
        variant: "destructive",
      });
    }
  };

  const handleRefundSubmit = async () => {
    if (!refundReason) {
      toast({
        title: "Error",
        description: "Please select a refund reason",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/askrefund`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: order._id,
          reason: refundReason,
          description: refundDescription,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setOrder(data.order);
        setShowRefundDialog(false);
        setRefundReason("");
        setRefundDescription("");
        toast({
          title: "Success",
          description: data.message || "Refund request submitted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit refund request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to submit refund request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit refund request",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCustomerDetails = async () => {
    if (!updatedCustomerDetails) {
      toast({
        title: "Error",
        description: "Customer details are not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/orders/${params.id}/customer-details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCustomerDetails),
      });

      const data = await response.json();
      if (data.success) {
        setOrder((prev) => ({
          ...prev,
          customerDetail: updatedCustomerDetails,
        }));
        setShowUpdateDialog(false);
        toast({
          title: "Success",
          description: "Customer details updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update customer details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update customer details:", error);
      toast({
        title: "Error",
        description: "Failed to update customer details",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-4 text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 text-center">
        <p className="text-lg text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const canEditDetails = order.status === "Pending";
  const canRequestRefund = order.status !== "Received" && order.paymentStatus === "Paid";
  const canMarkAsReceived = order.status === "Dispatched";

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Order #{order.transactionRef}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Placed on {format(new Date(order.orderDate), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {canRequestRefund && (
            <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-sm sm:text-base"
                  aria-label="Request a refund"
                >
                  Request Refund
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-[90vw] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Refund</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Select value={refundReason} onValueChange={setRefundReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {refundReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Additional details about your refund request..."
                    value={refundDescription}
                    onChange={(e) => setRefundDescription(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button
                    onClick={handleRefundSubmit}
                    disabled={!refundReason}
                    className="w-full"
                    aria-label="Submit refund request"
                  >
                    Submit Refund Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {canMarkAsReceived && (
            <Button
              variant="outline"
              onClick={handleMarkAsReceived}
              className="w-full sm:w-auto text-sm sm:text-base"
              aria-label="Mark order as received"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Received
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Status and Details */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="rounded-lg border p-5 bg-card">
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={statusColors[order.status]} className="text-sm">
                  {order.status}
                </Badge>
                <Badge variant={statusColors[order.paymentStatus]} className="text-sm">
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between sm:justify-start gap-4">
                {["Pending", "Dispatched", "Received"].map((status) => (
                  <div key={status} className="flex flex-col items-center">
                    <div
                      className={`rounded-full p-2 ${
                        order.status === status
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {status === "Pending" && <Package className="h-5 w-5" />}
                      {status === "Dispatched" && <Truck className="h-5 w-5" />}
                      {status === "Received" && <CheckCircle className="h-5 w-5" />}
                    </div>
                    <span className="mt-2 text-xs sm:text-sm">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer and Merchant Details */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="rounded-lg border p-5 bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Customer Details</h2>
                {canEditDetails && (
                  <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" aria-label="Edit customer details">
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-[90vw] sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Update Customer Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="customerName">Name</Label>
                          <Input
                            id="customerName"
                            value={updatedCustomerDetails?.customerName || ""}
                            onChange={(e) =>
                              setUpdatedCustomerDetails((prev) => ({
                                ...prev,
                                customerName: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            value={updatedCustomerDetails?.phoneNumber || ""}
                            onChange={(e) =>
                              setUpdatedCustomerDetails((prev) => ({
                                ...prev,
                                phoneNumber: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customerEmail">Email</Label>
                          <Input
                            id="customerEmail"
                            value={updatedCustomerDetails?.customerEmail || ""}
                            onChange={(e) =>
                              setUpdatedCustomerDetails((prev) => ({
                                ...prev,
                                customerEmail: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={updatedCustomerDetails?.address?.state || ""}
                            onChange={(e) =>
                              setUpdatedCustomerDetails((prev) => ({
                                ...prev,
                                address: {
                                  ...prev?.address,
                                  state: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={updatedCustomerDetails?.address?.city || ""}
                            onChange={(e) =>
                              setUpdatedCustomerDetails((prev) => ({
                                ...prev,
                                address: {
                                  ...prev?.address,
                                  city: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <Button
                          onClick={handleUpdateCustomerDetails}
                          className="w-full"
                          aria-label="Save customer details"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <p className="truncate">{order.customerDetail.customerName}</p>
                <p className="truncate">{order.customerDetail.phoneNumber}</p>
                <p className="truncate">{order.customerDetail.customerEmail}</p>
                <p className="truncate">
                  {order.customerDetail.address.city}, {order.customerDetail.address.state}
                </p>
              </div>
            </div>

            {/* Merchant Details */}
            <div className="rounded-lg border p-5 bg-card">
              <h2 className="text-lg font-semibold mb-4">Merchant Details</h2>
              <div className="space-y-2 text-sm">
                <p className="truncate">{order.merchantDetail.merchantName}</p>
                <p className="truncate">{order.merchantDetail.phoneNumber}</p>
                <p className="truncate">{order.merchantDetail.merchantEmail}</p>
                {order.merchantDetail.merchantReference && (
                  <p className="truncate">Ref: {order.merchantDetail.merchantReference}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items and Refund Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="rounded-lg border bg-card">
            <div className="p-5 border-b">
              <h2 className="text-lg font-semibold">Order Items</h2>
            </div>
            <div className="divide-y">
              {order.products.map((product) => (
                <div
                  key={product.productId}
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-sm sm:text-base truncate">
                      {product.productName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {product.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Delivery: {product.delivery} (${product.deliveryPrice.toFixed(2)})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm sm:text-base">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total: ${(product.price * product.quantity + product.deliveryPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t bg-muted/20">
              <div className="flex justify-between font-medium text-sm sm:text-base">
                <span>Total Amount</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Refund Information */}
          {order.refundReason && (
            <div className="rounded-lg border p-5 bg-card">
              <h2 className="text-lg font-semibold mb-4">Refund Information</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Reason:</span>{" "}
                  <span className="break-words">{order.refundReason}</span>
                </p>
                {order.refundDescription && (
                  <p>
                    <span className="font-medium">Description:</span>{" "}
                    <span className="break-words">{order.refundDescription}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}