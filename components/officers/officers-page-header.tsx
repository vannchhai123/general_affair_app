import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type OfficersPageHeaderProps = {
  isRefreshing: boolean;
  onRefresh: () => void;
  onAdd?: () => void;
};

export function OfficersPageHeader({ isRefreshing, onRefresh, onAdd }: OfficersPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="page-title text-xl font-semibold tracking-tight text-slate-950">
          គ្រប់គ្រងមន្រ្តី
        </h1>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          បន្ទាន់សម័យ
        </Button>
        {onAdd ? (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            បង្កើតមន្រ្តី
          </Button>
        ) : null}
      </div>
    </div>
  );
}
