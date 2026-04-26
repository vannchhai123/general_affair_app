'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Officer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department: string;
  status: string;
}

interface Permission {
  id: number;
  permission_name: string;
  description?: string | null;
  category?: string | null;
}

interface OfficerPermission {
  id: number;
  officer_id: number;
  permission_id: number;
  granted_at: string;
  officer_name: string;
  officer_department: string;
  permission_name: string;
  permission_category: string;
}

interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

interface PermissionAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officer: Officer | null;
  permissions: Permission[];
  assignments: OfficerPermission[];
  onAssign: (officerId: number, permissionId: number) => Promise<void>;
  onRevoke: (assignmentId: number) => Promise<void>;
}

export function PermissionAssignmentDialog({
  open,
  onOpenChange,
  officer,
  permissions,
  assignments,
  onAssign,
  onRevoke,
}: PermissionAssignmentDialogProps) {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    toAdd: Set<number>;
    toRemove: Set<number>;
  }>({ toAdd: new Set(), toRemove: new Set() });

  // Group permissions by category
  const categoriesMap = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    const category = perm.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  const categories: PermissionCategory[] = Object.entries(categoriesMap).map(([name, perms]) => ({
    name,
    permissions: perms,
  }));

  // Get permissions currently assigned to this officer
  const currentAssignments = assignments.filter((a) => a.officer_id === officer?.id);
  const assignedPermissionIds = new Set(currentAssignments.map((a) => a.permission_id));

  // Calculate effective assignment state considering pending changes
  const getEffectiveState = (permissionId: number) => {
    if (pendingChanges.toRemove.has(permissionId)) return false;
    if (pendingChanges.toAdd.has(permissionId)) return true;
    return assignedPermissionIds.has(permissionId);
  };

  // Calculate category state
  const getCategoryState = (categoryPermissions: Permission[]) => {
    const checkedCount = categoryPermissions.filter((p) => getEffectiveState(p.id)).length;
    if (checkedCount === 0) return 'unchecked';
    if (checkedCount === categoryPermissions.length) return 'checked';
    return 'indeterminate';
  };

  const handleToggleCategory = (category: PermissionCategory) => {
    const state = getCategoryState(category.permissions);
    const allChecked = state === 'checked';

    category.permissions.forEach((perm) => {
      const isCurrentlyAssigned = getEffectiveState(perm.id);

      if (allChecked && isCurrentlyAssigned) {
        // Uncheck all
        if (assignedPermissionIds.has(perm.id)) {
          setPendingChanges((prev) => ({
            ...prev,
            toRemove: new Set([...prev.toRemove, perm.id]),
          }));
        }
        setPendingChanges((prev) => ({
          ...prev,
          toAdd: new Set([...prev.toAdd].filter((id) => id !== perm.id)),
        }));
      } else if (!allChecked && !isCurrentlyAssigned) {
        // Check all
        if (!assignedPermissionIds.has(perm.id)) {
          setPendingChanges((prev) => ({
            ...prev,
            toAdd: new Set([...prev.toAdd, perm.id]),
          }));
        }
        setPendingChanges((prev) => ({
          ...prev,
          toRemove: new Set([...prev.toRemove].filter((id) => id !== perm.id)),
        }));
      }
    });
  };

  const handleTogglePermission = (permissionId: number) => {
    const isCurrentlyAssigned = getEffectiveState(permissionId);

    if (isCurrentlyAssigned) {
      // Need to remove
      if (assignedPermissionIds.has(permissionId)) {
        setPendingChanges((prev) => ({
          ...prev,
          toRemove: new Set([...prev.toRemove, permissionId]),
        }));
      }
      setPendingChanges((prev) => ({
        ...prev,
        toAdd: new Set([...prev.toAdd].filter((id) => id !== permissionId)),
      }));
    } else {
      // Need to add
      if (!assignedPermissionIds.has(permissionId)) {
        setPendingChanges((prev) => ({
          ...prev,
          toAdd: new Set([...prev.toAdd, permissionId]),
        }));
      }
      setPendingChanges((prev) => ({
        ...prev,
        toRemove: new Set([...prev.toRemove].filter((id) => id !== permissionId)),
      }));
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const handleAssign = async () => {
    if (!officer || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Process removals
      for (const permissionId of pendingChanges.toRemove) {
        const assignment = currentAssignments.find((a) => a.permission_id === permissionId);
        if (assignment) {
          await onRevoke(assignment.id);
        }
      }

      // Process additions
      for (const permissionId of pendingChanges.toAdd) {
        await onAssign(officer.id, permissionId);
      }

      setPendingChanges({ toAdd: new Set(), toRemove: new Set() });
      onOpenChange(false);
    } catch {
      // Mutation hooks already surface the error toast.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setPendingChanges({ toAdd: new Set(), toRemove: new Set() });
    onOpenChange(false);
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(searchLower) ||
      cat.permissions.some(
        (p) =>
          p.permission_name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower),
      )
    );
  });

  const totalChanges = pendingChanges.toAdd.size + pendingChanges.toRemove.size;
  const officerDisplayName = officer
    ? `${officer.first_name} ${officer.last_name} - ${officer.position}`
    : 'Loading officer...';

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex h-[90dvh] flex-col overflow-hidden sm:max-w-[600px]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserCog className="h-5 w-5" />
            Assign Permissions
          </DialogTitle>
          <DialogDescription>{officerDisplayName}</DialogDescription>
        </DialogHeader>

        {/* Search */}
        <Input
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 shrink-0"
          disabled={isSubmitting}
        />

        {/* Permission Tree */}
        <ScrollArea className="min-h-0 flex-1 pr-4">
          <div className="space-y-1">
            {filteredCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.name);
              const categoryState = getCategoryState(category.permissions);
              const filteredPermissions = category.permissions.filter(
                (p) =>
                  !search ||
                  p.permission_name.toLowerCase().includes(search.toLowerCase()) ||
                  p.description?.toLowerCase().includes(search.toLowerCase()),
              );

              return (
                <div key={category.name} className="space-y-1">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 py-1">
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-accent"
                      disabled={isSubmitting}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <Checkbox
                      checked={categoryState === 'checked'}
                      indeterminate={categoryState === 'indeterminate'}
                      onCheckedChange={() => handleToggleCategory(category)}
                      aria-label={category.name}
                      disabled={isSubmitting}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>

                  {/* Category Permissions */}
                  {isExpanded && (
                    <div className="ml-7 space-y-1">
                      {filteredPermissions.map((permission) => {
                        const isChecked = getEffectiveState(permission.id);

                        return (
                          <div key={permission.id} className="flex items-start gap-2 py-1">
                            <div className="w-5 shrink-0" />
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleTogglePermission(permission.id)}
                              aria-label={permission.permission_name}
                              disabled={isSubmitting}
                            />
                            <div className="flex-1">
                              <label className="text-sm cursor-pointer">
                                {permission.permission_name}
                              </label>
                              {permission.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer with changes summary */}
        <div className="shrink-0 pt-4">
          <Separator className="mb-4" />
          <div className="flex items-center justify-between mb-4">
            {totalChanges > 0 && (
              <Badge variant="outline" className="gap-1">
                {pendingChanges.toAdd.size > 0 && (
                  <span className="text-emerald-600">+{pendingChanges.toAdd.size}</span>
                )}
                {pendingChanges.toRemove.size > 0 && (
                  <span className="text-destructive">-{pendingChanges.toRemove.size}</span>
                )}
                <span className="text-muted-foreground ml-1">changes</span>
              </Badge>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={totalChanges === 0 || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Assign'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
