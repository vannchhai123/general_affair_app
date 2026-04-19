'use client';

import { useState } from 'react';
import {
  Plus,
  Users,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserMinus,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useOfficers } from '@/hooks/officers/use-officers';
import {
  useCreateOfficer,
  useUpdateOfficer,
  useDeleteOfficer,
} from '@/hooks/officers/use-officer-mutations';

import { useOfficerStats } from '@/hooks/officers/use-officer-stats';
import { OfficerFilters } from '@/components/offficers/officer-filters';
import { OfficersTable } from '@/components/offficers/officers-table';
import { OfficerDialog, type OfficerFormData } from '@/components/officer-dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Skeleton } from '@/components/ui/skeleton';
import type { Officer } from '@/lib/schemas';

const PAGE_SIZE = 5;

function SummaryCards({
  stats,
  isLoading,
}: {
  stats?: {
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
  };
  isLoading: boolean;
}) {
  const cards = [
    {
      label: 'Total',
      value: stats?.total ?? 0,
      icon: Users,
      color: 'text-slate-700',
      bg: 'bg-slate-50',
    },
    {
      label: 'Active',
      value: stats?.active ?? 0,
      icon: UserCheck,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      label: 'On Leave',
      value: stats?.onLeave ?? 0,
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      label: 'Inactive',
      value: stats?.inactive ?? 0,
      icon: UserMinus,
      color: 'text-red-700',
      bg: 'bg-red-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-lg border p-4 ${c.bg}`}>
            <Skeleton className="mb-2 h-5 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-lg border p-4 ${c.bg}`}>
          <div className="flex items-center justify-between">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <c.icon className={`h-5 w-5 ${c.color}`} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function OfficersPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<
    (OfficerFormData & { id: number }) | undefined
  >();
  const [deleteOfficerData, setDeleteOfficerData] = useState<Officer | null>(null);
  const { data: stats, isLoading: statsLoading } = useOfficerStats();
  console.log('officer stats:', { data: stats });

  const {
    officers = [],
    total = 0,
    mutate,
    isLoading,
    isError,
    error,
  } = useOfficers({
    search,
    department: department === 'all' ? undefined : department,
    status: status === 'all' ? undefined : status,
    page: page - 1,
    pageSize: PAGE_SIZE,
  });

  const createOfficer = useCreateOfficer();
  const updateOfficer = useUpdateOfficer();
  const deleteOfficer = useDeleteOfficer();

  function resetPage() {
    setPage(1);
  }

  function handleAdd() {
    setEditingOfficer(undefined);
    setDialogOpen(true);
  }

  function handleEdit(officer: Officer) {
    setEditingOfficer({
      id: officer.id,
      first_name: officer.first_name,
      last_name: officer.last_name,
      email: officer.email || '',
      position: officer.position,
      department: officer.department,
      phone: officer.phone || '',
      status: officer.status,
      officerCode: officer.officerCode || '',
    });
    setDialogOpen(true);
  }

  function handleDelete(officer: Officer) {
    setDeleteOfficerData(officer);
  }

  async function confirmDelete() {
    if (!deleteOfficerData) return;
    await deleteOfficer.mutateAsync(deleteOfficerData.id);
    mutate();
    setDeleteOfficerData(null);
  }

  async function handleSubmit(data: OfficerFormData) {
    if (editingOfficer) {
      await updateOfficer.mutateAsync({ id: editingOfficer.id, data });
    } else {
      await createOfficer.mutateAsync(data);
    }
    mutate();
  }

  if (isError) {
    return <div className="text-red-500">Failed to load officers: {error?.message}</div>;
  }

  const isSummaryLoading = statsLoading || !stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Officers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization&apos;s officers and roles.
          </p>
        </div>

        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Officer
        </Button>
      </div>

      <SummaryCards stats={stats} isLoading={isSummaryLoading} />

      {/* Filters */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        <OfficerFilters
          search={search}
          setSearch={(v) => {
            setSearch(v);
            resetPage();
          }}
          department={department}
          setDepartment={(v) => {
            setDepartment(v);
            resetPage();
          }}
          status={status}
          setStatus={(v) => {
            setStatus(v);
            resetPage();
          }}
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <OfficersTable
          officers={officers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
          totalOfficer={total}
        />
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-end gap-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / PAGE_SIZE)}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(Math.ceil(total / PAGE_SIZE), p + 1))}
            disabled={page >= Math.ceil(total / PAGE_SIZE)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialog */}
      <OfficerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        officer={editingOfficer}
        onSubmit={handleSubmit}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteOfficerData}
        onOpenChange={(open) => !open && setDeleteOfficerData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Officer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>
                {deleteOfficerData?.first_name} {deleteOfficerData?.last_name}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
