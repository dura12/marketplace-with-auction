"use client";

import { AuctionCard } from "./auction-card";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function AuctionGrid() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/fetchAuctions?page=${page}&limit=12`);

                if (!response.ok) {
                    throw new Error("Failed to fetch auctions");
                }

                const data = await response.json();
                setAuctions(data);
                setHasMore(data.length === 12);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching auctions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAuctions();
    }, [page]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-[420px] w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error loading auctions: {error}</div>;
    }

    return (
        <div className="space-y-6">
            {auctions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No auctions found</div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {auctions.map((auction) => (
                        <AuctionCard key={auction._id} auction={auction} />
                    ))}
                </div>
            )}
            <div className="flex justify-center gap-4 mt-8">
                <Button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <Button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={!hasMore}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}