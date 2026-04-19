'use client';

import { MoreHorizontal, Eye, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import type { Officer, OfficerPermission } from '@/lib/schemas';

interface OfficersTableProps {
  ctx: {
    officers: Officer[] | undefined;
    paginatedOfficers: Officer[] | undefined;
    assignments: OfficerPermission[] | undefined;
    isLoading: boolean;
    openAssignmentDialog: (officerId: number) => void;
    assignPage: number;
    setAssignPage: (page: number) => void;
    assignTotalPages: number;
    pageSize: number;
  };
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="px-4 py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="h-5 w-10 rounded-full" />
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="mx-auto h-8 w-8 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function OfficersTable({ ctx }: OfficersTableProps) {
  const {
    officers,
    paginatedOfficers,
    assignments,
    isLoading,
    openAssignmentDialog,
    assignPage,
    setAssignPage,
    assignTotalPages,
    pageSize,
  } = ctx;

  const totalPages = assignTotalPages;
  const showPagination = totalPages > 0 && paginatedOfficers && paginatedOfficers.length > 0;

  if (!isLoading && (!officers || officers.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Eye className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium">No officers found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add officers to start assigning permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-2">Officer</TableHead>
              <TableHead className="px-4 py-2">Department</TableHead>
              <TableHead className="px-4 py-2 text-center">Permissions</TableHead>
              <TableHead className="w-12 px-4 py-2 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              paginatedOfficers?.map((o) => {
                const count = assignments?.filter((a) => a.officer_id === o.id).length || 0;

                return (
                  <TableRow key={o.id}>
                    <TableCell className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                            {getInitials(o.first_name, o.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {o.first_name} {o.last_name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{o.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2 text-sm">{o.department}</TableCell>
                    <TableCell className="px-4 py-2 text-center">
                      <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                        {count}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => openAssignmentDialog(o.id)}>
                            <Key className="mr-2 h-4 w-4" />
                            Assign Permission
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {showPagination && !isLoading && (
          <div className="flex justify-end items-center gap-2 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {assignPage} of {totalPages}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                if (assignPage > 1) setAssignPage(assignPage - 1);
              }}
              disabled={assignPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                if (assignPage < totalPages) setAssignPage(assignPage + 1);
              }}
              disabled={assignPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
