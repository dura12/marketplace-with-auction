import { connectToDB } from "@/libs/functions"
import Auction from "@/models/Auction"
import Bid from "@/models/Bid"
import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        await connectToDB()
        
        const { searchParams } = new URL(request.url)
        const page = Number(searchParams.get("page")) || 1
        const limit = Number(searchParams.get("limit")) || 12
        const skip = (page - 1) * limit

        // Fetch active auctions with pagination
        const auctionResults = await Auction.find({
            status: "active",
            startTime: { $lte: new Date() },
            endTime: { $gt: new Date() }
        })
        .populate('merchantId', 'name avatar')
        .populate('productId', 'name')
        .sort({ endTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

        // Get auction IDs for bid lookup
        const auctionIds = auctionResults.map((a) => a._id);

        // Fetch bids for these auctions
        const bidResults = await Bid.find({
            auctionId: { $in: auctionIds },
        }).populate({
            path: 'bids.bidderId',
            select: 'name avatar email',
        });

        // Create a map of auctionId to bid data
        const bidMap = bidResults.reduce((acc, bidDoc) => {
            const bids = bidDoc.bids || [];
            const highestBid = bids.length > 0 ? Math.max(...bids.map((b) => b.bidAmount)) : 0;
            acc[bidDoc.auctionId.toString()] = {
                highestBid: highestBid || 0,
                totalBids: bids.length,
                bids: bids.map((bid) => ({
                    id: bid._id,
                    bidder: {
                        id: bid.bidderId?._id || null,
                        name: bid.bidderId?.name || bid.bidderName || 'Unknown',
                        avatar: bid.bidderId?.avatar || '/placeholder.svg',
                        email: bid.bidderId?.email || bid.bidderEmail || '',
                    },
                    amount: bid.bidAmount,
                    time: bid.bidTime,
                    status: bid.status,
                })),
            };
            return acc;
        }, {});

        // Combine auction data with bid data
        const auctions = auctionResults.map((auction) => {
            const bidData = bidMap[auction._id.toString()] || {
                highestBid: auction.startingPrice,
                totalBids: 0,
                bids: [],
            };
            return {
                ...auction,
                auctionTitle: auction.auctionTitle || 'Untitled Auction',
                highestBid: bidData.highestBid,
                totalBids: bidData.totalBids,
                bids: bidData.bids,
                itemImg: auction.itemImg?.[0] || '/placeholder.svg',
                merchant: {
                    id: auction.merchantId?._id || null,
                    name: auction.merchantId?.name || 'Unknown Merchant',
                    avatar: auction.merchantId?.avatar || '/placeholder.svg',
                },
                productName: auction.productId?.name || 'Unknown Product',
                timeLeft: Math.floor((auction.endTime - new Date()) / (1000 * 60 * 60)) // hours remaining
            };
        });
        console.log("Fetched auctions1: ", auctions)
        return NextResponse.json(auctions);
    } catch (error) {
        console.error("Error fetching auctions:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}