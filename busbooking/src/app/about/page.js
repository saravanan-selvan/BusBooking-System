"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState, useEffect } from "react";

// Set a fixed size for the map container
const containerStyle = {
  width: "100%",
  height: "400px",
};

// Fallback location (Bangalore example)
const defaultLocation = {
  lat: 12.9716,
  lng: 77.5946,
};

export default function BusTrackerMap({ busLocation }) {
  const [currentLocation, setCurrentLocation] = useState(
    busLocation || defaultLocation
  );

  // Simulate live movement every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLocation((prev) => {
        if (!prev) return prev; // safety check
        return {
          lat: prev.lat + 0.0001,
          lng: prev.lng + 0.0001,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation}
        zoom={15}
      >
        <Marker position={currentLocation} label="Bus" />
      </GoogleMap>
    </LoadScript>
  );
}
