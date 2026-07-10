'use client';

import { KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('officerPermissions');

  return (
    <RequireAccess
      roles={['ROLE_ADMIN']}
      permission="OFFICER_VIEW_PERMISSION"
      title={t('restrictedTitle')}
      description={t('restrictedDescription')}
    >
      <div className="space-y-5">
        <PageHeader
          // eyebrow={t('eyebrow')}
          title={t('title')}
          // description={
          //   isSuperAdmin
          //     ? t('descriptionAdmin')
          //     : t('descriptionReadOnly')
          // }
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
                {t('assignButton')}
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
                    <TableHead>{t('readOnlyTable.officer')}</TableHead>
                    <TableHead>{t('readOnlyTable.permission')}</TableHead>
                    <TableHead>{t('readOnlyTable.grantedAt')}</TableHead>
                    <TableHead>{t('readOnlyTable.grantedBy')}</TableHead>
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
