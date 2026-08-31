import { z } from 'zod';

const nullableDisplayString = z
  .union([z.string(), z.number()])
  .nullable()
  .optional()
  .transform((value) => (value !== null && value !== undefined ? String(value) : ''));

const nullableNumber = z
  .union([z.number(), z.string()])
  .nullable()
  .optional()
  .transform((value) => (value !== null && value !== undefined ? Number(value) : 0));

export const attendanceSessionSchema = z
  .object({
    id: z
      .union([z.number(), z.string()])
      .optional()
      .transform((v) => (v ? Number(v) : 0)),
    shiftName: nullableDisplayString,
    shift_name: nullableDisplayString,
    checkIn: z.string().nullable().optional(),
    check_in: z.string().nullable().optional(),
    checkOut: z.string().nullable().optional(),
    check_out: z.string().nullable().optional(),
    status: nullableDisplayString,
  })
  .passthrough()
  .transform((item) => ({
    id: item.id || 0,
    shiftName: item.shiftName || item.shift_name || '',
    checkIn: item.checkIn || item.check_in || null,
    checkOut: item.checkOut || item.check_out || null,
    status: item.status || 'Present',
  }));

export const attendanceApiSchema = z
  .object({
    id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
    officerId: z.union([z.number(), z.string()]).nullable().optional(),
    officer_id: z.union([z.number(), z.string()]).nullable().optional(),
    officer: z.any().optional(),
    imageUrl: nullableDisplayString,
    image_url: nullableDisplayString,
    date: nullableDisplayString,
    checkIn: z.string().nullable().optional(),
    check_in: z.string().nullable().optional(),
    checkOut: z.string().nullable().optional(),
    check_out: z.string().nullable().optional(),
    totalWorkMin: nullableNumber,
    total_work_min: nullableNumber,
    totalWorkMinutes: nullableNumber,
    totalLateMin: nullableNumber,
    total_late_min: nullableNumber,
    totalLateMinutes: nullableNumber,
    status: nullableDisplayString,
    firstName: nullableDisplayString,
    first_name: nullableDisplayString,
    lastName: nullableDisplayString,
    last_name: nullableDisplayString,
    firstNameKh: nullableDisplayString,
    first_name_kh: nullableDisplayString,
    lastNameKh: nullableDisplayString,
    last_name_kh: nullableDisplayString,
    department: nullableDisplayString,
    office: nullableDisplayString,
    officerCode: nullableDisplayString,
    officer_code: nullableDisplayString,
    sessions: z.array(z.any()).nullable().optional(),
  })
  .passthrough();

export const attendanceSchema = attendanceApiSchema.transform((item) => {
  const officer = item.officer && typeof item.officer === 'object' ? item.officer : null;

  const officerId =
    (item.officerId ? Number(item.officerId) : null) ||
    (item.officer_id ? Number(item.officer_id) : null) ||
    (officer?.id ? Number(officer.id) : 0);

  const firstName =
    item.firstName ||
    item.first_name ||
    officer?.first_name ||
    officer?.first_name_en ||
    officer?.firstName ||
    '';
  const lastName =
    item.lastName ||
    item.last_name ||
    officer?.last_name ||
    officer?.last_name_en ||
    officer?.lastName ||
    '';
  const department = item.department || item.office || officer?.department || officer?.office || '';
  const officerCode =
    item.officerCode || item.officer_code || officer?.officerCode || officer?.officer_code || '';

  const parsedSessions = Array.isArray(item.sessions)
    ? item.sessions
        .map((s) => {
          const parsed = attendanceSessionSchema.safeParse(s);
          return parsed.success ? parsed.data : null;
        })
        .filter(Boolean)
    : [];

  return {
    id: item.id,
    officerId,
    imageUrl: item.imageUrl || item.image_url || officer?.image_url || officer?.imageUrl || null,
    date: item.date || '',
    checkIn: item.checkIn || item.check_in || null,
    checkOut: item.checkOut || item.check_out || null,
    totalWorkMin: item.totalWorkMin || item.total_work_min || item.totalWorkMinutes || 0,
    totalLateMin: item.totalLateMin || item.total_late_min || item.totalLateMinutes || 0,
    status: item.status || 'Present',
    firstName,
    lastName,
    department,
    officerCode,
    sessions: parsedSessions as z.infer<typeof attendanceSessionSchema>[],
  };
});

export const attendanceResponseSchema = z
  .union([
    z
      .object({
        content: z.array(z.any()),
        page: z.number().optional().default(0),
        size: z.number().optional().default(10),
        totalElements: z.number().optional().default(0),
        totalPages: z.number().optional().default(1),
        last: z.boolean().optional().default(true),
      })
      .passthrough(),
    z
      .object({
        data: z.union([
          z.array(z.any()),
          z
            .object({
              content: z.array(z.any()).optional(),
              totalElements: z.number().optional(),
              totalPages: z.number().optional(),
            })
            .passthrough(),
        ]),
      })
      .passthrough(),
    z.array(z.any()),
  ])
  .transform((raw: any) => {
    let rawList: any[] = [];
    let totalElements = 0;
    let totalPages = 1;
    let page = 0;
    let size = 10;
    let last = true;

    if (Array.isArray(raw)) {
      rawList = raw;
      totalElements = raw.length;
    } else if (raw.content && Array.isArray(raw.content)) {
      rawList = raw.content;
      totalElements = raw.totalElements ?? raw.content.length;
      totalPages = raw.totalPages ?? 1;
      page = raw.page ?? 0;
      size = raw.size ?? 10;
      last = raw.last ?? true;
    } else if (raw.data) {
      if (Array.isArray(raw.data)) {
        rawList = raw.data;
        totalElements = raw.data.length;
      } else if (raw.data.content && Array.isArray(raw.data.content)) {
        rawList = raw.data.content;
        totalElements = raw.data.totalElements ?? raw.data.content.length;
        totalPages = raw.data.totalPages ?? 1;
      }
    }

    const content = rawList
      .map((item) => {
        const parsed = attendanceSchema.safeParse(item);
        return parsed.success ? parsed.data : null;
      })
      .filter(Boolean) as z.infer<typeof attendanceSchema>[];

    return {
      content,
      totalElements,
      totalPages,
      page,
      size,
      last,
    };
  });

export const attendanceListResponseSchema = z.array(attendanceSchema);

export type AttendanceSession = z.infer<typeof attendanceSessionSchema>;
export type Attendance = z.infer<typeof attendanceSchema>;
export type AttendanceResponse = z.infer<typeof attendanceResponseSchema>;
export type AttendanceListResponse = z.infer<typeof attendanceListResponseSchema>;
