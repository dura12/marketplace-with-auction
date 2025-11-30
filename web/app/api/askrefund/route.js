import { connectToDB } from "@/libs/functions";
import User from "@/models/User";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import jwt from 'jsonwebtoken';

export async function PUT(req) {
  try {
    const session = await getServerSession(options);
    let userEmail = session?.user?.email;

    if (!userEmail) {
      const authHeader = req.headers.get("Authorization");
      const token = authHeader?.split(" ")[1];

      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized: No session or token found" },
          { status: 401 }
        );
      }

      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        userEmail = decoded?.email;
        if (!userEmail) {
          return NextResponse.json(
            { error: "Unauthorized: Invalid token" },
            { status: 401 }
          );
        }
      } catch (err) {
        return NextResponse.json(
          { error: "Unauthorized: Token verification failed" },
          { status: 401 }
        );
      }
    }

    await connectToDB();
    const sessionUser = await User.findOne({ email: userEmail });
    if (!sessionUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (sessionUser.isBanned || sessionUser.isDeleted) {
      return NextResponse.json(
        {
          error:
            "Your account is either banned or deleted, and you cannot update an order.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { _id, reason, description } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: "Refund reason is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(_id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      order.customerDetail.customerId.toString() !== sessionUser._id.toString()
    ) {
      return NextResponse.json(
        { error: "You are not authorized to request a refund for this order." },
        { status: 403 }
      );
    }

    order.paymentStatus = "Pending Refund";
    order.refundReason = reason;
    if (description) {
      order.refundDescription = description;
    }

    await order.save();

    return NextResponse.json(
      {
        message:
          "Your refund is being processed. Please wait until it is approved by the admin.",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
