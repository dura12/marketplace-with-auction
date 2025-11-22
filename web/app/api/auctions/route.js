
import { connectToDB, checkProductAvailability, userInfo, elligibleToAuction } from "@/libs/functions";
import Auction from "@/models/Auction";
import { scheduleAuctionEnd, isMerchant } from "@/libs/functions";
import mongoose from "mongoose";

const createResponse = (data, status) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

const authenticateMerchant = async (req) => {
  await connectToDB();
  const merchantCheck = await isMerchant(req);
  if (merchantCheck instanceof Response) return merchantCheck;
  return merchantCheck;
};

export async function POST(req) {
  try {
    const auth = await authenticateMerchant(req);
    if (auth instanceof Response) return auth;

    await elligibleToAuction(req)
    const auctionData = await req.json();
    console.log("Received auction data:", auctionData);

    if (auctionData.productId) {
      if (!mongoose.Types.ObjectId.isValid(auctionData.productId)) {
        return createResponse({ error: "Invalid product ID format" }, 400);
      }
      try {
        const availability = await checkProductAvailability(auctionData.productId, auctionData.totalQuantity || 1);
        if (!availability.available) {
          return createResponse({ error: availability.message }, 400);
        }
      } catch (error) {
        if (error.name === "CastError") {
          return createResponse({ error: "Product not found: Invalid product ID" }, 400);
        }
        console.error("Error checking product availability:", error);
        return createResponse({ error: "Error checking product availability" }, 400);
      }
    }

    const auctionPayload = {
      auctionTitle: auctionData.auctionTitle,
      productId: auctionData.productId || undefined,
      merchantId: auth.merchantId,
      description: auctionData.description,
      condition: auctionData.condition,
      startTime: auctionData.startTime,
      endTime: auctionData.endTime,
      itemImg: auctionData.images,
      startingPrice: parseFloat(auctionData.startingPrice),
      reservedPrice: parseFloat(auctionData.reservedPrice),
      bidIncrement: parseFloat(auctionData.bidIncrement),
      status: "pending",
      adminApproval: "pending",
      totalQuantity: parseInt(auctionData.totalQuantity) || 1,
      category: auctionData.category,
    };

    const newAuction = await Auction.create(auctionPayload);
    await scheduleAuctionEnd(newAuction);
    return createResponse({ message: "Auction created successfully", auction: newAuction }, 201);
  } catch (error) {
    console.error("Error creating auction:", error);
    return createResponse({ error: "Internal server error" }, 500);
  }
}

export async function GET(req) {
  try {
    const auth = await authenticateMerchant(req);
    if (auth instanceof Response) return auth;

    const auctions = await Auction.find({ merchantId: auth.merchantId })
      .populate("productId", "productName") // Populate product name if available
      .lean();
    
    // Map auctions to include productName
    const auctionsWithProductName = auctions.map((auction) => ({
      ...auction,
      productName: auction.productId?.productName || auction.auctionTitle,
    }));

    return createResponse(auctionsWithProductName, 200);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return createResponse({ error: "Internal server error" }, 500);
  }
}

export async function PUT(req) {
  try {
    const auth = await authenticateMerchant(req);
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const { auctionId, ...updateData } = body; 
    
    if (!auctionId) {
      return createResponse({ error: "Auction ID is required" }, 400);
    }
    
    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return createResponse({ error: "Invalid auction ID format" }, 400);
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return createResponse({ error: "Auction not found" }, 404);
    }

    if (auction.merchantId.toString() !== auth.merchantId.toString()) {
      return createResponse({ error: "Forbidden: You are not the owner of this auction" }, 403);
    }

    // Modified condition to check admin approval and status
    if (
      !['rejected', 'pending'].includes(auction.adminApproval) || 
      auction.status !== 'pending'
    ) {
      return createResponse({ 
        error: "Cannot update auction that's already approved or in active/ended state" 
      }, 400);
    }

    const allowedFields = ["endTime", "reservedPrice", "itemImg", "description", "bidIncrement", "auctionTitle", "category", "startTime"];
    let scheduleEnd = false;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        // Special handling for date fields
        if (key === 'startTime' || key === 'endTime') {
          auction[key] = new Date(value);
        } else {
          auction[key] = value;
        }
        
        if (key === "endTime") scheduleEnd = true;
      }
    }

    auction.adminApproval = "pending";
    await auction.save();

    if (scheduleEnd) {
      await scheduleAuctionEnd(auction);
    }

    return createResponse({ 
      message: "Auction updated successfully", 
      auction 
    }, 200);
  } catch (error) {
    console.error("Error updating auction:", error);
    return createResponse({ error: "Internal server error" }, 500);
  }
}

export async function DELETE(req) {
  try {
  
    const auth = await authenticateMerchant(req);
    if (auth instanceof Response) return auth;
    const body = await req.json();
    const { auctionId } = body;

    console.log("DELETE request body:", body);

    if (!auctionId) {
      return createResponse({ error: "Auction ID is required" }, 400);
    }

    const auction = await Auction.findOne({ 
      _id: new mongoose.Types.ObjectId(auctionId), 
      merchantId: auth.merchantId });
    if (!auction) {
      return createResponse({ error: "Not authorized to delete this auction" }, 403);
    }
    
    if (auction.merchantId.toString() !== auth.merchantId.toString()) {
      return createResponse({ error: "Forbidden: You are not the owner of this auction" }, 403);
    }

    if (auction.adminApproval !== "pending") {
      return createResponse({ error: "Can only delete auctions pending approval" }, 403);
    }

    await Auction.deleteOne({ _id: auctionId });
    return createResponse({ message: "Auction deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting auction:", error);
    return createResponse({ error: "Internal server error" }, 500);
  }
}