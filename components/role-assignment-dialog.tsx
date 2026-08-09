'use client';

import { useState } from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';
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

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officer: Officer | null;
  onAssignRole: (officerId: number, roleName: string) => Promise<void>;
}

const AVAILABLE_ROLES = [
  {
    key: 'ROLE_ADMIN',
    nameEn: 'Administrator',
    nameKh: 'អភិបាលប្រព័ន្ធ (Admin)',
    description: 'មានសិទ្ធិពេញលេញលើប្រព័ន្ធទាំងមូល',
  },
  {
    key: 'ROLE_HEAD_OFFICE',
    nameEn: 'Head Office',
    nameKh: 'ការិយាល័យកណ្តាល (Head Office)',
    description: 'គ្រប់គ្រងប្រតិបត្តិការទូទៅប្រចាំថ្ងៃ',
  },
  {
    key: 'ROLE_MANAGER',
    nameEn: 'Manager',
    nameKh: 'ប្រធាន (Manager)',
    description: 'អាចមើលរបាយការណ៍ និងវត្តមានមន្ត្រីគ្រប់ការិយាល័យ',
  },
  {
    key: 'ROLE_OFFICER',
    nameEn: 'Officer',
    nameKh: 'មន្ត្រី (Officer)',
    description: 'សិទ្ធិជាមន្ត្រីទូទៅស្វ័យសេវា (Self-Service)',
  },
];

export function RoleAssignmentDialog({
  open,
  onOpenChange,
  officer,
  onAssignRole,
}: RoleAssignmentDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>('ROLE_OFFICER');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    ? `${officer.first_name} ${officer.last_name}`
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
          <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-3">
            {AVAILABLE_ROLES.map((role) => (
              <div
                key={role.key}
                className={`flex items-start space-x-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedRole === role.key
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
                onClick={() => setSelectedRole(role.key)}
              >
                <RadioGroupItem value={role.key} id={role.key} className="mt-1" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={role.key} className="cursor-pointer font-medium text-sm">
                      {role.nameKh}
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {role.key}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            បោះបង់
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
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
