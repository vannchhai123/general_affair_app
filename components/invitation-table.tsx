'use client';

import { format } from 'date-fns';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InvitationStatusBadge } from '@/components/invitation-status-badge';
import { OfficerAvatarGroup } from '@/components/officer-avatar-group';
import { cn } from '@/lib/utils';
import type { Invitation } from '@/lib/schemas';

type SortKey = 'id' | 'subject' | 'organization' | 'date' | 'status';

function SortableHead({
  label,
  sortKey,
  activeSort,
  direction,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  activeSort: SortKey;
  direction: 'asc' | 'desc';
  onSort: (value: SortKey) => void;
  className?: string;
}) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 text-left font-medium"
      >
        {label}
        <ArrowUpDown
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground',
            activeSort === sortKey && 'text-foreground',
          )}
        />
        {activeSort === sortKey ? (
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {direction}
          </span>
        ) : null}
      </button>
    </TableHead>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: 8 }).map((__, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-5 w-full max-w-[120px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function InvitationTable({
  invitations,
  isLoading,
  page,
  pageCount,
  onPageChange,
  sortKey,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onAssign,
  onChangeStatus,
  onDelete,
}: {
  invitations: Invitation[];
  isLoading: boolean;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  sortKey: SortKey;
  sortDirection: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
  onView: (invitation: Invitation) => void;
  onEdit: (invitation: Invitation) => void;
  onAssign: (invitation: Invitation) => void;
  onChangeStatus: (invitation: Invitation) => void;
  onDelete: (invitation: Invitation) => void;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent font-khmer-moul-light text-xs text-blue-900">
            <SortableHead
              label="អត្តសញ្ញាណ"
              sortKey="id"
              activeSort={sortKey}
              direction={sortDirection}
              onSort={onSort}
              className="w-[120px] text-blue-900"
            />
            <SortableHead
              label="កម្មវត្ថុ"
              sortKey="subject"
              activeSort={sortKey}
              direction={sortDirection}
              onSort={onSort}
              className="text-blue-900"
            />
            <SortableHead
              label="អង្គភាព/ស្ថាប័ន"
              sortKey="organization"
              activeSort={sortKey}
              direction={sortDirection}
              onSort={onSort}
              className="text-blue-900"
            />
            <SortableHead
              label="កាលបរិច្ឆេទ"
              sortKey="date"
              activeSort={sortKey}
              direction={sortDirection}
              onSort={onSort}
              className="text-blue-900"
            />
            <TableHead className="text-blue-900">ទីតាំង</TableHead>
            <TableHead className="text-blue-900">មន្ត្រីចាត់តាំង</TableHead>
            <SortableHead
              label="ស្ថានភាព"
              sortKey="status"
              activeSort={sortKey}
              direction={sortDirection}
              onSort={onSort}
              className="text-blue-900"
            />
            <TableHead className="w-[80px] text-right text-blue-900">សកម្មភាព</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : invitations.length > 0 ? (
            invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  INV-{String(invitation.id).padStart(3, '0')}
                </TableCell>
                <TableCell>
                  <div className="min-w-[220px]">
                    <p className="font-medium">{invitation.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {invitation.type === 'incoming' ? 'លិខិតចូល' : 'លិខិតចេញ'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{invitation.organization}</TableCell>
                <TableCell className="text-sm">
                  {format(new Date(invitation.date), 'dd/MM/yyyy')}
                  <p className="text-xs text-muted-foreground">
                    {invitation.time || 'មិនទាន់កំណត់ម៉ោង'}
                  </p>
                </TableCell>
                <TableCell className="max-w-[220px] truncate text-sm">
                  {invitation.location}
                </TableCell>
                <TableCell>
                  <OfficerAvatarGroup officers={invitation.assigned_officers} compact />
                </TableCell>
                <TableCell>
                  <InvitationStatusBadge status={invitation.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">បើកសកម្មភាព</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(invitation)}>
                        <Eye className="mr-2 h-4 w-4" />
                        មើលលម្អិត
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(invitation)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        កែសម្រួល
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssign(invitation)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        ចាត់តាំងមន្ត្រី
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onChangeStatus(invitation)}>
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        ប្តូរស្ថានភាព
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(invitation)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        លុបលិខិតអញ្ជើញ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="py-16 text-center">
                <div className="mx-auto max-w-sm">
                  <p className="text-base font-semibold">មិនរកឃើញលិខិតអញ្ជើញឡើយ</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    សូមព្យាយាមកែសម្រួលតម្រងស្វែងរក ស្ថានភាព ឬចន្លោះកាលបរិច្ឆេទ
                    ឬបង្កើតលិខិតអញ្ជើញថ្មី។
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!isLoading && invitations.length > 0 ? (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            ទំព័រទី {page} នៃ {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              ថយក្រោយ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === pageCount}
            >
              បន្ទាប់
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
