'use client';

import { useEffect, useMemo, useState } from 'react';

import { useDepartments, usePositions } from '@/hooks/organization';
import type { Department, Position } from '@/lib/schemas';

import { Button } from '@/components/ui/button';
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
  first_name: string;
  last_name: string;
  sex: 'male' | 'female';
  email: string;
  position: string;
  department: string;
  phone: string;
  status: string;
  officerCode?: string;
}

interface OfficerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officer?: OfficerFormData & { id: number };
  onSubmit: (data: OfficerFormData) => Promise<void>;
}

const emptyForm: OfficerFormData = {
  first_name: '',
  last_name: '',
  sex: 'male',
  email: '',
  position: '',
  department: '',
  phone: '',
  status: 'active',
  officerCode: '',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="font-khmer-moul-light text-xs text-muted-foreground">{children}</p>;
}

export function OfficerDialog({ open, onOpenChange, officer, onSubmit }: OfficerDialogProps) {
  const [form, setForm] = useState<OfficerFormData>(emptyForm);
  const [loading, setLoading] = useState(false);

  const { departments = [] } = useDepartments({ page: 0, size: 100, status: 'active' });
  const selectedDepartment = useMemo(
    () => departments.find((department: Department) => department.name === form.department),
    [departments, form.department],
  );
  const selectedDepartmentId = selectedDepartment?.id;
  const { positions = [] } = usePositions({
    page: 0,
    size: 100,
    status: 'active',
    departmentId: selectedDepartmentId,
  });

  useEffect(() => {
    if (officer) {
      setForm({
        first_name: officer.first_name || '',
        last_name: officer.last_name || '',
        sex: officer.sex || 'male',
        email: officer.email || '',
        position: officer.position || '',
        department: officer.department || '',
        phone: officer.phone || '',
        status: officer.status || 'active',
        officerCode: officer.officerCode || '',
      });
      return;
    }

    setForm(emptyForm);
  }, [officer, open]);

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
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-5 sm:max-w-[500px]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="page-title">
            {officer ? 'កែប្រែមន្រ្តី' : 'បន្ថែមមន្រ្តីថ្មី'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="rounded-2xl border bg-slate-50/60 p-3.5">
              <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="officerCode">កូដមន្រ្តី</Label>
                  <Input
                    id="officerCode"
                    value={form.officerCode || ''}
                    onChange={(e) => setForm({ ...form, officerCode: e.target.value })}
                    placeholder="ឧ. OFF-001"
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
                      <SelectItem value="active">សកម្ម</SelectItem>
                      <SelectItem value="on_leave">ច្បាប់ឈប់សម្រាក</SelectItem>
                      <SelectItem value="inactive">មិនសកម្ម</SelectItem>
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
                  <Label htmlFor="first_name">នាមខ្លួន</Label>
                  <Input
                    id="first_name"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="last_name">នាមត្រកូល</Label>
                  <Input
                    id="last_name"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
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
                      <SelectItem value="male">ប្រុស</SelectItem>
                      <SelectItem value="female">ស្រី</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">ទូរស័ព្ទ</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-3.5">
              <div className="mb-3">
                <SectionTitle>អង្គភាព និងតួនាទី</SectionTitle>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="department">នាយកដ្ឋាន</Label>
                  <Select
                    value={form.department}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        department: value,
                        position: current.department === value ? current.position : '',
                      }))
                    }
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="ជ្រើសរើសនាយកដ្ឋាន" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department: Department) => (
                        <SelectItem key={department.id} value={department.name}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="position">តួនាទី</Label>
                  <Select
                    value={form.position}
                    onValueChange={(value) => setForm({ ...form, position: value })}
                    disabled={!selectedDepartmentId}
                  >
                    <SelectTrigger id="position">
                      <SelectValue
                        placeholder={
                          selectedDepartmentId ? 'ជ្រើសរើសតួនាទី' : 'ជ្រើសនាយកដ្ឋានជាមុន'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position: Position) => (
                        <SelectItem key={position.id} value={position.title}>
                          {position.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
