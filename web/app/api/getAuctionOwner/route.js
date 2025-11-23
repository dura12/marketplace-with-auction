import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Auction from '@/models/Auction'
import User from '@/models/User'
import { connectToDB } from '@/libs/functions'

export async function GET(req) {
  try {
    await connectToDB()

    const { searchParams } = new URL(req.url)
    const auctionId = searchParams.get('auctionId')

    if (!auctionId || !mongoose.Types.ObjectId.isValid(auctionId)) {
      return NextResponse.json({ message: 'Invalid or missing auctionId' }, { status: 400 })
    }

    const auction = await Auction.findById(auctionId).select('merchantId')

    if (!auction) {
      return NextResponse.json({ message: 'Auction not found' }, { status: 404 })
    }

    const merchant = await User.findById(auction.merchantId)
      .select('-password -otp -otpExpiry') // exclude sensitive fields
      .lean()

    if (!merchant) {
      return NextResponse.json({ message: 'Merchant not found' }, { status: 404 })
    }

    return NextResponse.json({ merchant }, { status: 200 })

  } catch (error) {
    console.error('[GET_MERCHANT_BY_AUCTION_ID]', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
