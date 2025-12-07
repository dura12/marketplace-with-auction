
// "use client"

// import { useState, useRef, useEffect } from "react"
// import Image from "next/image"
// import { Minus, Plus, ShoppingCart, Heart, ChevronDown, ChevronUp, Star } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Textarea } from "@/components/ui/textarea"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { useCart } from "@/components/cart-provider"
// import { useToast } from "@/components/ui/use-toast"

// export default function ProductDetail({ product }) {
//   const [isMounted, setIsMounted] = useState(false)
//   const [selectedImage, setSelectedImage] = useState(0)
//   const [quantity, setQuantity] = useState(1)
//   const [selectedVariant, setSelectedVariant] = useState(product.variant?.[0] || "")
//   const [selectedSize, setSelectedSize] = useState(product.size?.[0] || "")
//   const [showFullDescription, setShowFullDescription] = useState(false)
//   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
//   const [isZoomed, setIsZoomed] = useState(false)
//   const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
//   const [showReviewDialog, setShowReviewDialog] = useState(false)

//   const imageRef = useRef(null)
//   const zoomRef = useRef(null)

//   useEffect(() => {
//     setIsMounted(true)
//   }, [])

//   if (!isMounted) {
//     return (
//       <div className="container py-8">
//         <div className="grid gap-8 md:grid-cols-2">
//           {/* Loading skeleton */}
//           <div className="space-y-4">
//             <div className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
//             <div className="flex gap-4">
//               {[0, 1, 2].map((i) => (
//                 <div key={i} className="w-20 h-20 bg-gray-200 animate-pulse rounded-lg"></div>
//               ))}
//             </div>
//           </div>
//           <div className="space-y-6">
//             <div className="h-10 bg-gray-200 animate-pulse rounded w-3/4"></div>
//             <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
//           </div>
//         </div>
//       </div>
//     )
//   }
//   const { addToCart } = useCart()
//   const { toast } = useToast()

//   const handleMouseMove = (e) => {
//     if (!imageRef.current || !zoomRef.current) return

//     const { left, top, width, height } = imageRef.current.getBoundingClientRect()
//     const x = (e.clientX - left) / width
//     const y = (e.clientY - top) / height

//     setZoomPosition({ x: x * 100, y: y * 100 })

//     const zoomWidth = zoomRef.current.offsetWidth
//     const zoomHeight = zoomRef.current.offsetHeight
//     const translateX = Math.max(0, Math.min(x * width * 2 - zoomWidth / 2, width * 2 - zoomWidth))
//     const translateY = Math.max(0, Math.min(y * height * 2 - zoomHeight / 2, height * 2 - zoomHeight))

//     zoomRef.current.style.transform = `translate(${-translateX}px, ${-translateY}px)`
//   }

//   const handleAddToCart = () => {
//     if (product.variant?.length && !selectedVariant) {
//       toast({
//         title: "Please select a variant",
//         variant: "destructive",
//       })
//       return
//     }

//     if (product.size?.length && !selectedSize) {
//       toast({
//         title: "Please select a size",
//         variant: "destructive",
//       })
//       return
//     }

//     addToCart({
//       id: product._id,
//       name: product.productName,
//       price: product.price,
//       image: product.images[0],
//       selectedVariant,
//       selectedSize,
//       quantity,
//     })

//     toast({
//       title: "Added to cart",
//       description: `${product.productName} has been added to your cart`,
//     })
//   }

//   const handleSubmitReview = async () => {
//     if (!newReview.comment.trim()) {
//       toast({
//         title: "Error",
//         description: "Please write a review comment",
//         variant: "destructive",
//       })
//       return
//     }

//     try {
//       const response = await fetch(`/api/products/${product._id}/reviews`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(newReview),
//       })

//       if (!response.ok) {
//         throw new Error('Failed to submit review')
//       }

//       const updatedProduct = await response.json()
//       setProduct(updatedProduct)

//       setShowReviewDialog(false)
//       setNewReview({ rating: 5, comment: "" })

//       toast({
//         title: "Review submitted",
//         description: "Thank you for your review!",
//       })
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       })
//     }
//   }

//   const averageRating = product.review?.length 
//     ? product.review.reduce((acc, curr) => acc + curr.rating, 0) / product.review.length
//     : 0

//   return (
//     <div className="container py-8">
//       <div className="grid gap-8 md:grid-cols-2">
//         {/* Image Gallery */}
//         <div className="space-y-4">
//           <div
//             ref={imageRef}
//             className="relative aspect-square overflow-hidden rounded-lg border"
//             onMouseMove={handleMouseMove}
//             onMouseEnter={() => setIsZoomed(true)}
//             onMouseLeave={() => setIsZoomed(false)}
//           >
//             <Image
//               src={product.images[selectedImage] || "/placeholder.svg"}
//               alt={product.productName}
//               fill
//               className="object-cover"
//               priority
//             />
//             {isZoomed && (
//               <div
//                 className="absolute left-0 top-0 h-full w-full overflow-hidden bg-white"
//                 style={{
//                   clipPath: `circle(80px at ${zoomPosition.x}% ${zoomPosition.y}%)`,
//                 }}
//               >
//                 <div ref={zoomRef} className="absolute left-0 top-0 h-[200%] w-[200%]">
//                   <Image
//                     src={product.images[selectedImage] || "/placeholder.svg"}
//                     alt={product.productName}
//                     fill
//                     className="object-cover"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//           <div className="flex gap-4 overflow-auto pb-2">
//             {product.images.map((image, index) => (
//               <button
//                 key={index}
//                 className={`relative aspect-square w-20 shrink-0 rounded-lg border overflow-hidden ${
//                   selectedImage === index ? "ring-2 ring-primary" : ""
//                 }`}
//                 onClick={() => setSelectedImage(index)}
//               >
//                 <Image
//                   src={image || "/placeholder.svg"}
//                   alt={`${product.productName} ${index + 1}`}
//                   fill
//                   className="object-cover"
//                 />
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Product Info */}
//         <div className="space-y-6">
//           <div>
//             <h1 className="text-3xl font-bold">{product.productName}</h1>
//             <p className="text-2xl font-bold mt-2">${product.price.toFixed(2)}</p>
//           </div>

//           {/* ... rest of your product detail JSX ... */}
//           <div className="flex justify-between">
//                <span>Seller</span>
//                <span className="font-medium">{product.merchantDetail?.merchantName || 'Unknown'}</span>
//           </div>
//         </div>
//       </div>

//       {/* Reviews Section */}
//       {/* ... your reviews section JSX ... */}
//       <div className="mt-12">
//          <div className="flex items-center justify-between mb-6">
//            <h2 className="text-2xl font-bold">Customer Reviews</h2>
//            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
//              <DialogTrigger asChild>
//                <Button>Write a Review</Button>
//              </DialogTrigger>
//              <DialogContent>
//                <DialogHeader>
//                  <DialogTitle>Write a Review</DialogTitle>
//                </DialogHeader>
//                <div className="space-y-4 py-4">
//                  <div className="flex items-center gap-2">
//                    {Array.from({ length: 5 }).map((_, i) => (
//                     <Button
//                       key={i}
//                       variant="ghost"
//                       size="sm"
//                       className="p-0 hover:bg-transparent"
//                       onClick={() => setNewReview((prev) => ({ ...prev, rating: i + 1 }))}
//                     >
//                       <Star
//                         className={`h-6 w-6 ${
//                           i < newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
//                         }`}
//                       />
//                     </Button>
//                   ))}
//                 </div>
//                 <Textarea
//                   placeholder="Write your review here..."
//                   value={newReview.comment}
//                   onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
//                   rows={4}
//                 />
//                 <Button onClick={handleSubmitReview}>Submit Review</Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>

//         <div className="space-y-6">
//           {product.review?.length > 0 ? (
//             product.review.map((review, index) => (
//               <div key={index} className="border-b pb-6">
//                 <div className="flex items-center gap-4 mb-2">
//                   <div className="flex">
//                     {Array.from({ length: 5 }).map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
//                       />
//                     ))}
//                   </div>
//                   <span className="text-sm text-muted-foreground">
//                     {new Date(review.createdDate).toLocaleDateString()}
//                   </span>
//                 </div>
//                 <p>{review.comment}</p>
//               </div>
//             ))
//           ) : (
//             <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
//           )}
//         </div>
//     </div>
//   </div>
//   )
// }
"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Minus, Plus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { toast } from "react-hot-toast"
import { cn } from "@/libs/utils"

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
  const [imageLoading, setImageLoading] = useState(true)

  const imageRef = useRef(null)
  const zoomRef = useRef(null)

  // Safe access to product data
  console.log("product" , product)
  const mainImage = product?.images?.[0] || "/placeholder.svg"
  const categoryName = product?.category?.categoryName || "Uncategorized"
  const merchantName = product?.merchantDetail?.merchantName || "Abdelaziz Ebrahim1"
  const productPrice = product?.price?.toFixed(2) || "0.00"
  const [reviews, setReviews] = useState(product?.review || [])
  const { addToCart } = useCart()
  //const { toast } = useToast()

  const handleAddToCart = () => {
    if (product?.variant?.length && !selectedVariant) {
      toast({ title: "Please select a variant", variant: "destructive" })
      return
    }

    if (product?.size?.length && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" })
      return
    }

    addToCart({
      id: product?._id || "",
      name: product?.productName || "Unknown Product",
      price: product?.price || 0,
      image: mainImage,
      selectedVariant,
      selectedSize,
      quantity,
    })

    toast({
      title: "Added to cart",
      description: `${product?.productName || "Item"} has been added to your cart`,
    })
  }
  useEffect(() => {
    setIsMounted(true)
    // Initialize selections safely
    if (product?.variant?.length) {
      setSelectedVariant(product.variant[0])
    }
    if (product?.size?.length) {
      setSelectedSize(product.size[0])
    }
  }, [product])

  if (!isMounted) {
        return (
          <div className="container py-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Loading skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="flex gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-10 bg-gray-200 animate-pulse rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
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
  const averageRating = product.review?.length 
      ? product.review.reduce((acc, curr) => acc + curr.rating, 0) / product.review.length
      : 0

  // Updated image section with loading state
  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-2">
         {/* Image Gallery */}
         <div className="space-y-4">
          <div
            ref={imageRef}
            className="relative aspect-square overflow-hidden rounded-lg border"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <Image
              src={product.images?.[selectedImage] || "/placeholder.svg"}
              alt={product.productName}
              fill
              className="object-cover"
              priority
            />
            {isZoomed && (
              <div
                className="absolute left-0 top-0 h-full w-full overflow-hidden bg-white"
                style={{
                  clipPath: `circle(80px at ${zoomPosition.x}% ${zoomPosition.y}%)`,
                }}
              >
                <div ref={zoomRef} className="absolute left-0 top-0 h-[200%] w-[200%]">
                  <Image
                    src={product.images?.[selectedImage] || "/placeholder.svg"}
                    alt={product.productName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4 overflow-auto pb-2">
            {product.images?.map((image, index) => (
              <button
                key={index}
                className={`relative aspect-square w-20 shrink-0 rounded-lg border overflow-hidden ${
                  selectedImage === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.productName} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info with safety checks */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product?.productName || "Product Name"}</h1>
            <div className="mt-4 flex items-center gap-4">
              <p className="text-2xl font-bold">${productPrice}</p>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400" />
                <span>{reviews.length} reviews</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Category</span>
              <span className="font-medium">{categoryName}</span>
            </div>
            <div className="flex justify-between">
              <span>Seller</span>
              <span className="font-medium">{merchantName}</span>
            </div>
            <div className="flex justify-between">
              <span>Availability</span>
              <span className={cn(
                "font-medium",
                product?.quantity > 0 ? "text-green-600" : "text-red-600"
              )}>
                {product?.quantity > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Variants */}
          {product?.variant?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Variants</h3>
              <div className="flex flex-wrap gap-2">
                {product.variant.map((variant, index) => (
                  <Button
                    key={index}
                    variant={selectedVariant === variant ? "default" : "outline"}
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
            <div className="space-y-2">
              <h3 className="font-medium">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {product.size.map((size, index) => (
                  <Button
                    key={index}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-medium">Description</h3>
            <p className="text-muted-foreground">
              {product?.description || "No description available"}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section with safety checks */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
            {/* Review dialog remains same */}
            <DialogTrigger asChild>
              <Button>Write a Review</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      size="sm"
                      className="p-0 hover:bg-transparent"
                      onClick={() => setNewReview((prev) => ({ ...prev, rating: i + 1 }))}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          i < newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </Button>
                  ))}
                </div>
                <Textarea
                  placeholder="Write your review here..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                />
                <Button onClick={handleSubmitReview}>Submit Review</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="border-b pb-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (review?.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review?.createdDate).toLocaleDateString()}
                  </span>
                </div>
                <p>{review?.comment || "No comment provided"}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  )
}