import type { SetStateAction } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OfficerFilters } from '@/components/officers/officer-filters';
import { OfficersTable } from '@/components/officers/officers-table';
import type { Officer } from '@/lib/schemas';

type OfficersDirectoryCardProps = {
  officers: Officer[];
  total: number;
  isLoading: boolean;
  search: string;
  department: string;
  status: string;
  activeFilterCount: number;
  currentPage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  onSearchChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onResetFilters: () => void;
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
  activeFilterCount,
  currentPage,
  totalPages,
  startItem,
  endItem,
  onSearchChange,
  onDepartmentChange,
  onStatusChange,
  onResetFilters,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onUploadImage,
}: OfficersDirectoryCardProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-lg shadow-sm">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">បញ្ជីមន្ត្រី</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background">
              បង្ហាញ {startItem}-{endItem}
            </Badge>
            <Badge variant="outline" className="bg-background">
              សរុប {total}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="border-b p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              តម្រង និងស្វែងរក
            </div>
            {activeFilterCount > 0 ? (
              <Button variant="ghost" size="sm" onClick={onResetFilters}>
                <X className="mr-2 h-4 w-4" />
                សម្អាត
              </Button>
            ) : null}
          </div>

          <OfficerFilters
            search={search}
            setSearch={onSearchChange}
            department={department}
            setDepartment={onDepartmentChange}
            status={status}
            setStatus={onStatusChange}
          />

          <div className="flex min-h-6 flex-wrap gap-2">
            {search ? <Badge variant="secondary">ស្វែងរក៖ {search}</Badge> : null}
            {department !== 'all' ? (
              <Badge variant="secondary">នាយកដ្ឋាន៖ {department}</Badge>
            ) : null}
            {status !== 'all' ? <Badge variant="secondary">ស្ថានភាព៖ {status}</Badge> : null}
            {activeFilterCount === 0 ? <p className="text-sm text-muted-foreground"></p> : null}
          </div>
        </div>
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
        <CardContent className="flex flex-col gap-4 border-t bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            កំពុងមើលកំណត់ត្រា {startItem}-{endItem} ក្នុងចំណោម {total}
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
