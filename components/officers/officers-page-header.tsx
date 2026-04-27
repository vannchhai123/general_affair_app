import { Plus, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

type OfficersPageHeaderProps = {
  isRefreshing: boolean;
  onRefresh: () => void;
  onAdd: () => void;
};

export function OfficersPageHeader({ isRefreshing, onRefresh, onAdd }: OfficersPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <div>
          <h1 className="page-title text-2xl tracking-tight">ការគ្រប់គ្រងមន្ត្រី</h1>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          ផ្ទុកឡើងវិញ
        </Button>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          បន្ថែមមន្ត្រី
        </Button>
      </div>
    </div>
  );
}
