"use client"

import { useEffect, useState } from "react"
import { AuctionCard } from "@/components/auction/auction-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"



export function EndingSoonAuctions() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/fetchAuctions/endingSoon')
        
        if (!response.ok) {
          throw new Error('Failed to fetch auctions')
        }

        const data = await response.json()
        setAuctions(data.auctions)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch auctions:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAuctions()
  }, [])

  if (loading) {
    return <EndingSoonSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (auctions.length === 0) {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>No auctions ending soon</AlertTitle>
        <AlertDescription>
          There are currently no auctions ending within the next 24 hours. Check back later!
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="scroll-smooth overflow-x-hidden mt-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {auctions.map((auction) => (
          <AuctionCard 
            key={auction._id} 
            auction={{
              _id: auction._id,
              auctionTitle: auction.auctionTitle,
              description: auction.description,
              highestBid: auction.highestBid,
              totalBids: auction.totalBids,
              bids: auction.bids,
              startingPrice: auction.startingPrice,
              bidIncrement: auction.bidIncrement,
              endTime: auction.endTime,
              itemImg: auction.itemImg,
              condition: auction.condition,
              status: auction.status,
              merchant: auction.merchant,
              productName: auction.productName,
            }} 
          />
        ))}
      </div>
    </div>
  )
}

// Helper function to calculate time left in a human-readable format
function getTimeLeft(endTime) {
  const endDate = new Date(endTime)
  const now = new Date()
  const timeLeft = endDate.getTime() - now.getTime()

  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// Helper function to determine urgency level based on time left
function getUrgencyLevel(endTime) {
  const endDate = new Date(endTime)
  const now = new Date()
  const hoursLeft = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursLeft < 3) {
    return "high"
  } else if (hoursLeft < 12) {
    return "medium"
  } else {
    return "low"
  }
}

function EndingSoonSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

