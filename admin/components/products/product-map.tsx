"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { MapPin, RefreshCw } from "lucide-react"

interface ProductMapProps {
  coordinates: [number, number] // [longitude, latitude]
  productName: string
  category?: string
  height?: string
  className?: string
}

export function ProductMap({
  coordinates,
  productName,
  category,
  height = "h-64 md:h-80",
  className = "",
}: ProductMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current || !coordinates) return

    const loadMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [lng, lat] = coordinates

        // Check if Google Maps API is already loaded
        if (window.google && window.google.maps) {
          initializeMap(lat, lng)
        } else {
          // Load Google Maps API if not already loaded
          const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_MAPS_KEY as string,
            version: "weekly",
          })

          await loader.load()
          initializeMap(lat, lng)
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error)
        setError("Failed to load map. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    const initializeMap = (lat: number, lng: number) => {
      const mapOptions = {
        center: { lat, lng },
        zoom: 12,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        fullscreenControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
      }

      // Create the map
      const map = new window.google.maps.Map(mapRef.current!, mapOptions)
      mapInstanceRef.current = map

      // Add a marker for the product location
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: productName,
        animation: window.google.maps.Animation.DROP,
      })
      markerRef.current = marker

      // Add info window with product name
      const infoContent = category
        ? `<div class="p-2"><strong>${productName}</strong><br/>${category}</div>`
        : `<div class="p-2"><strong>${productName}</strong></div>`

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
      })

      // Open info window by default
      infoWindow.open(map, marker)
    }

    loadMap()

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      mapInstanceRef.current = null
    }
  }, [coordinates, productName, category])

  if (error) {
    return (
      <div className={`${height} bg-muted flex items-center justify-center rounded-md ${className}`}>
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 mx-auto text-red-500" />
          <p className="font-medium mt-2">Map Error</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative rounded-md overflow-hidden ${className}`}>
      {isLoading && (
        <div className={`${height} bg-muted flex items-center justify-center absolute inset-0 z-10`}>
          <div className="text-center p-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 font-medium">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className={`${height} w-full transition-opacity duration-300`}
        style={{ opacity: isLoading ? 0 : 1 }}
        aria-label={`Map showing location of ${productName}`}
      />
    </div>
  )
}

