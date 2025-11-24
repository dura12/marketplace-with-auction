import { NextResponse } from "next/server";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tx_ref = searchParams.get("tx_ref");

    if (!tx_ref) {
      return NextResponse.json({ message: "Transaction reference required" }, { status: 400 });
    }

    const order = await Order.findOne({ transactionRef: tx_ref });
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}