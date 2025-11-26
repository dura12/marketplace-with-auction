// pages/api/user/auctions/total-bids.js
import Auction from "@/models/Auction"
import Bid from "@/models/Bid"
import { connectToDB, userInfo } from "@/libs/functions"

export async function GET(req, res) {
  const sessionId = await userInfo( req )
  
  if (!sessionId) 
    return new Response(JSON.stringify({ error: "Unauthorized"}), { status:401 })
  
  await connectToDB()

  try {
    // Get all auctions created by user
    const userAuctions = await Auction.find({ merchantId: sessionId })
    const auctionIds = userAuctions.map(auction => auction._id)
    
    // Count total bids across all auctions
    const totalBids = await Bid.aggregate([
      { $match: { auctionId: { $in: auctionIds } } },
      { $project: { bidCount: { $size: "$bids" } } },
      { $group: { _id: null, total: { $sum: "$bidCount" } } }
    ])
    
    
    return new Response(JSON.stringify({
       totalBids: totalBids[0]?.total || 0}),
      { status:200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error"}), { status:500 })
  }
}