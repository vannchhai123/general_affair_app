'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { RequireAccess } from '@/components/auth/require-access';
import { PageHeader } from '@/components/app-shell/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAssignPermissionToRole,
  usePermissionsByRole,
} from '@/hooks/permissions/use-role-permissions';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import type { Permission } from '@/lib/schemas';

const roles = ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_OFFICER'] as const;

export default function RolePermissionsPage() {
  const [role, setRole] = useState<string>('ROLE_ADMIN');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const allPermissions = usePermissions();
  const currentPermissions = usePermissionsByRole(role, { page: 0, size: 500 });
  const assignPermission = useAssignPermissionToRole();

  const permissionsByCategory = useMemo(() => {
    const grouped = new Map<string, string[]>();

    for (const item of allPermissions.data ?? []) {
      const category = item.category || 'General';
      const values = grouped.get(category) ?? [];
      values.push(item.permission_name);
      grouped.set(category, values);
    }

    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions.data]);

  const currentPermissionNames = new Set(
    (currentPermissions.data?.content ?? []).map((item: Permission) => item.permission_name),
  );

  async function handleAssign() {
    for (const permissionName of selectedPermissions) {
      await assignPermission.mutateAsync({
        role,
        data: { permissionName },
      });
    }

    setSelectedPermissions([]);
  }

  return (
    <RequireAccess
      permission="ROLE_ASSIGN_PERMISSION"
      roles={['ROLE_SUPER_ADMIN']}
      title="Role permission assignment is restricted"
      description="Only super administrators can assign permissions to roles."
    >
      <div className="space-y-5">
        <PageHeader
          eyebrow="Access Control"
          title="Role Permissions"
          description="Assign permission definitions to application roles using the backend role assignment endpoint."
        />

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Role Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="max-w-sm">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value);
                  setSelectedPermissions([]);
                }}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-xl border">
                {permissionsByCategory.map(([category, values]) => (
                  <div key={category} className="border-b last:border-b-0">
                    <div className="bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      {category}
                    </div>
                    <div className="grid gap-3 p-4 md:grid-cols-2">
                      {values.map((permissionName) => {
                        const checked = selectedPermissions.includes(permissionName);
                        const alreadyAssigned = currentPermissionNames.has(permissionName);
                        return (
                          <label
                            key={permissionName}
                            className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                          >
                            <Checkbox
                              checked={checked}
                              disabled={alreadyAssigned}
                              onCheckedChange={(next) => {
                                setSelectedPermissions((current) =>
                                  next
                                    ? [...current, permissionName]
                                    : current.filter((item) => item !== permissionName),
                                );
                              }}
                            />
                            <div>
                              <div className="font-medium text-slate-900">{permissionName}</div>
                              <div className="text-xs text-slate-500">
                                {alreadyAssigned ? 'Already assigned' : 'Available for assignment'}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-xl border bg-white p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Current role permissions</p>
                  <p className="text-xs text-slate-500">
                    Existing permissions returned for {role}.
                  </p>
                </div>
                <div className="max-h-[420px] space-y-2 overflow-y-auto">
                  {(currentPermissions.data?.content ?? []).map((item: Permission) => (
                    <div
                      key={item.id}
                      className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      {item.permission_name}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => void handleAssign()}
                  disabled={!selectedPermissions.length || assignPermission.isPending}
                  className="w-full"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Assign Selected Permissions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RequireAccess>
  );
}
