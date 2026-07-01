'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { useDepartments, usePositions } from '@/hooks/organization';
import type { Department, Position } from '@/lib/schemas';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface OfficerFormData {
  officerCode: string;
  username: string;
  first_name_en: string;
  last_name_en: string;
  first_name_kh: string;
  last_name_kh: string;
  sex: 'MALE' | 'FEMALE';
  date_of_birth: string;
  national_id: string;
  nationality: string;
  ethnicity: string;
  email: string;
  position_id: number;
  office_id: number;
  education_level: string;
  hire_date: string;
  contract_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  phone: string;
  status: string;
  invitation_priority: boolean;
}

interface OfficerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officer?: OfficerFormData & { id: number };
  onSubmit: (data: OfficerFormData) => Promise<void>;
}

const emptyForm: OfficerFormData = {
  officerCode: '',
  username: '',
  first_name_en: '',
  last_name_en: '',
  first_name_kh: '',
  last_name_kh: '',
  sex: 'MALE',
  date_of_birth: '',
  national_id: '',
  nationality: 'Cambodian',
  ethnicity: 'Cambodian',
  email: '',
  position_id: 0,
  office_id: 0,
  education_level: '',
  hire_date: '',
  contract_type: 'FULL_TIME',
  phone: '',
  status: 'ACTIVE',
  invitation_priority: false,
};

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="font-khmer-moul-light text-xs text-muted-foreground">{children}</p>;
}

export function OfficerDialog({ open, onOpenChange, officer, onSubmit }: OfficerDialogProps) {
  const [form, setForm] = useState<OfficerFormData>(emptyForm);
  const [loading, setLoading] = useState(false);

  const { departments = [] } = useDepartments({ page: 0, size: 100, status: 'active' });
  const selectedDepartmentId = form.office_id || undefined;
  const { positions = [] } = usePositions({
    page: 0,
    size: 100,
    status: 'active',
    departmentId: selectedDepartmentId,
  });

  useEffect(() => {
    if (officer) {
      setForm({
        officerCode: officer.officerCode || '',
        username: officer.username || '',
        first_name_en: officer.first_name_en || '',
        last_name_en: officer.last_name_en || '',
        first_name_kh: officer.first_name_kh || '',
        last_name_kh: officer.last_name_kh || '',
        sex: (officer.sex || 'MALE').toUpperCase() as OfficerFormData['sex'],
        date_of_birth: officer.date_of_birth || '',
        national_id: officer.national_id || '',
        nationality: officer.nationality || 'Cambodian',
        ethnicity: officer.ethnicity || 'Cambodian',
        email: officer.email || '',
        position_id: officer.position_id || 0,
        office_id: officer.office_id || 0,
        education_level: officer.education_level ?? '',
        hire_date: officer.hire_date || '',
        contract_type: officer.contract_type || 'FULL_TIME',
        phone: officer.phone || '',
        status: (officer.status || 'ACTIVE').toUpperCase(),
        invitation_priority: officer.invitation_priority ?? false,
      });
      return;
    }

    setForm(emptyForm);
  }, [officer, open]);

  const selectedDepartmentName = useMemo(
    () =>
      departments.find((department: Department) => department.id === form.office_id)?.name ?? '',
    [departments, form.office_id],
  );
  const selectedPositionTitle = useMemo(
    () => positions.find((position: Position) => position.id === form.position_id)?.title ?? '',
    [positions, form.position_id],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(form);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-5 sm:max-w-[640px]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="page-title">
            {officer ? 'កែប្រែមន្រ្តី' : 'បន្ថែមមន្រ្តីថ្មី'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="rounded-2xl border bg-slate-50/60 p-3.5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="officerCode">លេខកូដមន្រ្តី</Label>
                  <Input
                    id="officerCode"
                    value={form.officerCode}
                    onChange={(e) => setForm({ ...form, officerCode: e.target.value })}
                    placeholder="OFF001"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">ឈ្មោះអ្នកប្រើប្រាស់</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="username.dev"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="status">ស្ថានភាព</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) => setForm({ ...form, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">សកម្ម</SelectItem>
                      <SelectItem value="ON_LEAVE">ច្បាប់ឈប់សម្រាក</SelectItem>
                      <SelectItem value="INACTIVE">មិនសកម្ម</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-3.5">
              <div className="mb-3">
                <SectionTitle>ព័ត៌មានមូលដ្ឋាន</SectionTitle>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="first_name_en">នាមខ្លួន (អង់គ្លេស)</Label>
                  <Input
                    id="first_name_en"
                    value={form.first_name_en}
                    onChange={(e) => setForm({ ...form, first_name_en: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="last_name_en">នាមត្រកូល (អង់គ្លេស)</Label>
                  <Input
                    id="last_name_en"
                    value={form.last_name_en}
                    onChange={(e) => setForm({ ...form, last_name_en: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="first_name_kh">នាមខ្លួន (KH)</Label>
                  <Input
                    id="first_name_kh"
                    value={form.first_name_kh}
                    onChange={(e) => setForm({ ...form, first_name_kh: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="last_name_kh">នាមត្រកូល (KH)</Label>
                  <Input
                    id="last_name_kh"
                    value={form.last_name_kh}
                    onChange={(e) => setForm({ ...form, last_name_kh: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="email">អ៊ីមែល</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="sex">ភេទ</Label>
                  <Select
                    value={form.sex}
                    onValueChange={(value) =>
                      setForm({ ...form, sex: value as OfficerFormData['sex'] })
                    }
                  >
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="ជ្រើសរើសភេទ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">ប្រុស</SelectItem>
                      <SelectItem value="FEMALE">ស្រី</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">ទូរស័ព្ទ</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="date_of_birth">ថ្ងៃ ខែ ឆ្នាំកំណើត</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="national_id">National ID</Label>
                  <Input
                    id="national_id"
                    value={form.national_id}
                    onChange={(e) => setForm({ ...form, national_id: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={form.nationality}
                    onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="ethnicity">Ethnicity</Label>
                  <Input
                    id="ethnicity"
                    value={form.ethnicity}
                    onChange={(e) => setForm({ ...form, ethnicity: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-3.5">
              <div className="mb-3">
                <SectionTitle>អង្គភាព និងកិច្ចសន្យា</SectionTitle>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="office_id">អង្គភាព</Label>
                  <Select
                    value={form.office_id > 0 ? String(form.office_id) : undefined}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        office_id: Number(value),
                        position_id: current.office_id === Number(value) ? current.position_id : 0,
                      }))
                    }
                  >
                    <SelectTrigger id="office_id" className="w-full">
                      <SelectValue
                        placeholder="ជ្រើសរើសអង្គភាព"
                        className="truncate max-w-full"
                        title={selectedDepartmentName}
                      >
                        {selectedDepartmentName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department: Department) => (
                        <SelectItem key={department.id} value={String(department.id)}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="position_id">តំណែង</Label>
                  <Select
                    value={form.position_id > 0 ? String(form.position_id) : undefined}
                    onValueChange={(value) => setForm({ ...form, position_id: Number(value) })}
                    disabled={!selectedDepartmentId}
                  >
                    <SelectTrigger id="position_id" className="w-full">
                      <SelectValue
                        placeholder={
                          selectedDepartmentId ? 'ជ្រើសរើសតំណែង' : 'ជ្រើសរើសអង្គភាពជាមុន'
                        }
                        className="truncate max-w-full"
                        title={selectedPositionTitle}
                      >
                        {selectedPositionTitle}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position: Position) => (
                        <SelectItem key={position.id} value={String(position.id)}>
                          {position.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="education_level">កម្រិតការអប់រំ</Label>
                  <Input
                    id="education_level"
                    type="text"
                    value={form.education_level}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        education_level: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={form.hire_date}
                    onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="contract_type">ប្រភេទកិច្ចសន្យា</Label>
                  <Select
                    value={form.contract_type}
                    onValueChange={(value) =>
                      setForm({ ...form, contract_type: value as OfficerFormData['contract_type'] })
                    }
                  >
                    <SelectTrigger id="contract_type">
                      <SelectValue placeholder="ជ្រើសរើសប្រភេទកិច្ចសន្យា" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">ពេញម៉ោង</SelectItem>
                      <SelectItem value="PART_TIME">ម៉ោងខ្លះ</SelectItem>
                      <SelectItem value="CONTRACT">កិច្ចសន្យា</SelectItem>
                      <SelectItem value="INTERNSHIP">ហាត់ការ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/30 p-3 sm:col-span-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="invitation_priority">
                      អទិភាពនៃការអញ្ជើញ (Invitation Priority)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      កំណត់ជាអទិភាពសម្រាប់ការផ្ញើលិខិតអញ្ជើញ
                    </p>
                  </div>
                  <Switch
                    id="invitation_priority"
                    checked={form.invitation_priority}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, invitation_priority: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              បោះបង់
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'កំពុងរក្សាទុក...' : officer ? 'កែប្រែ' : 'បង្កើត'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
