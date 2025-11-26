// pages/api/user/auctions.js
import { connectToDB, userInfo } from "libs/functions"
import Auction from "@/models/Auction"


export async function GET(req, res) {
  const sessionId = await userInfo(req)
  
  if (!sessionId) 
    return new Response(JSON.stringify({ error: "Unauthorized"}), { status:401 })
  
  await connectToDB()

  try {
    const auctions = await Auction.find({ merchantId: sessionId })
      .sort({ createdAt: -1 })
      .populate('productId', 'productName images')
    
      return new Response(JSON.stringify(auctions), { status:200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error"}), { status:500 })
  }
}