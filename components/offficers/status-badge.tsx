import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>;
    case 'on_leave':
      return <Badge className="bg-amber-100 text-amber-700">On Leave</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
