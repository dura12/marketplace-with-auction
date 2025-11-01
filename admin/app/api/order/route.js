import Order from "@/models/Order";
import { connectToDB, isAdminOrSuperAdmin } from "@/utils/functions";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    await connectToDB();
    await isAdminOrSuperAdmin();

    const id = searchParams.get("id");

    if (id) {
      const order = await Order.findById(id);
      if (!order) {
        return new Response(
          JSON.stringify({ success: false, message: "Order not found" }),
          { status: 404 }
        );
      }
      return new Response(JSON.stringify({ success: true, order }), {
        status: 200,
      });
    } else {
      const orders = await Order.find();
      console.log("Orders fetched: ", orders);

      return new Response(JSON.stringify({ success: true, orders }), {
        status: 200,
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await isAdminOrSuperAdmin();

    const body = await req.json();
    const { _id, paymentStatus } = body;

    // Validate input
    if (!_id) {
      return NextResponse.json(
        { error: "Order ID is required", status: "fail" },
        { status: 400 }
      );
    }

    if (!["Refunded", "Paid To Merchant"].includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Invalid payment status", status: "fail" },
        { status: 400 }
      );
    }

    // Fetch the order
    const order = await Order.findById(_id);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found", status: "fail" },
        { status: 404 }
      );
    }

    // Prevent updating if the order is already in the desired status
    if (order.paymentStatus === paymentStatus) {
      return NextResponse.json(
        {
          error: `Order is already marked as ${paymentStatus}`,
          status: "fail",
        },
        { status: 400 }
      );
    }

    // Update the payment status
    order.paymentStatus = paymentStatus;
    await order.save(); // Save the updated order

    return NextResponse.json(
      {
        message: `Order status updated to ${paymentStatus}`,
        order,
        status: "success",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal Server Error", status: "fail" },
      { status: 500 }
    );
  }
}
