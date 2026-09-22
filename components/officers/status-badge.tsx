import { Badge } from '@/components/ui/badge';
import { normalizeOfficerStatus } from '@/lib/officers/page-utils';

export function StatusBadge({ status }: { status: string }) {
  switch (normalizeOfficerStatus(status)) {
    case 'active':
      return <Badge className="bg-emerald-100 text-emerald-700">សកម្ម</Badge>;
    case 'on_leave':
      return <Badge className="bg-amber-100 text-amber-700">ច្បាប់ឈប់សម្រាក</Badge>;
    case 'inactive':
      return <Badge variant="secondary">មិនសកម្ម</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function OfficerTypeBadge({ contractType }: { contractType?: string | null }) {
  const type = (contractType || '').toUpperCase().trim();

  if (type === 'CONTRACT' || type === 'មន្រ្តីកិច្ចសន្យា' || type === 'កិច្ចសន្យា') {
    return (
      <Badge className="bg-amber-50 text-amber-700 border border-amber-200/80 font-medium hover:bg-amber-50">
        មន្រ្តីកិច្ចសន្យា
      </Badge>
    );
  }

  if (type === 'PART_TIME' || type === 'ក្រៅម៉ោង') {
    return (
      <Badge className="bg-sky-50 text-sky-700 border border-sky-200/80 font-medium hover:bg-sky-50">
        ក្រៅម៉ោង
      </Badge>
    );
  }

  if (type === 'INTERNSHIP' || type === 'កម្មសិក្សា' || type === 'កម្មសិក្សាការី') {
    return (
      <Badge className="bg-purple-50 text-purple-700 border border-purple-200/80 font-medium hover:bg-purple-50">
        កម្មសិក្សាការី
      </Badge>
    );
  }

  // Default to FULL_TIME (មន្រ្តីក្របខណ្ធ)
  return (
    <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-medium hover:bg-indigo-50">
      {contractType && contractType !== 'FULL_TIME' ? contractType : 'មន្រ្តីក្របខណ្ធ'}
    </Badge>
  );
}
