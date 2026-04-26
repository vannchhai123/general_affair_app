import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface OfficerFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
}

export function OfficerFilters({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
}: OfficerFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ស្វែងរកតាមឈ្មោះ ឬអ៊ីមែល..."
          className="pl-9"
        />
      </div>

      <Select value={department} onValueChange={setDepartment}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="នាយកដ្ឋាន" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">នាយកដ្ឋានទាំងអស់</SelectItem>
          <SelectItem value="Operations">ប្រតិបត្តិការ</SelectItem>
          <SelectItem value="Security">សន្តិសុខ</SelectItem>
          <SelectItem value="Administration">រដ្ឋបាល</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="ស្ថានភាព" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ស្ថានភាពទាំងអស់</SelectItem>
          <SelectItem value="active">សកម្ម</SelectItem>
          <SelectItem value="on_leave">ច្បាប់ឈប់សម្រាក</SelectItem>
          <SelectItem value="inactive">មិនសកម្ម</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
