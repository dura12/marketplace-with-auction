import { connectToDB } from "@/libs/functions";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectToDB();

    // First await the params object
    const awaitedParams = await params;
    const id = awaitedParams.id;

    // Validate the ID parameter
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid auction ID" },
        { status: 400 }
      );
    }

    const auctionId = new Types.ObjectId(id);

    // Find the auction
    const auction = await Auction.findById(auctionId)
      .populate('merchantId', 'name avatar rating totalSales')
      .populate('productId', 'name');

    if (!auction) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    // Find bids for this auction
    const bidDocument = await Bid.findOne({ auctionId })
      .populate({
        path: "bids.bidderId",
        select: "name avatar email",
      })
      .sort({ "bids.bidTime": -1 });

    // Transform the data for cleaner response
    const bids = bidDocument?.bids.map(bid => ({
      id: bid._id,
      bid: {
        id: bid.bidderId,
        name: bid.bidderName,
        avatar: bid.bidderId.avatar,
        email: bid.bidderEmail,
      },
      amount: bid.bidAmount,
      time: bid.bidTime,
      status: bid.status,
    })) || [];

    // Combine auction and bid data
    const response = {
      ...auction.toObject(),
      bids,
      highestBid: bidDocument?.highestBid || auction.startingPrice,
      totalBids: bidDocument?.totalBids || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching auction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}