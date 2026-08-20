import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchApi, type ApiError } from '@/lib/api/fetcher';
import { apiFetch } from '@/lib/client';
import {
  attendanceLocationSettingsSchema,
  attendanceLocationsResponseSchema,
  type AttendanceLocation,
  type AttendanceLocationSettings,
  type CreateAttendanceLocationRequest,
  type UpdateAttendanceLocationRequest,
  type ToggleLocationSettingRequest,
} from '@/lib/schemas/attendance/attendance-location.schema';

export const ATTENDANCE_LOCATIONS_QUERY_KEY = ['attendance-locations'] as const;
export const ATTENDANCE_LOCATION_SETTINGS_QUERY_KEY = ['attendance-locations-settings'] as const;

/**
 * Fetch settings from backend, trying primary /attendance/location-settings and fallback /attendance/locations/settings
 */
async function fetchSettings(): Promise<AttendanceLocationSettings> {
  try {
    return await fetchApi('/attendance/location-settings', attendanceLocationSettingsSchema);
  } catch (err) {
    try {
      return await fetchApi('/attendance/locations/settings', attendanceLocationSettingsSchema);
    } catch {
      // If both fail, try fetching /attendance/locations as a list
      try {
        const locations = (await fetchApi(
          '/attendance/locations',
          attendanceLocationsResponseSchema,
        )) as AttendanceLocation[];
        return { isGlobalEnabled: false, locations };
      } catch {
        throw err;
      }
    }
  }
}

/**
 * Save full settings payload to backend
 */
async function saveSettings(
  payload: AttendanceLocationSettings,
): Promise<AttendanceLocationSettings> {
  return fetchApi('/attendance/location-settings', attendanceLocationSettingsSchema, {
    method: 'PUT',
    body: JSON.stringify({
      isGlobalEnabled: payload.isGlobalEnabled,
      locations: (payload.locations ?? []).map((loc) => ({
        ...(loc.id ? { id: loc.id } : {}),
        name: loc.name.trim(),
        boundary: loc.boundary.map((pt) => ({
          latitude: Number(pt.latitude),
          longitude: Number(pt.longitude),
        })),
      })),
    }),
  });
}

/**
 * Fetch global attendance location settings (e.g. isGlobalEnabled and locations)
 */
export function useAttendanceLocationSettings() {
  return useQuery<AttendanceLocationSettings, ApiError>({
    queryKey: ATTENDANCE_LOCATION_SETTINGS_QUERY_KEY,
    queryFn: fetchSettings,
  });
}

/**
 * Fetch list of all configured attendance locations
 */
export function useAttendanceLocations() {
  const { data: settings, isLoading, isError, error, refetch } = useAttendanceLocationSettings();

  return {
    data: (settings?.locations ?? []) as AttendanceLocation[],
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Create a new attendance location
 */
export function useCreateAttendanceLocation() {
  const queryClient = useQueryClient();

  return useMutation<AttendanceLocation, ApiError, CreateAttendanceLocationRequest>({
    mutationFn: async (newLocation: CreateAttendanceLocationRequest) => {
      // Try granular POST /attendance/locations first
      try {
        const res = await apiFetch('/attendance/locations', {
          method: 'POST',
          body: JSON.stringify(newLocation),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback to updating location-settings
      }

      // Fallback: Fetch current settings, append new location, and PUT
      const currentSettings =
        queryClient.getQueryData<AttendanceLocationSettings>(
          ATTENDANCE_LOCATION_SETTINGS_QUERY_KEY,
        ) ?? (await fetchSettings());

      const nextLocations = [...(currentSettings.locations ?? []), newLocation];
      const updated = await saveSettings({
        ...currentSettings,
        locations: nextLocations,
      });

      return (
        updated.locations?.[updated.locations.length - 1] ?? (newLocation as AttendanceLocation)
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ATTENDANCE_LOCATION_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ATTENDANCE_LOCATIONS_QUERY_KEY });
      toast.success('បានបង្កើតទីតាំងថ្មីដោយជោគជ័យ');
    },
    onError: (error: ApiError | Error) => {
      const message = error instanceof Error ? error.message : 'បរាជ័យក្នុងការបង្កើតទីតាំង';
      toast.error(message);
    },
  });
}

/**
 * Update an existing attendance location
 */
export function useUpdateAttendanceLocation() {
  const queryClient = useQueryClient();

  return useMutation<
    AttendanceLocation,
    ApiError,
    { id?: number; data: UpdateAttendanceLocationRequest }
  >({
    mutationFn: async ({ id, data }) => {
      // Try granular PUT /attendance/locations/{id} first if id exists
      if (id !== undefined) {
        try {
          const res = await apiFetch(`/attendance/locations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
          });
          if (res.ok) {
            return await res.json();
          }
        } catch {
          // Fallback
        }
      }

      // Fallback: Update in full settings list and PUT
      const currentSettings =
        queryClient.getQueryData<AttendanceLocationSettings>(
          ATTENDANCE_LOCATION_SETTINGS_QUERY_KEY,
        ) ?? (await fetchSettings());

      const nextLocations = (currentSettings.locations ?? []).map((loc) => {
        if (id !== undefined && loc.id === id) {
          return { ...loc, ...data };
        }
        if (loc.name === data.name) {
          return { ...loc, ...data };
        }
        return loc;
      });

      const updated = await saveSettings({
        ...currentSettings,
        locations: nextLocations,
      });

      return (
        updated.locations?.find((l) => l.id === id || l.name === data.name) ??
        (data as AttendanceLocation)
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ATTENDANCE_LOCATION_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ATTENDANCE_LOCATIONS_QUERY_KEY });
      toast.success('បានកែប្រែទីតាំងដោយជោគជ័យ');
    },
    onError: (error: ApiError | Error) => {
      const message = error instanceof Error ? error.message : 'បរាជ័យក្នុងការកែប្រែទីតាំង';
      toast.error(message);
    },
  });
}

/**
 * Delete an attendance location
 */
export function useDeleteAttendanceLocation() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number | string>({
    mutationFn: async (target: number | string) => {
      // Try granular DELETE /attendance/locations/{id} if target is number
      if (typeof target === 'number') {
        try {
          const res = await apiFetch(`/attendance/locations/${target}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            return;
          }
        } catch {
          // Fallback
        }
      }

      // Fallback: Filter out target location and PUT
      const currentSettings =
        queryClient.getQueryData<AttendanceLocationSettings>(
          ATTENDANCE_LOCATION_SETTINGS_QUERY_KEY,
        ) ?? (await fetchSettings());

      const nextLocations = (currentSettings.locations ?? []).filter(
        (loc) => loc.id !== target && loc.name !== target,
      );

      await saveSettings({
        ...currentSettings,
        locations: nextLocations,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ATTENDANCE_LOCATION_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ATTENDANCE_LOCATIONS_QUERY_KEY });
      toast.success('បានលុបទីតាំងដោយជោគជ័យ');
    },
    onError: (error: ApiError | Error) => {
      const message = error instanceof Error ? error.message : 'បរាជ័យក្នុងការលុបទីតាំង';
      toast.error(message);
    },
  });
}

/**
 * Toggle global geofence validation setting
 */
export function useToggleLocationSetting() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, ToggleLocationSettingRequest>({
    mutationFn: async (data: ToggleLocationSettingRequest) => {
      // Try granular PATCH /attendance/locations/settings/toggle first
      try {
        const res = await apiFetch('/attendance/locations/settings/toggle', {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
        if (res.ok) {
          return await res.json().catch(() => ({}));
        }
      } catch {
        // Fallback
      }

      // Fallback: update isGlobalEnabled in location-settings PUT
      const currentSettings =
        queryClient.getQueryData<AttendanceLocationSettings>(
          ATTENDANCE_LOCATION_SETTINGS_QUERY_KEY,
        ) ?? (await fetchSettings());

      return saveSettings({
        ...currentSettings,
        isGlobalEnabled: data.isGlobalEnabled,
      });
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ATTENDANCE_LOCATION_SETTINGS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ATTENDANCE_LOCATIONS_QUERY_KEY });
      if (variables.isGlobalEnabled) {
        toast.success('បានបើកដំណើរការផ្ទៀងផ្ទាត់ទីតាំងជាសកល');
      } else {
        toast.info('បានបិទដំណើរការផ្ទៀងផ្ទាត់ទីតាំងជាសកល');
      }
    },
    onError: (error: ApiError | Error) => {
      const message = error instanceof Error ? error.message : 'បរាជ័យក្នុងការកែប្រែការកំណត់';
      toast.error(message);
    },
  });
}
