'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import type {
  AttendanceLocation,
  LatLng,
  CreateAttendanceLocationRequest,
} from '@/lib/schemas/attendance/attendance-location.schema';

// Dynamically import Leaflet Map to avoid Next.js SSR window is not defined error
const LocationMapPicker = dynamic(() => import('./location-map-picker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-xl border border-dashed flex flex-col items-center justify-center bg-muted/20 text-muted-foreground gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-xs font-medium">កំពុងផ្ទុកផែនទី OpenStreetMap...</span>
    </div>
  ),
});

interface LocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: AttendanceLocation | null;
  onSubmit: (data: CreateAttendanceLocationRequest) => Promise<void>;
  isLoading?: boolean;
}

const DEFAULT_COORDINATES: LatLng[] = [
  { latitude: 11.577559, longitude: 104.869771 },
  { latitude: 11.577574, longitude: 104.870204 },
  { latitude: 11.577258, longitude: 104.870224 },
  { latitude: 11.577243, longitude: 104.869793 },
];

export function LocationFormDialog({
  open,
  onOpenChange,
  location,
  onSubmit,
  isLoading = false,
}: LocationFormDialogProps) {
  const isEditing = Boolean(location);

  const [name, setName] = useState('');
  const [boundary, setBoundary] = useState<LatLng[]>(DEFAULT_COORDINATES);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      if (location) {
        setName(location.name || '');
        setBoundary(
          location.boundary && location.boundary.length > 0
            ? location.boundary.map((pt) => ({
                latitude: Number(pt.latitude) || 0,
                longitude: Number(pt.longitude) || 0,
              }))
            : DEFAULT_COORDINATES,
        );
      } else {
        setName('');
        setBoundary([]);
      }
      setTouched(false);
    }
  }, [open, location]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('សូមបញ្ចូលឈ្មោះទីតាំង');
    }

    if (boundary.length < 3) {
      errors.push('ព្រំប្រទល់ពហុកោណត្រូវមានយ៉ាងតិច ៣ ចំណុច');
    }

    boundary.forEach((pt, idx) => {
      if (pt.latitude < -90 || pt.latitude > 90) {
        errors.push(`ចំណុចទី #${idx + 1} មាន Latitude មិនត្រឹមត្រូវ (-90 ដល់ 90)`);
      }
      if (pt.longitude < -180 || pt.longitude > 180) {
        errors.push(`ចំណុចទី #${idx + 1} មាន Longitude មិនត្រឹមត្រូវ (-180 ដល់ 180)`);
      }
    });

    return errors;
  }, [name, boundary]);

  const isValid = validationErrors.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid || isLoading) return;

    await onSubmit({
      name: name.trim(),
      boundary: boundary.map((pt) => ({
        latitude: Number(pt.latitude),
        longitude: Number(pt.longitude),
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1 pb-2 border-b">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-primary/10 p-2 text-primary ring-1 ring-primary/20">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {isEditing ? 'កែប្រែទីតាំងវត្តមាន' : 'បន្ថែមទីតាំងវត្តមានថ្មី'}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {isEditing
                    ? 'កែប្រែឈ្មោះ និងអូសចំណុចព្រំប្រទល់ពហុកោណលើផែនទីសម្រាប់ទីតាំងនេះ'
                    : 'ស្វែងរកអាសយដ្ឋាន រួចចុចលើផែនទីដើម្បីកំណត់តំបន់ចុះវត្តមាន (Geofence Polygon)'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Location Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>
                  ឈ្មោះទីតាំង <span className="text-rose-500">*</span>
                </span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ឧ. សាខាសែនសុខ, សាកលវិទ្យាល័យ ន័រតុន..."
                className="h-9.5 text-sm font-medium"
                disabled={isLoading}
              />
              {touched && !name.trim() && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  សូមបញ្ចូលឈ្មោះទីតាំង
                </p>
              )}
            </div>

            {/* Interactive Visual Map Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>កំណត់ព្រំប្រទល់ភូមិសាស្ត្រលើផែនទី (Interactive Geofence Map)</span>
              </label>

              {open && <LocationMapPicker points={boundary} onChange={setBoundary} />}
            </div>

            {/* Validation Alerts */}
            {touched && validationErrors.length > 0 && (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-600 dark:text-rose-400 space-y-1">
                {validationErrors.map((err, i) => (
                  <p key={i} className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {err}
                  </p>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              បោះបង់
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2 min-w-[130px]">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  កំពុងរក្សាទុក...
                </>
              ) : isEditing ? (
                'រក្សាទុកការកែប្រែ'
              ) : (
                'បង្កើតទីតាំង'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
