import { connectToDB } from "@/libs/functions";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;
    console.log(`Pagination params - Page: ${page}, Limit: ${limit}, Skip: ${skip}`);

    console.log("Fetching active auctions...");
    const auctionResults = await Auction.find({ status: "active" })
      .populate("merchantId", "name avatar")
      .populate("productId", "name")
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit)
      .lean();
    console.log(`Fetched ${auctionResults.length} active auctions.`);

    const auctionIds = auctionResults.map((a) => a._id);
    console.log("Auction IDs for bid lookup:", auctionIds);

    console.log("Fetching bids for active auctions...");
    const bidResults = await Bid.find({
      auctionId: { $in: auctionIds },
    }).populate({
      path: "bids.bidderId",
      select: "name avatar email",
    });
    console.log(`Fetched bids for ${bidResults.length} auctions.`);

    const bidMap = bidResults.reduce((acc, bidDoc) => {
      const bids = bidDoc.bids || [];
      const highestBid =
        bids.length > 0 ? Math.max(...bids.map((b) => b.bidAmount)) : 0;
      acc[bidDoc.auctionId.toString()] = {
        highestBid: highestBid || 0,
        totalBids: bids.length,
        bids: bids.map((bid) => ({
          id: bid._id,
          bidder: {
            id: bid.bidderId?._id || null,
            name: bid.bidderId?.name || bid.bidderName || "Unknown",
            avatar: bid.bidderId?.avatar || "/placeholder.svg",
            email: bid.bidderId?.email || bid.bidderEmail || "",
          },
          amount: bid.bidAmount,
          time: bid.bidTime,
          status: bid.status,
        })),
      };
      return acc;
    }, {});
    console.log("Constructed bid map.");

    console.log("Merging auction and bid data...");
    const auctions = auctionResults.map((auction) => {
      const bidData = bidMap[auction._id.toString()] || {
        highestBid: auction.startingPrice,
        totalBids: 0,
        bids: [],
      };

      // Calculate timeLeft in hours, fallback to null if dates invalid
      const now = new Date();
      const endTime = new Date(auction.endTime);
      const timeLeftHours = isNaN(endTime.getTime()) ? null : Math.floor((endTime - now) / (1000 * 60 * 60));

      return {
        ...auction,
        auctionTitle: auction.auctionTitle || "Untitled Auction",
        highestBid: bidData.highestBid,
        totalBids: bidData.totalBids,
        bids: bidData.bids,
        itemImg: Array.isArray(auction.itemImg) && auction.itemImg.length > 0 ? auction.itemImg[0] : "/placeholder.svg",
        merchant: {
          id: auction.merchantId?._id || null,
          name: auction.merchantId?.name || "Unknown Merchant",
          avatar: auction.merchantId?.avatar || "/placeholder.svg",
        },
        productName: auction.productId?.name || "Unknown Product",
        timeLeft: timeLeftHours,
      };
    });
    console.log("Final active auctions with bid data:", auctions);

    return NextResponse.json(auctions);
  } catch (error) {
    console.error("Error fetching active auctions:", error.message, error.stack);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}