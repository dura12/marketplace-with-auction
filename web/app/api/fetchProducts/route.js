import { connectToDB } from "@/libs/functions";
import Product from "@/models/Product";

export async function GET(req) {
  console.log("Connecting to database...");
  await connectToDB();

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit")) || 10;
  const page = parseInt(url.searchParams.get("page")) || 1;
  const lat = parseFloat(url.searchParams.get("lat"));
  const lng = parseFloat(url.searchParams.get("lng"));
  const category = url.searchParams.get("category");

  console.log("Request parameters extracted:", {
    lat,
    lng,
    limit,
    page,
    category,
  });

  // Build base filter
  const filter = {
    isBanned: { $ne: true },
    isDeleted: { $ne: true },
    
  };

  if (category) {
    console.log("Applying category filter:", category);
    filter["category.categoryId"] = category;
  }

  try {
    const skip = (page - 1) * limit;
    let products;
    let total;

    if (lat && lng) {
      console.log("Lat & Lng provided, using geoNear aggregation");

      const aggregationPipeline = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distance",
            spherical: true,
            maxDistance: 1000000,
            query: filter,
          },
        },
        { $sort: { distance: 1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            productName: 1,
            category: 1,
            price: 1,
            offer: 1,
            images: { $slice: ["$images", 1] },
            merchantDetail: { merchantId: 1, merchantName: 1 },
            location: 1,
            delivery: 1,
            deliveryPrice: 1,
            distance: 1,
            createdAt: 1,
          },
        },
      ];

      console.log("Running geoNear aggregation...");
      products = await Product.aggregate(aggregationPipeline);
      console.log("Products: ", products);

      console.log(`GeoNear aggregation returned ${products.length} products`);

      if (products.length === 0) {
        console.log(
          "No geo-located products found, falling back to default find()"
        );
        products = await Product.find(filter)
          .select(
            "_id productName category price offer images merchantDetail delivery createdAt"
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();
        console.log(`Fallback query returned ${products.length} products`);
      }
    } else {
      console.log("No location provided, using default sorting with find()");
      products = await Product.find(filter)
        .select(
          "_id productName category price offer images merchantDetail delivery createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      console.log(`Find() query returned ${products.length} products`);
    }

    console.log("Counting total matching products...");
    total = await Product.countDocuments(filter);
    console.log(`Total products matching filter: ${total}`);

    console.log("Returning successful response...");
    return new Response(
      JSON.stringify({
        products,
        total,
        message: `Found ${products.length} products${
          lat && lng ? " sorted by distance" : ""
        }`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error during GET request:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch products",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
