import Category from "@/models/Category";
import { connectToDB } from "@/libs/functions";

export async function GET() {
  try {
    await connectToDB();

    // Aggregate categories with product count
    const categories = await Category.aggregate([
      {
        $match: {
          isDeleted: { $ne: true }, // Exclude deleted categories
        },
      },
      {
        $lookup: {
          from: 'products',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$category.categoryId', '$$categoryId'] },
                    { $ne: ['$isDeleted', true] } // Exclude deleted products
                  ]
                }
              }
            }
          ],
          as: 'products',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          createdBy: 1,
          productCount: { $size: '$products' },
        },
      },
    ]).exec();

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    });
  }
}