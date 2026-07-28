import { Eye, MoreHorizontal, Pencil, Phone, Upload } from 'lucide-react';
import type { Officer } from '@/lib/schemas';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { StatusBadge } from './status-badge';

// Helper function to truncate long text
const truncateText = (text: string, maxLength: number = 25) => {
  if (text && text.length > maxLength) {
    return `${text.slice(0, maxLength)}...`;
  }
  return text;
};

interface OfficersTableProps {
  officers?: Officer[];
  onView?: (officer: Officer) => void;
  onEdit?: (officer: Officer) => void;
  onUploadImage?: (officer: Officer) => void;
  isLoading?: boolean;
  totalOfficer?: number;
}

function getOfficerInitials(officer: Officer) {
  const initials = [
    officer.first_name_kh || officer.first_name,
    officer.last_name_kh || officer.last_name,
  ]
    .filter(Boolean)
    .map((name) => name[0])
    .join('');

  return initials || 'OF';
}

function getSexLabel(sex?: string | null) {
  if (!sex) return '-';
  const normalized = sex.toLowerCase();
  if (normalized === 'male' || normalized === 'm' || normalized === 'ប្រុស') return 'ប្រុស';
  if (normalized === 'female' || normalized === 'f' || normalized === 'ស្រី') return 'ស្រី';
  return sex;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="px-4 py-2">
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="hidden px-4 py-2 md:table-cell">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="hidden px-4 py-2 md:table-cell">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="hidden px-4 py-2 lg:table-cell">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="mx-auto h-8 w-8 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function OfficersTable({
  officers,
  onView,
  onEdit,
  onUploadImage,
  isLoading,
}: OfficersTableProps) {
  const showUpload = Boolean(onUploadImage);
  const showEdit = Boolean(onEdit);

  if (!isLoading && (!officers || officers.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Eye className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium">មិនប្រទាក់មន្រ្តីណាឡើយ</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          សូមកែសម្រួលតម្រង ឬបង្កើតមន្រ្តីដើម្បីបំពេញបញ្ជីនេះ។
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent font-khmer-moul-light">
            <TableHead className="px-4 py-2 text-blue-900">កូដមន្រ្តី</TableHead>
            <TableHead className="px-4 py-2 text-blue-900">នាមត្រកូល</TableHead>
            <TableHead className="px-4 py-2 text-blue-900">នាមខ្លួន</TableHead>
            <TableHead className="hidden px-4 py-2 md:table-cell text-blue-900">
              នាមត្រកូល (EN)
            </TableHead>
            <TableHead className="hidden px-4 py-2 md:table-cell text-blue-900">
              នាមខ្លួន (EN)
            </TableHead>
            <TableHead className="px-4 py-2 text-blue-900">ភេទ</TableHead>
            <TableHead className="px-4 py-2 text-blue-900">តួនាទី</TableHead>
            <TableHead className="hidden px-4 py-2 lg:table-cell text-blue-900 max-w-[180px] sm:max-w-[220px]">
              ការិយាល័យ
            </TableHead>
            <TableHead className="px-4 py-2 text-blue-900">ស្ថានភាព</TableHead>
            <TableHead className="w-12 px-4 py-2 text-center text-blue-900">សកម្មភាព</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            officers?.map((officer) => (
              <TableRow key={officer.id}>
                <TableCell className="px-4 py-3 align-middle font-mono text-sm text-muted-foreground">
                  {officer.officerCode || '-'}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle font-medium leading-relaxed">
                  {officer.last_name_kh || officer.last_name}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle font-medium leading-relaxed">
                  {officer.first_name_kh || officer.first_name}
                </TableCell>
                <TableCell className="hidden px-4 py-3 align-middle text-sm leading-relaxed md:table-cell">
                  {officer.last_name_en || officer.last_name || '-'}
                </TableCell>
                <TableCell className="hidden px-4 py-3 align-middle text-sm leading-relaxed md:table-cell">
                  {officer.first_name_en || officer.first_name || '-'}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle text-sm leading-relaxed">
                  {getSexLabel(officer.sex)}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle text-sm leading-relaxed">
                  {officer.position || '-'}
                </TableCell>
                <TableCell
                  className="hidden max-w-[180px] sm:max-w-[220px] px-4 py-3 text-sm align-middle leading-relaxed lg:table-cell"
                  title={officer.department || officer.office || ''}
                >
                  <div
                    className="truncate py-0.5"
                    title={officer.department || officer.office || ''}
                  >
                    {truncateText(officer.department || officer.office || '-', 25)}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2">
                  <StatusBadge status={officer.status} />
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">បើកម៉ឺនុយ</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                      <DropdownMenuItem onClick={() => onView?.(officer)}>
                        <Eye className="mr-2 h-4 w-4" />
                        មើល
                      </DropdownMenuItem>
                      {showUpload ? (
                        <DropdownMenuItem onClick={() => onUploadImage?.(officer)}>
                          <Upload className="mr-2 h-4 w-4" />
                          បញ្ចូលរូបភាព
                        </DropdownMenuItem>
                      ) : null}
                      {showEdit ? (
                        <DropdownMenuItem onClick={() => onEdit?.(officer)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          កែសម្រួល
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
