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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Officer Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Search, review, and maintain officer records for daily administration.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        {onAdd ? (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Create Officer
          </Button>
        ) : null}
      </div>
    </div>
  );
}
