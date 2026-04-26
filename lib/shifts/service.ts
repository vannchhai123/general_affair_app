'use client';

import { apiFetch } from '@/lib/client';
import {
  shiftAssignmentListResponseSchema,
  shiftRequestSchema,
  shiftSchema,
  shiftStatusPatchSchema,
  shiftAuditEventSchema,
  shiftListResponseSchema,
  weeklyTemplateListResponseSchema,
  type DayOfWeek,
  type Shift,
  type ShiftAssignment,
  type ShiftAssignmentScope,
  type ShiftAuditEvent,
  type ShiftFormInput,
  type WeeklyTemplate,
} from '@/lib/schemas';

const SHIFT_STORE_KEY = 'shift-management.shifts';
const ASSIGNMENT_STORE_KEY = 'shift-management.assignments';
const AUDIT_STORE_KEY = 'shift-management.audit';

type ListShiftParams = {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  size?: number;
};

function safeLocalStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function shouldUseMockFallback(error: unknown) {
  void error;
  return process.env.NEXT_PUBLIC_SHIFT_MOCK_ONLY === 'true';
}

const seedShifts: Shift[] = [
  {
    id: 1,
    name: 'Morning Core',
    code: 'SHIFT-AM',
    startTime: '08:00',
    endTime: '12:00',
    status: 'active',
    isActive: true,
    crossMidnight: false,
    graceMinutes: 10,
    checkInOpenBeforeMinutes: 15,
    checkOutCloseAfterMinutes: 30,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    description: 'Primary office morning shift.',
    assignedDepartmentsCount: 3,
    assignedPositionsCount: 2,
    assignedEmployeesCount: 6,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-03-05T10:00:00Z',
  },
  {
    id: 2,
    name: 'Afternoon Support',
    code: 'SHIFT-PM',
    startTime: '13:00',
    endTime: '17:30',
    status: 'active',
    isActive: true,
    crossMidnight: false,
    graceMinutes: 5,
    checkInOpenBeforeMinutes: 20,
    checkOutCloseAfterMinutes: 20,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    description: 'Operational support during afternoon hours.',
    assignedDepartmentsCount: 2,
    assignedPositionsCount: 2,
    assignedEmployeesCount: 4,
    createdAt: '2026-01-02T08:00:00Z',
    updatedAt: '2026-03-02T09:00:00Z',
  },
  {
    id: 3,
    name: 'Night Response',
    code: 'SHIFT-NIGHT',
    startTime: '22:00',
    endTime: '06:00',
    status: 'inactive',
    isActive: false,
    crossMidnight: true,
    graceMinutes: 15,
    checkInOpenBeforeMinutes: 30,
    checkOutCloseAfterMinutes: 45,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    description: 'Overnight response coverage.',
    assignedDepartmentsCount: 1,
    assignedPositionsCount: 1,
    assignedEmployeesCount: 2,
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-02-14T11:00:00Z',
  },
];

const seedTemplates: WeeklyTemplate[] = [
  {
    id: 1,
    scope: 'department',
    scopeId: 1,
    scopeName: 'Administration',
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    days: {
      mon: [1, 2],
      tue: [1, 2],
      wed: [1, 2],
      thu: [1, 2],
      fri: [1, 2],
      sat: [],
      sun: [],
    },
  },
];

const seedAudit: Record<number, ShiftAuditEvent[]> = {
  1: [
    { id: 1, action: 'created', actorName: 'System Admin', timestamp: '2026-01-01T08:00:00Z' },
    { id: 2, action: 'updated', actorName: 'System Admin', timestamp: '2026-03-05T10:00:00Z' },
  ],
  2: [{ id: 3, action: 'created', actorName: 'HR Admin', timestamp: '2026-01-02T08:00:00Z' }],
  3: [
    { id: 4, action: 'created', actorName: 'Operations Lead', timestamp: '2026-01-05T08:00:00Z' },
    {
      id: 5,
      action: 'deactivated',
      actorName: 'Operations Lead',
      timestamp: '2026-02-14T11:00:00Z',
    },
  ],
};

function readStore<T>(key: string, fallback: T): T {
  const storage = safeLocalStorage();
  if (!storage) return fallback;

  const raw = storage.getItem(key);
  if (!raw) {
    storage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    storage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeStore<T>(key: string, value: T) {
  safeLocalStorage()?.setItem(key, JSON.stringify(value));
}

function filterShifts(shifts: Shift[], params: ListShiftParams) {
  const filtered = shifts.filter((shift) => {
    const matchesSearch =
      !params.search ||
      shift.name.toLowerCase().includes(params.search.toLowerCase()) ||
      shift.code.toLowerCase().includes(params.search.toLowerCase());

    const matchesStatus =
      !params.status || params.status === 'all' || shift.status === params.status;

    return matchesSearch && matchesStatus;
  });

  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    page,
    size,
    totalElements: filtered.length,
    totalPages: filtered.length === 0 ? 0 : Math.ceil(filtered.length / size),
    last: start + size >= filtered.length,
  };
}

async function parseJson<T>(response: Response, fallback: T) {
  try {
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

const mockService = {
  async listShifts(params: ListShiftParams = {}) {
    return filterShifts(readStore(SHIFT_STORE_KEY, seedShifts), params);
  },
  async getShift(id: number) {
    return readStore(SHIFT_STORE_KEY, seedShifts).find((shift) => shift.id === id) ?? null;
  },
  async createShift(input: ShiftFormInput) {
    const payload = shiftRequestSchema.parse(input);
    const shifts = readStore(SHIFT_STORE_KEY, seedShifts);
    const nextId = shifts.reduce((max, shift) => Math.max(max, shift.id), 0) + 1;
    const created: Shift = shiftSchema.parse({
      id: nextId,
      name: payload.name,
      code: payload.code,
      startTime: payload.startTime,
      endTime: payload.endTime,
      isActive: payload.isActive,
      crossMidnight: payload.crossMidnight,
      graceMinutes: payload.graceMinutes,
      checkInOpenBeforeMinutes: payload.checkInOpenBeforeMinutes,
      checkOutCloseAfterMinutes: payload.checkOutCloseAfterMinutes,
      effectiveFrom: payload.effectiveFrom,
      effectiveTo: payload.effectiveTo,
      description: payload.description,
      assignedDepartmentsCount: 0,
      assignedPositionsCount: 0,
      assignedEmployeesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    writeStore(SHIFT_STORE_KEY, [created, ...shifts]);
    const audit = readStore(AUDIT_STORE_KEY, seedAudit);
    audit[nextId] = [
      {
        id: Date.now(),
        action: 'created',
        actorName: 'Admin User',
        timestamp: new Date().toISOString(),
      },
    ];
    writeStore(AUDIT_STORE_KEY, audit);
    return created;
  },
  async updateShift(id: number, input: ShiftFormInput) {
    const payload = shiftRequestSchema.parse(input);
    const shifts = readStore(SHIFT_STORE_KEY, seedShifts);
    const updated = shifts.map((shift) =>
      shift.id === id
        ? {
            ...shift,
            name: payload.name,
            code: payload.code,
            startTime: payload.startTime,
            endTime: payload.endTime,
            crossMidnight: payload.crossMidnight,
            graceMinutes: payload.graceMinutes,
            checkInOpenBeforeMinutes: payload.checkInOpenBeforeMinutes,
            checkOutCloseAfterMinutes: payload.checkOutCloseAfterMinutes,
            status: payload.status,
            isActive: payload.isActive,
            effectiveFrom: payload.effectiveFrom,
            effectiveTo: payload.effectiveTo,
            description: payload.description,
            updatedAt: new Date().toISOString(),
          }
        : shift,
    );
    writeStore(SHIFT_STORE_KEY, updated);
    return updated.find((shift) => shift.id === id) ?? null;
  },
  async updateShiftStatus(id: number, status: Shift['status']) {
    const shifts = readStore(SHIFT_STORE_KEY, seedShifts);
    const updated = shifts.map((shift) =>
      shift.id === id
        ? {
            ...shift,
            status,
            isActive: status === 'active',
            updatedAt: new Date().toISOString(),
          }
        : shift,
    );
    writeStore(SHIFT_STORE_KEY, updated);
    return updated.find((shift) => shift.id === id) ?? null;
  },
  async deleteShift(id: number) {
    const shifts = readStore(SHIFT_STORE_KEY, seedShifts).filter((shift) => shift.id !== id);
    writeStore(SHIFT_STORE_KEY, shifts);
  },
  async listTemplates(scope: ShiftAssignmentScope, id?: number) {
    const templates = readStore(ASSIGNMENT_STORE_KEY, seedTemplates);
    return weeklyTemplateListResponseSchema.parse(
      templates.filter((template) => template.scope === scope && (!id || template.scopeId === id)),
    );
  },
  async saveTemplate(template: WeeklyTemplate) {
    const templates = readStore(ASSIGNMENT_STORE_KEY, seedTemplates);
    const existing = templates.findIndex(
      (item) => item.scope === template.scope && item.scopeId === template.scopeId,
    );
    if (existing >= 0) {
      templates[existing] = template;
    } else {
      templates.push({ ...template, id: Date.now() });
    }
    writeStore(ASSIGNMENT_STORE_KEY, templates);
    return template;
  },
  async listAssignments(scope: ShiftAssignmentScope, id?: number) {
    const templates = await this.listTemplates(scope, id);
    const assignments: ShiftAssignment[] = [];

    templates.forEach((template) => {
      (Object.entries(template.days) as [DayOfWeek, number[]][]).forEach(
        ([dayOfWeek, shiftIds]) => {
          shiftIds.forEach((shiftId) => {
            assignments.push({
              id: Number(`${template.id}${shiftId}`),
              shiftId,
              scope: template.scope,
              scopeId: template.scopeId,
              scopeName: template.scopeName,
              dayOfWeek,
              effectiveFrom: template.effectiveFrom,
              effectiveTo: template.effectiveTo,
            });
          });
        },
      );
    });

    return shiftAssignmentListResponseSchema.parse(assignments);
  },
  async getShiftAudit(id: number) {
    const audit = readStore(AUDIT_STORE_KEY, seedAudit);
    return (audit[id] ?? []).map((item) => shiftAuditEventSchema.parse(item));
  },
};

async function httpListShifts(params: ListShiftParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status && params.status !== 'all') query.set('status', params.status);
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 10));

  const response = await apiFetch(`/shifts?${query.toString()}`);
  if (!response.ok) {
    const data = await parseJson(response, {});
    throw Object.assign(new Error('Failed to fetch shifts'), { status: response.status, data });
  }

  return shiftListResponseSchema.parse(await response.json());
}

async function httpGetShift(id: number) {
  const response = await apiFetch(`/shifts/${id}`);
  if (!response.ok) {
    const data = await parseJson(response, {});
    throw Object.assign(new Error('Failed to fetch shift'), { status: response.status, data });
  }

  return shiftSchema.parse(await response.json());
}

async function httpCreateShift(input: ShiftFormInput) {
  const payload = shiftRequestSchema.parse(input);
  const response = await apiFetch('/shifts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await parseJson(response, {});
    throw Object.assign(new Error('Failed to create shift'), { status: response.status, data });
  }
  return shiftSchema.parse(await response.json());
}

async function httpUpdateShift(id: number, input: ShiftFormInput) {
  const payload = shiftRequestSchema.parse(input);
  const response = await apiFetch(`/shifts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await parseJson(response, {});
    throw Object.assign(new Error('Failed to update shift'), { status: response.status, data });
  }
  return shiftSchema.parse(await response.json());
}

async function httpUpdateShiftStatus(id: number, status: Shift['status']) {
  const payload = shiftStatusPatchSchema.parse({ status });
  const response = await apiFetch(`/shifts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await parseJson(response, {});
    throw Object.assign(new Error('Failed to update shift status'), {
      status: response.status,
      data,
    });
  }
  const json = await parseJson<unknown>(response, { success: true });
  if (typeof json === 'object' && json !== null && 'id' in (json as Record<string, unknown>)) {
    return shiftSchema.parse(json);
  }
  return null;
}

async function httpDeleteShift(id: number) {
  const response = await apiFetch(`/shifts/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const data = await parseJson(response, {});
    throw Object.assign(new Error('Failed to delete shift'), { status: response.status, data });
  }
}

async function httpListAssignments(scope: ShiftAssignmentScope, id?: number) {
  const query = new URLSearchParams({ scope });
  if (id) query.set('id', String(id));
  const response = await apiFetch(`/shift-assignments?${query.toString()}`);
  if (!response.ok) {
    const data = await parseJson(response, {});
    throw Object.assign(new Error('Failed to fetch shift assignments'), {
      status: response.status,
      data,
    });
  }
  return shiftAssignmentListResponseSchema.parse(await response.json());
}

async function httpSaveTemplate(template: WeeklyTemplate) {
  const response = await apiFetch('/shift-assignments', {
    method: 'POST',
    body: JSON.stringify(template),
  });
  if (!response.ok) {
    const data = await parseJson(response, {});
    throw Object.assign(new Error('Failed to save shift assignments'), {
      status: response.status,
      data,
    });
  }
  return weeklyTemplateListResponseSchema.parse([await response.json()])[0];
}

export const shiftManagementService = {
  async listShifts(params: ListShiftParams = {}) {
    try {
      return await httpListShifts(params);
    } catch (error) {
      if (!shouldUseMockFallback(error)) throw error;
      return mockService.listShifts(params);
    }
  },
  async getShift(id: number) {
    try {
      return await httpGetShift(id);
    } catch (error) {
      if (!shouldUseMockFallback(error)) throw error;
      return mockService.getShift(id);
    }
  },
  async createShift(input: ShiftFormInput) {
    try {
      return await httpCreateShift(input);
    } catch (error) {
      if (!shouldUseMockFallback(error)) throw error;
      return mockService.createShift(input);
    }
  },
  async updateShift(id: number, input: ShiftFormInput) {
    try {
      return await httpUpdateShift(id, input);
    } catch (error) {
      if (!shouldUseMockFallback(error)) throw error;
      return mockService.updateShift(id, input);
    }
  },
  async updateShiftStatus(id: number, status: Shift['status']) {
    try {
      const response = await httpUpdateShiftStatus(id, status);
      return response ?? (await this.getShift(id));
    } catch (error) {
      if (!shouldUseMockFallback(error)) throw error;
      return mockService.updateShiftStatus(id, status);
    }
  },
  async deleteShift(id: number) {
    try {
      await httpDeleteShift(id);
    } catch (error) {
      if (!shouldUseMockFallback(error)) throw error;
      await mockService.deleteShift(id);
    }
  },
  async listAssignments(scope: ShiftAssignmentScope, id?: number) {
    try {
      return await httpListAssignments(scope, id);
    } catch (error) {
      if (!shouldUseMockFallback(error)) throw error;
      return mockService.listAssignments(scope, id);
    }
  },
  async listTemplates(scope: ShiftAssignmentScope, id?: number) {
    try {
      const assignments = await httpListAssignments(scope, id);
      const grouped = new Map<string, WeeklyTemplate>();
      assignments.forEach((assignment) => {
        const key = `${assignment.scope}-${assignment.scopeId}`;
        if (!grouped.has(key)) {
          grouped.set(key, {
            id: assignment.id,
            scope: assignment.scope,
            scopeId: assignment.scopeId,
            scopeName: assignment.scopeName,
            effectiveFrom: assignment.effectiveFrom,
            effectiveTo: assignment.effectiveTo,
            days: {
              mon: [],
              tue: [],
              wed: [],
              thu: [],
              fri: [],
              sat: [],
              sun: [],
            },
          });
        }
        const template = grouped.get(key);
        if (template) {
          template.days[assignment.dayOfWeek].push(assignment.shiftId);
        }
      });
      return [...grouped.values()];
    } catch (error) {
      if (!shouldUseMockFallback(error)) throw error;
      return mockService.listTemplates(scope, id);
    }
  },
  async saveTemplate(template: WeeklyTemplate) {
    try {
      return await httpSaveTemplate(template);
    } catch (error) {
      if (!shouldUseMockFallback(error)) throw error;
      return mockService.saveTemplate(template);
    }
  },
  async getShiftAudit(id: number) {
    try {
      return await mockService.getShiftAudit(id);
    } catch {
      return [];
    }
  },
};
