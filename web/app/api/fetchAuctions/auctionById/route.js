

// import { connectToDB, userInfo } from "@/libs/functions";
// import Auction from "@/models/Auction";
// import Bid from "@/models/Bid";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//   const userId = await userInfo(req);
//   if (!userId?._id) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   await connectToDB();

//   // 1) Fetch all bids by this user
//   const userBidDocs = await Bid.find({ "bids.bidderId": userId })
//     .lean()
//     .exec();

//   const participatedAuctionIds = userBidDocs
//     .map((doc) => doc.auctionId)
//     .filter(Boolean);

//   // 2) Fetch all auctions the user participated in
//   const participated = participatedAuctionIds.length
//     ? await Auction.find({ _id: { $in: participatedAuctionIds } })
//         .lean()
//         .exec()
//     : [];

//   // 3) Transform auction data and compute additional fields
//   const transformedAuctions = participated.map((auction) => {
//     // Find the bid document for this auction
//     const bidDoc = userBidDocs.find(
//       (bid) => bid.auctionId.toString() === auction._id.toString()
//     );

//     // Get the user's latest bid
//     const userBids = bidDoc?.bids
//       .filter((bid) => bid.bidderId.toString() === userId.toString())
//       .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime)); // Sort by latest bid
//     const myBid = userBids?.[0]?.bidAmount || 0;

//     // Calculate time left
//     const now = new Date();
//     const endTime = new Date(auction.endTime);
//     let timeLeft = "";
//     if (auction.status === "active") {
//       const diffMs = endTime - now;
//       if (diffMs <= 0) {
//         timeLeft = "Ended";
//       } else {
//         const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
//         const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
//         timeLeft = `${diffHours}h ${diffMinutes}m`;
//       }
//     } else if (auction.status === "ended") {
//       timeLeft = auction.highestBidder?.toString() === userId.toString() ? "Won" : "Lost";
//     } else {
//       timeLeft = "N/A";
//     }

//     // Check for new activity (e.g., new bids since user's last bid)
//     const lastUserBidTime = userBids?.[0]?.bidTime || now;
//     const hasNewActivity = bidDoc?.bids.some(
//       (bid) => new Date(bid.bidTime) > new Date(lastUserBidTime)
//     );

//     return {
//       _id: auction._id,
//       title: auction.auctionTitle, // Map auctionTitle to title
//       description: auction.description || "",
//       imageUrl: auction.itemImg?.[0] || "/placeholder.svg", // Use first image
//       status: auction.status,
//       currentBid: bidDoc?.highestBid || auction.startingPrice, // Use highest bid or starting price
//       myBid, // User's latest bid
//       isHighestBidder: bidDoc?.highestBidder?.toString() === userId.toString(), // Check if user is highest bidder
//       hasNewActivity, // Indicate new bid activity
//       bids: bidDoc?.totalBids || 0, // Total number of bids
//       timeLeft, // Computed time left or status
//       endTime: auction.endTime, // Needed for sorting
//       totalQuantity: auction.totalQuantity, // Needed for sorting
//       highestBid: bidDoc?.highestBid || 0, // Needed for sorting
//     };
//   });

//   // 4) Partition into active, won, lost
//   const activeBids = transformedAuctions.filter((a) => a.status === "active");
//   const won = transformedAuctions.filter(
//     (a) => a.status === "ended" && a.isHighestBidder
//   );
//   const lost = transformedAuctions.filter(
//     (a) => a.status === "ended" && !a.isHighestBidder
//   );

//   return NextResponse.json(
//     { participated: transformedAuctions, activeBids, won, lost },
//     { status: 200 }
//   );
// }
import { connectToDB, userInfo } from "@/libs/functions";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import { NextResponse } from "next/server";

export async function GET(req) {
  console.log("🔍 Getting user info...");
  const userId = await userInfo(req);
  if (!userId?._id) {
    console.log("⛔ Unauthorized access attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  console.log("✅ User authorized:", userId._id);

  console.log("🔌 Connecting to database...");
  await connectToDB();
  console.log("✅ Connected to database");

  console.log("📥 Fetching all bids by user...");
  const userBidDocs = await Bid.find({ "bids.bidderId": userId }).lean().exec();
  console.log("✅ Fetched user bids:", userBidDocs.length);

  const participatedAuctionIds = userBidDocs
    .map((doc) => doc.auctionId)
    .filter(Boolean);
  console.log("📦 Participated auction IDs:", participatedAuctionIds);

  console.log("📥 Fetching participated auctions...");
  const participated = participatedAuctionIds.length
    ? await Auction.find({ _id: { $in: participatedAuctionIds } })
        .lean()
        .exec()
    : [];
  console.log("✅ Fetched auctions:", participated.length);

  console.log("🔄 Transforming auction data...");
  const userObjectId = userId._id.toString();

  const transformedAuctions = participated.map((auction) => {
    const bidDoc = userBidDocs.find(
      (bid) => bid.auctionId.toString() === auction._id.toString()
    );

    const userBids = bidDoc?.bids
      .filter((bid) => bid.bidderId.toString() === userObjectId)
      .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));

    const myBid = userBids?.[0]?.bidAmount || 0;

    const now = new Date();
    const endTime = new Date(auction.endTime);
    let timeLeft = "";

    if (auction.status === "active") {
      const diffMs = endTime - now;
      if (diffMs <= 0) {
        timeLeft = "Ended";
      } else {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        timeLeft = `${diffHours}h ${diffMinutes}m`;
      }
    } else if (auction.status === "ended") {
      timeLeft =
        bidDoc?.highestBidder?.toString() === userObjectId ? "Won" : "Lost";
    } else {
      timeLeft = "N/A";
    }

    const lastUserBidTime = new Date(userBids?.[0]?.bidTime || 0);

    const hasNewActivity = bidDoc?.bids.some(
      (bid) =>
        bid.bidderId.toString() !== userObjectId &&
        new Date(bid.bidTime) > lastUserBidTime
    );

    return {
      _id: auction._id,
      title: auction.auctionTitle,
      description: auction.description || "",
      imageUrl: auction.itemImg?.[0] || "/placeholder.svg",
      status: auction.status,
      currentBid: bidDoc?.highestBid || auction.startingPrice,
      myBid,
      isHighestBidder: bidDoc?.highestBidder?.toString() === userObjectId,
      hasNewActivity,
      bids: bidDoc?.totalBids || 0,
      timeLeft,
      endTime: auction.endTime,
      totalQuantity: auction.totalQuantity,
      highestBid: bidDoc?.highestBid || 0,
    };
  });

  console.log("📊 Partitioning auctions...");
  const activeBids = transformedAuctions.filter((a) => a.status === "active");
  const won = transformedAuctions.filter(
    (a) => a.status === "ended" && a.isHighestBidder
  );
  const lost = transformedAuctions.filter(
    (a) => a.status === "ended" && !a.isHighestBidder
  );

  const result = {
    participated: transformedAuctions,
    activeBids,
    won,
    lost,
  };

  console.log("✅ Final response data:", result);

  return NextResponse.json(result, { status: 200 });
}

