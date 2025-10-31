import Product from "@/models/Product";
import { isAdminOrSuperAdmin } from "@/utils/functions";

export async function GET(req) {
  await isAdminOrSuperAdmin();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page")) || 1;
  const limit = parseInt(url.searchParams.get("limit")) || 30;
  const skip = (page - 1) * limit;
  const isBanned = url.searchParams.get("isBanned") === "true";
  const phrase = url.searchParams.get("phrase") || "";
  const center = url.searchParams.get("center");
  const radius = parseInt(url.searchParams.get("radius")) || 20000;

  // Additional filters
  const minPrice = parseFloat(url.searchParams.get("minPrice")) || undefined;
  const maxPrice = parseFloat(url.searchParams.get("maxPrice")) || undefined;
  const minQuantity =
    parseInt(url.searchParams.get("minQuantity")) || undefined;
  const maxQuantity =
    parseInt(url.searchParams.get("maxQuantity")) || undefined;
  const minAvgReview =
    parseFloat(url.searchParams.get("minAvgReview")) || undefined;
  const maxAvgReview =
    parseFloat(url.searchParams.get("maxAvgReview")) || undefined;
  const delivery = url.searchParams.get("delivery") || undefined;
  const minDeliveryPrice =
    parseFloat(url.searchParams.get("minDeliveryPrice")) || undefined;
  const maxDeliveryPrice =
    parseFloat(url.searchParams.get("maxDeliveryPrice")) || undefined;
  const categoryId = url.searchParams.get("categoryId") || undefined;

  let filter = { isBanned };

  // Case-insensitive, partial match for productName, brand, description
  if (phrase) {
    const regex = new RegExp(phrase, "i");
    filter.$or = [
      { productName: regex },
      { brand: regex },
      { description: regex },
    ];
  }

  if (minPrice) filter.price = { ...filter.price, $gte: minPrice };
  if (maxPrice) filter.price = { ...filter.price, $lte: maxPrice };
  if (minQuantity) filter.quantity = { ...filter.quantity, $gte: minQuantity };
  if (maxQuantity) filter.quantity = { ...filter.quantity, $lte: maxQuantity };

  if (minAvgReview || maxAvgReview) {
    filter.avgRating = {};
    if (minAvgReview) filter.avgRating.$gte = minAvgReview;
    if (maxAvgReview) filter.avgRating.$lte = maxAvgReview;
  }

  if (delivery && delivery !== "all") {
    filter.delivery = delivery.toUpperCase();
  }

  if (minDeliveryPrice) {
    filter.deliveryPrice = { ...filter.deliveryPrice, $gte: minDeliveryPrice };
  }

  if (maxDeliveryPrice) {
    filter.deliveryPrice = { ...filter.deliveryPrice, $lte: maxDeliveryPrice };
  }

  if (categoryId && categoryId !== "all") {
    filter["category.categoryId"] = categoryId;
  }

  let aggregationSteps = [];

  if (center) {
    const [lat, lng] = center.split("-").map(Number);
    aggregationSteps.push({
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        distanceField: "distance",
        maxDistance: radius,
        spherical: true,
        query: filter,
      },
    });
  } else {
    aggregationSteps.push({ $match: filter });
  }

  aggregationSteps.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
    },
  });

  const result = await Product.aggregate(aggregationSteps);
  const products = result[0].data || [];
  const total = result[0].metadata[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return new Response(
    JSON.stringify({
      products,
      total,
      pagination: { totalPages, page, limit },
    }),
    { status: 200 }
  );
}

export async function PUT(req) {
  await isAdminOrSuperAdmin();
  const adminInfo = await userInfo();

  if (adminInfo?.isBanned || adminInfo?.isDeleted) {
    return new Response(
      JSON.stringify({
        error: "You cannot perform this operation temporarily",
      }),
      { status: 403 }
    );
  }

  const { _id, isBanned, banReason, banDescription } = await req.json();

  if (!_id) {
    return new Response(JSON.stringify({ error: "Product ID is required" }), {
      status: 400,
    });
  }

  try {
    const product = await Product.findById(_id);
    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
      });
    }

    if (typeof isBanned === "boolean") {
      product.isBanned = isBanned;

      if (isBanned) {
        product.banReason = {
          reason: banReason || "No reason provided",
          description: banDescription || "",
        };
        product.bannedAt = new Date();
      } else {
        product.banReason = {
          reason: "",
          description: "",
        };
        product.bannedAt = null;
      }

      await product.save();
      return new Response(
        JSON.stringify({
          message: `Product ${isBanned ? "banned" : "unbanned"} successfully`,
        }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ error: "No valid update provided" }), {
      status: 400,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to update product" }), {
      status: 500,
    });
  }
}

export async function DELETE(req) {
  await isAdminOrSuperAdmin();

  const adminInfo = await userInfo();

  if (adminInfo?.isBanned || adminInfo?.isDeleted) {
    return new Response(
      JSON.stringify({
        error: "You cannot perform this operation temporarily",
      }),
      {
        status: 403,
      }
    );
  }

  const url = new URL(req.url);
  const { _id } = await req.json();

  if (!_id) {
    return new Response(JSON.stringify({ error: "Product ID is required" }), {
      status: 400,
    });
  }

  try {
    const product = await Product.findById(_id);

    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
      });
    }

    await Product.findByIdAndDelete(_id);

    return new Response(
      JSON.stringify({ message: "Product permanently deleted" }),
      { status: 200 }
    );

    // To use trash logic, uncomment the following block:
    // if (product.isDeleted && product.trashDate) {
    //   await Product.findByIdAndDelete(_id);
    //   console.log("[DELETE] Permanently deleted trashed product:", _id);
    //   return new Response(JSON.stringify({ message: "Product permanently deleted" }), { status: 200 });
    // } else {
    //   product.isDeleted = true;
    //   product.trashDate = new Date();
    //   await product.save();
    //   console.log("[DELETE] Product moved to trash:", _id);
    //   return new Response(
    //     JSON.stringify({ message: "Product moved to trash. It will be permanently deleted after 30 days" }),
    //     { status: 200 }
    //   );
    // }
  } catch (error) {
    console.error("[DELETE] Error in handler:", error.message);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
