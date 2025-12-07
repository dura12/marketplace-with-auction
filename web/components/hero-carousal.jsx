"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    id: 1,
    title: "Next-Level Gaming Starts Here",
    subtitle: "Discover PlayStation 5 Today!",
    cta: "Shop Now",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Nu2eYsjP9J2HZEvAeG4KOLutmlS5os.png",
    link: "/products/ps5",
    urgent: "Hurry up only few left!",
  },
  {
    id: 2,
    title: "Summer Sale!",
    subtitle: "Enjoy discounts on selected items",
    cta: "Get 50% OFF",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4e8aZDaBKgJpc0gGOrP0tADcfrUSwH.png",
    link: "/sale",
  },
  // Add more slides as needed
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative h-full">
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
              <div className="container h-full flex items-center">
                <div className="max-w-lg text-white space-y-4">
                  {slide.urgent && <p className="text-orange-500 font-medium">{slide.urgent}</p>}
                  <h1 className="text-4xl md:text-5xl font-bold">{slide.title}</h1>
                  <p className="text-lg md:text-xl">{slide.subtitle}</p>
                  <div className="flex gap-4">
                    <Button asChild size="lg">
                      <a href={slide.link}>{slide.cta}</a>
                    </Button>
                    <Button variant="outline" size="lg">
                      Explore Deals
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

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
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-4" : "bg-white/50"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}

