import { v4 as uuidv4 } from "uuid";
import { userInfo } from "@/libs/functions";

export async function POST(req) {
  try {
    const chapaKey = process.env.CHAPA_SECRET_KEY;
    const body = await req.json();

    const amount = body.total;
    const orderData = body;

    const tx_ref = `tx_${uuidv4().split("-")[0]}`;

    if (!amount || !orderData) {
      console.warn("⚠️ Missing required fields: amount or orderData");
      return new Response(
        JSON.stringify({
          message: "Missing required fields: amount and orderData are required",
        }),
        { status: 400 }
      );
    }

    if (!chapaKey) {
      console.error("❌ Chapa secret key not found in environment");
      return new Response(
        JSON.stringify({ message: "Chapa secret key not configured" }),
        { status: 500 }
      );
    }

    const user = await userInfo(req);
    if (!user) {
      console.warn("🚫 User not authenticated");
      return new Response(
        JSON.stringify({ message: "User not authenticated" }),
        { status: 401 }
      );
    }

    const email = user.email?.toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn("⚠️ Invalid email format:", email);
      return new Response(JSON.stringify({ message: "Invalid email format" }), {
        status: 400,
      });
    }

    const fullName = user.fullName?.trim().split(" ") || ["Unknown"];
    const first_name = fullName[0];
    const last_name = fullName.slice(1).join(" ") || "Unknown";
    const phone_number = user.phoneNumber || "";

    if (!phone_number) {
      console.warn("⚠️ Missing user phone number");
      return new Response(
        JSON.stringify({ message: "User phone number is missing" }),
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("⚠️ Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ message: "Missing or invalid Authorization header" }),
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];

    const orderResponse = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...orderData,
          transactionRef: tx_ref,
          paymentStatus: "Pending",
          userId: user._id,
        }),
      }
    );

    if (!orderResponse.ok) {
      const orderError = await orderResponse.text();
      console.error("❌ Order creation failed:", orderError);
      return new Response(
        JSON.stringify({
          message: "Order creation failed",
          details: orderError,
        }),
        { status: 400 }
      );
    }

    const orderDataResponse = await orderResponse.json();
    const orderId = orderDataResponse.order._id;

    const requestBody = {
      amount,
      currency: "ETB",
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      callback_url:
        process.env.CHAPA_CALLBACK_URL || "http://localhost:3000/api/callback",
      return_url: `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/verifyPayment-mobile?tx_ref=${tx_ref}&orderId=${orderId}`,
      customization: {
        title: "Order Payment",
        description: "Complete your payment via Chapa",
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

    if (!chapaResponse.ok) {
      const errorDetails = await chapaResponse.text();
      console.error("❌ Chapa API error:", errorDetails);
      await fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/order`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ _id: orderId }),
        }
      );
      return new Response(
        JSON.stringify({ message: "Chapa API error", details: errorDetails }),
        { status: 400 }
      );
    }

    const data = await chapaResponse.json();

    if (data.status === "success") {
      return new Response(
        JSON.stringify({
          checkout_url: data.data.checkout_url,
          tx_ref,
          orderId,
        }),
        { status: 200 }
      );
    } else {
      console.warn("⚠️ Transaction failed at Chapa:", data.message);
      await fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/order`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ _id: orderId }),
        }
      );
      return new Response(
        JSON.stringify({
          message: data.message || "Transaction initialization failed",
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("🔥 Checkout Error:", error);
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
