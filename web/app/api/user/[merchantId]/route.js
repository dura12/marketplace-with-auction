import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectToDB } from "@/libs/functions";

export async function GET(req, { params }) {
  try {
    await connectToDB()
    // Await params to resolve the Promise
    const { merchantId } = await params;

    if (!merchantId) {
      return NextResponse.json({ message: "Merchant ID is required" }, { status: 400 });
    }

    // Find the merchant by ID and ensure they are a merchant
    const merchant = await User.findOne({ _id: merchantId, role: "merchant" }).select(
      "_id fullName email phoneNumber account_name account_number bank_code isBanned isDeleted approvalStatus"
    );

    if (!merchant) {
      return NextResponse.json({ message: "Merchant not found" }, { status: 404 });
    }

    if (merchant.isBanned) {
      return NextResponse.json({ message: "Merchant is banned" }, { status: 403 });
    }

    if (merchant.isDeleted) {
      return NextResponse.json({ message: "Merchant account is deleted" }, { status: 410 });
    }

    if (merchant.approvalStatus !== "approved") {
      return NextResponse.json({ message: "Merchant is not approved" }, { status: 403 });
    }

    // Return only necessary fields
    const merchantData = {
      _id: merchant._id,
      fullName: merchant.fullName,
      email: merchant.email,
      phoneNumber: merchant.phoneNumber || "", // Fallback if not provided
      account_name: merchant.account_name || "Merchant Account",
      account_number: merchant.account_number || "N/A",
      bank_code: merchant.bank_code || "DEFAULT",
    };

    return NextResponse.json(merchantData, { status: 200 });
  } catch (error) {
    console.error("Error fetching merchant details:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}