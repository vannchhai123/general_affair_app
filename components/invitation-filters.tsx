'use client';

import { format } from 'date-fns';
import { CalendarIcon, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function InvitationFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  dateRange,
  onDateRangeChange,
  onReset,
  hasActiveFilters,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  dateRange?: DateRange;
  onDateRangeChange: (value: DateRange | undefined) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium font-khmer-moul-light text-slate-800 text-xs">
          ស្វែងរក និងតម្រង
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_180px_180px_240px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ស្វែងរកតាមប្រធានបទ អង្គភាព ទីតាំង ឬមន្ត្រី"
            className="pl-9"
          />
        </div>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="ស្ថានភាព" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ស្ថានភាពទាំងអស់</SelectItem>
            <SelectItem value="pending">កំពុងរង់ចាំ</SelectItem>
            <SelectItem value="accepted">បានទទួលយក</SelectItem>
            <SelectItem value="rejected">បានបដិសេធ</SelectItem>
            <SelectItem value="completed">បានបញ្ចប់</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="ប្រភេទ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ប្រភេទទាំងអស់</SelectItem>
            <SelectItem value="incoming">លិខិតចូល</SelectItem>
            <SelectItem value="outgoing">លិខិតចេញ</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start rounded-md text-left font-normal',
                !dateRange && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from
                ? `${format(dateRange.from, 'dd/MM/yyyy')}${dateRange.to ? ` - ${format(dateRange.to, 'dd/MM/yyyy')}` : ''}`
                : 'ជ្រើសរើសចន្លោះកាលបរិច្ឆេទ'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Button variant="outline" onClick={onReset} disabled={!hasActiveFilters}>
          <RotateCcw className="mr-2 h-4 w-4" />
          កំណត់ឡើងវិញ
        </Button>
      </div>
    </div>
  );
}
