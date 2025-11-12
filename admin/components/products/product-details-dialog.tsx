/* eslint-disable @next/next/no-img-element */
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Truck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProductMap } from "./product-map";
import { ProductType } from "@/utils/typeDefinitions";
import LocationMap from "../location/LocationMap";

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

interface ProductDetailsDialogProps {
  product: ProductType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: {
    type: "ban" | "unban" | "delete";
    productId: string;
    reason?: string;
    description?: string;
  }) => void;
  isLoading: {
    ban?: boolean;
    unban?: boolean;
    delete?: boolean;
  };
}

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
  onAction,
  isLoading,
}: ProductDetailsDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [showUnbanConfirm, setShowUnbanConfirm] = useState(false);
  const [selectedBanReason, setSelectedBanReason] = useState("");
  const [banDescription, setBanDescription] = useState("");

  const banReasons = [
    "Policy Violation",
    "Inappropriate Content",
    "Fraudulent Listing",
    "Counterfeit Product",
    "Safety Concerns",
    "Other",
  ];

  const nextImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  const avgRating: number =
    product.review && product.review.length > 0
      ? parseFloat(
          (
            product.review.reduce(
              (sum: number, review: any) => sum + review.rating,
              0
            ) / product.review.length
          ).toFixed(1)
        )
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product.productName}</span>
            {product.isBanned ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Banned
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Product ID: {product._id}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-12 gap-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Product Name</Label>
                <div className="text-sm mt-1">{product.productName}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <div className="text-sm mt-1">
                  {product.category.categoryName}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Price</Label>
                <div className="text-sm mt-1">${product.price.toFixed(2)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Brand</Label>
                <div className="text-sm mt-1">{product.brand}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="text-sm mt-1">{product.quantity} in stock</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Sold</Label>
                <div className="text-sm mt-1">
                  {product.soldQuantity} units sold
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Merchant</Label>
                <div className="text-sm mt-1">
                  {product.merchantDetail.merchantName}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Merchant Email</Label>
                <div className="text-sm mt-1">
                  {product.merchantDetail.merchantEmail}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Delivery Type</Label>
                <div className="text-sm mt-1 flex items-center">
                  <Truck className="h-4 w-4 mr-1 text-blue-500" />
                  {product.delivery === "FLAT"
                    ? "Flat Rate"
                    : product.delivery === "PERPIECE"
                    ? "Per Piece"
                    : product.delivery === "PERKG"
                    ? "Per Kilogram"
                    : "Free Shipping"}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Delivery Price</Label>
                <div className="text-sm mt-1">
                  {product.delivery === "FREE"
                    ? "Free"
                    : `$${product.deliveryPrice.toFixed(2)}`}
                </div>
              </div>
              {product.variant && product.variant.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Variants</Label>
                  <div className="text-sm mt-1 flex flex-wrap gap-1">
                    {product.variant.map((variant: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {variant}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {product.size && product.size.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Sizes</Label>
                  <div className="text-sm mt-1 flex flex-wrap gap-1">
                    {product.size.map((size: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Created At</Label>
                <div className="text-sm mt-1">
                  {new Date(product.createdAt).toLocaleString()}
                </div>
              </div>
              {product.isDeleted && product.trashDate && (
                <div>
                  <Label className="text-sm font-medium">Deleted At</Label>
                  <div className="text-sm mt-1">
                    {new Date(product.trashDate).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Description</Label>
              <div className="text-sm mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images">
            <div className="relative">
              {product.images && product.images.length > 0 ? (
                <div className="relative border rounded-md overflow-hidden">
                  <img
                    src={
                      product.images[currentImageIndex] || "/placeholder.svg"
                    }
                    alt={`Product image ${currentImageIndex + 1}`}
                    className="w-full h-48 sm:h-64 md:h-80 object-contain bg-gray-50"
                  />
                  {product.images.length > 1 && (
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
                        {currentImageIndex + 1} / {product.images.length}
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
              {product.images && product.images.length > 1 && (
                <div className="flex mt-4 gap-2 overflow-x-auto pb-2">
                  {product.images.map((img: string, index: number) => (
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
                        src={img || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            {product.review && product.review.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">
                      {avgRating.toFixed(1)}
                    </span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(avgRating)
                              ? "text-yellow-500 fill-yellow-500"
                              : i < Math.ceil(avgRating)
                              ? "text-yellow-500 fill-yellow-500 opacity-50"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({product.review.length}{" "}
                      {product.review.length === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.review.map((review: any, index: number) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 shadow-sm bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            Customer ID: {review.customerId}
                          </div>
                          <div className="flex items-center mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.createdDate).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No reviews available for this product.
              </div>
            )}
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-medium">Product Location</span>
              </div>
              {product.location?.coordinates && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {product.location.coordinates[1].toFixed(6)},{" "}
                  {product.location.coordinates[0].toFixed(6)}
                </Badge>
              )}
            </div>

            <div className="border rounded-md overflow-hidden">
              {product.location?.coordinates ? (
                <LocationMap location={product.location.coordinates} />
              ) : (
                <div className="h-64 md:h-80 bg-muted flex items-center justify-center">
                  <div className="text-center p-4">
                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="font-medium mt-2">No Location Data</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This product does not have location information.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {product.location?.coordinates && (
              <div className="flex justify-end">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${product.location.coordinates[1]},${product.location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center text-blue-600 hover:text-blue-800"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  View in Google Maps
                </a>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
          {!product.isBanned ? (
            <Button
              variant="destructive"
              onClick={() => {
                setSelectedBanReason("");
                setBanDescription("");
                setShowBanConfirm(true);
              }}
              disabled={isLoading.ban}
              className="w-full sm:w-auto"
            >
              {isLoading.ban ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Ban Product
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowUnbanConfirm(true)}
              disabled={isLoading.unban}
              className="w-full sm:w-auto"
            >
              {isLoading.unban ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Unban Product
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading.delete}
            className="w-full sm:w-auto"
          >
            {isLoading.delete ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete Product
          </Button>

          {/* Ban Confirmation Dialog */}
          {showBanConfirm && (
            <Dialog open={showBanConfirm} onOpenChange={setShowBanConfirm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Ban</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to ban this product? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="banReason">Ban Reason</Label>
                    <Select
                      value={selectedBanReason}
                      onValueChange={setSelectedBanReason}
                    >
                      <SelectTrigger id="banReason">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {banReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="banDescription">Additional Details</Label>
                    <Textarea
                      id="banDescription"
                      value={banDescription}
                      onChange={(e) => setBanDescription(e.target.value)}
                      placeholder="Enter additional details about the ban"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowBanConfirm(false)}
                    disabled={isLoading.ban}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onAction({
                        type: "ban",
                        productId: product._id,
                        reason: selectedBanReason,
                        description: banDescription,
                      });
                      setShowBanConfirm(false);
                    }}
                    disabled={!selectedBanReason || isLoading.ban}
                  >
                    {isLoading.ban ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Confirm Ban
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Unban Confirmation Dialog */}
          {showUnbanConfirm && (
            <Dialog open={showUnbanConfirm} onOpenChange={setShowUnbanConfirm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Unban</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to unban this product?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowUnbanConfirm(false)}
                    disabled={isLoading.unban}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      onAction({
                        type: "unban",
                        productId: product._id,
                      });
                      setShowUnbanConfirm(false);
                    }}
                    disabled={isLoading.unban}
                  >
                    {isLoading.unban ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <Dialog
              open={showDeleteConfirm}
              onOpenChange={setShowDeleteConfirm}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Delete</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this product? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading.delete}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onAction({
                        type: "delete",
                        productId: product._id,
                      });
                      setShowDeleteConfirm(false);
                    }}
                    disabled={isLoading.delete}
                  >
                    {isLoading.delete ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Confirm Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
