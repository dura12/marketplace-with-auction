import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import Advertisement from "@/models/Advertisement";
import { connectToDB } from "@/libs/functions";
import User from "@/models/User";

export async function POST(req) {
  await connectToDB();
  const chapaKey = process.env.CHAPA_SECRET_KEY;
  let body;

  try {
    body = await req.json();
    const { amount, adData } = body;
    // Get _id from URL query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("_id");

    if (!amount || !adData || !adData.adId) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ message: "User ID is missing" }),
        { status: 400 }
      );
    }

    if (!chapaKey) {
      return new Response(
        JSON.stringify({ message: "Chapa secret key not configured" }),
        { status: 500 }
      );
    }

    // Get user info from the database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: User not found" },
        { status: 401 }
      );
    }

    // Validate user data
    if (user.role !== "merchant") {
      return NextResponse.json(
        { error: "Unauthorized: User must be a merchant" },
        { status: 401 }
      );
    }

    const email = user.email?.toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ message: "Invalid email format" }), {
        status: 400,
      });
    }

    const fullName = user.fullName?.trim().split(" ") || [];
    const first_name = fullName[0] || "Unknown";
    const last_name = fullName.slice(1).join(" ") || "Unknown";
    const phone_number = user.phoneNumber || "";

    if (!phone_number) {
      return new Response(
        JSON.stringify({ message: "User phone number is missing" }),
        { status: 400 }
      );
    }

    const tx_ref = `tx_${uuidv4().split("-")[0]}`;

    const requestBody = {
      amount,
      currency: "ETB",
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      callback_url:
        process.env.CHAPA_CALLBACK_URL || "http://localhost:3001/api/callback",
      return_url: `${
        process.env.NEXTAUTH_URL || "http://localhost:3001"
      }/verifyPayment/ad?tx_ref=${tx_ref}&adId=${adData.adId}`,
      customization: {
        title: "Ad Payment",
        description: `Payment for advertisement: ${
          adData.product?.productName || "Advertisement"
        }`
          .slice(0, 50)
          .replace(/[^\w\s.-]/g, ""),
      },
    };

    const chapaResponse = await fetch(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chapaKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await chapaResponse.json();

    if (!chapaResponse.ok || data.status !== "success") {
      console.error("Chapa API error details:", {
        status: chapaResponse.status,
        message: data.message,
        errors: data.errors || "No additional error details",
      });
      await Advertisement.findByIdAndUpdate(adData.adId, {
        paymentStatus: "FAILED",
      });
      return new Response(
        JSON.stringify({
          message: "Chapa API error",
          details: data.message || "Unknown error",
        }),
        { status: 400 }
      );
    }

    await Advertisement.findByIdAndUpdate(adData.adId, {
      paymentStatus: "PAID",
      tx_ref,
    });

    return new Response(
      JSON.stringify({
        checkout_url: data.data.checkout_url,
        tx_ref,
        adId: adData.adId,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    if (body?.adData?.adId) {
      await Advertisement.findByIdAndUpdate(body.adData.adId, {
        paymentStatus: "FAILED",
      });
    }
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}