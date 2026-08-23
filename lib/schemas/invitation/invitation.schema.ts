import { z } from 'zod';
import {
  invitationStatusValues,
  invitationTypeValues,
  invitationCategoryValues,
} from './invitation';

function normalizeStatus(val?: any): (typeof invitationStatusValues)[number] {
  const s = String(val ?? '')
    .trim()
    .toLowerCase();
  if (s === 'accepted' || s === 'completed' || s === 'rejected') return s;
  return 'pending';
}

function normalizeType(val?: any): (typeof invitationTypeValues)[number] {
  const t = String(val ?? '')
    .trim()
    .toLowerCase();
  if (t === 'outgoing') return 'outgoing';
  return 'incoming';
}

function normalizeCategory(val?: any): (typeof invitationCategoryValues)[number] | null {
  if (!val) return null;
  const c = String(val).trim().toLowerCase();
  if (c === 'external') return 'external';
  if (c === 'internal') return 'internal';
  return null;
}

export const assignedOfficerSchema = z.preprocess(
  (raw: any) => {
    if (!raw || typeof raw !== 'object') return raw;
    return {
      id: raw.id ?? 0,
      first_name: raw.first_name ?? raw.firstName ?? raw.first_name_en ?? '',
      last_name: raw.last_name ?? raw.lastName ?? raw.last_name_en ?? '',
      department: raw.department ?? raw.office ?? '',
      position: raw.position ?? '',
      officerCode: raw.officerCode ?? raw.officer_code ?? '',
      first_name_kh: raw.first_name_kh ?? raw.firstNameKh ?? null,
      last_name_kh: raw.last_name_kh ?? raw.lastNameKh ?? null,
      imageUrl:
        raw.imageUrl ??
        raw.image_url ??
        raw.avatar_url ??
        raw.photo_url ??
        raw.photoUrl ??
        raw.profile_image ??
        raw.profileImage ??
        null,
      image_url: raw.image_url ?? raw.imageUrl ?? null,
      avatar_url: raw.avatar_url ?? null,
      photo_url: raw.photo_url ?? raw.photoUrl ?? null,
      photoUrl: raw.photoUrl ?? raw.photo_url ?? null,
      profile_image: raw.profile_image ?? raw.profileImage ?? null,
      profileImage: raw.profileImage ?? raw.profile_image ?? null,
    };
  },
  z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    department: z.string(),
    position: z.string(),
    officerCode: z.string().optional(),
    first_name_kh: z.string().optional().nullable(),
    last_name_kh: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    image_url: z.string().optional().nullable(),
    avatar_url: z.string().optional().nullable(),
    photo_url: z.string().optional().nullable(),
    photoUrl: z.string().optional().nullable(),
    profile_image: z.string().optional().nullable(),
    profileImage: z.string().optional().nullable(),
  }),
);

export const invitationSchema = z.preprocess(
  (raw: any) => {
    if (!raw || typeof raw !== 'object') return raw;

    const assignedOfficersRaw = raw.assigned_officers ?? raw.assignedOfficers ?? raw.officers ?? [];
    const assignedOfficers = Array.isArray(assignedOfficersRaw) ? assignedOfficersRaw : [];

    const assignedOfficerIdsRaw =
      raw.assigned_officer_ids ??
      raw.assignedOfficerIds ??
      raw.officer_ids ??
      raw.officerIds ??
      assignedOfficers.map((o: any) => o?.id).filter(Boolean);
    const assigned_officer_ids = Array.isArray(assignedOfficerIdsRaw) ? assignedOfficerIdsRaw : [];

    return {
      id: raw.id ?? 0,
      subject: raw.subject ?? raw.title ?? '',
      organization: raw.organization ?? raw.presided_by ?? raw.presidedBy ?? '',
      type: normalizeType(raw.type),
      category: normalizeCategory(raw.category),
      date: raw.date ?? raw.invitation_date ?? raw.invitationDate ?? '',
      time: raw.time ?? raw.invitation_time ?? raw.invitationTime ?? '',
      location: raw.location ?? '',
      description: raw.description ?? raw.remarks ?? '',
      status: normalizeStatus(raw.status),
      assigned_officer_ids,
      assigned_officers: assignedOfficers,
      imageIds: raw.imageIds ?? raw.image_ids ?? [],
      imageUrls: raw.imageUrls ?? raw.image_urls ?? [],
      created_at: raw.created_at ?? raw.createdAt ?? '',
      updated_at: raw.updated_at ?? raw.updatedAt ?? '',
    };
  },
  z.object({
    id: z.number(),
    subject: z.string(),
    organization: z.string(),
    type: z.enum(invitationTypeValues),
    category: z.enum(invitationCategoryValues).optional().nullable(),
    date: z.string(),
    time: z.string().nullable().optional(),
    location: z.string(),
    description: z.string().nullable().optional(),
    status: z.enum(invitationStatusValues),
    assigned_officer_ids: z.array(z.number()),
    assigned_officers: z.array(assignedOfficerSchema),
    imageIds: z.array(z.number()).optional().nullable(),
    imageUrls: z.array(z.string()).optional().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
);

export const invitationsResponseSchema = z.preprocess((data: any) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.invitations)) return data.invitations;
  }
  return [];
}, z.array(invitationSchema));

export type Invitation = z.infer<typeof invitationSchema>;
export type InvitationsResponse = z.infer<typeof invitationsResponseSchema>;
