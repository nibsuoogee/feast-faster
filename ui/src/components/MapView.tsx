"use client";

import * as React from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
// @ts-ignore
import "leaflet.markercluster";

type ChargingStation = {
  id: string;
  name: string;
  address: string;
  availableChargers: number;
  totalChargers: number;
  lat: number;
  lng: number;
};

type MapViewProps = {
  center?: [number, number];
  zoom?: number;
  active?: boolean;
  stations?: ChargingStation[];
};

// Create custom charging station icon
const createStationIcon = (available: number, isAvailable: boolean) => {
  const color = isAvailable ? '#16a34a' : '#9ca3af'; // green-600 : gray-400
  const svgIcon = `
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" fill="${color}" stroke="white" stroke-width="2"/>
      <path d="M24 12 L28 22 L20 22 L24 32 L22 22 L26 22 Z" fill="white"/>
      ${isAvailable ? `
        <circle cx="36" cy="36" r="8" fill="white" stroke="${color}" stroke-width="2"/>
        <text x="36" y="40" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">${available}</text>
      ` : ''}
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-station-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// Create user location icon with pulsing animation
const createUserIcon = () => {
  const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @keyframes pulse {
            0% { opacity: 1; r: 12; }
            50% { opacity: 0.4; r: 16; }
            100% { opacity: 0; r: 20; }
          }
          .pulse-ring {
            animation: pulse 2s ease-out infinite;
          }
        </style>
      </defs>
      <circle class="pulse-ring" cx="16" cy="16" r="12" fill="#3b82f6" opacity="0.6"/>
      <circle cx="16" cy="16" r="10" fill="#2563eb" stroke="white" stroke-width="3"/>
      <circle cx="16" cy="16" r="5" fill="white"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-user-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const MapView: React.FC<MapViewProps> = ({ 
  center = [60.984, 25.663], 
  zoom = 9, 
  active = false,
  stations = []
}) => {
  const mapRef = React.useRef<L.Map | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const markersRef = React.useRef<L.Marker[]>([]);
  const clusterGroupRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map only if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Add user location marker (not clustered)
      const userMarker = L.marker(center, { icon: createUserIcon() }).addTo(mapRef.current);
      userMarker.bindPopup('<b>Your Location</b>');
      markersRef.current.push(userMarker);

      // Initialize marker cluster group
      clusterGroupRef.current = (L as any).markerClusterGroup({
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function(cluster: any) {
          const childCount = cluster.getChildCount();
          let c = ' marker-cluster-';
          if (childCount < 10) {
            c += 'small';
          } else if (childCount < 100) {
            c += 'medium';
          } else {
            c += 'large';
          }
          
          return L.divIcon({ 
            html: '<div><span>' + childCount + '</span></div>', 
            className: 'marker-cluster' + c, 
            iconSize: L.point(40, 40) 
          });
        }
      });
      
      mapRef.current.addLayer(clusterGroupRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
      clusterGroupRef.current = null;
    };
  }, []);

  // Update station markers when stations change
  React.useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;

    // Clear existing clustered markers
    clusterGroupRef.current.clearLayers();

    // Add new station markers to cluster group
    stations.forEach(station => {
      const isAvailable = station.availableChargers > 0;
      const icon = createStationIcon(station.availableChargers, isAvailable);
      
      const marker = L.marker([station.lat, station.lng], { icon });
      
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${station.name}</h3>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${station.address}</p>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="color: ${isAvailable ? '#16a34a' : '#9ca3af'}; font-weight: 600;">
              ${station.availableChargers}/${station.totalChargers} Available
            </span>
          </div>
        </div>
      `);
      
      clusterGroupRef.current.addLayer(marker);
    });
  }, [stations]);

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
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
};

export default MapView;
