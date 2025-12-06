"use client"

import { useState, useEffect } from "react"
import { Package, Truck, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { useSession } from "next-auth/react"

// Demo data based on schema
const demoOrder = {
  id: "order-1",
  customerDetail: {
    customerId: "1",
    customerName: "John Doe",
    phoneNumber: "+1234567890",
    customerEmail: "john@example.com",
    address: {
      state: "California",
      city: "Los Angeles",
    },
  },
  merchantDetail: {
    merchantId: "1",
    merchantName: "Tech Store",
    merchantEmail: "store@example.com",
    phoneNumber: "+1234567890",
    account_name: "Tech Store Ltd",
    account_number: "1234567890",
    merchantRefernce: "MERCH-123",
    bank_code: "001",
  },
  products: [
    {
      productId: "1",
      productName: "iPhone 15 Pro",
      quantity: 1,
      price: 999.99,
      delivery: "FLAT",
      deliveryPrice: 10,
    },
    {
      productId: "2",
      productName: "AirPods Pro",
      quantity: 1,
      price: 249.99,
      delivery: "FLAT",
      deliveryPrice: 5,
    },
  ],
  totalPrice: 1264.98,
  status: "Pending",
  paymentStatus: "Paid",
  location: {
    type: "Point",
    coordinates: [-118.2437, 34.0522],
  },
  transactionRef: "TRX-123456789",
  orderDate: new Date(),
}

const refundReasons = [
  "Product not as described",
  "Product damaged",
  "Wrong item received",
  "Product not received",
  "Better price found elsewhere",
  "Changed mind",
  "Other",
]

const statusColors = {
  Pending: "yellow",
  Dispatched: "blue",
  Received: "green",
  "Pending Refund": "red",
  Refunded: "gray",
  Paid: "green",
  "Paid To Merchant": "green",
}

export default function OrderDetailPage({ params }) {
  const { data: session } = useSession()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [refundReason, setRefundReason] = useState("")
  const [refundDescription, setRefundDescription] = useState("")
  const [updatedCustomerDetails, setUpdatedCustomerDetails] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        const data = await response.json()
        if (data.success) {
          setOrder(data.order)
          setUpdatedCustomerDetails(data.order.customerDetail)
        }
      } catch (error) {
        console.error("Failed to fetch order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  const handleRefundSubmit = async () => {
    if (!refundReason) return

    try {
      const response = await fetch(`/api/orders/${params.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reason: refundReason, 
          description: refundDescription 
        }),
      })

      const data = await response.json()
      if (data.success) {
        setOrder(prev => ({
          ...prev,
          paymentStatus: "Pending Refund",
          refundReason,
        }))
        setShowRefundDialog(false)
      }
    } catch (error) {
      console.error("Failed to submit refund request:", error)
    }
  }

  const handleUpdateCustomerDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}/customer-details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCustomerDetails),
      })

      const data = await response.json()
      if (data.success) {
        setOrder(prev => ({
          ...prev,
          customerDetail: updatedCustomerDetails,
        }))
        setShowUpdateDialog(false)
      }
    } catch (error) {
      console.error("Failed to update customer details:", error)
    }
  }

  const handleDispatch = async () => {
    try {
      const response = await fetch(`/api/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: order._id,
          status: 'Dispatched'
        }),
      })

      const data = await response.json()
      if (data.message === "Order updated successfully") {
        setOrder(prev => ({
          ...prev,
          status: 'Dispatched'
        }))
      }
    } catch (error) {
      console.error("Failed to dispatch order:", error)
    }
  }

  if (loading) {
    return (
      <div className="container p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-4">Loading...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div>Order not found</div>
  }

  const isCustomer = session?.user?.role === 'customer'
  const isMerchant = session?.user?.role === 'merchant'
  const canRequestRefund = isCustomer && order.status === 'Pending' && order.paymentStatus === 'Paid'
  const canEditDetails = isCustomer && order.status === 'Pending'
  const canDispatch = isMerchant && order.status === 'Pending'

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order {order.transactionRef}</h1>
          <p className="text-muted-foreground">Placed on {format(new Date(order.orderDate), "MMMM d, yyyy")}</p>
        </div>
        {canRequestRefund && (
          <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">Request Refund</Button>
            </DialogTrigger>
            <DialogContent>
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
                />
                <Button onClick={handleRefundSubmit} disabled={!refundReason}>
                  Submit Refund Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold mb-4">Order Status</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                <Badge variant={statusColors[order.paymentStatus]}>{order.paymentStatus}</Badge>
                {canDispatch && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDispatch}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Dispatch Order
                  </Button>
                )}
              </div>
              <div className="relative flex gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full p-2 ${
                      order.status === "Pending" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="mt-2 text-sm">Pending</div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full p-2 ${
                      order.status === "Dispatched" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="mt-2 text-sm">Dispatched</div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full p-2 ${
                      order.status === "Received" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div className="mt-2 text-sm">Received</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold whitespace-nowrap">Customer Details</h2>
                {canEditDetails && (
                  <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Customer Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="customerName">Name</Label>
                          <Input
                            id="customerName"
                            value={updatedCustomerDetails.customerName}
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
                            value={updatedCustomerDetails.phoneNumber}
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
                            value={updatedCustomerDetails.customerEmail}
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
                            value={updatedCustomerDetails.address.state}
                            onChange={(e) =>
                              setUpdatedCustomerDetails((prev) => ({
                                ...prev,
                                address: {
                                  ...prev.address,
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
                            value={updatedCustomerDetails.address.city}
                            onChange={(e) =>
                              setUpdatedCustomerDetails((prev) => ({
                                ...prev,
                                address: {
                                  ...prev.address,
                                  city: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <Button onClick={handleUpdateCustomerDetails} className="w-full">
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="space-y-2">
                <p>{order.customerDetail.customerName}</p>
                <p>{order.customerDetail.phoneNumber}</p>
                <p>{order.customerDetail.customerEmail}</p>
                <p>
                  {order.customerDetail.address.city}, {order.customerDetail.address.state}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h2 className="font-semibold mb-4">Merchant Details</h2>
              <div className="space-y-2">
                <p>{order.merchantDetail.merchantName}</p>
                <p>{order.merchantDetail.phoneNumber}</p>
                <p>{order.merchantDetail.merchantEmail}</p>
                {order.merchantDetail.merchantRefernce && <p>Ref: {order.merchantDetail.merchantRefernce}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Order Items</h2>
            </div>
            <div className="divide-y">
              {order.products.map((product) => (
                <div key={product.productId} className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{product.productName}</h3>
                    <p className="text-sm text-muted-foreground">Quantity: {product.quantity}</p>
                    <p className="text-sm text-muted-foreground">
                      Delivery: {product.delivery} (${product.deliveryPrice})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Total: ${(product.price * product.quantity + product.deliveryPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-muted/50">
              <div className="flex justify-between font-medium">
                <span>Total Amount</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.refundReason && (
            <div className="rounded-lg border p-4">
              <h2 className="font-semibold mb-2">Refund Information</h2>
              <p>
                <span className="font-medium">Reason:</span> {order.refundReason}
              </p>
              {order.refundDescription && (
                <p className="mt-2">
                  <span className="font-medium">Description:</span> {order.refundDescription}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}