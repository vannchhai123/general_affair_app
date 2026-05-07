import { Eye, MoreHorizontal, Pencil, Phone, Trash2, Upload } from 'lucide-react';
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

interface OfficersTableProps {
  officers?: Officer[];
  onView?: (officer: Officer) => void;
  onEdit?: (officer: Officer) => void;
  onDelete?: (officer: Officer) => void;
  onUploadImage?: (officer: Officer) => void;
  isLoading?: boolean;
  totalOfficer?: number;
}

function getOfficerInitials(officer: Officer) {
  const initials = [officer.first_name, officer.last_name]
    .filter(Boolean)
    .map((name) => name[0])
    .join('');

  return initials || 'OF';
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
  onView,
  onEdit,
  onDelete,
  onUploadImage,
  isLoading,
}: OfficersTableProps) {
  const showUpload = Boolean(onUploadImage);
  const showEdit = Boolean(onEdit);
  const showDelete = Boolean(onDelete);

  if (!isLoading && (!officers || officers.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Eye className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium">No officers found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust filters or create an officer to populate this directory.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4 py-2">Officer Code</TableHead>
            <TableHead className="px-4 py-2">First Name</TableHead>
            <TableHead className="px-4 py-2">Last Name</TableHead>
            <TableHead className="px-4 py-2">Position</TableHead>
            <TableHead className="hidden px-4 py-2 lg:table-cell">Department</TableHead>
            <TableHead className="hidden px-4 py-2 md:table-cell">Phone</TableHead>
            <TableHead className="px-4 py-2">Status</TableHead>
            <TableHead className="w-12 px-4 py-2 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            officers?.map((officer) => (
              <TableRow key={officer.id}>
                <TableCell className="px-4 py-2 font-mono text-sm text-muted-foreground">
                  {officer.officerCode || '-'}
                </TableCell>
                <TableCell className="px-4 py-2 font-medium">{officer.first_name}</TableCell>
                <TableCell className="px-4 py-2 font-medium">{officer.last_name}</TableCell>
                <TableCell className="px-4 py-2 text-sm">{officer.position}</TableCell>
                <TableCell className="hidden px-4 py-2 text-sm lg:table-cell">
                  {officer.department}
                </TableCell>
                <TableCell className="hidden px-4 py-2 text-sm md:table-cell">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {officer.phone || '-'}
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
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                      <DropdownMenuItem onClick={() => onView?.(officer)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {showUpload ? (
                        <DropdownMenuItem onClick={() => onUploadImage?.(officer)}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </DropdownMenuItem>
                      ) : null}
                      {showEdit ? (
                        <DropdownMenuItem onClick={() => onEdit?.(officer)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      ) : null}
                      {showDelete ? (
                        <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(officer)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
