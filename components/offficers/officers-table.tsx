import { MoreHorizontal, Pencil, Trash2, Eye, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { StatusBadge } from './status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { Officer } from '@/lib/schemas';

interface OfficersTableProps {
  officers?: Officer[];
  onEdit?: (officer: Officer) => void;
  onDelete?: (officer: Officer) => void;
  isLoading?: boolean;
  totalOfficer?: number;
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
          <TableCell className="px-4 py-2">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="px-4 py-2">
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
  onEdit,
  onDelete,
  isLoading,
  totalOfficer,
}: OfficersTableProps) {
  if (!isLoading && (!officers || officers.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Eye className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium">រកមិនឃើញមន្ត្រី</h3>
        <p className="mt-1 text-sm text-muted-foreground">សូមកែតម្រូវតម្រង ឬបន្ថែមមន្ត្រីថ្មី។</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4 py-2">កូដមន្ត្រី</TableHead>
            <TableHead className="px-4 py-2">នាមខ្លួន</TableHead>
            <TableHead className="px-4 py-2">នាមត្រកូល</TableHead>
            <TableHead className="px-4 py-2">តួនាទី</TableHead>
            <TableHead className="hidden px-4 py-2 lg:table-cell">នាយកដ្ឋាន</TableHead>
            <TableHead className="hidden px-4 py-2 md:table-cell">ទូរស័ព្ទ</TableHead>
            <TableHead className="px-4 py-2">ស្ថានភាព</TableHead>
            <TableHead className="w-12 px-4 py-2 text-center">សកម្មភាព</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            officers?.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="px-4 py-2 font-mono text-sm text-muted-foreground">
                  {o.officerCode || '—'}
                </TableCell>
                <TableCell className="px-4 py-2 font-medium">{o.first_name}</TableCell>
                <TableCell className="px-4 py-2 font-medium">{o.last_name}</TableCell>
                <TableCell className="px-4 py-2 text-sm">{o.position}</TableCell>
                <TableCell className="hidden px-4 py-2 text-sm lg:table-cell">
                  {o.department}
                </TableCell>
                <TableCell className="hidden px-4 py-2 text-sm md:table-cell">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {o.phone || <span className="text-muted-foreground/50">—</span>}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2">
                  <StatusBadge status={o.status} />
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
                      <DropdownMenuItem onClick={() => onEdit?.(o)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        កែប្រែ
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(o)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        លុប
                      </DropdownMenuItem>
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
