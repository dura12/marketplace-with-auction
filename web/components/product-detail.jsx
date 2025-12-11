"use client"

import { useState, useRef, useEffect } from "react"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { Minus, Plus, Star, ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, ChevronRight, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { toast } from "react-hot-toast"
import { cn } from "@/libs/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ProductDetail({ product }) {
  const [isMounted, setIsMounted] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [isZoomed, setIsZoomed] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const imageRef = useRef(null)
  const zoomRef = useRef(null)
  const { data: session } = useSession()
  const router = useRouter()

  // Safe access to product data
  const mainImage = product?.images?.[0] || ""
  const categoryName = product?.category?.categoryName || "Uncategorized"
  const merchantName = product?.merchantDetail?.merchantName || "Unknown Seller"
  const merchantId = product?.merchantDetail?.merchantId
  const productPrice = product?.price || 0
  const originalPrice = product?.originalPrice || productPrice * 1.2
  const hasDiscount = originalPrice > productPrice
  const discountPercent = hasDiscount ? Math.round((1 - productPrice / originalPrice) * 100) : 0
  const [reviews, setReviews] = useState(product?.review || [])
  const { addToCart, cart } = useCart()
  const isInStock = product?.quantity > 0
  const stockLevel = product?.quantity || 0

  // Check if product is already in cart
  const isInCart = cart?.merchants?.some(merchant => 
    merchant.products.some(p => p.id === product?._id)
  )

  const handleAddToCart = () => {
    if (!session) {
      toast.error("Please sign in to add items to cart")
      return
    }

    if (product?.variant?.length && !selectedVariant) {
      toast.error("Please select a variant")
      return
    }

    if (product?.size?.length && !selectedSize) {
      toast.error("Please select a size")
      return
    }

    addToCart({
      id: product?._id || "",
      name: product?.productName || "Unknown Product",
      price: productPrice,
      image: mainImage,
      selectedVariant,
      selectedSize,
      quantity,
      merchantId: product?.merchantDetail?.merchantId,
      merchantName: product?.merchantDetail?.merchantName,
      delivery: product?.delivery,
      deliveryPrice: product?.deliveryPrice,
      email: session?.user?.email
    })

    toast.success(`${product?.productName} added to cart!`)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  useEffect(() => {
    setIsMounted(true)
    if (product?.variant?.length) {
      setSelectedVariant(product.variant[0])
    }
    if (product?.size?.length) {
      setSelectedSize(product.size[0])
    }
  }, [product])

  if (!isMounted) {
    return (
      <div className="container py-6 lg:py-10">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted animate-pulse rounded-2xl" />
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-20 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
          
          {/* Info skeleton */}
          <div className="space-y-6">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
              <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
            </div>
            <div className="h-10 bg-muted animate-pulse rounded w-3/4" />
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-5 w-5 bg-muted animate-pulse rounded" />
                ))}
              </div>
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-12 bg-muted animate-pulse rounded w-1/3" />
            <div className="space-y-3">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-9 w-20 bg-muted animate-pulse rounded-full" />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-muted animate-pulse rounded-lg" />
              <div className="flex-1 h-12 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  const handleMouseMove = (e) => {
        if (!imageRef.current || !zoomRef.current) return
    
        const { left, top, width, height } = imageRef.current.getBoundingClientRect()
        const x = (e.clientX - left) / width
        const y = (e.clientY - top) / height
    
        setZoomPosition({ x: x * 100, y: y * 100 })
    
        const zoomWidth = zoomRef.current.offsetWidth
        const zoomHeight = zoomRef.current.offsetHeight
        const translateX = Math.max(0, Math.min(x * width * 2 - zoomWidth / 2, width * 2 - zoomWidth))
        const translateY = Math.max(0, Math.min(y * height * 2 - zoomHeight / 2, height * 2 - zoomHeight))
    
        zoomRef.current.style.transform = `translate(${-translateX}px, ${-translateY}px)`
      }
      const handleSubmitReview = async () => {
        try {
          const response = await fetch(`/api/products/${product._id}/reviews`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newReview),
          });
      
          if (!response.ok) throw new Error('Failed to submit review');
      
          const { product: updatedProduct } = await response.json();
      
          // Update reviews with the updated product's reviews from the API
          setReviews(updatedProduct.review || []);
      
          // Reset the new review form
          setNewReview({ rating: 5, comment: "" });
          setShowReviewDialog(false);
      
          toast({
            title: "Review submitted",
            description: "Thank you for your review!",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      };
  const averageRating = reviews?.length 
      ? reviews.reduce((acc, curr) => acc + (curr?.rating || 0), 0) / reviews.length
      : 0

  return (
    <div className="container py-6 lg:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <span className="hover:text-primary cursor-pointer" onClick={() => router.push('/')}>Home</span>
        <ChevronRight className="h-4 w-4" />
        <span className="hover:text-primary cursor-pointer" onClick={() => router.push('/products')}>Products</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{product?.productName}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div
            ref={imageRef}
            className="relative aspect-square overflow-hidden rounded-2xl border bg-muted/30 shadow-sm"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            {/* Discount Badge */}
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 z-10 bg-red-500 hover:bg-red-600 text-white px-3 py-1">
                -{discountPercent}% OFF
              </Badge>
            )}
            
            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "")} />
            </Button>

            <ImageWithFallback
              src={product?.images?.[selectedImage]}
              alt={product?.productName}
              fallbackText={product?.productName}
              fill
              className="object-cover"
              priority
            />
            
            {/* Zoom Effect */}
            {isZoomed && product?.images?.[selectedImage] && (
              <div
                className="absolute left-0 top-0 h-full w-full overflow-hidden bg-white pointer-events-none"
                style={{
                  clipPath: `circle(100px at ${zoomPosition.x}% ${zoomPosition.y}%)`,
                }}
              >
                <div ref={zoomRef} className="absolute left-0 top-0 h-[200%] w-[200%]">
                  <ImageWithFallback
                    src={product?.images?.[selectedImage]}
                    alt={product?.productName}
                    fallbackText={product?.productName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted">
            {product?.images?.map((image, index) => (
              <button
                key={index}
                className={cn(
                  "relative aspect-square w-20 shrink-0 rounded-xl border-2 overflow-hidden transition-all",
                  selectedImage === index 
                    ? "border-primary ring-2 ring-primary/20 scale-105" 
                    : "border-transparent hover:border-muted-foreground/30"
                )}
                onClick={() => setSelectedImage(index)}
              >
                <ImageWithFallback
                  src={image}
                  alt={`${product?.productName} ${index + 1}`}
                  fallbackText={product?.productName}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category & Brand */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {categoryName}
            </Badge>
            {product?.brand && (
              <Badge variant="outline" className="text-xs">
                {product.brand}
              </Badge>
            )}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              {product?.productName || "Product Name"}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.floor(averageRating) 
                        ? "fill-amber-400 text-amber-400" 
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {product?.soldQuantity || 0} sold
              </span>
            </div>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline gap-3 py-4 border-y">
            <span className="text-3xl sm:text-4xl font-bold text-primary">
              ${productPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              isInStock ? "bg-green-500" : "bg-red-500"
            )} />
            <span className={cn(
              "text-sm font-medium",
              isInStock ? "text-green-600" : "text-red-600"
            )}>
              {isInStock ? `In Stock (${stockLevel} available)` : "Out of Stock"}
            </span>
          </div>

          {/* Variants */}
          {product?.variant?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Color / Variant
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variant.map((variant, index) => (
                  <Button
                    key={index}
                    variant={selectedVariant === variant ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "rounded-full px-4",
                      selectedVariant === variant && "ring-2 ring-primary/20"
                    )}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    {variant}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product?.size?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.size.map((size, index) => (
                  <Button
                    key={index}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "min-w-[3rem] rounded-lg",
                      selectedSize === size && "ring-2 ring-primary/20"
                    )}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Quantity
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-r-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-l-none"
                  onClick={() => setQuantity(Math.min(stockLevel, quantity + 1))}
                  disabled={quantity >= stockLevel}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {stockLevel} pieces available
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              size="lg"
              className="flex-1 h-12 text-base font-semibold"
              onClick={handleAddToCart}
              disabled={!isInStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isInCart ? "Add More to Cart" : "Add to Cart"}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1 h-12 text-base font-semibold"
              onClick={handleBuyNow}
              disabled={!isInStock}
            >
              Buy Now
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
              <Truck className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-medium">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
              <Shield className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-medium">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
              <RefreshCw className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-medium">Easy Returns</span>
            </div>
          </div>

          {/* Seller Info */}
          <Card className="border-dashed">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{merchantName}</p>
                <p className="text-sm text-muted-foreground">Verified Seller</p>
              </div>
              <Button variant="outline" size="sm">
                Visit Store
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description Section */}
      <div className="mt-12">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Product Description</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product?.description || "No description available for this product."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <p className="text-muted-foreground mt-1">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} • {averageRating.toFixed(1)} average rating
            </p>
          </div>
          <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Star className="h-4 w-4" />
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Rating</label>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className="p-1 hover:scale-110 transition-transform"
                        onClick={() => setNewReview((prev) => ({ ...prev, rating: i + 1 }))}
                      >
                        <Star
                          className={cn(
                            "h-8 w-8 transition-colors",
                            i < newReview.rating 
                              ? "fill-amber-400 text-amber-400" 
                              : "text-muted-foreground/30 hover:text-amber-200"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Review</label>
                  <Textarea
                    placeholder="Share your experience with this product..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button onClick={handleSubmitReview} className="w-full">
                  Submit Review
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <Card key={index}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {review?.reviewerName?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review?.reviewerName || "Anonymous"}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < (review?.rating || 0) 
                                    ? "fill-amber-400 text-amber-400" 
                                    : "text-muted-foreground/30"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {review?.createdDate ? new Date(review.createdDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : ''}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review?.comment || "No comment provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Star className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="font-medium text-lg">No Reviews Yet</h3>
                <p className="text-muted-foreground mt-1">Be the first to share your experience!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}