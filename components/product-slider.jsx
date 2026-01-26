"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductSlider({ isHomePage = false }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedAds = async () => {
      try {
        setLoading(true);
        // Get user's location for regional filtering
        let userLocation = null;
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          });
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        } catch (geoError) {
          console.log("Could not get user location:", geoError);
          // Fallback to a default location if geolocation fails
          userLocation = { lat: 0, lng: 0 }; // Adjust as needed
        }

        const center = `${userLocation.lat}-${userLocation.lng}`;
        console.log("location:", center);
        const url = `/api/advertisement?center=${center}&radius=50000&limit=5&${isHomePage ? "isHome=true" : "isHome=false"}`;
        console.log("Fetching from URL:", url);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch advertisements");
        const data = await response.json();
        console.log("API rrr:", data);
        setFeaturedProducts(data.ads);
      } catch (err) {
        console.error("Error fetching featured ads:", err);
        setError("Failed to load featured ads. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAds();

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHomePage, featuredProducts.length]); // Re-run if isHomePage or product length changes

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gray-100 py-8">
        <div className="container flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden bg-gray-100 py-8">
        <div className="container text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gray-100 py-8">
        <div className="container text-center text-gray-500">No featured ads available.</div>
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
          {featuredProducts.map((ad) => (
            <div key={ad._id} className="min-w-full flex justify-center px-4">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2">
                    <img
                      src={ad.product.images?.[0] || "/placeholder.svg"}
                      alt={ad.product.productName}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="p-8 md:w-1/2 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-2">{ad.product.productName}</h3>
                    <p className="text-gray-600 mb-4">{ad.product.description}</p>
                    <p className="text-3xl font-bold mb-6">${ad.product.price}</p>
                    <div className="flex gap-4">
                      <Button>Buy Now</Button>
                      <Button variant="outline">Learn More</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40"
          onClick={prevSlide}
          disabled={featuredProducts.length <= 1}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40"
          onClick={nextSlide}
          disabled={featuredProducts.length <= 1}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredProducts.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentSlide ? "bg-primary w-4" : "bg-gray-300"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}