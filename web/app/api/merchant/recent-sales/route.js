import { connectToDB, userInfo } from "@/libs/functions";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDB();
    const user = await userInfo(req);
    
    if (!user || user.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch 5 most recent orders for this merchant
    const recentOrders = await Order.find({
      "merchantDetail.merchantId": user._id,
      "paymentStatus": "Paid" // Only show paid orders
    })
    .sort({ orderDate: -1 }) // Most recent first
    .limit(5);

    const formattedOrders = recentOrders.map(order => ({
      customerName: order.customerDetail.customerName,
      customerInitials: order.customerDetail.customerName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase(),
      productName: order.products[0]?.productName || "Multiple Items", // Show first product or "Multiple Items"
      amount: order.totalPrice,
      date: order.orderDate
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching recent sales:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 