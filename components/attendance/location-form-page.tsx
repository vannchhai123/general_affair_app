'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Save,
  Loader2,
  AlertCircle,
  Compass,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
  AttendanceLocation,
  LatLng,
  CreateAttendanceLocationRequest,
} from '@/lib/schemas/attendance/attendance-location.schema';

// Dynamically import Leaflet Map to avoid SSR window error
const LocationMapPicker = dynamic(() => import('./location-map-picker'), {
  ssr: false,
  loading: () => (
    <div className="h-[580px] w-full rounded-2xl border border-dashed flex flex-col items-center justify-center bg-muted/20 text-muted-foreground gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <span className="text-sm font-medium">កំពុងផ្ទុកផែនទី OpenStreetMap...</span>
    </div>
  ),
});

const DEFAULT_COORDINATES: LatLng[] = [
  { latitude: 11.577559, longitude: 104.869771 },
  { latitude: 11.577574, longitude: 104.870204 },
  { latitude: 11.577258, longitude: 104.870224 },
  { latitude: 11.577243, longitude: 104.869793 },
];

interface LocationFormPageProps {
  initialData?: AttendanceLocation | null;
  onSubmit: (data: CreateAttendanceLocationRequest) => Promise<void>;
  isLoading?: boolean;
  pageTitle?: string;
  isEditing?: boolean;
}

export function LocationFormPage({
  initialData,
  onSubmit,
  isLoading = false,
  pageTitle,
  isEditing = false,
}: LocationFormPageProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [boundary, setBoundary] = useState<LatLng[]>(
    initialData?.boundary && initialData.boundary.length > 0
      ? initialData.boundary.map((pt) => ({
          latitude: Number(pt.latitude) || 0,
          longitude: Number(pt.longitude) || 0,
        }))
      : [],
  );
  const [touched, setTouched] = useState(false);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('សូមបញ្ចូលឈ្មោះទីតាំង');
    }

    if (boundary.length < 3) {
      errors.push('ព្រំប្រទល់ពហុកោណត្រូវមានយ៉ាងតិច ៣ ចំណុច ដើម្បីបង្កើតជាផ្ទៃតំបន់បិទជិត');
    }

    boundary.forEach((pt, idx) => {
      if (pt.latitude < -90 || pt.latitude > 90) {
        errors.push(`ចំណុច P${idx + 1} មាន Latitude មិនត្រឹមត្រូវ (-90 ដល់ 90)`);
      }
      if (pt.longitude < -180 || pt.longitude > 180) {
        errors.push(`ចំណុច P${idx + 1} មាន Longitude មិនត្រឹមត្រូវ (-180 ដល់ 180)`);
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

  const handleBack = () => {
    router.push('/dashboard/qr-sessions');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="h-9 w-9 p-0"
            title="ត្រឡប់ក្រោយ"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="page-title text-2xl font-bold tracking-tight text-foreground">
              {pageTitle || (isEditing ? 'កែប្រែទីតាំងវត្តមាន' : 'បន្ថែមទីតាំងវត្តមានថ្មី')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
            បោះបង់
          </Button>
          <Button type="submit" disabled={isLoading} className="gap-2 min-w-[140px]">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                កំពុងរក្សាទុក...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតទីតាំងថ្មី'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Location Info & Polygon Vertices Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Name & Status */}
          <Card className="shadow-xs border-border/80">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                ព័ត៌មានទីតាំង
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>
                    ឈ្មោះទីតាំង / សាខា <span className="text-rose-500">*</span>
                  </span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ឧ. សាខាសែនសុខ, សាកលវិទ្យាល័យ ន័រតុន..."
                  className="h-10 text-sm font-medium"
                  disabled={isLoading}
                />
                {touched && !name.trim() && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    សូមបញ្ចូលឈ្មោះទីតាំង
                  </p>
                )}
              </div>

              <div className="rounded-xl border bg-muted/20 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground">ស្ថានភាពពហុកោណ៖</span>
                  <Badge
                    variant={boundary.length >= 3 ? 'default' : 'secondary'}
                    className={
                      boundary.length >= 3
                        ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-xs'
                        : 'bg-rose-500/10 text-rose-600 border-rose-200 text-xs'
                    }
                  >
                    {boundary.length >= 3 ? 'គ្រប់គ្រាន់' : 'មិនទាន់គ្រប់ (យ៉ាងតិច ៣)'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Polygon Vertices List */}
          <Card className="shadow-xs border-border/80">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" />
                  ចំណុចកូអរដោនេ ({boundary.length})
                </CardTitle>
                <Badge variant="outline" className="text-xs font-mono">
                  {boundary.length} vertices
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {boundary.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  មិនទាន់មានចំណុចត្រូវបានដាក់នៅឡើយ។ សូមចុចលើផែនទីដើម្បីបន្ថែម។
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto divide-y divide-border/60">
                  {boundary.map((pt, idx) => (
                    <div
                      key={`list-pt-${idx}`}
                      className="flex items-center justify-between p-3 text-xs hover:bg-muted/30 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                          P{idx + 1}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          Lat: <span className="text-foreground">{pt.latitude.toFixed(6)}</span>,
                          Lng: <span className="text-foreground">{pt.longitude.toFixed(6)}</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setBoundary((prev) => prev.filter((_, i) => i !== idx))}
                        disabled={isLoading || boundary.length <= 3}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-20"
                        title={
                          boundary.length <= 3
                            ? 'មិនអាចលុបបានទេ (ត្រូវការយ៉ាងតិច ៣ ចំណុច)'
                            : 'លុបចំណុចនេះ'
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Warnings */}
          {touched && validationErrors.length > 0 && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 text-xs text-rose-600 dark:text-rose-400 space-y-1.5">
              {validationErrors.map((err, i) => (
                <p key={i} className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Full-Page High Resolution Map (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="shadow-xs border-border/80 overflow-hidden">
            <CardHeader className="pb-3 border-b bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">ផែនទីភូមិសាស្ត្រពហុកោណ</CardTitle>
                </div>

                {boundary.length >= 3 && (
                  <Badge
                    variant="outline"
                    className="border-emerald-500 text-emerald-600 bg-emerald-50 text-xs hidden sm:flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    ផ្ទៃពហុកោណត្រឹមត្រូវ
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <LocationMapPicker points={boundary} onChange={setBoundary} />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
