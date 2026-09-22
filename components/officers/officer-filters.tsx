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
  officerType?: string;
  setOfficerType?: (value: string) => void;
  status?: string;
  setStatus?: (value: string) => void;
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
  officerType,
  setOfficerType,
  status,
  setStatus,
  departments = [],
  positions = [],
}: OfficerFiltersProps) {
  const currentOfficerType = officerType ?? status ?? 'all';
  const handleOfficerTypeChange = setOfficerType ?? setStatus ?? (() => {});

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
        <SelectTrigger className="w-full sm:w-[240px] text-sm leading-relaxed">
          <SelectValue placeholder="ការិយាល័យ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="py-1.5 leading-relaxed">
            ការិយាល័យ
          </SelectItem>
          {departments.map((item) => (
            <SelectItem key={item.id} value={item.name} className="py-1.5 leading-relaxed">
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={position} onValueChange={setPosition}>
        <SelectTrigger className="w-full sm:w-[220px] text-sm leading-relaxed">
          <SelectValue placeholder="តួនាទី" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="py-1.5 leading-relaxed">
            តួនាទី
          </SelectItem>
          {uniquePositions.map((title) => (
            <SelectItem key={title} value={title} className="py-1.5 leading-relaxed">
              {title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentOfficerType} onValueChange={handleOfficerTypeChange}>
        <SelectTrigger className="w-full sm:w-[180px] text-sm leading-relaxed">
          <SelectValue placeholder="ប្រភេទមន្ត្រី" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="py-1.5 leading-relaxed">
            ប្រភេទមន្ត្រី
          </SelectItem>
          <SelectItem value="FULL_TIME" className="py-1.5 leading-relaxed">
            មន្រ្តីក្របខណ្ធ
          </SelectItem>
          <SelectItem value="CONTRACT" className="py-1.5 leading-relaxed">
            មន្រ្តីកិច្ចសន្យា
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
