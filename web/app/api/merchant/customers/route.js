import mongoose from 'mongoose';
import { isMerchant } from '@/libs/functions';
import Order from '@/models/Order';

export async function GET(req, res) {
  try {
    const merchantCheck = await isMerchant(req);
    if (merchantCheck instanceof Response) {
      return new Response(
        JSON.stringify({error: 'Unauthorized: Only Merchants can perform this operation'}),
        { status: 403 }
      );
    }
    const { merchantId } = merchantCheck;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const customers = await Order.aggregate([
      {
        $match: {
          "merchantDetail.merchantId": new mongoose.Types.ObjectId(merchantId),
          "status": "Received"
        }
      },
      {
        $group: {
          _id: "$customerDetail.customerId",
          orders: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" },
          lastOrder: { $max: "$orderDate" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer"
        }
      },
      {
        $unwind: "$customer"
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: "$customer.fullName",
          email: "$customer.email",
          avatar: "$customer.image",
          orders: 1,
          totalSpent: 1,
          lastOrder: 1,
          status: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$customer.isDeleted", true] },
                  { $eq: ["$customer.isBanned", true] },
                  { $lt: ["$lastOrder", thirtyDaysAgo] }
                ]
              },
              then: "Inactive",
              else: "Active"
            }
          }
        }
      }
    ]);
    return new Response(
      JSON.stringify(customers),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching customers:', error);
    return new Response(
      JSON.stringify({error: 'Internal server error'}),
      { status: 500 }
    );
  }
}