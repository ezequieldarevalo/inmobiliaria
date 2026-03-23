"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for Leaflet in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  popup?: string;
}

interface PropertyMapProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  height?: string;
  singleMarker?: boolean;
}

export default function PropertyMap({
  markers,
  center = [-34.6037, -58.3816], // Buenos Aires default
  zoom = 12,
  className = "",
  height = "400px",
  singleMarker = false,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: !singleMarker,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // Add new markers
    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: defaultIcon }).addTo(map);
      if (m.popup) {
        marker.bindPopup(m.popup);
      } else {
        marker.bindPopup(`<b>${m.title}</b>`);
      }
    });

    // If multiple markers, fit bounds
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [30, 30] });
    } else if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], singleMarker ? 16 : zoom);
    }
  }, [markers, zoom, singleMarker]);

  return (
    <div
      ref={mapRef}
      className={`rounded-xl overflow-hidden border border-gray-700 ${className}`}
      style={{ height, width: "100%" }}
    />
  );
}
