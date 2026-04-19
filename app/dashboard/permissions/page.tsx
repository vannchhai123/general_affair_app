'use client';

import { useState, useMemo } from 'react';
import { Shield, Key, Users, ShieldCheck, ShieldX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePermissionsPage } from '@/hooks/permissions/use-permissions-page';
import { PermissionDialog, type PermissionFormData } from '@/components/permission-dialog';
import { PermissionAssignmentDialog } from '@/components/permission-assignment-dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionsTable } from '@/components/permissions/permissions-table';
import OfficersTable from '@/components/permissions/officers-table';
import type { Permission } from '@/lib/schemas';

function SummaryCards({
  permissions,
  assignments,
  isLoading,
}: {
  permissions?: Permission[];
  assignments?: { officer_id: number }[];
  isLoading: boolean;
}) {
  const stats = useMemo(() => {
    const perms = permissions ?? [];
    const assigns = assignments ?? [];
    const categories = new Set(perms.map((p) => p.category || 'General'));
    const uniqueOfficers = new Set(assigns.map((a) => a.officer_id));

    return {
      total: perms.length,
      categories: categories.size,
      assignments: assigns.length,
      officers: uniqueOfficers.size,
    };
  }, [permissions, assignments]);

  const cards = [
    {
      label: 'Total Permissions',
      value: isLoading ? null : stats.total,
      icon: Shield,
      color: 'text-violet-700',
      bg: 'bg-violet-50',
    },
    {
      label: 'Categories',
      value: isLoading ? null : stats.categories,
      icon: ShieldCheck,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Assignments',
      value: isLoading ? null : stats.assignments,
      icon: Key,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      label: 'Officers Assigned',
      value: isLoading ? null : stats.officers,
      icon: Users,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-lg border p-4 ${c.bg}`}>
            <Skeleton className="mb-2 h-6 w-10" />
            <Skeleton className="h-4 w-24" />
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

export default function PermissionsPage() {
  const ctx = usePermissionsPage();
  const [deletePermissionData, setDeletePermissionData] = useState<Permission | null>(null);

  function handleCreate(data: PermissionFormData) {
    ctx.handleCreate(data);
  }

  function handleUpdate(data: PermissionFormData) {
    if (!ctx.editPermission) return;
    ctx.handleUpdate(data);
  }

  function handleDeleteClick(permission: Permission) {
    setDeletePermissionData(permission);
  }

  async function confirmDelete() {
    if (deletePermissionData) {
      await ctx.setDeleteId(deletePermissionData.id);
      await ctx.handleDelete();
      setDeletePermissionData(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Permissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage system permissions and assign them to officers.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        permissions={ctx.permissions}
        assignments={ctx.assignments}
        isLoading={ctx.isLoading}
      />

      {/* Tabs */}
      <Tabs defaultValue="manage" className="flex flex-col gap-4">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="manage">
            <Shield className="mr-2 h-4 w-4" />
            Manage Permissions
          </TabsTrigger>
          <TabsTrigger value="assign">
            <Key className="mr-2 h-4 w-4" />
            Assign to Officers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <PermissionsTable
            ctx={ctx}
            onEdit={(p) => {
              ctx.setEditPermission(p);
              ctx.setDialogOpen(true);
            }}
            onDelete={handleDeleteClick}
          />
        </TabsContent>

        <TabsContent value="assign">
          <OfficersTable ctx={ctx} />
        </TabsContent>
      </Tabs>

      {/* Create / Edit Dialog */}
      <PermissionDialog
        open={ctx.dialogOpen}
        onOpenChange={ctx.setDialogOpen}
        permission={ctx.editPermission || undefined}
        onSubmit={ctx.editPermission ? handleUpdate : handleCreate}
      />

      {/* Permission Assignment Dialog */}
      {ctx.permissions && ctx.assignments && (
        <PermissionAssignmentDialog
          open={ctx.assignmentDialogOpen}
          onOpenChange={ctx.setAssignmentDialogOpen}
          officer={ctx.selectedOfficer}
          permissions={ctx.permissions}
          assignments={ctx.assignments}
          onAssign={ctx.handleAssign}
          onRevoke={ctx.handleRevoke}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletePermissionData}
        onOpenChange={(open) => !open && setDeletePermissionData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{deletePermissionData?.permission_name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
