'use client';

import { useState } from 'react';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Shield,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import type { Permission } from '@/lib/schemas/api-schemas';

interface PermissionsTableProps {
  ctx: {
    search: string;
    setSearch: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    categories: string[];
    filteredPermissions: Permission[] | undefined;
    paginatedPermissions: Permission[] | undefined;
    isLoading: boolean;
    setDialogOpen: (open: boolean) => void;
    setEditPermission: (permission: Permission | null) => void;
    managePage: number;
    setManagePage: (page: number) => void;
    manageTotalPages: number;
    pageSize: number;
  };
  onEdit?: (permission: Permission) => void;
  onDelete?: (permission: Permission) => void;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="px-4 py-2">
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell className="px-4 py-2">
            <Skeleton className="mx-auto h-8 w-8 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function PermissionsTable({ ctx, onEdit, onDelete }: PermissionsTableProps) {
  const {
    search,
    setSearch,
    category,
    setCategory,
    categories,
    filteredPermissions,
    paginatedPermissions,
    isLoading,
    setDialogOpen,
    setEditPermission,
    managePage,
    setManagePage,
    manageTotalPages,
    pageSize,
  } = ctx;

  const totalPages = manageTotalPages;
  const showPagination = totalPages > 0 && paginatedPermissions && paginatedPermissions.length > 0;

  if (!isLoading && (!filteredPermissions || filteredPermissions.length === 0)) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions..."
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c: string) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setDialogOpen(true)} className="self-start sm:self-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Permission
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Eye className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium">No permissions found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or add a new permission.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions..."
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c: string) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setDialogOpen(true)} className="self-start sm:self-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Permission
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-2">Permission Name</TableHead>
              <TableHead className="px-4 py-2">Category</TableHead>
              <TableHead className="px-4 py-2">Description</TableHead>
              <TableHead className="w-12 px-4 py-2 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              paginatedPermissions?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{p.permission_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <Badge variant="secondary" className="rounded-full">
                      {p.category || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-sm text-muted-foreground">
                    {p.description || <span className="text-muted-foreground/50">—</span>}
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
                        <DropdownMenuItem onClick={() => onEdit?.(p)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(p)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {showPagination && !isLoading && (
          <div className="flex justify-end items-center gap-2 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {managePage} of {totalPages}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                if (managePage > 1) setManagePage(managePage - 1);
              }}
              disabled={managePage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                if (managePage < totalPages) setManagePage(managePage + 1);
              }}
              disabled={managePage === totalPages}
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
