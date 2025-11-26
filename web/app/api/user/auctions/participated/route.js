// pages/api/user/auctions/participated.js

import Bid from "@/models/Bid"
import Auction from "@/models/Auction"
import { connectToDB, userInfo } from "@/libs/functions"

export async function GET(req, res) {
  const sessionId = await userInfo(req)
  
  if (!sessionId) 
    return new Response(JSON.stringify({ error: "Unauthorized"}), { status:401 })
  
  await connectToDB()

  try {
    // Get all auctions where user has placed bids
    const userBids = await Bid.find({ "bids.bidderId": sessionId })
    const auctionIds = [...new Set(userBids.map(bid => bid.auctionId.toString()))]
    const auctions = await Auction.find({ _id: { $in: auctionIds } })
      .populate('productId', 'productName images')
    
    return new Response(JSON.stringify(auctions))
  } catch (error) {
    return new Response(JSON.stringify(error.message), { status:500 })
  }
}