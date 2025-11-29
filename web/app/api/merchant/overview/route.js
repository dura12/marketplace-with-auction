// import { connectToDB, userInfo } from "@/libs/functions";
// import Order from "@/models/Order";
// import Product from "@/models/Product";
// import Auction from "@/models/Auction";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//   try {
//     await connectToDB();
//     const user = await userInfo(req);
    
//     if (!user || user.role !== "merchant") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Get current month's start and end dates
//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

//     // Fetch merchant's orders
//     const orders = await Order.find({
//       "merchantDetail.merchantId": user._id,
//       orderDate: { $gte: startOfMonth, $lte: endOfMonth }
//     });

//     // Calculate metrics
//     const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
//     const totalOrders = orders.length;
//     const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

//     // Get product categories distribution
//     const products = await Product.find({ "merchantDetail.merchantId": user._id });
//     const categoryDistribution = products.reduce((acc, product) => {
//       const category = product.category.categoryName;
//       acc[category] = (acc[category] || 0) + 1;
//       return acc;
//     }, {});

//     // Format category data for pie chart
//     const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({
//       name,
//       value
//     }));

//     // Get monthly revenue data
//     const monthlyData = Array.from({ length: 12 }, (_, i) => {
//       const monthStart = new Date(now.getFullYear(), i, 1);
//       const monthEnd = new Date(now.getFullYear(), i + 1, 0);
      
//       const monthOrders = orders.filter(order => 
//         order.orderDate >= monthStart && order.orderDate <= monthEnd
//       );
      
//       const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      
//       return {
//         name: new Date(0, i).toLocaleString("default", { month: "short" }),
//         total: monthRevenue
//       };
//     });

//     // Get top selling product
//     const productSales = {};
//     orders.forEach(order => {
//       order.products.forEach(product => {
//         productSales[product.productId] = (productSales[product.productId] || 0) + product.quantity;
//       });
//     });

//     const topSellingProductId = Object.entries(productSales)
//       .sort(([,a], [,b]) => b - a)[0]?.[0];
    
//     const topSellingProduct = topSellingProductId 
//       ? await Product.findById(topSellingProductId)
//       : null;

//     // Get highest bid from active auctions
//     const activeAuctions = await Auction.find({
//       merchantId: user._id,
//       status: 'active',
//       endTime: { $gt: new Date() }
//     }).sort({ startingPrice: -1 }).limit(1);

//     // Calculate customer satisfaction from product reviews
//     const allProducts = await Product.find({ "merchantDetail.merchantId": user._id });
//     const reviews = allProducts.flatMap(product => product.review || []);
//     const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
//     const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : 0;

//     return NextResponse.json({
//       metrics: {
//         totalRevenue: totalRevenue.toFixed(2),
//         totalOrders,
//         avgOrderValue: avgOrderValue.toFixed(2),
//         conversionRate: "3.2%" // This would need actual conversion data
//       },
//       monthlyData,
//       categoryData,
//       topSellingProduct: topSellingProduct ? {
//         name: topSellingProduct.productName,
//         unitsSold: productSales[topSellingProduct._id] || 0
//       } : null,
//       highestBid: activeAuctions[0] ? {
//         name: activeAuctions[0].auctionTitle,
//         currentBid: activeAuctions[0].startingPrice
//       } : null,
//       customerSatisfaction: `${averageRating}/5.0`,
//       totalReviews: reviews.length
//     });
//   } catch (error) {
//     console.error("Error fetching merchant overview:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// } 
import { connectToDB, userInfo } from "@/libs/functions";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Auction from "@/models/Auction";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDB();
    const user = await userInfo(req);

    if (!user || user.role !== "merchant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch merchant's orders
    const orders = await Order.find({
      "merchantDetail.merchantId": user._id,
      orderDate: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Fetch all products for conversion rate
    const products = await Product.find({ "merchantDetail.merchantId": user._id });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate conversion rate (orders / total products listed)
    const totalProducts = products.length;
    const conversionRate = totalProducts > 0 ? ((totalOrders / totalProducts) * 100).toFixed(2) + "%" : "0%";

    // Get product categories distribution
    const categoryDistribution = products.reduce((acc, product) => {
      const category = product.category.categoryName;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Format category data for pie chart
    const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({
      name,
      value,
    }));

    // Get monthly revenue data
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), i, 1);
      const monthEnd = new Date(now.getFullYear(), i + 1, 0);

      const monthOrders = orders.filter(
        (order) => order.orderDate >= monthStart && order.orderDate <= monthEnd
      );

      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalPrice, 0);

      return {
        name: new Date(0, i).toLocaleString("default", { month: "short" }),
        total: monthRevenue,
      };
    });

    // Get top selling product
    const productSales = {};
    orders.forEach((order) => {
      order.products.forEach((product) => {
        productSales[product.productId] = (productSales[product.productId] || 0) + product.quantity;
      });
    });

    const topSellingProductId = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    const topSellingProduct = topSellingProductId
      ? await Product.findById(topSellingProductId)
      : null;

    // Get highest bid from active auctions
    const activeAuctions = await Auction.find({
      merchantId: user._id,
      status: "active",
      endTime: { $gt: new Date() },
    }).sort({ startingPrice: -1 }).limit(1);

    // Calculate customer satisfaction from product reviews
    const allProducts = await Product.find({ "merchantDetail.merchantId": user._id });
    const reviews = allProducts.flatMap((product) => product.review || []);
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(1) : 0;

    return NextResponse.json({
      metrics: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        avgOrderValue: avgOrderValue.toFixed(2),
        conversionRate, // Dynamic conversion rate
      },
      monthlyData,
      categoryData,
      topSellingProduct: topSellingProduct
        ? {
            name: topSellingProduct.productName,
            unitsSold: productSales[topSellingProduct._id] || 0,
          }
        : null,
      highestBid: activeAuctions[0]
        ? {
            name: activeAuctions[0].auctionTitle,
            currentBid: activeAuctions[0].startingPrice,
          }
        : null,
      customerSatisfaction: `${averageRating}/5.0`,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching merchant overview:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}