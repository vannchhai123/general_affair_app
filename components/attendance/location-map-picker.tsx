'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  useMapEvents,
  useMap,
  Tooltip,
} from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Trash2,
  RotateCcw,
  MapPin,
  Compass,
  Loader2,
  LocateFixed,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

// Custom Leaflet marker icon configuration for Next.js SSR
const createNumberedIcon = (num: number) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background-color: #2563eb;
      color: #ffffff;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      transform: translate(-13px, -13px);
      cursor: grab;
    ">${num}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

export interface LatLngPoint {
  latitude: number;
  longitude: number;
}

interface LocationMapPickerProps {
  points: LatLngPoint[];
  onChange: (points: LatLngPoint[]) => void;
}

// Helper component to handle click events on the map
function MapClickHandler({ onAddPoint }: { onAddPoint: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

// Helper component to dynamically fly / pan map center
function ChangeView({ center, zoom = 17 }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.2,
    });
  }, [center, zoom, map]);
  return null;
}

export default function LocationMapPicker({ points, onChange }: LocationMapPickerProps) {
  // Compute initial center based on points centroid or default Phnom Penh
  const defaultCenter = useMemo<[number, number]>(() => {
    if (points.length > 0) {
      const sumLat = points.reduce((acc, p) => acc + p.latitude, 0);
      const sumLng = points.reduce((acc, p) => acc + p.longitude, 0);
      return [sumLat / points.length, sumLng / points.length];
    }
    return [11.577559, 104.869771]; // Sen Sok / Phnom Penh default
  }, [points]);

  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState<number>(points.length > 0 ? 18 : 16);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Address search via OpenStreetMap Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const query =
        searchQuery.includes('Cambodia') || searchQuery.includes('Phnom Penh')
          ? searchQuery
          : `${searchQuery}, Phnom Penh, Cambodia`;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);
        setMapZoom(18);
        toast.success(`បានរកឃើញ៖ ${data[0].display_name.split(',')[0]}`);
      } else {
        toast.error('រកមិនឃើញទីតាំងដែលបានស្វែងរកទេ');
      }
    } catch {
      toast.error('បរាជ័យក្នុងការស្វែងរកទីតាំង');
    } finally {
      setIsSearching(false);
    }
  };

  // Add Point
  const handleAddPoint = (lat: number, lng: number) => {
    onChange([...points, { latitude: lat, longitude: lng }]);
  };

  // Drag Marker End
  const handleMarkerDrag = (index: number, e: L.LeafletEvent) => {
    const marker = e.target as L.Marker;
    const { lat, lng } = marker.getLatLng();
    const updated = [...points];
    updated[index] = {
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    };
    onChange(updated);
  };

  // Undo Last Point
  const handleUndoLastPoint = () => {
    if (points.length === 0) return;
    onChange(points.slice(0, -1));
  };

  // Clear all points
  const handleClearPoints = () => {
    onChange([]);
  };

  // Locate browser GPS
  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រ Geolocation ទេ');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setMapCenter([lat, lng]);
        setMapZoom(19);
        toast.success('បានកំណត់ទីតាំងបច្ចុប្បន្នរបស់អ្នក');
      },
      (error) => {
        setIsLocating(false);
        toast.error(`មិនអាចទាញយកទីតាំងបានទេ៖ ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Quick Preset Jumps
  const handleJumpToPreset = (lat: number, lng: number, name: string) => {
    setMapCenter([lat, lng]);
    setMapZoom(18);
    toast.info(`បានផ្លាស់ទីទៅកាន់ ${name}`);
  };

  return (
    <div className="space-y-3">
      {/* Search Bar & Action Controls */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleSearch();
              }
            }}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void handleSearch()}
            disabled={isSearching || !searchQuery.trim()}
            className="h-9 text-xs gap-1.5"
          >
            {isSearching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            ស្វែងរក
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetMyLocation}
            disabled={isLocating}
            className="h-9 text-xs gap-1 text-primary hover:bg-primary/5"
            title="ទីតាំង GPS របស់ខ្ញុំ"
          >
            {isLocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LocateFixed className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">ទីតាំងខ្ញុំ</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndoLastPoint}
            disabled={points.length === 0}
            className="h-9 text-xs gap-1"
            title="ត្រឡប់ចំណុចចុងក្រោយ"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ថយក្រោយ</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearPoints}
            disabled={points.length === 0}
            className="h-9 text-xs gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="លុបចំណុចទាំងអស់"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">លុបទាំងអស់</span>
          </Button>
        </div>
      </div>

      {/* Quick Landmark Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-muted-foreground">
        <span className="shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          ផ្លាស់ទីរហ័ស៖
        </span>
        <button
          type="button"
          onClick={() => handleJumpToPreset(11.577559, 104.869771, 'Sen Sok Office')}
          className="rounded-md border bg-muted/40 px-2 py-0.5 text-xs text-foreground hover:bg-muted transition"
        >
          Sen Sok Office
        </button>
        <button
          type="button"
          onClick={() => handleJumpToPreset(11.588065, 104.929502, 'Norton University')}
          className="rounded-md border bg-muted/40 px-2 py-0.5 text-xs text-foreground hover:bg-muted transition"
        >
          Norton University
        </button>
        <button
          type="button"
          onClick={() => handleJumpToPreset(11.556374, 104.92821, 'Phnom Penh Center')}
          className="rounded-md border bg-muted/40 px-2 py-0.5 text-xs text-foreground hover:bg-muted transition"
        >
          Phnom Penh
        </button>
      </div>

      {/* Interactive Map Container */}
      <div className="h-[400px] w-full rounded-xl overflow-hidden border border-border/80 relative z-0 shadow-inner bg-slate-100 dark:bg-slate-900">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <MapClickHandler onAddPoint={handleAddPoint} />

          {/* Render Shaded Polygon when >= 3 points */}
          {points.length >= 3 && (
            <Polygon
              positions={points.map((p) => [p.latitude, p.longitude])}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.35,
                weight: 3,
                dashArray: '2, 4',
              }}
            />
          )}

          {/* Polyline outline when exactly 2 points */}
          {points.length === 2 && (
            <Polygon
              positions={points.map((p) => [p.latitude, p.longitude])}
              pathOptions={{
                color: '#2563eb',
                weight: 3,
              }}
            />
          )}

          {/* Draggable Corner Markers */}
          {points.map((p, idx) => (
            <Marker
              key={`vertex-${idx}-${p.latitude}-${p.longitude}`}
              position={[p.latitude, p.longitude]}
              icon={createNumberedIcon(idx + 1)}
              draggable={true}
              eventHandlers={{
                dragend: (e) => handleMarkerDrag(idx, e),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <div className="text-center text-xs">
                  <p className="font-bold">ចំណុច P{idx + 1}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}
                  </p>
                  <p className="text-[10px] text-primary italic">អាចអូស (Drag) ដើម្បីកែប្រែ</p>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Hint & Polygon Validation Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs pt-1 border-t">
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Badge
            variant={points.length >= 3 ? 'default' : 'secondary'}
            className={
              points.length >= 3
                ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-xs'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 text-xs'
            }
          >
            <Compass className="mr-1 h-3 w-3" />
            {points.length} ចំណុច {points.length < 3 ? '(ត្រូវការយ៉ាងតិច ៣)' : '(ពហុកោណពេញលេញ)'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
