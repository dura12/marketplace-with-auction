"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns";

export function BidHistory({ auctionId }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        if (!auctionId) {
          throw new Error("Auction ID is required");
        }
        
        const response = await fetch(`/api/auctions/${auctionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bid history");
        }
        const data = await response.json();
        setBids(data.bids || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBids();
  }, [auctionId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bid History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading bid history...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bid History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (bids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bid History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">No bids yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bid History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bids.map((bid) => (
            <div
              key={bid.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={bid.avatar} alt={bid.bidderName} />
                  <AvatarFallback>{bid.bidderName}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{bid.bidderName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(bid.time), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">${bid.amount}</p>
                <p
                  className={`text-sm ${
                    bid.status === "active"
                      ? "text-green-500"
                      : bid.status === "outbid"
                      ? "text-red-500"
                      : "text-blue-500"
                  }`}
                >
                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

