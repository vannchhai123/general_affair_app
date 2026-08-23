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

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_180px_180px_240px_auto] items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ស្វែងរកតាមបរិយាយ, អង្គភាព, ទីកន្លែង..."
            className="h-10 pl-9 text-sm"
          />
        </div>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="ស្ថានភាព" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ស្ថានភាព</SelectItem>
            <SelectItem value="pending">កំពុងរង់ចាំ</SelectItem>
            <SelectItem value="accepted">បានទទួលយក</SelectItem>
            <SelectItem value="rejected">បានបដិសេធ</SelectItem>
            <SelectItem value="completed">បានបញ្ចប់</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="ប្រភេទ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ប្រភេទ</SelectItem>
            <SelectItem value="incoming">លិខិតអញ្ជើញគណៈអភិបាល</SelectItem>
            <SelectItem value="outgoing">លិខិតអញ្ជើញផ្ទៃក្នុង</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-10 w-full justify-start rounded-md text-left font-normal text-sm',
                !dateRange && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {dateRange?.from
                  ? `${format(dateRange.from, 'dd/MM/yyyy')}${dateRange.to ? ` - ${format(dateRange.to, 'dd/MM/yyyy')}` : ''}`
                  : 'ជ្រើសរើសចន្លោះកាលបរិច្ឆេទ'}
              </span>
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

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            កំណត់ឡើងវិញ
          </Button>
        )}
      </div>
    </div>
  );
}
