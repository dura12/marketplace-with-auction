import { connectToDB } from "@/libs/functions";
import Auction from "@/models/Auction";

export async function GET() {
  try {
    await connectToDB();

    // Get all unique statuses from active auctions
    const statuses = await Auction.aggregate([
      {
        $match: {
          status: { $exists: true },
          adminApproval: 'approved'
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          label: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'pending'] }, then: 'Pending Auctions' },
                { case: { $eq: ['$_id', 'active'] }, then: 'Active Auctions' },
                { case: { $eq: ['$_id', 'ended'] }, then: 'Ended Auctions' },
                { case: { $eq: ['$_id', 'cancelled'] }, then: 'Cancelled Auctions' }
              ],
              default: '$_id'
            }
          },
          count: 1
        }
      },
      {
        $sort: { id: 1 }
      }
    ]);

    // Add "All Auctions" option
    const allAuctionsCount = await Auction.countDocuments({ adminApproval: 'approved' });
    const formattedStatuses = [
      { id: 'all', label: 'All Auctions', count: allAuctionsCount },
      ...statuses
    ];

    return new Response(JSON.stringify(formattedStatuses), {
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