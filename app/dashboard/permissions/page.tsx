'use client';

import { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  Shield,
  Key,
  Users,
  ShieldCheck,
  ShieldX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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
import { CardNumber } from '@/components/ui/card-number';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionsTable } from '@/components/permissions/permissions-table';
import OfficersTable from '@/components/permissions/officers-table';
import type { Permission } from '@/lib/schemas';

function SummaryCards({
  permissions,
  assignments,
  isLoading,
  activeTab,
  onSelectTab,
}: {
  permissions?: Permission[];
  assignments?: { officer_id: number }[];
  isLoading: boolean;
  activeTab: 'manage' | 'assign';
  onSelectTab: (tab: 'manage' | 'assign') => void;
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
      bg: 'bg-violet-50/50',
      iconBg: 'bg-violet-100 text-violet-700',
      targetTab: 'manage' as const,
    },
    {
      label: 'Categories',
      value: isLoading ? null : stats.categories,
      icon: ShieldCheck,
      color: 'text-blue-700',
      bg: 'bg-blue-50/50',
      iconBg: 'bg-blue-100 text-blue-700',
      targetTab: 'manage' as const,
    },
    {
      label: 'Active Assignments',
      value: isLoading ? null : stats.assignments,
      icon: Key,
      color: 'text-amber-700',
      bg: 'bg-amber-50/50',
      iconBg: 'bg-amber-100 text-amber-700',
      targetTab: 'assign' as const,
    },
    {
      label: 'Officers Assigned',
      value: isLoading ? null : stats.officers,
      icon: Users,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/50',
      iconBg: 'bg-emerald-100 text-emerald-700',
      targetTab: 'assign' as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <Skeleton className="mb-2 h-6 w-10" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => {
        const isSelected = activeTab === c.targetTab;
        return (
          <Card
            key={c.label}
            role="button"
            tabIndex={0}
            onClick={() => onSelectTab(c.targetTab)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectTab(c.targetTab);
              }
            }}
            className={`group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-[0.99] select-none ${
              isSelected ? 'ring-2 ring-primary/20 border-primary/50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <CardNumber value={c.value} className={`text-2xl font-bold ${c.color}`} />
              <div className="flex items-center gap-1.5">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
                <div
                  className={`p-2 rounded-xl transition-transform group-hover:scale-105 ${c.iconBg}`}
                >
                  <c.icon className="h-4 w-4" />
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs font-medium text-muted-foreground truncate">{c.label}</p>
          </Card>
        );
      })}
    </div>
  );
}

export default function PermissionsPage() {
  const ctx = usePermissionsPage();
  const [activeTab, setActiveTab] = useState<'manage' | 'assign'>('manage');
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
          <h1 className="page-title text-2xl tracking-tight">Permissions</h1>
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
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'manage' | 'assign')}
        className="flex flex-col gap-4"
      >
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
      <PermissionAssignmentDialog
        open={ctx.assignmentDialogOpen}
        onOpenChange={ctx.setAssignmentDialogOpen}
        officer={ctx.selectedOfficer}
        permissions={ctx.permissions ?? []}
        assignments={ctx.assignments ?? []}
        onAssign={ctx.handleAssign}
        onRevoke={ctx.handleRevoke}
      />

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
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
