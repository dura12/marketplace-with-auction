"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Star } from "lucide-react"

// Mock reviews data - in a real app, you would fetch this from your API
// const mockReviews = [
//   {
//     id: "review1",
//     reviewerId: "user1",
//     reviewerName: "Alice Johnson",
//     reviewerImage: "/placeholder.svg?height=40&width=40",
//     rating: 5,
//     comment: "Great seller! The item was exactly as described and shipping was fast. Would definitely buy from again.",
//     date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
//     auctionId: "auction1",
//     auctionTitle: "Vintage Camera Collection",
//   },
//   {
//     id: "review2",
//     reviewerId: "user2",
//     reviewerName: "Bob Smith",
//     reviewerImage: "/placeholder.svg?height=40&width=40",
//     rating: 4,
//     comment:
//       "Good experience overall. The item was in good condition as described. Shipping took a bit longer than expected, but still within reasonable time.",
//     date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
//     auctionId: "auction2",
//     auctionTitle: "Antique Wooden Desk",
//   },
//   {
//     id: "review3",
//     reviewerId: "user3",
//     reviewerName: "Carol Davis",
//     reviewerImage: "/placeholder.svg?height=40&width=40",
//     rating: 5,
//     comment:
//       "Excellent seller! Very responsive and helpful. The item was carefully packaged and arrived in perfect condition.",
//     date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
//     auctionId: "auction3",
//     auctionTitle: "Rare Coin Collection",
//   },
// ]

export function ProfileReviews({ userId }) {
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState()
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    //In a real app, you would fetch reviews from your API
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/merchant/reviews`)
        const data = await response.json()
        setReviews(data.reviews)
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchReviews()

    // Using mock data for demonstration
    setTimeout(() => {
      setReviews(data.review)
      setAverageRating(data.averageRating)
      setIsLoading(false)
    }, 1000)
  }, [userId])

  if (isLoading) {
    return <ReviewsSkeleton />
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No Reviews Yet</h3>
          <p className="text-muted-foreground mt-1">You haven't received any reviews yet.</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate average rating
  //const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
        <CardDescription>Reviews from users who have interacted with you</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Rating Summary */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{averageRating}</span>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(averageRating) ? "fill-amber-500 text-amber-500" : "text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</span>
          </div>
          <Separator orientation="vertical" className="h-16" />
          <div className="flex-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((review) => review.rating === rating).length
                const percentage = (count / reviews.length) * 100
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span className="text-xs w-3">{rating}</span>
                      <Star className="h-3 w-3 ml-1 fill-amber-500 text-amber-500" />
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={review.id}>
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.reviewerImage} alt={review.reviewerName} />
                  <AvatarFallback>{review.reviewerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{review.reviewerName}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-amber-500 text-amber-500" : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">{formatDate(review.date)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      For: <span className="font-medium">{review.auctionTitle}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{review.comment}</p>
                </div>
              </div>
              {index < reviews.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function ReviewsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        {/* Rating Summary Skeleton */}
        <Skeleton className="h-24 w-full mb-6" />

        {/* Reviews List Skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
              {i < 2 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

