import { connectToDB } from "@/libs/functions";
import Advertisement from "@/models/Advertisement";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectToDB();

  try {
    const body = await req.json();
    const { tx_ref, status, adId } = body;

    if (!tx_ref || !adId) {
      return new Response(JSON.stringify({ message: "Missing tx_ref or adId" }), { status: 400 });
    }

    const ad = await Advertisement.findById(adId);
    if (!ad) {
      return new Response(JSON.stringify({ message: "Advertisement not found" }), { status: 404 });
    }

    if (status === "success") {
      ad.paymentStatus = "PAID";
    } else {
      ad.paymentStatus = "FAILED";
    }

    await ad.save();

    return new Response(
      JSON.stringify({ message: "Payment status updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Callback error:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error", error: error.message }),
      { status: 500 }
    );
  }
}