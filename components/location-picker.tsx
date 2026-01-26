'use client';

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export type Location = {
  lat: number;
  lng: number;
};

export default function LocationPicker({
  defaultLocation,
  onChange,
  gpsCoords,
}: {
  defaultLocation: Location;
  onChange: (location: Location) => void;
  gpsCoords: Location | null;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_MAPS_KEY as string,
        version: "weekly",
      });

      const google = await loader.load();
      const { Map } = await loader.importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await loader.importLibrary("marker") as google.maps.MarkerLibrary;

      if (divRef.current) {
        const map = new Map(divRef.current, {
          mapId: "map",
          center: defaultLocation,
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
        });

        const marker = new AdvancedMarkerElement({
          position: defaultLocation,
          map: map,
        });

        map.addListener("click", (ev: google.maps.MapMouseEvent) => {
          if (ev.latLng) {
            const lat = ev.latLng.lat();
            const lng = ev.latLng.lng();
            marker.position = ev.latLng;
            onChange({ lat, lng });
          }
        });

        mapRef.current = map;
        markerRef.current = marker;
      }
    };

    loadMap();
  }, []);

  // When gpsCoords changes, update the marker and map center
  useEffect(() => {
    if (gpsCoords && mapRef.current && markerRef.current) {
      const latLng = new google.maps.LatLng(gpsCoords.lat, gpsCoords.lng);
      mapRef.current.setCenter(latLng);
      markerRef.current.position = latLng;
    }
  }, [gpsCoords]);

  return (
    <div ref={divRef} id="map" className="w-full h-[200px]" />
  );
}
