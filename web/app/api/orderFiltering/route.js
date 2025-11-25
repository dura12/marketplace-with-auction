import { userInfo } from "@/libs/functions";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionUser = await userInfo(req);

    // Check if user is authenticated
    if (!sessionUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized: User not found",
        }),
        { status: 401 }
      );
    }

    // Initialize aggregation pipeline
    let aggregationSteps = [];

    // Determine user role and apply role-based filtering
    const userRole = sessionUser.role;
    const myOrders = searchParams.get("myOrders") === "true";

    if (userRole === "merchant") {
      if (myOrders) {
        // Merchant acting as customer
        aggregationSteps.push({
          $match: {
            "customerDetail.customerId": new mongoose.Types.ObjectId(
              sessionUser._id
            ),
          },
        });
      } else {
        // Merchant as seller
        aggregationSteps.push({
          $match: {
            "merchantDetail.merchantId": new mongoose.Types.ObjectId(
              sessionUser._id
            ),
          },
        });
      }
    } else if (userRole === "customer") {
      // Customer filtering by their own orders
      aggregationSteps.push({
        $match: {
          "customerDetail.customerId": new mongoose.Types.ObjectId(
            sessionUser._id
          ),
        },
      });
    }

    // Extract query parameters for filtering
    const merchantId = searchParams.get("merchantId");
    const customerId = searchParams.get("customerId");
    const productId = searchParams.get("productId");
    const auctionId = searchParams.get("auctionId");
    const minTotalPrice = searchParams.get("minTotalPrice");
    const maxTotalPrice = searchParams.get("maxTotalPrice");
    const paymentStatus = searchParams.get("paymentStatus");
    const status = searchParams.get("status");
    const center = searchParams.get("center");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const delivery = searchParams.get("delivery");
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // Define filter object for additional filtering and count
    let filter = {};

    if (merchantId) {
      filter["merchantDetail.merchantId"] = new mongoose.Types.ObjectId(
        merchantId
      );
    }
    if (customerId) {
      filter["customerDetail.customerId"] = new mongoose.Types.ObjectId(
        customerId
      );
    }
    if (productId) {
      filter["products.productId"] = new mongoose.Types.ObjectId(productId);
    }
    if (auctionId) {
      filter["auction.auctionId"] = new mongoose.Types.ObjectId(auctionId);
    }
    if (minTotalPrice || maxTotalPrice) {
      filter.totalPrice = {};
      if (minTotalPrice) {
        const min = Number(minTotalPrice);
        if (!isNaN(min) && min >= 0) filter.totalPrice.$gte = min;
      }
      if (maxTotalPrice) {
        const max = Number(maxTotalPrice);
        if (!isNaN(max) && max >= 0) filter.totalPrice.$lte = max;
      }
    }
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }
    if (status) {
      filter.status = status;
    }
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) filter.orderDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) filter.orderDate.$lte = end;
      }
    }
    if (delivery) {
      filter.$or = [
        { "products.delivery": delivery },
        { "auction.delivery": delivery },
      ];
    }
    if (state) {
      filter["customerDetail.address.state"] = state;
    }
    if (city) {
      filter["customerDetail.address.city"] = city;
    }

    // Location-based filtering
    if (center) {
      const coords = center.split("-");
      const lat = parseFloat(coords[0]);
      const lng = parseFloat(coords[1]);
      aggregationSteps.unshift({
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          query: filter,
          includeLocs: "location",
          distanceField: "distance",
          spherical: true,
        },
      });
    } else {
      aggregationSteps.push({ $match: filter });
    }

    // Sorting options
    const sortOptions = {};
    if (sortBy) {
      const validSortFields = ["totalPrice", "orderDate", "status", "distance"];
      if (validSortFields.includes(sortBy)) {
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      }
    } else {
      sortOptions.orderDate = -1;
    }
    aggregationSteps.push({ $sort: sortOptions });

    // Pagination
    const skip = (page - 1) * limit;
    aggregationSteps.push({ $skip: skip });
    aggregationSteps.push({ $limit: limit });

    // Execute aggregation pipeline
    console.log(
      "Aggregation steps:",
      JSON.stringify(aggregationSteps, null, 2)
    );
    const orders = await Order.aggregate(aggregationSteps);

    console.log("filtered orders: ", orders);

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        orders,
        pagination: {
          page,
          limit,
          totalOrders,
          totalPages: Math.ceil(totalOrders / limit),
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
