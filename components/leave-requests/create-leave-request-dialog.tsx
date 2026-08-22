'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Search, User, X } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { toast } from '@/lib/toast';

import type { Officer } from '@/lib/schemas';

interface CreateLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLeaveRequestDialog({ open, onOpenChange }: CreateLeaveRequestDialogProps) {
  const { officers } = useOfficers({ pageSize: 500 });
  const createMutation = useCreateLeaveRequest();

  const [officerId, setOfficerId] = useState<string>('');
  const [officerPopoverOpen, setOfficerPopoverOpen] = useState(false);
  const [officerSearch, setOfficerSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const [leaveType, setLeaveType] = useState<string>('Annual Leave');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [totalDays, setTotalDays] = useState<number>(1);
  const [reason, setReason] = useState<string>('');

  const departmentList = useMemo(() => {
    const set = new Set<string>();
    officers.forEach((o: Officer) => {
      if (o.department?.trim()) set.add(o.department.trim());
    });
    return Array.from(set);
  }, [officers]);

  const filteredOfficers = useMemo(() => {
    const query = officerSearch.trim().toLowerCase();
    return officers.filter((officer: Officer) => {
      if (
        selectedDepartment !== 'all' &&
        (officer.department || '').trim() !== selectedDepartment
      ) {
        return false;
      }
      if (!query) return true;

      const khName = `${officer.last_name_kh || ''} ${officer.first_name_kh || ''}`.toLowerCase();
      const enName = `${officer.first_name_en || ''} ${officer.last_name_en || ''}`.toLowerCase();
      const pos = (officer.position || '').toLowerCase();
      const dept = (officer.department || '').toLowerCase();
      const code = (officer.officerCode || (officer as any).officer_code || '').toLowerCase();

      return (
        khName.includes(query) ||
        enName.includes(query) ||
        pos.includes(query) ||
        dept.includes(query) ||
        code.includes(query)
      );
    });
  }, [officers, officerSearch, selectedDepartment]);

  const selectedOfficer = useMemo(
    () => officers.find((o: Officer) => o.id === Number(officerId)),
    [officers, officerId],
  );

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
      toast.error('សូមជ្រើសរើសមន្ត្រី');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('សូមជ្រើសរើសកាលបរិច្ឆេទ');
      return;
    }

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
      setOfficerSearch('');
      setSelectedDepartment('all');
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
          <DialogTitle className="text-xl font-bold text-slate-900 page-title">
            បង្កើតសំណើច្បាប់ឈប់សម្រាក
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Searchable & Filterable Officer Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="officer" className="text-xs font-semibold text-slate-700">
              មន្ត្រី*
            </Label>
            <Popover open={officerPopoverOpen} onOpenChange={setOfficerPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="officer"
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={officerPopoverOpen}
                  className="w-full justify-between h-11 px-3.5 text-left font-normal border-slate-200 rounded-xl bg-white"
                >
                  {selectedOfficer ? (
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold text-xs">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-medium text-slate-900 truncate leading-relaxed">
                        {selectedOfficer.last_name_kh || selectedOfficer.last_name_en}{' '}
                        {selectedOfficer.first_name_kh || selectedOfficer.first_name_en}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      ជ្រើសរើសមន្ត្រី...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[340px] sm:w-[460px] p-0 rounded-2xl shadow-xl border-slate-200"
                align="start"
              >
                <div className="p-3 border-b space-y-2 bg-slate-50/70 rounded-t-2xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, តួនាទី..."
                      value={officerSearch}
                      onChange={(e) => setOfficerSearch(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-xl bg-white border-slate-200"
                    />
                    {officerSearch && (
                      <button
                        type="button"
                        onClick={() => setOfficerSearch('')}
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {departmentList.length > 0 && (
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="h-8 text-xs bg-white rounded-xl border-slate-200 leading-relaxed">
                        <SelectValue placeholder="គ្រប់ការិយាល័យ / អង្គភាព" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[220px] rounded-xl">
                        <SelectItem value="all" className="text-xs">
                          គ្រប់ការិយាល័យ / អង្គភាព ({officers.length})
                        </SelectItem>
                        {departmentList.map((dept) => {
                          const count = officers.filter(
                            (o: Officer) => (o.department || '').trim() === dept,
                          ).length;
                          return (
                            <SelectItem key={dept} value={dept} className="text-xs">
                              {dept} ({count})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="max-h-[240px] overflow-y-auto p-1">
                  {filteredOfficers.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      រកមិនឃើញមន្ត្រីដែលត្រូវនឹងការស្វែងរកទេ
                    </div>
                  ) : (
                    filteredOfficers.map((officer: Officer) => {
                      const isSelected = String(officer.id) === officerId;
                      return (
                        <div
                          key={officer.id}
                          onClick={() => {
                            setOfficerId(String(officer.id));
                            setOfficerPopoverOpen(false);
                          }}
                          className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-medium'
                              : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-900">
                                {officer.last_name_kh} {officer.first_name_kh}
                              </span>
                              {officer.position && (
                                <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                                  {officer.position}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {officer.department}{' '}
                              {officer.officerCode ? `· ID: ${officer.officerCode}` : ''}
                            </p>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="leaveType" className="text-xs font-semibold text-slate-700">
              ប្រភេទច្បាប់*
            </Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger id="leaveType" className="h-10 rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Annual Leave">ច្បាប់សម្រាកប្រចាំឆ្នាំ</SelectItem>
                <SelectItem value="Sick Leave">ច្បាប់ជំងឺ</SelectItem>
                <SelectItem value="Personal Leave">ច្បាប់ផ្ទាល់ខ្លួន</SelectItem>
                <SelectItem value="Special Leave">ច្បាប់ពិសេស</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-xs font-semibold text-slate-700">
                ថ្ងៃចាប់ផ្តើម*
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
                ថ្ងៃបញ្ចប់*
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
              ចំនួនថ្ងៃសរុប
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
              មូលហេតុ
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
              បោះបង់
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-blue-600 font-medium hover:bg-blue-700 text-white"
            >
              {createMutation.isPending ? 'កំពុងរក្សាទុក...' : 'បង្កើតសំណើ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
