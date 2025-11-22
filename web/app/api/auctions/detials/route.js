import { connectToDB } from "@/libs/functions"
import Auction from "@/models/Auction"
import Bid from "@/models/Bid"
import { isMerchant } from "@/libs/functions"

const createResponse = (data, status) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

const authenticateMerchant = async (req) => {
  await connectToDB()
  const merchantCheck = await isMerchant(req)
  if (merchantCheck instanceof Response) return merchantCheck
  return merchantCheck
}

export async function GET(req) {
  try {
    const auth = await authenticateMerchant(req)
    if (auth instanceof Response) return auth

    const url = new URL(req.url)
    const auctionId = url.searchParams.get("id")

    if (auctionId) {
      // Fetch a single auction by ID
      const auction = await Auction.findOne({ _id: auctionId, merchantId: auth.merchantId })
        .populate("productId", "productName")
        .lean()

      if (!auction) {
        return createResponse({ error: "Auction not found or not authorized" }, 404)
      }

      // Fetch associated bids
      const bidDoc = await Bid.findOne({ auctionId: auction._id })
        .populate({
          path: "bids.bidderId",
          select: "name avatar", // Assuming User model has these fields
        })
        .lean()

      // Prepare the auction data with productName and bids
      const auctionWithDetails = {
        ...auction,
        productName: auction.productId?.productName || auction.auctionTitle,
        bids: bidDoc
          ? bidDoc.bids.map((bid) => ({
              id: bid._id,
              bidder: {
                id: bid.bidderId._id,
                name: bid.bidderId.name,
                avatar: bid.bidderId.avatar,
              },
              amount: bid.bidAmount,
              time: bid.bidTime,
            }))
          : [],
        currentBid: bidDoc && bidDoc.highestBid > 0 ? bidDoc.highestBid : auction.startingPrice,
      }

      return createResponse(auctionWithDetails, 200)
    } else {
      // Fetch all auctions for the merchant (existing functionality)
      const auctions = await Auction.find({ merchantId: auth.merchantId })
        .populate("productId", "productName")
        .lean()

      const auctionsWithProductName = auctions.map((auction) => ({
        ...auction,
        productName: auction.productId?.productName || auction.auctionTitle,
      }))

      return createResponse(auctionsWithProductName, 200)
    }
  } catch (error) {
    console.error("Error fetching auctions:", error)
    return createResponse({ error: "Internal server error" }, 500)
  }
}
