"use client"

import { useState } from "react"
import { ShoppingCart, Eye } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "./cart-provider"
import { useToast } from "./ui/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function ProductCard({ product }) {

  if (!product || !product?._id) {
    console.error("Product missing ID or invalid:", {
      product,
      hasProduct: !!product,
      hasId: product?._id,
    });
    // Return a fallback UI instead of null
    return (
      <div className="group relative rounded-lg border p-4 bg-gray-100 text-center">
        <p className="text-sm text-muted-foreground">Invalid product data</p>
      </div>
    );
  }
  
  const [isFavorite, setIsFavorite] = useState(false)
  
  // Ensure we have fallback values for missing data
  const { toast } = useToast()
  const router = useRouter()

  const { data: session } = useSession()
  const productName = product.productName 
  const originalPrice = product.price 
  const offerPrice = product.offer?.price
  const offerEndDate = product.offer?.offerEndDate ? new Date(product.offer.offerEndDate) : null
  const isOfferActive = offerPrice && offerEndDate && offerEndDate > new Date()
  const displayPrice = isOfferActive ? offerPrice : originalPrice
  const soldCount = product.soldQuantity
  const image = product.images?.[0] || "/placeholder.svg"
  const quantity = product.quantity 
  const isOutOfStock = quantity === 0
  const { addToCart, cart } = useCart()
  const averageRating = product.review?.length 
      ? product.review.reduce((acc, curr) => acc + curr.rating, 0) / product.review.length
      : 0

  // Check if the product is in the cart
  const isInCart = cart.merchants.some(merchant => 
    merchant.products.some(p => p.id === product._id)
  )
  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    addToCart({
      id: product._id,
      name: product.productName,
      price: displayPrice,
      image: product.images?.[0] || "/placeholder.svg",
      quantity: 1,
      merchantId: product.merchantDetail.merchantId,
      merchantName: product.merchantDetail.merchantName,
      delivery: product.delivery,
      deliveryPrice: product.deliveryPrice,
      email: session.user.email 
    })
    toast({
        title: "Product added to cart",
        description:`${product.productName} has been added to your cart`
    })
  }

  const handleViewCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    router.push('/cart')
  }
  return (
    <div className="group relative rounded-lg border p-4 hover:shadow-lg">
      {isOutOfStock && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white font-medium">Out of Stock</p>
        </div>
      )}
      <Link href={`/products/${product._id}`} passHref>
        <div className="aspect-square overflow-hidden rounded-lg">
          <Image
            src={image}
            alt={productName}
            width={300}
            height={300}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="mt-4 space-y-2">
          <h3 className="font-medium line-clamp-2">{productName}</h3>
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} | {soldCount} sold
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              {isOfferActive ? (
                <>
                  <p className="text-lg font-bold text-red-600">${offerPrice.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground line-through">
                    ${originalPrice.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold">${originalPrice.toFixed(2)}</p>
              )}
            </div>
            <Button
              size="icon"
              className="rounded-full h-10 w-10 hover:bg-primary/90"
              onClick={isInCart ? handleViewCart : handleAddToCart}
              disabled={isOutOfStock}
            >
              {isInCart ? (
                <Eye className="h-5 w-5 text-primary-foreground " />
              ) : (
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              )}
            </Button>
          </div>
        </div>
      </Link>
    </div>
  )
}