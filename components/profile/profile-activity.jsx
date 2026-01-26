"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Award, Clock, Gavel, Heart, Package, ShoppingCart } from "lucide-react"

// Mock activity data - in a real app, you would fetch this from your API
const mockActivities = [
  {
    id: "act1",
    type: "bid",
    auctionId: "auction1",
    auctionTitle: "Vintage Camera Collection",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    amount: 250,
    status: "outbid",
  },
  {
    id: "act2",
    type: "win",
    auctionId: "auction2",
    auctionTitle: "Antique Wooden Desk",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 450,
    status: "completed",
  },
  {
    id: "act3",
    type: "watchlist",
    auctionId: "auction3",
    auctionTitle: "Rare Coin Collection",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: "act4",
    type: "purchase",
    productId: "product1",
    productTitle: "Handcrafted Leather Wallet",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 85,
    status: "delivered",
  },
  {
    id: "act5",
    type: "bid",
    auctionId: "auction4",
    auctionTitle: "Vintage Vinyl Records",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 120,
    status: "won",
  },
]

export function ProfileActivity({ userId }) {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch activities from your API
    // async function fetchActivities() {
    //   try {
    //     const response = await fetch(`/api/users/${userId}/activities`)
    //     const data = await response.json()
    //     setActivities(data)
    //   } catch (error) {
    //     console.error('Error fetching activities:', error)
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }
    //
    // fetchActivities()

    // Using mock data for demonstration
    setTimeout(() => {
      setActivities(mockActivities)
      setIsLoading(false)
    }, 1000)
  }, [userId])

  if (isLoading) {
    return <ActivitySkeleton />
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No Activity Yet</h3>
          <p className="text-muted-foreground mt-1">
            Your activity will appear here once you start participating in auctions.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your recent actions and participation on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <ActivityIcon type={activity.type} status={activity.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-medium truncate">{getActivityTitle(activity)}</p>
                      <p className="text-sm text-muted-foreground">{formatTimestamp(activity.timestamp)}</p>
                    </div>
                    <ActivityStatus status={activity.status} amount={activity.amount} />
                  </div>
                </div>
              </div>
              {index < activities.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityIcon({ type, status }) {
  const iconClasses = "h-10 w-10 p-2 rounded-full"

  switch (type) {
    case "bid":
      return (
        <div className={`${iconClasses} bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400`}>
          <Gavel className="h-6 w-6" />
        </div>
      )
    case "win":
      return (
        <div className={`${iconClasses} bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400`}>
          <Award className="h-6 w-6" />
        </div>
      )
    case "watchlist":
      return (
        <div className={`${iconClasses} bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400`}>
          <Heart className="h-6 w-6" />
        </div>
      )
    case "purchase":
      return (
        <div className={`${iconClasses} bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400`}>
          <ShoppingCart className="h-6 w-6" />
        </div>
      )
    default:
      return (
        <div className={`${iconClasses} bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400`}>
          <Clock className="h-6 w-6" />
        </div>
      )
  }
}

function ActivityStatus({ status, amount }) {
  switch (status) {
    case "outbid":
      return (
        <Badge
          variant="outline"
          className="text-amber-500 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20"
        >
          Outbid ${amount}
        </Badge>
      )
    case "won":
      return (
        <Badge
          variant="outline"
          className="text-green-500 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
        >
          Won ${amount}
        </Badge>
      )
    case "active":
      return (
        <Badge
          variant="outline"
          className="text-blue-500 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20"
        >
          Active
        </Badge>
      )
    case "completed":
      return (
        <Badge
          variant="outline"
          className="text-green-500 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
        >
          Completed ${amount}
        </Badge>
      )
    case "delivered":
      return (
        <Badge
          variant="outline"
          className="text-green-500 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
        >
          <Package className="h-3 w-3 mr-1" />
          Delivered
        </Badge>
      )
    default:
      return null
  }
}

function getActivityTitle(activity) {
  switch (activity.type) {
    case "bid":
      return `Bid on "${activity.auctionTitle}"`
    case "win":
      return `Won auction "${activity.auctionTitle}"`
    case "watchlist":
      return `Added "${activity.auctionTitle}" to watchlist`
    case "purchase":
      return `Purchased "${activity.productTitle}"`
    default:
      return "Unknown activity"
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function ActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <Skeleton className="h-5 w-48 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </div>
              {i < 4 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

