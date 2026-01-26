"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Bell, Clock, DollarSign, Trophy, XCircle } from "lucide-react"
import { cn } from "@/libs/utils"
import { Button } from "@/components/ui/button"

export function MyAuctionCard({ auction, onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const [loggedUser, setLoggedUser] = useState(null)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const { data: session } = useSession()

  // Fetch user data when session is available
  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        setIsLoadingUser(true)
        try {
          const response = await fetch("/api/user")
          if (!response.ok) throw new Error(`Server error: ${response.status}`)
          const userData = await response.json()
          setLoggedUser(userData)
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast.error("Failed to load user data")
        } finally {
          setIsLoadingUser(false)
        }
      }
    }
    fetchUser()
  }, [session])

  // Calculate time left percentage for progress bar
  const calculateTimeLeftPercentage = () => {
    if (auction.status !== "active") return 100

    const now = new Date().getTime()
    const end = new Date(auction.endTime).getTime()
    const total = end - now

    if (total <= 0) return 100

    const sevenDays = 7 * 24 * 60 * 60 * 1000
    const elapsed = sevenDays - total
    return Math.min(Math.floor((elapsed / sevenDays) * 100), 100)
  }

  // Get status badge color
  const getStatusBadge = () => {
    switch (auction.status) {
      case "active":
        return auction.isHighestBidder ? (
          <Badge className="bg-success text-success-foreground">Highest Bidder</Badge>
        ) : (
          <Badge variant="outline" className="text-warning">Outbid</Badge>
        )
      case "won":
        return <Badge className="bg-success text-success-foreground">Won</Badge>
      case "lost":
        return <Badge variant="outline" className="text-destructive">Lost</Badge>
      case "ended":
        return <Badge variant="outline">Ended</Badge>
      default:
        return null
    }
  }

  // Get status icon based on auction.status
  const getStatusIcon = () => {
    switch (auction.timeLeft) {
      case "Won":
        return <Trophy className="h-5 w-5 text-success" />
      case "lost":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "active":
        return auction.isHighestBidder ? (
          <DollarSign className="h-5 w-5 text-success" />
        ) : (
          <DollarSign className="h-5 w-5 text-warning" />
        )
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

// Handle checkout process using fetched user data
async function handleCheckout() {
  if (!loggedUser) {
    toast.error("User data not loaded. Please try again.");
    return;
  }

  try {
    const response = await fetch(`/api/getAuctionOwner?auctionId=${auction._id}`);
    if (!response.ok) {
      toast.error("Failed to fetch merchant info");
      return;
    }

    const data = await response.json();
    const merchant = data.merchant;

    const orderData = {
      auction: {
        auctionId: auction._id || "ID",
        delivery: auction?.delivery || "FREE",
        deliveryPrice: auction?.deliveryPrice || 0,
      },
      customerDetail: {
        customerId: loggedUser._id,
        customerName: loggedUser.fullName,
        phoneNumber: loggedUser.phoneNumber,
        customerEmail: loggedUser.email,
        address: {
          state: loggedUser.stateName,
          city: loggedUser.cityName,
        },
      },
      merchantDetail: {
        merchantId: merchant._id,
        merchantName: merchant.fullName,
        merchantEmail: merchant.email,
        phoneNumber: merchant.phoneNumber,
        account_name: merchant.account_name,
        account_number: merchant.account_number,
        bank_code: merchant.bank_code,
      },
    };

    console.log("Prepared orderData for checkout:", orderData);

    const amount =
      auction.currentBid +
      (auction.delivery === "PAID" ? auction.deliveryPrice : 0);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, orderData }),
    });

    if (!res.ok) {
      const error = await res.json();
      toast.error(error.message || "Checkout failed");
      return;
    }

    const { checkout_url } = await res.json();
    toast.success("Checkout initiated!");

    // Optional: Redirect to checkout
    if (checkout_url) {
      window.location.href = checkout_url;
    }
  } catch (error) {
    console.error("Error during checkout:", error);
    toast.error("Checkout failed. Please try again.");
  }
}


  return (
    <Card
      className={cn(
        "overflow-hidden border-primary/10 transition-all duration-300 cursor-pointer relative",
        isHovered && "shadow-md transform -translate-y-1",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Notification indicator */}
      {auction.hasNewActivity && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground animate-pulse">
                <Bell className="h-3 w-3" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>New bid activity!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <Image
            src={auction.imageUrl || "/placeholder.svg"}
            alt={auction.title}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform duration-300"
            style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <Progress value={calculateTimeLeftPercentage()} className="h-1 rounded-none" />
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold line-clamp-1">{auction.title}</h3>
            {getStatusBadge()}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{auction.description}</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Bid</p>
              <p className="text-lg font-bold text-primary">${auction.currentBid}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Your Bid</p>
              <p
                className={cn("text-lg font-bold", auction.isHighestBidder ? "text-success" : "text-muted-foreground")}
              >
                ${auction.myBid || 0}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t p-4 bg-muted/30">
        <div className="flex items-center gap-1.5 text-sm">
          {getStatusIcon()}
          <span
            className={cn(auction.timeLeft === "Won" && "text-success", auction.timeLeft === "lost" && "text-destructive")}
          >
            {auction.timeLeft}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {auction.bids} {auction.bids === 1 ? "bid" : "bids"}
          </div>
          {auction.timeLeft === "Won" && (
            <Button
              size="sm"
              className="ml-2"
              onClick={(e) => {
                e.stopPropagation()
                handleCheckout()
              }}
              disabled={isLoadingUser}
            >
              {isLoadingUser ? "Loading..." : "Proceed to Checkout"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}