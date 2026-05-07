'use client';

import { useEffect, useState } from 'react';
import { Layers3 } from 'lucide-react';
import { RequireAccess } from '@/components/auth/require-access';
import { PageHeader } from '@/components/app-shell/page-header';
import { ShiftAssignmentPlanner } from '@/components/shifts/shift-assignment-planner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  useSaveShiftTemplate,
  useShiftAssignments,
  useShiftList,
  useShiftReferenceData,
} from '@/hooks/shifts/use-shift-management';
import type { ShiftAssignmentScope } from '@/lib/schemas';

export default function ShiftAssignmentsPage() {
  const [selectedScope, setSelectedScope] = useState<ShiftAssignmentScope>('department');
  const [selectedScopeId, setSelectedScopeId] = useState<number | undefined>();

  const shiftList = useShiftList({ page: 0, size: 100, status: 'all' });
  const references = useShiftReferenceData();
  const saveTemplate = useSaveShiftTemplate();
  const assignments = useShiftAssignments(selectedScope, selectedScopeId);

  useEffect(() => {
    if (selectedScopeId) return;
    if (selectedScope === 'department' && references.data?.departments[0]) {
      setSelectedScopeId(references.data.departments[0].id);
    }
    if (selectedScope === 'position' && references.data?.positions[0]) {
      setSelectedScopeId(references.data.positions[0].id);
    }
    if (selectedScope === 'employee' && references.data?.employees[0]) {
      setSelectedScopeId(references.data.employees[0].id);
    }
  }, [references.data, selectedScope, selectedScopeId]);

  return (
    <RequireAccess
      permission="SHIFT_ASSIGN"
      roles={['ROLE_SUPER_ADMIN']}
      title="Shift assignments are restricted"
      description="Only super administrators can assign weekly shift schedules."
    >
      <div className="space-y-5">
        <PageHeader
          eyebrow="Scheduling"
          title="Shift Assignments"
          description="Assign weekly shift templates by department, position, or officer scope."
          actions={
            <Button variant="outline" onClick={() => void assignments.refetch()}>
              <Layers3 className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          }
        />

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <ShiftAssignmentPlanner
              shifts={shiftList.data?.content ?? []}
              references={{
                departments: references.data?.departments ?? [],
                positions: references.data?.positions ?? [],
                employees: references.data?.employees ?? [],
              }}
              template={assignments.data?.[0] ?? null}
              loading={saveTemplate.isPending}
              readOnly={false}
              selectedScope={selectedScope}
              selectedScopeId={selectedScopeId}
              onScopeChange={(scope, id) => {
                setSelectedScope(scope);
                setSelectedScopeId(id);
              }}
              onSave={async (template) => {
                await saveTemplate.mutateAsync(template);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </RequireAccess>
  );
}
