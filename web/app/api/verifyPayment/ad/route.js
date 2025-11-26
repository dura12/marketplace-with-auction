import { NextResponse } from "next/server";
import Advertisement from "@/models/Advertisement";
import { connectToDB } from "@/libs/functions";
import mongoose from "mongoose";

export async function GET(req) {
  await connectToDB();

  try {
    const url = new URL(req.url);
    const tx_ref = url.searchParams.get("tx_ref");
    const adId = url.searchParams.get("adId");

    console.log("VerifyPayment request params:", { tx_ref, adId });

    if (!tx_ref || !adId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Find the advertisement
    const ad = await Advertisement.findById(adId);
    if (!ad) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    // Check if payment was already processed
    if (ad.paymentStatus === "PAID") {
      console.log("Payment already processed:", {
        adId,
        paymentStatus: ad.paymentStatus,
      });
      return NextResponse.redirect(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3001"
        }/dashboard/products/${ad.product._id}?payment=success`
      );
    }

    // Verify payment with Chapa
    const chapaKey = process.env.CHAPA_SECRET_KEY;
    const verifyResponse = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${chapaKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || verifyData.status !== "success") {
      // Update ad status to failed
      await Advertisement.findByIdAndUpdate(adId, {
        paymentStatus: "FAILED",
      });

      return NextResponse.redirect(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3001"
        }/dashboard/products/${ad.product._id}?payment=failed`
      );
    }

    // Update ad status to paid
    await Advertisement.findByIdAndUpdate(adId, {
      paymentStatus: "PAID",
      chapaRef: verifyData.data.id,
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3001"
      }/dashboard/products/${ad.product._id}?payment=success`
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.redirect(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3001"
      }/dashboard?error=payment_verification_failed`
    );
  }
}
