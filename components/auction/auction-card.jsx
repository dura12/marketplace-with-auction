"use client";
   import { useState, useEffect } from "react";
   import Link from "next/link";
   import Image from "next/image";
   import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
   import { Button } from "@/components/ui/button";
   import { cn } from "@/libs/utils";
   import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
   import {
       Dialog,
       DialogContent,
       DialogDescription,
       DialogFooter,
       DialogHeader,
       DialogTitle,
       DialogTrigger,
   } from "@/components/ui/dialog";
   import { Input } from "@/components/ui/input";
   import { Label } from "@/components/ui/label";
   import { useToast } from "@/components/ui/use-toast";
   import { Clock, Heart } from "lucide-react";
   import { socket } from "@/libs/socketClient";
   import { useSession } from "next-auth/react";
   import { useRouter } from "next/navigation";
   import { calculateTimeLeft } from "@/libs/utils";

   export function AuctionCard({ auction }) {
       console.log("AuctionCard auction:", auction);
       const [isFavorite, setIsFavorite] = useState(false);
       const [currentBid, setCurrentBid] = useState(
           auction.highestBid > 0 ? auction.highestBid : auction.startingPrice
       );
       const [totalBids, setTotalBids] = useState(auction.totalBids || 0);
       const [bidAmount, setBidAmount] = useState(currentBid + auction.bidIncrement);
       const { toast } = useToast();
       const [timeLeft, setTimeLeft] = useState("");
       const [urgent, setUrgentLevel] = useState("");
       const { data: session } = useSession();
       const router = useRouter();

       // Join auction room and listen for real-time bid updates
       useEffect(() => {
           socket.emit("joinAuction", auction._id);

           const handleNewBid = (data) => {
               if (data.auctionId === auction._id) {
                   setCurrentBid(data.bidAmount);
                   setTotalBids((prev) => prev + (data.bidderId === session?.user?.id ? 0 : 1));
                   setBidAmount(data.bidAmount + auction.bidIncrement);
                   toast({
                       title: "New bid placed!",
                       description: `Someone bid $${data.bidAmount} on ${auction.auctionTitle}`,
                   });
               }
           };

           socket.on("newBid", handleNewBid);

           return () => {
               socket.off("newBid", handleNewBid);
           };
       }, [auction._id, auction.bidIncrement, auction.auctionTitle, session]);

       useEffect(() => {
           const updateTimeLeft = () => {
               const timeString = calculateTimeLeft(auction.endTime);
               setTimeLeft(timeString);
               const now = new Date();
               const endTime = new Date(auction.endTime);
               const diff = endTime - now;
               const totalHoursLeft = diff / (1000 * 60 * 60);

               setUrgentLevel(
                   totalHoursLeft < 8 ? "high" : totalHoursLeft < 18 ? "medium" : "low"
               );
           };

           updateTimeLeft();
           const timer = setInterval(updateTimeLeft, 60000);
           return () => clearInterval(timer);
       }, [auction.endTime]);

       const handleBid = async () => {
           if (!session) {
               router.push("/login");
               return;
           }

           const minBid = currentBid + auction.bidIncrement;
           if (bidAmount < minBid) {
               toast({
                   title: "Invalid bid amount",
                   description: `Your bid must be at least $${minBid}`,
                   variant: "destructive",
               });
               return;
           }

           try {
               const response = await fetch("/api/bid", {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify({
                       auctionId: auction._id,
                       bidAmount,
                   }),
               });

               if (!response.ok) {
                   const errorData = await response.json();
                   throw new Error(errorData.message || "Failed to place bid");
               }

               const data = await response.json();
               setCurrentBid(data.highestBid);
               setTotalBids(data.totalBids);
               setBidAmount(data.highestBid + auction.bidIncrement);

               toast({
                   title: data.message,
                   description: `You ${data.message.includes("updated") ? "updated your bid to" : "bid"} $${bidAmount} on ${auction.auctionTitle}`,
               });

               socket.emit("newBidIncrement", {
                   auctionId: auction._id,
                   bidAmount,
                   bidderName: session.user.name,
                   bidderEmail: session.user.email,
                   bidderId: session.user.id
               });
           } catch (error) {
               toast({
                   title: "Bid failed",
                   description: error.message,
                   variant: "destructive",
               });
           }
       };

       const handleBidChange = (e) => {
           const value = Number(e.target.value);
           const minBid = currentBid + auction.bidIncrement;
           setBidAmount(Math.max(value, minBid));
       };

       const incrementBid = () => {
           setBidAmount((prev) => prev + auction.bidIncrement);
       };

       const isEndingSoon = urgent === "high" || urgent === "medium";
       const hasBids = totalBids > 0;

       return (
           <Card className="overflow-hidden border-primary/10 auction-card-hover">
               <CardHeader className="p-0">
                   <div className="relative">
                       <Link href={`/auctions/${auction._id}`}>
                           <div className="aspect-[4/3] w-full overflow-hidden">
                               <Image
                                   src={auction.itemImg || "/placeholder.svg"}
                                   alt={auction.auctionTitle}
                                   width={400}
                                   height={300}
                                   className="h-full w-full object-cover transition-transform hover:scale-105"
                               />
                           </div>
                       </Link>
                       <Button
                           variant="ghost"
                           size="icon"
                           className="absolute right-2 top-2 rounded-full bg-background/80 backdrop-blur-sm"
                           onClick={() => setIsFavorite(!isFavorite)}
                       >
                           <Heart
                               className={`h-5 w-5 ${isFavorite ? "fill-destructive text-destructive" : ""}`}
                           />
                       </Button>
                       {isEndingSoon && (
                           <div className="absolute left-2 top-2 highlight-badge animate-pulse-slow">
                               Ending Soon
                           </div>
                       )}
                   </div>
               </CardHeader>

               <CardContent className="p-4">
                   <div className="space-y-2">
                       <Link href={`/auctions/${auction._id}`} className="block">
                           <h3 className="line-clamp-1 font-semibold">{auction.auctionTitle}</h3>
                       </Link>
                       <p className="line-clamp-2 text-sm text-muted-foreground">{auction.description}</p>

                       <div className="flex items-center justify-between">
                           <div>
                               <p className="text-sm font-medium">Current Bid</p>
                               <p className="text-lg font-bold text-primary">
                                   ${hasBids ? currentBid : auction.startingPrice}
                                   {!hasBids && (
                                       <span className="text-sm ml-2 text-muted-foreground">
                                           (Starting Price)
                                       </span>
                                   )}
                               </p>
                           </div>
                           <div className="text-right">
                               <p className="text-sm font-medium">
                                   {totalBids} {totalBids === 1 ? "bid" : "bids"}
                               </p>
                               <div className="flex items-center gap-1">
                                   <Clock
                                       className={cn(
                                           "h-4 w-4",
                                           urgent === "high" && "text-red-500",
                                           urgent === "medium" && "text-amber-500",
                                           urgent === "low" && "text-green-500"
                                       )}
                                   />
                                   <span
                                       className={cn(
                                           "text-sm font-medium",
                                           urgent === "high" && "text-red-500",
                                           urgent === "medium" && "text-amber-500",
                                           urgent === "low" && "text-green-500"
                                       )}
                                   >
                                       {timeLeft}
                                   </span>
                               </div>
                           </div>
                       </div>
                   </div>
               </CardContent>

               <CardFooter className="flex items-center justify-between border-t p-4 bg-muted/30">
                   <div className="flex items-center space-x-2">
                       <Avatar className="h-6 w-6 border border-primary/20">
                           <AvatarImage src={auction.merchant?.avatar} alt={auction.merchant?.name} />
                           <AvatarFallback className="bg-primary/10 text-primary">
                               {auction.merchant?.name?.[0] || "U"}
                           </AvatarFallback>
                       </Avatar>
                       <span className="text-xs text-muted-foreground">{auction.merchant?.name}</span>
                   </div>

                   <Dialog>
                       <DialogTrigger asChild>
                           <Button
                               size="sm"
                               className="gradient-bg border-0"
                               onClick={() => setBidAmount(currentBid + auction.bidIncrement)}
                           >
                               Place Bid
                           </Button>
                       </DialogTrigger>
                       <DialogContent>
                           <DialogHeader>
                               <DialogTitle>Place a Bid</DialogTitle>
                               <DialogDescription>
                                   {hasBids
                                       ? `Current highest bid: $${currentBid} (Minimum bid: $${currentBid + auction.bidIncrement})`
                                       : `Starting price: $${auction.startingPrice} (Minimum bid: $${auction.startingPrice + auction.bidIncrement})`}
                               </DialogDescription>
                           </DialogHeader>

                           <div className="grid gap-4 py-4">
                               <div className="grid gap-2">
                                   <Label htmlFor="bid-amount">Bid Amount ($)</Label>
                                   <div className="flex items-center gap-2">
                                       <Button
                                           variant="outline"
                                           size="icon"
                                           onClick={incrementBid}
                                           className="h-8 w-8"
                                       >
                                           +
                                       </Button>
                                       <Input
                                           id="bid-amount"
                                           type="number"
                                           min={currentBid + auction.bidIncrement}
                                           value={bidAmount}
                                           onChange={handleBidChange}
                                           onKeyDown={(e) => e.key === "ArrowDown" && e.preventDefault()}
                                           className="border-primary/20 text-center"
                                       />
                                   </div>
                               </div>
                           </div>

                           <DialogFooter>
                               <Button onClick={handleBid} className="gradient-bg border-0">
                                   {totalBids > 0 && auction.bids?.some(b => b.bidderId === session?.user?.id) ? "Update Bid" : "Place Bid"}
                               </Button>
                           </DialogFooter>
                       </DialogContent>
                   </Dialog>
               </CardFooter>
           </Card>
       );
   }