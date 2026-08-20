import { z } from 'zod';

export const latLngSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const attendanceLocationSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'ឈ្មោះទីតាំងត្រូវបានទាមទារ'),
  boundary: z.array(latLngSchema),
});

export const attendanceLocationsResponseSchema = z.union([
  z.array(attendanceLocationSchema),
  z
    .object({
      id: z.number().optional(),
      isGlobalEnabled: z.boolean().optional(),
      locations: z.array(attendanceLocationSchema).optional(),
    })
    .transform((val) => val.locations ?? []),
]);

export const attendanceLocationSettingsSchema = z.object({
  id: z.number().optional(),
  isGlobalEnabled: z.boolean().default(false),
  locations: z.array(attendanceLocationSchema).default([]),
});

export const createAttendanceLocationSchema = z.object({
  name: z.string().min(1, 'ឈ្មោះទីតាំងត្រូវបានទាមទារ'),
  boundary: z.array(latLngSchema).min(3, 'ពហុកោណត្រូវមានយ៉ាងហោចណាស់ ៣ ចំណុច'),
});

export const updateAttendanceLocationSchema = z.object({
  name: z.string().min(1, 'ឈ្មោះទីតាំងត្រូវបានទាមទារ'),
  boundary: z.array(latLngSchema).min(3, 'ពហុកោណត្រូវមានយ៉ាងហោចណាស់ ៣ ចំណុច'),
});

export const toggleLocationSettingSchema = z.object({
  isGlobalEnabled: z.boolean(),
});

export type LatLng = z.infer<typeof latLngSchema>;
export type AttendanceLocation = z.infer<typeof attendanceLocationSchema>;
export type AttendanceLocationsResponse = AttendanceLocation[];
export type AttendanceLocationSettings = z.infer<typeof attendanceLocationSettingsSchema>;
export type CreateAttendanceLocationRequest = z.infer<typeof createAttendanceLocationSchema>;
export type UpdateAttendanceLocationRequest = z.infer<typeof updateAttendanceLocationSchema>;
export type ToggleLocationSettingRequest = z.infer<typeof toggleLocationSettingSchema>;
