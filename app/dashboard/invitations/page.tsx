'use client';

import { useEffect, useState } from 'react';
import { isAfter, isBefore, startOfDay } from 'date-fns';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { DateRange } from 'react-day-picker';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvitationDetail } from '@/components/invitation-detail';
import { InvitationFilters } from '@/components/invitation-filters';
import { InvitationForm } from '@/components/invitation-form';
import { InvitationStats } from '@/components/invitation-stats';
import { InvitationTable } from '@/components/invitation-table';
import {
  useCreateInvitation,
  useDeleteInvitation,
  useUpdateInvitation,
} from '@/hooks/invitations/use-invitation-mutations';
import { useInvitations } from '@/hooks/invitations/use-invitations';
import { officersResponseSchema, type Invitation, type Officer } from '@/lib/schemas';
import type { InvitationFormValues } from '@/lib/schemas/invitation/invitation';

type SortKey = 'id' | 'subject' | 'organization' | 'date' | 'status';

async function fetchOfficers() {
  const response = await fetch('/api/officers', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to fetch officers');
  }

  return officersResponseSchema.parse(await response.json());
}

export default function InvitationsPage() {
  const { data: invitationsData, isLoading } = useInvitations();
  const invitations: Invitation[] = invitationsData ?? [];
  const { data: officers = [] } = useQuery<Officer[]>({
    queryKey: ['officers', 'invitation-selector'],
    queryFn: fetchOfficers,
  });

  const createInvitation = useCreateInvitation();
  const updateInvitation = useUpdateInvitation();
  const deleteInvitation = useDeleteInvitation();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invitation | null>(null);
  const [statusValue, setStatusValue] = useState<Invitation['status']>('pending');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'assign'>('create');

  const pageSize = 7;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const hasActiveFilters =
    search.length > 0 || statusFilter !== 'all' || typeFilter !== 'all' || Boolean(dateRange?.from);

  const filteredInvitations = invitations.filter((invitation: Invitation) => {
    const officerMatch = invitation.assigned_officers.some(
      (officer: Invitation['assigned_officers'][number]) =>
        `${officer.first_name} ${officer.last_name}`.toLowerCase().includes(debouncedSearch),
    );

    const textMatch =
      !debouncedSearch ||
      invitation.subject.toLowerCase().includes(debouncedSearch) ||
      invitation.organization.toLowerCase().includes(debouncedSearch) ||
      invitation.location.toLowerCase().includes(debouncedSearch) ||
      officerMatch;

    const statusMatch = statusFilter === 'all' || invitation.status === statusFilter;
    const typeMatch = typeFilter === 'all' || invitation.type === typeFilter;

    const invitationDate = startOfDay(new Date(invitation.date));
    const fromMatch = !dateRange?.from || !isBefore(invitationDate, startOfDay(dateRange.from));
    const toMatch = !dateRange?.to || !isAfter(invitationDate, startOfDay(dateRange.to));

    return textMatch && statusMatch && typeMatch && fromMatch && toMatch;
  });

  const sortedInvitations = [...filteredInvitations].sort((left, right) => {
    let comparison = 0;

    switch (sortKey) {
      case 'id':
        comparison = left.id - right.id;
        break;
      case 'date':
        comparison = new Date(left.date).getTime() - new Date(right.date).getTime();
        break;
      case 'subject':
        comparison = left.subject.localeCompare(right.subject);
        break;
      case 'organization':
        comparison = left.organization.localeCompare(right.organization);
        break;
      case 'status':
        comparison = left.status.localeCompare(right.status);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const pageCount = Math.max(1, Math.ceil(sortedInvitations.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedInvitations = sortedInvitations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter, dateRange?.from, dateRange?.to]);

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === 'date' ? 'desc' : 'asc');
  }

  function resetFilters() {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateRange(undefined);
    setPage(1);
  }

  function openCreateDialog() {
    setSelectedInvitation(null);
    setFormMode('create');
    setFormOpen(true);
  }

  function openEditDialog(invitation: Invitation) {
    setSelectedInvitation(invitation);
    setFormMode('edit');
    setFormOpen(true);
  }

  function openAssignDialog(invitation: Invitation) {
    setSelectedInvitation(invitation);
    setFormMode('assign');
    setFormOpen(true);
  }

  function openDetail(invitation: Invitation) {
    setSelectedInvitation(invitation);
    setDetailOpen(true);
  }

  function openStatusDialog(invitation: Invitation) {
    setSelectedInvitation(invitation);
    setStatusValue(invitation.status);
    setStatusDialogOpen(true);
  }

  async function handleFormSubmit(values: InvitationFormValues) {
    if (selectedInvitation) {
      await updateInvitation.mutateAsync({ id: selectedInvitation.id, data: values });
    } else {
      await createInvitation.mutateAsync(values);
    }

    setFormOpen(false);
    setSelectedInvitation(null);
  }

  async function handleStatusSubmit() {
    if (!selectedInvitation) {
      return;
    }

    await updateInvitation.mutateAsync({
      id: selectedInvitation.id,
      data: { status: statusValue },
    });
    setStatusDialogOpen(false);
    setDetailOpen(false);
    setSelectedInvitation(null);
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    await deleteInvitation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    if (selectedInvitation?.id === deleteTarget.id) {
      setSelectedInvitation(null);
      setDetailOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Invitation Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and track all invitations</p>
        </div>

        <Button className="rounded-lg shadow-sm" onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invitation
        </Button>
      </div>

      <InvitationStats invitations={invitations} isLoading={isLoading} />

      <InvitationFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        type={typeFilter}
        onTypeChange={setTypeFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <InvitationTable
        invitations={paginatedInvitations}
        isLoading={isLoading}
        page={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onView={openDetail}
        onEdit={openEditDialog}
        onAssign={openAssignDialog}
        onChangeStatus={openStatusDialog}
        onDelete={setDeleteTarget}
      />

      <InvitationDetail
        invitation={selectedInvitation}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(invitation) => {
          setDetailOpen(false);
          openEditDialog(invitation);
        }}
        onChangeStatus={(invitation) => {
          setDetailOpen(false);
          openStatusDialog(invitation);
        }}
      />

      <InvitationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        invitation={selectedInvitation}
        officers={officers}
        mode={formMode}
        isPending={createInvitation.isPending || updateInvitation.isPending}
        onSubmit={handleFormSubmit}
      />

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              Update the workflow state for{' '}
              <span className="font-medium text-foreground">{selectedInvitation?.subject}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={statusValue}
              onValueChange={(value) => setStatusValue(value as Invitation['status'])}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusSubmit} disabled={updateInvitation.isPending}>
              {updateInvitation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invitation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-medium text-foreground">{deleteTarget?.subject}</span> and its
              officer assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
