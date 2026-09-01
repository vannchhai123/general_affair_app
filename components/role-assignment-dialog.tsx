'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Officer } from '@/lib/schemas';
import { useRoles } from '@/hooks/roles/use-roles';

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officer: Officer | null;
  onAssignRole: (officerId: number, roleName: string) => Promise<void>;
}

export function RoleAssignmentDialog({
  open,
  onOpenChange,
  officer,
  onAssignRole,
}: RoleAssignmentDialogProps) {
  const { data: roles = [], isLoading: isRolesLoading } = useRoles();
  const [selectedRole, setSelectedRole] = useState<string>('ROLE_OFFICER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (officer?.roles && officer.roles.length > 0) {
      const first = officer.roles[0];
      const code = typeof first === 'string' ? first : first.code;
      if (code) setSelectedRole(code);
    } else if (roles.length > 0 && !roles.some((r) => r.code === selectedRole)) {
      setSelectedRole(roles[0].code);
    }
  }, [officer, roles, selectedRole]);

  const handleSubmit = async () => {
    if (!officer || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAssignRole(officer.id, selectedRole);
      onOpenChange(false);
    } catch {
      // Error handled by mutation hook toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const officerDisplayName = officer
    ? `${officer.first_name || ''} ${officer.last_name || ''}`.trim() ||
      officer.fullName ||
      'មន្ត្រី'
    : 'កំពុងផ្ទុក...';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            កំណត់តួនាទីមន្ត្រី (Assign Officer Role)
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            ជ្រើសរើសតួនាទីសម្រាប់មន្ត្រី <strong>{officerDisplayName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-3">
          {isRolesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : roles.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              ពុំមានតួនាទីក្នុងប្រព័ន្ធនៅឡើយទេ (No roles available)
            </div>
          ) : (
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id || role.code}
                  className={`flex items-start space-x-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    selectedRole === role.code
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                  onClick={() => setSelectedRole(role.code)}
                >
                  <RadioGroupItem value={role.code} id={role.code} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={role.code} className="cursor-pointer font-medium text-sm">
                        {role.nameKm || role.name}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {role.code}
                      </Badge>
                    </div>
                    {role.description && (
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            បោះបង់
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isRolesLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            {isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកតួនាទី'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
