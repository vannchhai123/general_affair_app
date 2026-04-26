'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Layers3, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DayOfWeek, Shift, ShiftAssignmentScope, WeeklyTemplate } from '@/lib/schemas';
import { buildAssignmentConflicts, DAY_LABELS, DAY_LABELS_KM, DAY_ORDER } from '@/lib/shifts/utils';

type ReferenceData = {
  departments: Array<{ id: number; name: string }>;
  positions: Array<{ id: number; title: string }>;
  employees: Array<{ id: number; first_name: string; last_name: string; officerCode: string }>;
};

interface ShiftAssignmentPlannerProps {
  shifts: Shift[];
  references: ReferenceData;
  template?: WeeklyTemplate | null;
  loading: boolean;
  readOnly: boolean;
  onScopeChange: (scope: ShiftAssignmentScope, id?: number) => void;
  selectedScope: ShiftAssignmentScope;
  selectedScopeId?: number;
  onSave: (template: WeeklyTemplate) => Promise<void>;
}

export function ShiftAssignmentPlanner({
  shifts,
  references,
  template,
  loading,
  readOnly,
  onScopeChange,
  selectedScope,
  selectedScopeId,
  onSave,
}: ShiftAssignmentPlannerProps) {
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]);
  const [workingDays, setWorkingDays] = useState<Record<DayOfWeek, boolean>>({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: false,
    sun: false,
  });
  const [draft, setDraft] = useState<Record<DayOfWeek, number[]>>({
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  });

  useEffect(() => {
    if (!template) return;
    setDraft({
      mon: template.days.mon ?? [],
      tue: template.days.tue ?? [],
      wed: template.days.wed ?? [],
      thu: template.days.thu ?? [],
      fri: template.days.fri ?? [],
      sat: template.days.sat ?? [],
      sun: template.days.sun ?? [],
    });
  }, [template]);

  const conflicts = useMemo(
    () =>
      DAY_ORDER.flatMap((day) =>
        buildAssignmentConflicts({
          day,
          shiftIds: draft[day],
          workingDay: workingDays[day],
          shifts,
        }),
      ),
    [draft, shifts, workingDays],
  );

  const scopeOptions = {
    department: references.departments.map((department) => ({
      id: department.id,
      label: department.name,
    })),
    position: references.positions.map((position) => ({
      id: position.id,
      label: position.title,
    })),
    employee: references.employees.map((employee) => ({
      id: employee.id,
      label: `${employee.first_name} ${employee.last_name} (${employee.officerCode})`,
    })),
  } satisfies Record<ShiftAssignmentScope, Array<{ id: number; label: string }>>;

  const selectedScopeName =
    scopeOptions[selectedScope].find((option) => option.id === selectedScopeId)?.label ??
    'មិនទាន់ជ្រើសរើស';

  const scopeLabel =
    selectedScope === 'department' ? 'ផ្នែក' : selectedScope === 'position' ? 'តួនាទី' : 'បុគ្គលិក';

  async function handleSave() {
    if (!selectedScopeId) return;

    const nextTemplate: WeeklyTemplate = {
      id: template?.id ?? Date.now(),
      scope: selectedScope,
      scopeId: selectedScopeId,
      scopeName: selectedScopeName,
      effectiveFrom: template?.effectiveFrom ?? new Date().toISOString().slice(0, 10),
      effectiveTo: template?.effectiveTo ?? null,
      days: draft,
    };

    await onSave(nextTemplate);
  }

  function toggleShift(day: DayOfWeek, shiftId: number, checked: boolean) {
    setDraft((current) => ({
      ...current,
      [day]: checked
        ? [...current[day], shiftId]
        : current[day].filter((value) => value !== shiftId),
    }));
  }

  function copyMondayToWeekdays() {
    setDraft((current) => ({
      ...current,
      tue: current.mon,
      wed: current.mon,
      thu: current.mon,
      fri: current.mon,
    }));
  }

  function applyToDepartments() {
    if (selectedDepartmentIds.length === 0) return;
    onScopeChange('department', selectedDepartmentIds[0]);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-3xl border bg-slate-50/80 p-4 lg:grid-cols-[1fr_1fr_auto]">
        <div>
          <p className="text-sm font-medium">វិសាលភាពកំណត់វេន</p>
          <Select
            value={selectedScope}
            onValueChange={(value) => onScopeChange(value as ShiftAssignmentScope)}
          >
            <SelectTrigger className="mt-2 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="department">ផ្នែក</SelectItem>
              <SelectItem value="position">តួនាទី</SelectItem>
              <SelectItem value="employee">បុគ្គលិកម្នាក់ៗ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-sm font-medium">គោលដៅ</p>
          <Select
            value={selectedScopeId ? String(selectedScopeId) : undefined}
            onValueChange={(value) => onScopeChange(selectedScope, Number(value))}
          >
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder={`ជ្រើសរើស ${scopeLabel}`} />
            </SelectTrigger>
            <SelectContent>
              {scopeOptions[selectedScope].map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={copyMondayToWeekdays} type="button" variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            ចម្លងថ្ងៃចន្ទ
          </Button>
        </div>
      </div>

      {selectedScope === 'department' ? (
        <div className="rounded-3xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">អនុវត្តគំរូជាក្រុមទៅផ្នែក</p>
            </div>
            <Button
              onClick={applyToDepartments}
              type="button"
              variant="outline"
              disabled={selectedDepartmentIds.length === 0}
            >
              អនុវត្តគំរូ
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {references.departments.map((department) => {
              const checked = selectedDepartmentIds.includes(department.id);
              return (
                <label
                  key={department.id}
                  className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) =>
                      setSelectedDepartmentIds((current) =>
                        next
                          ? [...current, department.id]
                          : current.filter((value) => value !== department.id),
                      )
                    }
                  />
                  {department.name}
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border">
        <div className="grid grid-cols-[150px_repeat(7,minmax(0,1fr))] border-b bg-slate-950 text-white">
          <div className="p-4 text-sm font-medium">គំរូវេន</div>
          {DAY_ORDER.map((day) => (
            <div key={day} className="border-l border-white/10 p-4 text-center">
              <p className="text-sm font-medium">{DAY_LABELS[day]}</p>
              <p className="text-xs text-white/60">{DAY_LABELS_KM[day]}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[150px_repeat(7,minmax(0,1fr))]">
          <div className="border-r bg-slate-50/80 p-4">
            <p className="text-sm font-medium">ថ្ងៃធ្វើការ</p>
            <p className="mt-1 text-xs text-muted-foreground">បើក ឬបិទថ្ងៃដែលត្រូវមានវត្តមាន។</p>
          </div>
          {DAY_ORDER.map((day) => (
            <div key={day} className="border-l p-4">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={workingDays[day]}
                  disabled={readOnly}
                  onCheckedChange={(checked) =>
                    setWorkingDays((current) => ({ ...current, [day]: Boolean(checked) }))
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {shifts.map((shift) => (
          <div key={shift.id} className="grid grid-cols-[150px_repeat(7,minmax(0,1fr))] border-t">
            <div className="border-r p-4">
              <p className="text-sm font-medium">{shift.name}</p>
              <p className="text-xs text-muted-foreground">
                {shift.startTime} - {shift.endTime}
              </p>
            </div>
            {DAY_ORDER.map((day) => {
              const checked = draft[day].includes(shift.id);
              return (
                <div key={`${shift.id}-${day}`} className="border-l p-4">
                  <label className="flex items-center justify-center">
                    <Checkbox
                      checked={checked}
                      disabled={readOnly}
                      onCheckedChange={(next) => toggleShift(day, shift.id, Boolean(next))}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers3 className="h-4 w-4" />
          អាចកំណត់វេនច្រើនក្នុងថ្ងៃតែមួយ សម្រាប់កាលវិភាគបំបែកវេន។
        </div>
        <Button disabled={loading || readOnly || !selectedScopeId} onClick={handleSave}>
          រក្សាទុកគំរូប្រចាំសប្ដាហ៍
        </Button>
      </div>

      <div className="rounded-3xl border bg-slate-50/80 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <TriangleAlert className="h-4 w-4 text-amber-600" />
          ការព្រមានអំពីបញ្ហាទំនាស់
        </div>
        <div className="mt-3 space-y-2">
          {conflicts.length === 0 ? (
            <p className="text-sm text-muted-foreground">មិនឃើញបញ្ហាទំនាស់នៃការកំណត់វេនទេ។</p>
          ) : (
            conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              >
                <p className="font-medium">{conflict.title}</p>
                <p className="mt-1">{conflict.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
