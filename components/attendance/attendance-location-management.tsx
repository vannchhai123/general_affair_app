'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Search,
  Compass,
  AlertCircle,
  Building,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useAttendanceLocations,
  useAttendanceLocationSettings,
  useDeleteAttendanceLocation,
  useToggleLocationSetting,
} from '@/hooks/attendance/use-attendance-locations';
import type { AttendanceLocation } from '@/lib/schemas/attendance/attendance-location.schema';

export function AttendanceLocationManagement() {
  const router = useRouter();

  const {
    data: locations = [],
    isLoading: isLocationsLoading,
    isError: isLocationsError,
    error: locationsError,
    refetch: refetchLocations,
  } = useAttendanceLocations();

  const {
    data: settings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    refetch: refetchSettings,
  } = useAttendanceLocationSettings();

  const deleteLocation = useDeleteAttendanceLocation();
  const toggleSetting = useToggleLocationSetting();

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Delete modal states
  const [deletingLocation, setDeletingLocation] = useState<AttendanceLocation | null>(null);

  // Filtered locations
  const filteredLocations = useMemo(() => {
    if (!searchTerm.trim()) return locations;
    const term = searchTerm.toLowerCase();
    return locations.filter((loc: AttendanceLocation) => loc.name.toLowerCase().includes(term));
  }, [locations, searchTerm]);

  // Master Global Switch Handler
  const handleToggleGlobal = async (checked: boolean) => {
    await toggleSetting.mutateAsync({ isGlobalEnabled: checked });
  };

  // Navigate to Add Page
  const handleNavigateToAdd = () => {
    router.push('/dashboard/qr-sessions/locations/add');
  };

  // Navigate to Edit Page
  const handleNavigateToEdit = (location: AttendanceLocation) => {
    const identifier =
      location.id !== undefined ? String(location.id) : encodeURIComponent(location.name);
    router.push(`/dashboard/qr-sessions/locations/${identifier}/edit`);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingLocation) return;
    await deleteLocation.mutateAsync(deletingLocation.id ?? deletingLocation.name);
    setDeletingLocation(null);
  };

  const isGlobalEnabled = settings?.isGlobalEnabled ?? false;

  return (
    <div className="space-y-6">
      {/* 1. Master Global Validation Switch Card */}
      <Card className="border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/10 border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`rounded-xl p-2.5 transition-colors ${
                  isGlobalEnabled
                    ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20'
                    : 'bg-muted text-muted-foreground ring-1 ring-border'
                }`}
              >
                {isGlobalEnabled ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <ShieldAlert className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2.5">
                  <CardTitle className="text-base font-bold text-foreground">
                    ការផ្ទៀងផ្ទាត់ទីតាំងជាសកល
                  </CardTitle>
                  <Badge
                    variant={isGlobalEnabled ? 'default' : 'secondary'}
                    className={
                      isGlobalEnabled
                        ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-xs'
                        : 'bg-muted text-muted-foreground text-xs'
                    }
                  >
                    {isGlobalEnabled ? 'បើកដំណើរការ' : 'បិទដំណើរការ'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {toggleSetting.isPending && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                id="global-validation-toggle"
                checked={isGlobalEnabled}
                onCheckedChange={handleToggleGlobal}
                disabled={isSettingsLoading || toggleSetting.isPending}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error alert for settings */}
      {isSettingsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>មិនអាចផ្ទុកការកំណត់សកលបានទេ</AlertTitle>
          <AlertDescription className="flex items-center justify-between mt-1">
            <span>សូមព្យាយាមទាញយកទិន្នន័យម្តងទៀត។</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetchSettings()}
              className="h-7 text-xs"
            >
              <RefreshCw className="mr-1.5 h-3 w-3" />
              ព្យាយាមម្តងទៀត
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 2. Locations Table / Grid Card */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b bg-card pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <CardTitle className="text-md font-bold text-foreground">
                  បញ្ជីទីតាំងវត្តមាន ({locations.length})
                </CardTitle>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះទីតាំង..."
                  className="h-9 pl-8 text-xs"
                />
              </div>

              <Button onClick={handleNavigateToAdd} size="sm" className="gap-1.5 h-9">
                <Plus className="h-4 w-4" />
                បន្ថែមទីតាំងថ្មី
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLocationsLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="mt-3 text-xs text-muted-foreground font-medium">
                កំពុងផ្ទុកបញ្ជីទីតាំង...
              </p>
            </div>
          ) : isLocationsError ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>មិនអាចផ្ទុកបញ្ជីទីតាំងបានទេ</AlertTitle>
                <AlertDescription className="flex items-center justify-between mt-2">
                  <span>
                    {locationsError instanceof Error
                      ? locationsError.message
                      : 'មានបញ្ហាបច្ចេកទេសក្នុងការទាញយកទិន្នន័យ'}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => void refetchLocations()}>
                    ព្យាយាមម្តងទៀត
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="rounded-full bg-muted p-3.5 text-muted-foreground mb-3">
                <MapPin className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                {searchTerm
                  ? 'រកមិនឃើញទីតាំងដែលត្រូវនឹងពាក្យស្វែងរកទេ'
                  : 'មិនទាន់មានទីតាំងត្រូវបានបង្កើតនៅឡើយ'}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                {searchTerm
                  ? 'សូមសាកល្បងស្វែងរកដោយប្រើពាក្យគន្លឹះផ្សេង។'
                  : 'ចុចប៊ូតុងខាងក្រោមដើម្បីបន្ថែមទីតាំងដំបូងរបស់អ្នកលើផែនទី។'}
              </p>
              {!searchTerm && (
                <Button onClick={handleNavigateToAdd} size="sm" className="mt-4 gap-1.5">
                  <Plus className="h-4 w-4" />
                  បន្ថែមទីតាំងដំបូង
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-14 text-center">ល.រ</TableHead>
                    <TableHead>ឈ្មោះទីតាំង</TableHead>
                    <TableHead>ចំនួនចំណុចពហុកោណ</TableHead>
                    <TableHead className="hidden md:table-cell">
                      កូអរដោនេគំរូ (Latitude, Longitude)
                    </TableHead>
                    <TableHead className="w-28 text-right">សកម្មភាព</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map((loc: AttendanceLocation, idx: number) => {
                    const pointCount = loc.boundary?.length || 0;
                    const firstPoint = loc.boundary?.[0];

                    return (
                      <TableRow key={loc.id ?? `${loc.name}-${idx}`} className="hover:bg-muted/20">
                        <TableCell className="text-center font-medium text-xs text-muted-foreground">
                          {idx + 1}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-sm text-foreground">
                              {loc.name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`text-xs gap-1 ${
                              pointCount >= 3
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            <Compass className="h-3 w-3" />
                            {pointCount} ចំណុច
                          </Badge>
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          {firstPoint ? (
                            <span className="font-mono text-xs text-muted-foreground">
                              {Number(firstPoint.latitude).toFixed(6)},{' '}
                              {Number(firstPoint.longitude).toFixed(6)}...
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              គ្មានទិន្នន័យ
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigateToEdit(loc)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              title="កែប្រែលើផែនទី"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingLocation(loc)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="លុប"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deletingLocation)}
        onOpenChange={(open) => {
          if (!open) setDeletingLocation(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              តើអ្នកពិតជាចង់លុបទីតាំងនេះមែនទេ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs pt-1">
              អ្នករៀបនឹងលុបទីតាំង{' '}
              <strong className="text-foreground">{deletingLocation?.name}</strong>។
              សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ
              ហើយមន្ត្រីនឹងមិនអាចផ្ទៀងផ្ទាត់វត្តមានក្នុងតំបន់នេះទៀតឡើយ។
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLocation.isPending}>បោះបង់</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteLocation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
            >
              {deleteLocation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  កំពុងលុប...
                </>
              ) : (
                'លុបទីតាំង'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
