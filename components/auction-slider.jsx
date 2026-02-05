"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AuctionSlider() {
    const [auctions, setAuctions] = useState([])
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const fetchFeaturedAuctions = async () => {
            try {
                const response = await fetch('/api/auctions/mostBids?page=1&limit=5&sortBy=totalBids&sortOrder=desc')
                const data = await response.json()
                setAuctions(data)
            } catch (error) {
                console.error('Error fetching featured auctions:', error)
            }
        }
        fetchFeaturedAuctions()
    }, [])

    useEffect(() => {
        if (auctions.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % auctions.length)
            }, 4000)
            return () => clearInterval(timer)
        }
        
    }, [auctions.length])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % auctions.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + auctions.length) % auctions.length)
    }
    if(auctions.length === 0) {
        return (
            <div className="relative overflow-hidden bg-gray-100 py-8">
              <div className="container text-center text-gray-500">No available auction.</div>
            </div>
          );
    }

    return (
        <div className="relative overflow-hidden bg-gray-100 py-8">
            <div className="container relative">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {auctions.map((auction) => (
                        <div key={auction._id} className="min-w-full flex justify-center px-4">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-1/2">
                                        <img
                                            src={auction.itemImg || "/placeholder.svg"}
                                            alt={auction.auctionTitle}
                                            className="w-full h-64 md:h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-8 md:w-1/2 flex flex-col justify-center">
                                        <h3 className="text-2xl font-bold mb-4">{auction.auctionTitle}</h3>
                                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                            <a href={`/auctions/${auction._id}`}>Place Bid</a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {auctions.length > 1 && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40"
                            onClick={prevSlide}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40"
                            onClick={nextSlide}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {auctions.map((_, index) => (
                                <button
                                    key={index}
                                    className={`h-2 w-2 rounded-full transition-all ${
                                        index === currentSlide ? "bg-blue-600 w-4" : "bg-gray-300"
                                    }`}
                                    onClick={() => setCurrentSlide(index)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}