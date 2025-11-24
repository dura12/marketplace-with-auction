import { NextResponse } from "next/server"
import Product from "@/models/Product"
import { connectToDB } from "@/libs/functions"
import mongoose from "mongoose"
export async function GET(request, { params }) {
  const { id } = await params
  
  if (!id) {
    return NextResponse.json(
      { error: "Product ID is required" },
      { status: 400 }
    )
  }

  await connectToDB()
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: "Invalid product ID" },
      { status: 400 }
    );
  }
  try {
    const product = await Product.findById(id)
      .populate('category.categoryId', 'name')
      .select('-isBanned -isDeleted')
      .lean()

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check if offer has expired and reset if necessary
    if (product.offer?.price && product.offer?.offerEndDate) {
      const offerEndDate = new Date(product.offer.offerEndDate)
      if (offerEndDate < new Date()) {
        await Product.findByIdAndUpdate(id, {
          $set: {
            'offer.price': null,
            'offer.offerEndDate': null
          }
        })
        product.offer = null
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  const { id } = params
  const body = await request.json()

  if (!id) {
    return NextResponse.json(
      { error: "Product ID is required" },
      { status: 400 }
    )
  }

  await connectToDB()

  try {
    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Handle offer updates
    if (body.offer) {
      // Validate offer price is less than original price
      if (body.offer.price && body.offer.price >= product.price) {
        return NextResponse.json(
          { error: "Offer price must be less than original price" },
          { status: 400 }
        )
      }

      // Validate offer end date is in the future
      if (body.offer.offerEndDate && new Date(body.offer.offerEndDate) <= new Date()) {
        return NextResponse.json(
          { error: "Offer end date must be in the future" },
          { status: 400 }
        )
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).populate('category.categoryId', 'name')
     .select('-isBanned -isDeleted')
     .lean()

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}