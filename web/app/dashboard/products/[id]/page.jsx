"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, Truck, Star, Edit, Tag, Megaphone } from "lucide-react"
import { AddEditProductForm } from "@/components/dashboard/addEditProductForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { format, differenceInWeeks } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { adRegions } from "@/libs/adRegion"
import React from "react" // Import React for React.use

// Haversine formula to calculate distance between two coordinates in kilometers
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Find the closest region based on coordinates
const findClosestRegion = (coordinates) => {
  let minDistance = Infinity;
  let closestRegion = null;

  for (const [region, [lon, lat]] of Object.entries(adRegions)) {
    const distance = getDistance(coordinates[1], coordinates[0], lat, lon);
    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = region;
    }
  }

  return closestRegion;
};

export default function ProductDetailPage({ params: paramsPromise }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false)
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [offerPrice, setOfferPrice] = useState("")
  const [offerEndDate, setOfferEndDate] = useState("")
  const [isHomeAd, setIsHomeAd] = useState(false)
  const [adStartDate, setAdStartDate] = useState("")
  const [adEndDate, setAdEndDate] = useState("")
  const [calculatedAdPrice, setCalculatedAdPrice] = useState(0)
  const [adStatus, setAdStatus] = useState({ isActive: false, adEndDateReached: true });

  // Unwrap the params Promise using React.use
  const params = React.use(paramsPromise)

  useEffect(() => {
    const fetchProductAndAd = async () => {
      try {
        setLoading(true);

        // Check URL for payment status
        const url = new URL(window.location.href);
        const paymentStatus = url.searchParams.get("payment");
        if (paymentStatus) {
          // Remove payment status from URL
          url.searchParams.delete("payment");
          window.history.replaceState({}, "", url);

          if (paymentStatus === "success") {
            toast({
              title: "Success",
              description: "Advertisement payment completed successfully",
            });
          } else if (paymentStatus === "failed") {
            toast({
              title: "Payment Failed",
              description: "Advertisement payment failed. Please try again.",
              variant: "destructive",
            });
          }
        }

        // Fetch product
        const productResponse = await fetch(`/api/products/${params.id}`);
        if (!productResponse.ok) throw new Error("Failed to fetch product");
        const productData = await productResponse.json();
        setProduct(productData);

        // Fetch advertisement status
        const adResponse = await fetch(`/api/advertisement?productId=${params.id}`);
        if (!adResponse.ok) throw new Error("Failed to fetch advertisement status");
        const adData = await adResponse.json();
        
        // Determine ad status
        const activeAd = adData.ads.find(ad => ad.isActive && new Date(ad.endsAt) > new Date());
        setAdStatus({
          isActive: !!activeAd,
          adEndDateReached: activeAd ? new Date(activeAd.endsAt) <= new Date() : true,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load product or advertisement details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProductAndAd();
    }
  }, [params.id, toast]);

  useEffect(() => {
    if (adStartDate && adEndDate) {
      const start = new Date(adStartDate)
      const end = new Date(adEndDate)
      if (end <= start) {
        toast({
          title: "Invalid Dates",
          description: "End date must be after start date",
          variant: "destructive",
        })
        setCalculatedAdPrice(0)
        return
      }
      const weeks = Math.max(1, differenceInWeeks(end, start))
      const basePrice = isHomeAd ? 100 : 50
      const totalPrice = basePrice * weeks
      setCalculatedAdPrice(totalPrice)
    } else {
      setCalculatedAdPrice(0)
    }
  }, [adStartDate, adEndDate, isHomeAd, toast])

  const handleOfferSubmit = async () => {
    try {
      const formattedDate = new Date(offerEndDate).toISOString()
      if (new Date(offerEndDate) <= new Date()) {
        throw new Error("Offer end date must be in the future")
      }

      const response = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offer: {
            price: parseFloat(offerPrice),
            offerEndDate: formattedDate,
          },
        }),
      })

      if (!response.ok) throw new Error("Failed to update offer")

      const updatedProduct = await response.json()
      setProduct(updatedProduct)
      setIsOfferDialogOpen(false)
      toast({
        title: "Success",
        description: "Offer has been set successfully",
      })
    } catch (error) {
      console.error("Error setting offer:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to set offer",
        variant: "destructive",
      })
    }
  }

  const handleRemoveOffer = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offer: {
            price: null,
            offerEndDate: null,
          },
        }),
      })

      if (!response.ok) throw new Error("Failed to remove offer")

      const updatedProduct = await response.json()
      setProduct(updatedProduct)
      toast({
        title: "Success",
        description: "Offer has been removed successfully",
      })
    } catch (error) {
      console.error("Error removing offer:", error)
      toast({
        title: "Error",
        description: "Failed to remove offer",
        variant: "destructive",
      })
    }
  }

  const handleCreateAd = async () => {
    if (!adStartDate || !adEndDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      })
      return
    }

    try {
      const adRegion = findClosestRegion(product.location.coordinates);
      if (!adRegion) {
        throw new Error("No matching region found for product location");
      }

      // Create advertisement and initialize payment
      const response = await fetch('/api/advertisement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: { ...product, _id: params.id },
          merchantDetail: product.merchantDetail,
          startsAt: new Date(adStartDate).toISOString(),
          endsAt: new Date(adEndDate).toISOString(),
          adPrice: calculatedAdPrice,
          adRegion,
          isHome: isHomeAd,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create advertisement');
      }

      if (data.checkout_url) {
        // Store ad data in localStorage before redirect
        localStorage.setItem('pendingAd', JSON.stringify({
          adId: data.adId,
          tx_ref: data.tx_ref,
          productId: params.id
        }));
        
        // Redirect to checkout URL
        window.location.href = data.checkout_url;
      } else {
        toast({
          title: "Success",
          description: "Advertisement created successfully",
        });
        setIsAdDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating advertisement:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  const inventoryData = [
    { name: "Sold", value: product.soldQuantity },
    { name: "Available", value: product.quantity },
  ]

  const COLORS = ["#8884d8", "#82ca9d"]

  const getDeliveryLabel = (type) => {
    switch (type) {
      case "FLAT":
        return "Flat Rate"
      case "PERPIECE":
        return "Per Piece"
      case "PERKG":
        return "Per Kilogram"
      case "FREE":
        return "Free Delivery"
      default:
        return type
    }
  }

  const calculateAverageRating = () => {
    if (!product.review || product.review.length === 0) return 0
    const sum = product.review.reduce((acc, review) => acc + review.rating, 0)
    return (sum / product.review.length).toFixed(1)
  }

  const currentPrice = product.offer?.price && new Date(product.offer.offerEndDate) > new Date()
    ? product.offer.price
    : product.price

  return (
    <div className="container p-6">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">{product.productName}</h1>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Button className="gradient-bg border-0" onClick={() => setIsEditProductOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Button>
            <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={adStatus.isActive && !adStatus.adEndDateReached}>
                  <Megaphone className="mr-2 h-4 w-4" />
                  Make it Ad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Advertisement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="adStartDate">Start Date</Label>
                    <Input
                      id="adStartDate"
                      type="datetime-local"
                      value={adStartDate}
                      onChange={(e) => setAdStartDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adEndDate">End Date</Label>
                    <Input
                      id="adEndDate"
                      type="datetime-local"
                      value={adEndDate}
                      onChange={(e) => setAdEndDate(e.target.value)}
                      min={adStartDate || new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Advertisement Price</Label>
                    <p className="text-sm">
                      {isHomeAd ? "100 ETB/week" : "50 ETB/week"} = {calculatedAdPrice} ETB
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isHomeAd"
                      checked={isHomeAd}
                      onCheckedChange={(checked) => setIsHomeAd(checked)}
                    />
                    <Label htmlFor="isHomeAd">Show on Homepage</Label>
                  </div>
                  <Button onClick={handleCreateAd} className="w-full" disabled={!calculatedAdPrice}>
                    Create Advertisement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {product.offer?.price ? (
              <Button variant="outline" onClick={handleRemoveOffer}>
                <Tag className="mr-2 h-4 w-4" />
                Remove Offer
              </Button>
            ) : (
              <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Tag className="mr-2 h-4 w-4" />
                    Provide Offer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Product Offer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="offerPrice">Offer Price</Label>
                      <Input
                        id="offerPrice"
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        placeholder="Enter offer price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="offerEndDate">Offer End Date</Label>
                      <Input
                        id="offerEndDate"
                        type="datetime-local"
                        value={offerEndDate}
                        onChange={(e) => setOfferEndDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <Button onClick={handleOfferSubmit} className="w-full">
                      Set Offer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative aspect-square overflow-hidden rounded-lg border">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.productName}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">{product.productName}</h2>
                    <p className="text-muted-foreground">{product.category.categoryName}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
                      {product.offer?.price && new Date(product.offer.offerEndDate) > new Date() && (
                        <Badge variant="destructive" className="text-sm">
                          Offer: ${product.price.toFixed(2)} → ${product.offer.price.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Badge variant={product.quantity > 0 ? "success" : "destructive"}>
                        {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                      <span className="ml-2 text-sm text-muted-foreground">{product.quantity} available</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Brand</p>
                    <p className="text-muted-foreground">{product.brand}</p>
                  </div>
                  {product.variant.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-medium">Variants</p>
                      <div className="flex flex-wrap gap-2">
                        {product.variant.map((variant, index) => (
                          <Badge key={index} variant="outline">
                            {variant}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.size.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-medium">Sizes</p>
                      <div className="flex flex-wrap gap-2">
                        {product.size.map((size, index) => (
                          <Badge key={index} variant="outline">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="font-medium">Delivery</p>
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {getDeliveryLabel(product.delivery)}
                        {product.delivery !== "FREE" && ` - $${product.deliveryPrice.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Location</p>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {product.location.coordinates[0]}, {product.location.coordinates[1]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {product.images.length > 1 && (
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.productName} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                {product.review.length > 0
                  ? `${product.review.length} reviews with an average rating of ${calculateAverageRating()} stars`
                  : "No reviews yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.review.length > 0 ? (
                <div className="space-y-4">
                  {product.review.map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{review.customerName}</p>
                          <div className="flex items-center mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.createdDate).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="mt-2 text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-muted-foreground">No reviews yet for this product.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Sold vs. Available Inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} units`, null]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sold</p>
                  <p className="text-2xl font-bold">{product.soldQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{product.quantity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Product Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">${(product.price * product.soldQuantity).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Rating</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">{calculateAverageRating()}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed Date</span>
                  <span className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merchant</span>
                  <span className="font-medium">{product.merchantDetail.merchantName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AddEditProductForm
        open={isEditProductOpen}
        onOpenChange={setIsEditProductOpen}
        product={product}
        mode="edit"
      />
    </div>
  )
}