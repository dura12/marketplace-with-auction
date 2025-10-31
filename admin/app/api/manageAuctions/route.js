// /app/api/manageAuctions/route.ts
import { connectToDB } from "@/utils/functions";
import { isAdminOrSuperAdmin } from "@/utils/functions";
import Auction from "@/models/Auction";

export async function GET(req) {
  try {
    await connectToDB();
    await isAdminOrSuperAdmin();

    const url = new URL(req.url);
    const _id = url.searchParams.get("_id");
    const status = url.searchParams.get("status");
    const adminApproval = url.searchParams.get("adminApproval");

    let filter = {};

    if (_id) filter._id = _id;
    if (status) filter.status = status;
    if (adminApproval) filter.adminApproval = adminApproval;

    const auctions = await Auction.find(filter);
    return new Response(JSON.stringify(auctions), { status: 200 });

  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message || "Error fetching auctions" }),
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectToDB();
    await isAdminOrSuperAdmin();

    const { auctionId, adminApproval, reason, description } = await req.json();
    console.log("Update data: ", auctionId, adminApproval, reason, description);

    if (!auctionId || !adminApproval) {
      return new Response(
        JSON.stringify({ message: "auctionId and adminApproval are required" }),
        { status: 400 }
      );
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return new Response(JSON.stringify({ message: "Auction not found" }), { status: 404 });
    }

    // Update approval status and auction status
    auction.adminApproval = adminApproval;
    auction.status = adminApproval === "approved" ? "active" : "cancelled";

    // Store rejection reason if applicable
    if (adminApproval === "rejected") {
      auction.rejectionReason = {
        category: reason || "unspecified",
        description: description || "No detailed reason provided"
      };
    }
    await auction.save();

    return new Response(JSON.stringify({ message: "Auction status updated successfully" }), { status: 200 });

  } catch (error) {
    console.log("error: ", error);
    return new Response(
      JSON.stringify({ message: error.message || "Error updating auction" }),
      { status: 500 }
    );
  }
}
