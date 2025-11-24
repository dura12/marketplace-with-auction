// app/api/products/[productId]/reviews/route.js
import { getServerSession } from "next-auth"
import { options } from "@/app/api/auth/[...nextauth]/options"
//import { useSession } from "next-auth/react"
import { NextResponse } from "next/server"
import Product from "@/models/Product"
import { connectToDB } from "@/libs/functions"

export async function POST(request, { params }) {
  const session = await getServerSession(options)
  
  // Verify user is authenticated
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized - Please log in" },
      { status: 401 }
    )
  }

  const { id } = params
  
  console.log(id)
  try {
    const { comment, rating } = await request.json()

    // Validate input
    if (!comment?.trim() || !rating) {
      return NextResponse.json(
        { error: "Comment and rating are required" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    await connectToDB()

    // Find the product and check if user already reviewed
    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check for existing review from this user
    const hasReviewed = product.review.some(
      review => review.customerId.toString() === session.user.id
    )

    if (hasReviewed) {
      return NextResponse.json(
        { error: "You've already reviewed this product" },
        { status: 400 }
      )
    }

    // Create new review
    const newReview = {
      customerId: session.user.id,
      comment: comment.trim(),
      rating: Number(rating),
      createdDate: new Date()
    }

    // Add review to product and save
    product.review.push(newReview)
    const updatedProduct = await product.save()

    return NextResponse.json({
      message: "Review added successfully",
      product: updatedProduct})

    } catch(error) {
        return NextResponse.json({error})
    }

}