'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { PermissionDialog, type PermissionFormData } from '@/components/permission-dialog';
import { PermissionsTable } from '@/components/permissions/permissions-table';
import { RequireAccess } from '@/components/auth/require-access';
import { PageHeader } from '@/components/app-shell/page-header';
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
import { usePermissionsPage } from '@/hooks/permissions/use-permissions-page';
import type { Permission } from '@/lib/schemas';

export default function AccessControlPermissionsPage() {
  const ctx = usePermissionsPage();
  const [deletePermissionData, setDeletePermissionData] = useState<Permission | null>(null);

  return (
    <RequireAccess
      permission="PERMISSION_VIEW"
      roles={['ROLE_SUPER_ADMIN']}
      title="Access control is restricted"
      description="Only super administrators can manage system permissions."
    >
      <div className="space-y-5">
        <PageHeader
          eyebrow="Access Control"
          title="Permissions"
          description="Create, update, and remove permission definitions used by the backend authorization layer."
          actions={
            <Button onClick={() => ctx.setDialogOpen(true)}>
              <Shield className="mr-2 h-4 w-4" />
              New Permission
            </Button>
          }
        />

        <PermissionsTable
          ctx={ctx}
          onEdit={(permission) => {
            ctx.setEditPermission(permission);
            ctx.setDialogOpen(true);
          }}
          onDelete={setDeletePermissionData}
        />

        <PermissionDialog
          open={ctx.dialogOpen}
          onOpenChange={ctx.setDialogOpen}
          permission={ctx.editPermission || undefined}
          onSubmit={async (data: PermissionFormData) => {
            if (ctx.editPermission) {
              await ctx.handleUpdate(data);
              return;
            }

            await ctx.handleCreate(data);
          }}
        />

        <AlertDialog
          open={!!deletePermissionData}
          onOpenChange={(open) => !open && setDeletePermissionData(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete permission</AlertDialogTitle>
              <AlertDialogDescription>
                Delete <strong>{deletePermissionData?.permission_name}</strong> from the access
                control catalog?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!deletePermissionData) return;
                  await ctx.setDeleteId(deletePermissionData.id);
                  await ctx.handleDelete();
                  setDeletePermissionData(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RequireAccess>
  );
}
