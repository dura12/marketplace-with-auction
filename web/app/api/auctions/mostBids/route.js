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
        const sortBy = ["endTime", "totalBids"].includes(searchParams.get("sortBy")) ? searchParams.get("sortBy") : "endTime"
        const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1

        const auctionResults = await Auction.aggregate([
            { $match: { status: "active", endTime: { $gt: new Date() } } },
            { $lookup: {
                from: 'bids',
                localField: '_id',
                foreignField: 'auctionId',
                as: 'bidData'
            } },
            { $unwind: { path: '$bidData', preserveNullAndEmptyArrays: true } },
            { $addFields: {
                totalBids: { $ifNull: ['$bidData.totalBids', 0] },
                highestBid: { $ifNull: ['$bidData.highestBid', '$startingPrice'] }
            } },
            { $sort: { [sortBy]: sortOrder } },
            { $skip: skip },
            { $limit: limit },
            { $project: {
                _id: 1,
                auctionTitle: 1,
                itemImg: { $arrayElemAt: ['$itemImg', 0] },
                highestBid: 1,
                totalBids: 1,
                endTime: 1,
                status: 1
            } }
        ])

        return NextResponse.json(auctionResults)
    } catch (error) {
        console.error("Error fetching auctions:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}