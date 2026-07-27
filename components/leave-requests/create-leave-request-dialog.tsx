'use client';

import { useState } from 'react';
import { CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { useCreateLeaveRequest } from '@/hooks/leave-requests/use-leave-request-mutations';
import { useOfficers } from '@/hooks/officers/use-officers';
import { toast } from 'sonner';

import type { Officer } from '@/lib/schemas';

interface CreateLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLeaveRequestDialog({ open, onOpenChange }: CreateLeaveRequestDialogProps) {
  const { officers } = useOfficers({ pageSize: 100 });
  const createMutation = useCreateLeaveRequest();

  const [officerId, setOfficerId] = useState<string>('');
  const [leaveType, setLeaveType] = useState<string>('Annual Leave');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [totalDays, setTotalDays] = useState<number>(1);
  const [reason, setReason] = useState<string>('');

  // Auto calculate days if dates are picked
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = e.getTime() - s.getTime();
      if (diffTime >= 0) {
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(days);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!officerId) {
      toast.error('សូមជ្រើសរើសមន្ត្រី (Please select an officer)');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('សូមជ្រើសរើសកាលបរិច្ឆេទ (Please select start and end dates)');
      return;
    }

    const selectedOfficer = officers.find((o: Officer) => o.id === Number(officerId));

    try {
      await createMutation.mutateAsync({
        officer_id: Number(officerId),
        first_name: selectedOfficer?.first_name_kh || selectedOfficer?.first_name_en || '',
        last_name: selectedOfficer?.last_name_kh || selectedOfficer?.last_name_en || '',
        department: selectedOfficer?.department || 'General',
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        reason: reason,
        status: 'Pending',
      });

      onOpenChange(false);
      // Reset form
      setOfficerId('');
      setStartDate('');
      setEndDate('');
      setTotalDays(1);
      setReason('');
    } catch {
      // Error handled by mutation error handler
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            បង្កើតសំណើច្បាប់ឈប់សម្រាក (New Leave Request)
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            បំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតសំណើច្បាប់ថ្មីជូនមន្ត្រី
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="officer" className="text-xs font-semibold text-slate-700">
              មន្ត្រី (Officer) *
            </Label>
            <Select value={officerId} onValueChange={setOfficerId}>
              <SelectTrigger id="officer" className="h-10 rounded-xl border-slate-200">
                <SelectValue placeholder="ជ្រើសរើសមន្ត្រី..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {officers.map((officer: Officer) => (
                  <SelectItem key={officer.id} value={String(officer.id)}>
                    {officer.last_name_kh} {officer.first_name_kh} ({officer.position || 'មន្ត្រី'})
                    - {officer.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="leaveType" className="text-xs font-semibold text-slate-700">
              ប្រភេទច្បាប់ (Leave Type) *
            </Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger id="leaveType" className="h-10 rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Annual Leave">ច្បាប់សម្រាកប្រចាំឆ្នាំ (Annual Leave)</SelectItem>
                <SelectItem value="Sick Leave">ច្បាប់ជំងឺ (Sick Leave)</SelectItem>
                <SelectItem value="Personal Leave">ច្បាប់ផ្ទាល់ខ្លួន (Personal Leave)</SelectItem>
                <SelectItem value="Special Leave">ច្បាប់ពិសេស (Special Leave)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-xs font-semibold text-slate-700">
                ថ្ងៃចាប់ផ្តើម (Start Date) *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange(e.target.value, endDate)}
                className="h-10 rounded-xl border-slate-200"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-xs font-semibold text-slate-700">
                ថ្ងៃបញ្ចប់ (End Date) *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange(startDate, e.target.value)}
                className="h-10 rounded-xl border-slate-200"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="totalDays" className="text-xs font-semibold text-slate-700">
              ចំនួនថ្ងៃសរុប (Total Days)
            </Label>
            <Input
              id="totalDays"
              type="number"
              min={1}
              value={totalDays}
              onChange={(e) => setTotalDays(Number(e.target.value))}
              className="h-10 rounded-xl border-slate-200"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-xs font-semibold text-slate-700">
              មូលហេតុ (Reason)
            </Label>
            <Textarea
              id="reason"
              placeholder="បញ្ជាក់មូលហេតុនៃការសុំច្បាប់..."
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl border-slate-200"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200"
            >
              បោះបង់ (Cancel)
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-blue-600 font-medium hover:bg-blue-700 text-white"
            >
              {createMutation.isPending ? 'កំពុងរក្សាទុក...' : 'បង្កើតសំណើ (Create Request)'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
