import { NextResponse } from "next/server";
import { userInfo } from "@/libs/functions";

export async function POST(req) {
  try {
    const body = await req.json();
    const { tx_ref, status, reference } = body;

    if (!tx_ref || !status) {
      return NextResponse.json({ message: "Missing tx_ref or status" }, { status: 400 });
    }

    if (status !== "success") {
      return NextResponse.json({ message: "Payment not successful" }, { status: 400 });
    }

    const user = await userInfo(req);
    if (!user) {
      return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
    }

    // Find the order by tx_ref
    const orderResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/order/verify?tx_ref=${tx_ref}`);
    if (!orderResponse.ok) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    const { order } = await orderResponse.json();

    // Update paymentStatus to Paid and save the Chapa reference
    const updateResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/order`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.token || ""}`,
      },
      body: JSON.stringify({
        _id: order._id,
        paymentStatus: "Paid",
        reference: reference
      }),
    });

    if (!updateResponse.ok) {
      const updateError = await updateResponse.text();
      return NextResponse.json({ message: "Failed to update order status", details: updateError }, { status: 400 });
    }

    return NextResponse.json({ message: "Order updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}