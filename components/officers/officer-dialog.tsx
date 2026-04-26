'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export function OfficerDialog({ open, onOpenChange, officer, onSubmit }: OfficerDialogProps) {
  const [form, setForm] = useState<OfficerFormData>(emptyForm);
  const [loading, setLoading] = useState(false);

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
    } else {
      setForm(emptyForm);
    }
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{officer ? 'កែប្រែមន្ត្រី' : 'បន្ថែមមន្ត្រីថ្មី'}</DialogTitle>
          <DialogDescription>
            {officer ? 'កែប្រែព័ត៌មានមន្ត្រី' : 'បំពេញព័ត៌មានដើម្បីបន្ថែមមន្ត្រីថ្មី'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="officerCode">កូដមន្ត្រី</Label>
            <Input
              id="officerCode"
              value={form.officerCode || ''}
              onChange={(e) => setForm({ ...form, officerCode: e.target.value })}
              placeholder="ឧ. OFF-001"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div className="flex flex-col gap-2">
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
              onValueChange={(v) => setForm({ ...form, sex: v as OfficerFormData['sex'] })}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="position">តួនាទី</Label>
              <Select
                value={form.position}
                onValueChange={(v) => setForm({ ...form, position: v })}
              >
                <SelectTrigger id="position">
                  <SelectValue placeholder="ជ្រើសរើសតួនាទី" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Senior Officer">មន្ត្រីជាន់ខ្ពស់</SelectItem>
                  <SelectItem value="Officer">មន្ត្រី</SelectItem>
                  <SelectItem value="Junior Officer">មន្ត្រីជាន់ទាប</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="department">នាយកដ្ឋាន</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v })}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="ជ្រើសរើសនាយកដ្ឋាន" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operations">ប្រតិបត្តិការ</SelectItem>
                  <SelectItem value="Security">សន្តិសុខ</SelectItem>
                  <SelectItem value="Administration">រដ្ឋបាល</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">ទូរស័ព្ទ</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">ស្ថានភាព</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
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
          <DialogFooter>
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
