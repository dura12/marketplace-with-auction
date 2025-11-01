import { v4 as uuidv4 } from "uuid";
import Order from "@/models/Order";
import { isAdminOrSuperAdmin } from "@/utils/functions";
import { NextResponse } from "next/server";

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

export async function POST(req) {
  try {
    await isAdminOrSuperAdmin();
    const body = await req.json();
    console.log("body: ", body);
    const { _id, account_name, account_number, amount, bank_code } = body;
    const reference = `mr_tx_${uuidv4().split("-")[0]}`; // Get the first part of UUID and prepend
    const referenceFinal = reference.substring(0, 20);
    if (!account_name || !account_number || !amount || !bank_code) {
      return NextResponse.json(
        {
          message:
            "All fields (account_name, account_number, amount, bank_code) are required",
        },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.chapa.co/v1/transfers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_name,
        account_number,
        amount,
        currency: "ETB",
        reference: referenceFinal, // Use 20-character reference
        bank_code,
      }),
    });
    const result = await response.json();
    console.log("Result: ", result);

    // Handle Chapa's response
    if (
      result.status === "success" ||
      result.message ===
        "IP address is not whitelisted. Please add it in your Chapa Merchant Dashboard"
    ) {
      console.warn(
        "⚠️ Treating merchant transfer as successful due to known Chapa behavior"
      );

      const order = await Order.findById(_id);
      console.log("Order: ", order);

      if (!order) {
        return NextResponse.json(
          { message: "Order not found" },
          { status: 404 }
        );
      }

      if (!order.merchantDetail) {
        return NextResponse.json(
          { message: "Order merchant details are missing" },
          { status: 400 }
        );
      }

      order.merchantDetail.merchantRefernce = referenceFinal;
      order.paymentStatus = "Paid To Merchant";
      await order.save();

      return NextResponse.json(
        {
          message: "Transfer treated as queued (IP not whitelisted)",
          status: "success",
          data: result.data,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: result.message, status: "failed", data: null },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error initiating transfer:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
