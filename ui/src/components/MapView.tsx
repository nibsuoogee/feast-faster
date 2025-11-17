"use client";

import * as React from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapViewProps = {
  center?: [number, number];
  zoom?: number;
  active?: boolean;
};

export const MapView: React.FC<MapViewProps> = ({ center = [60.984, 25.663], zoom = 9, active = false }) => {
  const mapRef = React.useRef<L.Map | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map only if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (active && mapRef.current) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 250);
    }
  }, [active]);

  return (
    <div 
      ref={containerRef} 
      className="w-full rounded-lg overflow-hidden"
      style={{ height: "400px", minHeight: "400px" }}
    />
  );
};

export default MapView;
