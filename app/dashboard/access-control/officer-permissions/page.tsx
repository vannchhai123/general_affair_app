'use client';

import { KeyRound } from 'lucide-react';
import { PermissionAssignmentDialog } from '@/components/permission-assignment-dialog';
import OfficersTable from '@/components/permissions/officers-table';
import { RequireAccess } from '@/components/auth/require-access';
import { PageHeader } from '@/components/app-shell/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/components/auth/auth-provider';
import { usePermissionsPage } from '@/hooks/permissions/use-permissions-page';
import type { OfficerPermission } from '@/lib/schemas';

export default function OfficerPermissionsPage() {
  const ctx = usePermissionsPage();
  const { isSuperAdmin } = useAuth();

  return (
    <RequireAccess
      permission="OFFICER_VIEW_PERMISSION"
      title="Officer permissions are restricted"
      description="Your account does not have access to officer-specific permission assignments."
    >
      <div className="space-y-5">
        <PageHeader
          eyebrow="Access Control"
          title="Officer Permissions"
          description={
            isSuperAdmin
              ? 'View and assign officer-specific permission overrides.'
              : 'Read-only officer permission assignments available to operational administrators.'
          }
          actions={
            isSuperAdmin ? (
              <Button
                variant="outline"
                onClick={() => {
                  if (ctx.officers?.[0]) {
                    ctx.openAssignmentDialog(ctx.officers[0].id);
                  }
                }}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Assign Permission
              </Button>
            ) : null
          }
        />

        {isSuperAdmin ? (
          <>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <OfficersTable ctx={ctx} />
              </CardContent>
            </Card>

            <PermissionAssignmentDialog
              open={ctx.assignmentDialogOpen}
              onOpenChange={ctx.setAssignmentDialogOpen}
              officer={ctx.selectedOfficer}
              permissions={ctx.permissions ?? []}
              assignments={ctx.assignments ?? []}
              onAssign={ctx.handleAssign}
              onRevoke={ctx.handleRevoke}
            />
          </>
        ) : (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer</TableHead>
                    <TableHead>Permission</TableHead>
                    <TableHead>Granted At</TableHead>
                    <TableHead>Granted By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ctx.assignments ?? []).map((item: OfficerPermission) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.officer_name}</TableCell>
                      <TableCell>{item.permission_name}</TableCell>
                      <TableCell>{item.granted_at}</TableCell>
                      <TableCell>
                        {String((item as { granted_by?: string | number }).granted_by ?? '-')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </RequireAccess>
  );
}
