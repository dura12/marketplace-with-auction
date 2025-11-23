import Bid from "@/models/Bid";
import Auction from "@/models/Auction";
import { connectToDB, userInfo } from "@/libs/functions";
import { sendEmail } from "@/libs/sendEmail";
import { getIO } from "../../../socket-server/libs/socket";
import { createBidNotification } from "@/libs/createNotification";

export async function POST(req) {
  try {
    await connectToDB();
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    console.log("Received request body:", body);

    const session = await userInfo(req);
    console.log("User sesion: ", session);
    if (!session || !session.email) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { auctionId, bidAmount } = body;
    const bidderId = session._id;
    const bidderEmail = session.email;
    const bidderName = session.fullName;

    if (!auctionId || !bidAmount) {
      return new Response(
        JSON.stringify({ message: "Auction ID and bid amount are required" }),
        { status: 400 }
      );
    }

    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== "active") {
      return new Response(
        JSON.stringify({ message: "Auction is not active" }),
        { status: 400 }
      );
    }

    let bid = await Bid.findOne({ auctionId });
    const isNewBidDocument = !bid;

    if (isNewBidDocument) {
      bid = new Bid({
        auctionId,
        bids: [],
      });
    }

    // Record the previous highest bidder before modifying bids
    const previousHighestBidder = bid.highestBidder
      ? bid.highestBidder.toString()
      : null;

    // Determine the current highest bid
    const currentHighestBid =
      bid.bids.length > 0
        ? Math.max(...bid.bids.map((b) => b.bidAmount))
        : auction.startingPrice;

    // Validate bid amount
    const minBid = currentHighestBid + auction.bidIncrement;
    if (bidAmount < minBid) {
      return new Response(
        JSON.stringify({ message: `Bid amount must be at least $${minBid}` }),
        { status: 400 }
      );
    }

    const existingBidIndex = bid.bids.findIndex(
      (b) => b.bidderId.toString() === bidderId
    );
    const isNewBid = existingBidIndex === -1;

    if (isNewBid) {
      bid.bids.push({
        bidderId,
        bidderEmail,
        bidderName,
        bidAmount,
        bidTime: new Date(),
      });
    } else {
      bid.bids[existingBidIndex].bidAmount = bidAmount;
      bid.bids[existingBidIndex].bidTime = new Date();
    }

    await bid.save(); // Triggers pre-save hook to update highestBid and highestBidder

    // Get all unique participants
    const participants = [
      ...new Set(bid.bids.map((b) => b.bidderId.toString())),
    ];

    // Create notification for the current bidder
    await createBidNotification({
      userId: bidderId,
      auctionId,
      bidAmount,
      bidderName,
      bidderEmail,
      type: "bid",
      title: "New Bid Placed",
      description: `You placed a bid of $${bidAmount} on auction ${auction.auctionTitle}`,
    });

    // Create notifications for all other participants
    for (const participant of participants) {
      if (participant === bidderId.toString()) continue; // Skip the current bidder

      let notificationType, notificationTitle, notificationDescription;

      if (
        participant === previousHighestBidder &&
        previousHighestBidder !== bidderId.toString()
      ) {
        notificationType = "outbid";
        notificationTitle = "You've been outbid";
        notificationDescription = `${bidderName} outbid you with $${bidAmount} on auction ${auction.auctionTitle}`;
      } else {
        notificationType = "bid";
        notificationTitle = "New Bid Placed";
        notificationDescription = `${bidderName} placed a bid of $${bidAmount} on auction ${auction.auctionTitle}`;
      }

      await createBidNotification({
        userId: participant,
        auctionId,
        bidAmount,
        bidderName,
        bidderEmail,
        type: notificationType,
        title: notificationTitle,
        description: notificationDescription,
      });
    }

    // Emit socket events
    const io = getIO();
    io.to(auctionId).emit("newBid", {
      auctionId,
      bidAmount,
      bidderName,
      bidderEmail,
      bidderId,
    });

    if (
      previousHighestBidder &&
      previousHighestBidder !== bidderId.toString()
    ) {
      io.to(auctionId).emit("outbid", {
        auctionId,
        bidAmount,
        bidderName,
        bidderEmail,
        bidderId,
        recipientId: previousHighestBidder,
      });
    }

    // Send email to all participants except the current bidder
    const emailRecipients = participants.filter(
      (p) => p !== bidderId.toString()
    );
    if (emailRecipients.length > 0) {
      await sendEmail(
        emailRecipients,
        "New Bid Placed!",
        `A new bid of $${bidAmount} has been placed by ${bidderName} on auction ${auction.auctionTitle}.`
      );
    }

    return new Response(
      JSON.stringify({
        message: isNewBid
          ? "Bid placed successfully"
          : "Bid updated successfully",
        highestBid: bid.highestBid,
        totalBids: bid.totalBids,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Bid placement error:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to place bid",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
