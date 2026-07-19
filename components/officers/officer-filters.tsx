import { Search } from 'lucide-react';

import type { Department, Position } from '@/lib/schemas';

import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface OfficerFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  position: string;
  setPosition: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  departments?: Department[];
  positions?: Position[];
}

export function OfficerFilters({
  search,
  setSearch,
  department,
  setDepartment,
  position,
  setPosition,
  status,
  setStatus,
  departments = [],
  positions = [],
}: OfficerFiltersProps) {
  const uniquePositions = Array.from(new Set(positions.map((p) => p.title)))
    .filter((title): title is string => Boolean(title))
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ស្វែងរក..."
          className="pl-9"
        />
      </div>

      <Select value={department} onValueChange={setDepartment}>
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="ការិយាល័យ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ការិយាល័យ</SelectItem>
          {departments.map((item) => (
            <SelectItem key={item.id} value={item.name}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={position} onValueChange={setPosition}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="តួនាទី" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">តួនាទី</SelectItem>
          {uniquePositions.map((title) => (
            <SelectItem key={title} value={title}>
              {title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="ស្ថានភាព" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ស្ថានភាព</SelectItem>
          <SelectItem value="active">សកម្ម</SelectItem>
          <SelectItem value="on_leave">ច្បាប់ឈប់សម្រាក</SelectItem>
          <SelectItem value="inactive">មិនសកម្ម</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
