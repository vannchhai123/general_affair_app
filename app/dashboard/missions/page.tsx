'use client';

import { format } from 'date-fns';
import { Check, X, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMissions } from '@/hooks/missions/use-missions';
import { useUpdateMission } from '@/hooks/missions/use-mission-mutations';
import type { Mission } from '@/lib/schemas';

function statusBadge(status: string) {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-emerald-100 text-emerald-700 border-0">Approved</Badge>;
    case 'Pending':
      return <Badge className="bg-amber-100 text-amber-700 border-0">Pending</Badge>;
    case 'Completed':
      return <Badge className="bg-blue-100 text-blue-700 border-0">Completed</Badge>;
    case 'Rejected':
      return <Badge className="bg-red-100 text-red-700 border-0">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function MissionsPage() {
  const { data: missions = [] } = useMissions();
  const updateMission = useUpdateMission();

  async function updateStatus(id: number, status: string) {
    await updateMission.mutateAsync({
      id,
      data: { status },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title text-2xl tracking-tight">Missions</h1>
        <p className="text-muted-foreground">Track and approve officer missions</p>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {missions.map((mission: Mission) => (
          <Card key={mission.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    {mission.purpose || 'Untitled Mission'}
                  </CardTitle>
                  <CardDescription>
                    {mission.first_name} {mission.last_name} - {mission.department}
                  </CardDescription>
                </div>
                {statusBadge(mission.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {mission.start_date ? format(new Date(mission.start_date), 'MMM d') : '?'} -{' '}
                  {mission.end_date ? format(new Date(mission.end_date), 'MMM d, yyyy') : '?'}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {mission.location || 'No location'}
                </div>
                {mission.approver_name && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Approved by: {mission.approver_name}
                  </p>
                )}
                {mission.status === 'Pending' && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => updateStatus(mission.id, 'Approved')}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => updateStatus(mission.id, 'Rejected')}
                    >
                      <X className="mr-1 h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {missions.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No missions found
          </div>
        )}
      </div>
    </div>
  );
}
