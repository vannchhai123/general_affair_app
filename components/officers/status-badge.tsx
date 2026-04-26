import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
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
