import { connectToDB } from "@/libs/functions";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { resolveValue } from "react-hot-toast";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tx_ref = searchParams.get("tx_ref");
    const chapaKey = process.env.CHAPA_SECRET_KEY;

    if (!tx_ref) {
      return NextResponse.json(
        { message: "Transaction reference (tx_ref) is required" },
        { status: 400 }
      );
    }

    if (!chapaKey) {
      return NextResponse.json(
        { message: "Chapa secret key not configured" },
        { status: 500 }
      );
    }

    // Make a request to Chapa's Verify Transaction endpoint
    const response = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${chapaKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    console.log("Verify result: ", result);

    // Handle Chapa's response
    if (result.status === "success") {
      await connectToDB();

      // Find and update the order
      const order = await Order.findOne({ transactionRef: tx_ref });
      if (!order) {
        return NextResponse.json(
          { message: "Order not found" },
          { status: 404 }
        );
      }

      console.log("verification/: ", result.data);
      if (result.data.reference){
        order.chapaRef = result.data.reference;
        order.paymentStatus = "Paid";
        await order.save()
      }

      return NextResponse.json(
        {
          message: "Payment verified successfully",
          data: result.data,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: result.message || "Payment verification failed",
          status: "failed",
          data: null,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
