import type { SetStateAction } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OfficerFilters } from '@/components/officers/officer-filters';
import { OfficersTable } from '@/components/officers/officers-table';
import type { Department, Officer } from '@/lib/schemas';

type OfficersDirectoryCardProps = {
  officers: Officer[];
  total: number;
  isLoading: boolean;
  search: string;
  department: string;
  status: string;
  departments: Department[];
  currentPage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  onSearchChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: SetStateAction<number>) => void;
  onView: (officer: Officer) => void;
  onEdit: (officer: Officer) => void;
  onDelete: (officer: Officer) => void;
  onUploadImage: (officer: Officer) => void;
};

export function OfficersDirectoryCard({
  officers,
  total,
  isLoading,
  search,
  department,
  status,
  departments,
  currentPage,
  totalPages,
  startItem,
  endItem,
  onSearchChange,
  onDepartmentChange,
  onStatusChange,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onUploadImage,
}: OfficersDirectoryCardProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border bg-white shadow-sm">
      <CardContent className="border-b p-4 sm:p-5">
        <OfficerFilters
          search={search}
          setSearch={onSearchChange}
          department={department}
          setDepartment={onDepartmentChange}
          status={status}
          setStatus={onStatusChange}
          departments={departments}
        />
      </CardContent>

      <CardContent className="p-0">
        <OfficersTable
          officers={officers}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onUploadImage={onUploadImage}
          isLoading={isLoading}
          totalOfficer={total}
        />
      </CardContent>

      {total > 0 && (
        <CardContent className="flex flex-col gap-3 border-t bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            បង្ហាញ {startItem}-{endItem} នៃ {total}
          </p>

          <div className="flex items-center justify-end gap-2">
            <p className="text-sm text-muted-foreground">
              ទំព័រ {currentPage} នៃ {totalPages}
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              មុន
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage >= totalPages}
            >
              បន្ទាប់
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
