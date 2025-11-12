"use client"
import { Loader } from "@googlemaps/js-api-loader"
import { createRef, type HTMLAttributes, useEffect, useState } from "react"
import { MapPin, RefreshCw } from "lucide-react"

type Props = HTMLAttributes<HTMLDivElement> & {
  location: number[]
  title?: string
}

export default function LocationMap({ location, title = "Location", ...divProps }: Props) {
  const mapsDivRef = createRef<HTMLDivElement>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapsDivRef.current) return

    const loadMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_MAPS_KEY as string,
          version: "weekly",
        })

        await loader.load()

        const { Map } = await loader.importLibrary("maps")
        const { AdvancedMarkerElement } = await loader.importLibrary("marker")

        const map = new Map(mapsDivRef.current as HTMLDivElement, {
          mapId: "map",
          center: { lng: location[0], lat: location[1] },
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true,
          fullscreenControl: true,
        })

        new AdvancedMarkerElement({
          map,
          position: { lng: location[0], lat: location[1] },
          title: title,
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading map:", error)
        setError("Failed to load map. Please try again later.")
        setIsLoading(false)
      }
    }

    loadMap()
  }, [location, title])

  return (
    <div className="relative" {...divProps}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="h-full min-h-[200px] flex items-center justify-center bg-muted">
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 mx-auto text-red-500" />
            <p className="font-medium mt-2">Map Error</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      )}

      <div
        ref={mapsDivRef}
        className="w-full h-full min-h-[200px] transition-opacity duration-300"
        style={{ opacity: isLoading || error ? 0 : 1 }}
      ></div>
    </div>
  )
}

