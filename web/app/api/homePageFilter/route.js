import Product from "@/models/Product";
import { connectToDB } from "@/libs/functions";

export async function GET(req) {
  await connectToDB();

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const center = url.searchParams.get("centerg");
  const radius = parseInt(url.searchParams.get("radius")) || 10000; // Default to 10KM
  const page = parseInt(url.searchParams.get("page")) || 1;
  const limit = parseInt(url.searchParams.get("limit")) || 8;
  const skip = (page - 1) * limit;

  let filter = {
    isBanned: { $ne: true },
    isDeleted: { $ne: true },
  };

  let sort = {};
  let aggregationSteps = [];

  // Handle location-based filtering if center is provided
  if (center) {
    const coords = center.split("-");
    const lat = parseFloat(coords[0]);
    const lng = parseFloat(coords[1]);

    aggregationSteps.push({
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        query: filter,
        includeLocs: "location",
        distanceField: "distance",
        maxDistance: radius,
        spherical: true,
      },
    });
  } else {
    aggregationSteps.push({ $match: filter });
  }

  switch (type) {
    case "bestSellers":
      sort = { soldQuantity: -1 };
      aggregationSteps.push(
        {
          $addFields: {
            averageRating: { $avg: "$review.rating" },
            totalReviews: { $size: "$review" },
          },
        },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
          },
        }
      );
      break;

    case "latestProducts":
      sort = { createdAt: -1 };
      aggregationSteps.push(
        {
          $addFields: {
            averageRating: { $avg: "$review.rating" },
            totalReviews: { $size: "$review" },
          },
        },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
          },
        }
      );
      break;

    case "topRated":
      aggregationSteps.push(
        { $unwind: "$review" },
        {
          $group: {
            _id: "$_id",
            productName: { $first: "$productName" },
            merchantDetail: { $first: "$merchantDetail" },
            category: { $first: "$category" },
            price: { $first: "$price" },
            quantity: { $first: "$quantity" },
            description: { $first: "$description" },
            images: { $first: "$images" },
            location: { $first: "$location" },
            delivery: { $first: "$delivery" },
            deliveryPrice: { $first: "$deliveryPrice" },
            soldQuantity: { $first: "$soldQuantity" },
            createdAt: { $first: "$createdAt" },
            averageRating: { $avg: "$review.rating" },
            totalReviews: { $sum: 1 },
          },
        },
        { $match: { totalReviews: { $gte: 1 }, averageRating: { $gte: 4 } } },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $sort: { averageRating: -1 } }, { $skip: skip }, { $limit: limit }],
          },
        }
      );
      break;

    default:
      return new Response(JSON.stringify({ error: "Invalid type parameter" }), { status: 400 });
  }

  const result = await Product.aggregate(aggregationSteps);
  const products = result[0].data;
  const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

  // console.log("products: ", products);

  return new Response(JSON.stringify({ products, total, page, limit }), { status: 200 });
}