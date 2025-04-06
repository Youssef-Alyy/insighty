"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface AccidentData {
  code: string;
  accidents: number;
  name: string;
}

// Types for the color calculation system
interface Supply {
  supplyTypeId: string;
  quantity: number;
  need: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

// Color constants
const COLOR_STOPS = {
  RED: "#811C39", // High number of accidents
  YELLOW: "#F6AAC0", // Medium number of accidents
  GREEN: "#FDD0DD", // Low number of accidents
} as const;

// Helper functions for color calculations
const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const interpolateColor = (color1: string, color2: string, t: number): string => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);

  return rgbToHex(r, g, b);
};

export const calculateZoneColor = (accidents: number, maxAccidents: number): string => {
  if (!accidents || !maxAccidents) return COLOR_STOPS.GREEN;

  const ratio = accidents / maxAccidents;

  // Adjust these thresholds as needed
  if (ratio <= 0.3) return COLOR_STOPS.GREEN;
  if (ratio >= 0.7) return COLOR_STOPS.RED;

  if (ratio < 0.5) {
    // Interpolate between green and yellow
    const t = (ratio - 0.3) / 0.2;
    return interpolateColor(COLOR_STOPS.GREEN, COLOR_STOPS.YELLOW, t);
  } else {
    // Interpolate between yellow and red
    const t = (ratio - 0.5) / 0.2;
    return interpolateColor(COLOR_STOPS.YELLOW, COLOR_STOPS.RED, t);
  }
};

const Map: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    try {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
    } catch (error) {
      console.log("Error setting Mapbox access token:", error);
    }

    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [51.1839, 25.3548], // Center on Qatar
      zoom: 7.0,
      projection: "mercator",
    });

    mapRef.current.on("load", () => {
      if (!mapRef.current) return;

      // First add the source
      mapRef.current.addSource("qatar-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.boundaries-adm1-v4",
        promoteId: { boundaries_admin_1: "mapbox_id" },
      });

      // Add a basic layer first
      mapRef.current.addLayer({
        id: "qatar-boundaries-base",
        type: "fill",
        source: "qatar-boundaries",
        "source-layer": "boundaries_admin_1",
        paint: {
          "fill-color": "transparent",
        },
        filter: ["==", ["get", "iso_3166_1"], "QA"],
      });

      // Sample accident data with Mapbox IDs for Qatar municipalities
      const accidentData: AccidentData[] = [
        { code: "dXJuOm1ieGJuZDpBUks3OnY0", accidents: 100, name: "Doha" },
        { code: "dXJuOm1ieGJuZDpBaEs3OnY0", accidents: 120, name: "Al Rayyan" },
        { code: "dXJuOm1ieGJuZDpBeEs3OnY0", accidents: 90, name: "Al Wakra" },
        { code: "dXJuOm1ieGJuZDpCQks3OnY0", accidents: 110, name: "Umm Slal" },
        {
          code: "dXJuOm1ieGJuZDpCUks3OnY0",
          accidents: 150,
          name: "Al Khor and Al Thakhira",
        },
        { code: "dXJuOm1ieGJuZDpCaEs3OnY0", accidents: 80, name: "Al Shamal" },
        { code: "dXJuOm1ieGJuZDpCeEs3OnY0", accidents: 20, name: "Al Daayen" },
        {
          code: "dXJuOm1ieGJuZDpDQks3OnY0",
          accidents: 60,
          name: "Al Sheehaniya",
        },
      ];

      // Find the maximum number of accidents for scaling
      const maxAccidents = Math.max(...accidentData.map((d) => d.accidents));

      // Function to generate color based on accident count
      const getColor = (accidents: number): string => {
        return calculateZoneColor(accidents, maxAccidents);
      };

      // Create a data-driven style for fill color
      const matchExpression: mapboxgl.Expression = ["match", ["get", "mapbox_id"]];

      // Add color stops for each region
      accidentData.forEach((row) => {
        const color = getColor(row.accidents);
        matchExpression.push(row.code, color);
      });

      // Default color for regions with no data
      matchExpression.push("rgba(200, 200, 200, 0.5)");

      // Add layer for Qatar boundaries
      mapRef.current.addLayer(
        {
          id: "qatar-boundaries",
          type: "fill",
          source: "qatar-boundaries",
          "source-layer": "boundaries_admin_1",
          paint: {
            "fill-color": matchExpression,
            "fill-opacity": 0.7,
          },
          filter: ["==", ["get", "iso_3166_1"], "QA"],
        },
        "admin-1-boundary-bg"
      );

      // Update outline layer with same filter
      mapRef.current.addLayer(
        {
          id: "qatar-boundaries-outline",
          type: "line",
          source: "qatar-boundaries",
          "source-layer": "boundaries_admin_1",
          paint: {
            "line-color": "#000",
            "line-width": 1,
          },
          filter: ["==", ["get", "iso_3166_1"], "QA"],
        },
        "admin-1-boundary-bg"
      );
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return <div id="map" className="rounded-2xl shadow-2xl   aspect-square" ref={mapContainerRef} ></div>;
};

export default Map; 