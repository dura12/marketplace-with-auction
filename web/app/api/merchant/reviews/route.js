import { connectToDB, userInfo } from "libs/functions";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(req, res) {
  const sessionId = await userInfo(req);

  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await connectToDB();

  try {
    const products = await Product.find({
      "merchantDetail.merchantId": sessionId,
      "review.0": { $exists: true },
    });

    const allReviews = products.flatMap((product) =>
      product.review.map((r) => ({
        ...r.toObject(),
        productId: product._id,
        productName: product.productName, // optionally include product info
      }))
    );

    // Get all unique customerIds from reviews
    const customerIds = [...new Set(allReviews.map((r) => r.customerId.toString()))];

    // Fetch user info for those customerIds
    const users = await User.find({ _id: { $in: customerIds } }, "fullName image");
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    // Attach user info to reviews
    const reviewsWithUserInfo = allReviews.map((review) => ({
      ...review,
      reviewerName: userMap[review.customerId.toString()]?.fullName || "Unknown",
      reviewerImage: userMap[review.customerId.toString()]?.image || "/default-avatar.png",
    }));

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    return new Response(
      JSON.stringify({
        averageRating: Number(averageRating.toFixed(1)),
        reviews: reviewsWithUserInfo,
        totalReviews: allReviews.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
