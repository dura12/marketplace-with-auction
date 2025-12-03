"use client";

import { useState, useEffect, use, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Heart, Share2 } from "lucide-react";
import { BidHistory } from "@/components/bid-history";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { socket } from "@/libs/socketClient";
import { calculateTimeLeft } from "@/libs/utils";

export default function AuctionDetailPage({ params }) {
  const { id } = use(params);
  const [auctionData, setAuctionData] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBidding, setIsBidding] = useState(false); // New state for bid loading
  const [dialogOpen, setDialogOpen] = useState(false); // State to control dialog
  const dialogCloseRef = useRef(null); // Ref for DialogClose
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  // Fetch auction data when the component mounts
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await fetch(`/api/auctions/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch auction data");
        }
        const data = await response.json();
        setAuctionData(data);
        setBidAmount(
          data.highestBid + data.bidIncrement || data.startingPrice + data.bidIncrement
        );
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  // Calculate time left when auctionData is available
  useEffect(() => {
    if (auctionData) {
      const updateTimeLeft = () => {
        const timeString = calculateTimeLeft(auctionData.endTime);
        setTimeLeft(timeString);
      };
      updateTimeLeft();
      const timer = setInterval(updateTimeLeft, 60000); // Update every minute
      return () => clearInterval(timer);
    }
  }, [auctionData]);

  // Listen for real-time bid updates
  useEffect(() => {
    if (auctionData) {
      socket.on("newBidIncrement", (data) => {
        if (data.auctionId === auctionData._id) {
          setAuctionData((prev) => ({
            ...prev,
            highestBid: data.bidAmount,
            totalBids: prev.totalBids + 1,
          }));
          setBidAmount(data.bidAmount + auctionData.bidIncrement);
        }
      });

      return () => socket.off("newBidIncrement");
    }
  }, [auctionData]);

  const handleBid = async () => {
    if (!session) {
      router.push("/login");
      toast({
        title: "Please log in",
        description: "You need to be logged in to place a bid.",
        variant: "destructive",
      });
      return;
    }

    if (!auctionData) return;

    const minBidAmount =
      (auctionData.highestBid || auctionData.startingPrice) + auctionData.bidIncrement;
    if (bidAmount < minBidAmount) {
      toast({
        title: "Invalid bid amount",
        description: `Your bid must be at least ETB${minBidAmount}`,
        variant: "destructive",
      });
      return;
    }

    setIsBidding(true); // Start loading

    try {
      const response = await fetch("/api/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId: auctionData._id,
          bidAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to place bid");
      }

      toast({
        title: "Bid placed successfully!",
        description: `You placed a bid of ETB${bidAmount} on ${auctionData.auctionTitle}`,
      });

      // Update local state
      setAuctionData((prev) => ({
        ...prev,
        highestBid: bidAmount,
        totalBids: prev.totalBids + 1,
      }));
      setBidAmount(bidAmount + auctionData.bidIncrement);

      // Emit socket event
      socket.emit("newBidIncrement", {
        auctionId: auctionData._id,
        bidAmount,
        bidderName: session.user.name,
        bidderEmail: session.user.email,
      });

      // Close the dialog
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error placing bid",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBidding(false); // Stop loading
    }
  };

  if (loading) {
    return (
      <div className="container p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !auctionData) {
    return <div className="container mx-auto px-4 py-8">Error: {error || "Auction not found"}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-4/3 overflow-hidden rounded-lg border">
            <Image
              src={auctionData.itemImg[0] || "/placeholder.svg"}
              alt={auctionData.auctionTitle}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {auctionData.itemImg.slice(1).map((image, index) => (
              <div key={index} className="relative aspect-4/3 overflow-hidden rounded-lg border">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${auctionData.auctionTitle} - Image ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Auction Details */}
        <div className="space-y-6 mt-4">
          <div>
            <h1 className="text-3xl font-bold">{auctionData.auctionTitle}</h1>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {timeLeft}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Current Bid Section */}
          <div className="w-full">
            <Card className="p-6 w-full">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Bid</p>
                  <p className="text-3xl font-bold text-primary">
                    ETB{auctionData.highestBid || auctionData.startingPrice}
                  </p>
                  <p className="text-sm text-muted-foreground">{auctionData.totalBids || 0} bids</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Starting Price</p>
                    <p className="font-medium">ETB{auctionData.startingPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reserve Price</p>
                    <p className="font-medium">ETB{auctionData.reservedPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Increment</p>
                    <p className="font-medium">ETB{auctionData.bidIncrement}</p>
                  </div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gradient-bg border-0 w-full">
                      Place Bid
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Place a Bid</DialogTitle>
                      <DialogDescription>
                        Current highest bid is ETB{auctionData.highestBid || auctionData.startingPrice}. Your bid must be
                        at least ETB{(auctionData.highestBid || auctionData.startingPrice) + auctionData.bidIncrement}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bid-amount">Bid Amount (ETB)</Label>
                        <Input
                          id="bid-amount"
                          type="number"
                          min={(auctionData.highestBid || auctionData.startingPrice) + auctionData.bidIncrement}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          className="border-primary/20"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleBid}
                        className="gradient-bg border-0"
                        disabled={isBidding}
                      >
                        {isBidding ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Placing Bid...
                          </div>
                        ) : (
                          "Place Bid"
                        )}
                      </Button>
                    </DialogFooter>
                    <DialogClose ref={dialogCloseRef} />
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={auctionData.merchantId?.avatar} alt={auctionData.merchantId?.name} />
                <AvatarFallback>{auctionData.merchantId?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{auctionData.merchantId?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {auctionData.merchantId?.rating} ★ · {auctionData.merchantId?.totalSales} sales
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="seller">Seller</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground">{auctionData.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Condition</p>
                  <p className="text-muted-foreground">{auctionData.condition}</p>
                </div>
                <div>
                  <p className="font-medium">Category</p>
                  <p className="text-muted-foreground">{auctionData.category}</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="shipping">
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{auctionData.location || "Not specified"}</p>
                </div>
                <div>
                  <p className="font-medium">Shipping Cost</p>
                  <p className="text-muted-foreground">ETB{auctionData.shippingCost || "TBD"}</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="seller">
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Seller Rating</p>
                  <p className="text-muted-foreground">{auctionData.merchantId?.rating} out of 5 stars</p>
                </div>
                <div>
                  <p className="font-medium">Total Sales</p>
                  <p className="text-muted-foreground">{auctionData.merchantId?.totalSales} items sold</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="mt-12 grid gap-8">
        <BidHistory auctionId={id} />
      </div>
    </div>
  );
}