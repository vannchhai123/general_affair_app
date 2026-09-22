'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  BriefcaseBusiness,
  Users,
  Search,
  X,
  ExternalLink,
  Phone,
  User,
  CheckCircle2,
  CircleOff,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getOfficerImageUrl, getOfficerInitials } from '@/lib/image-utils';
import type { Department, Position, Officer } from '@/lib/schemas';

export type OrganizationTabType = 'departments' | 'positions' | 'officers';

interface OrganizationStatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments?: Department[];
  positions?: Position[];
  officers?: Officer[];
  initialTab?: OrganizationTabType;
}

export function OrganizationStatDialog({
  open,
  onOpenChange,
  departments = [],
  positions = [],
  officers = [],
  initialTab = 'departments',
}: OrganizationStatDialogProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<OrganizationTabType>(initialTab);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab || 'departments');
      setSearch('');
    }
  }, [open, initialTab]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearch('');
      setActiveTab(initialTab || 'departments');
    }
    onOpenChange(isOpen);
  };

  const filteredDepartments = useMemo(() => {
    if (activeTab !== 'departments') return [];
    const query = search.trim().toLowerCase();

    return departments.filter((d) => {
      if (!query) return true;
      const searchableText = [d.name, d.code, d.manager, d.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(query);
    });
  }, [departments, activeTab, search]);

  const filteredPositions = useMemo(() => {
    if (activeTab !== 'positions') return [];
    const query = search.trim().toLowerCase();

    return positions.filter((p) => {
      if (!query) return true;
      const searchableText = [p.title, p.code, p.departmentName, p.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(query);
    });
  }, [positions, activeTab, search]);

  const filteredOfficers = useMemo(() => {
    if (activeTab !== 'officers') return [];
    const query = search.trim().toLowerCase();

    return officers.filter((o) => {
      if (!query) return true;
      const searchableText = [
        o.first_name,
        o.last_name,
        o.first_name_kh,
        o.last_name_kh,
        o.email,
        o.officerCode,
        o.phone,
        o.position,
        o.department,
        o.office,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(query);
    });
  }, [officers, activeTab, search]);

  const currentCount =
    activeTab === 'departments'
      ? filteredDepartments.length
      : activeTab === 'positions'
        ? filteredPositions.length
        : filteredOfficers.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-5xl md:max-w-6xl lg:max-w-7xl p-0 gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80">
                {activeTab === 'departments' && <Building2 className="h-5 w-5" />}
                {activeTab === 'positions' && <BriefcaseBusiness className="h-5 w-5" />}
                {activeTab === 'officers' && <Users className="h-5 w-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold text-slate-900 font-khmer-moul-light">
                    {activeTab === 'departments' && 'បញ្ជីការិយាល័យ'}
                    {activeTab === 'positions' && 'បញ្ជីតួនាទីការងារ'}
                    {activeTab === 'officers' && 'បញ្ជីមន្ត្រីដែលបានចាត់តាំង'}
                  </DialogTitle>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {currentCount} {activeTab === 'officers' ? 'នាក់' : ''}
                  </span>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  {`${departments.length} ការិយាល័យ · ${positions.length} តួនាទី · ${officers.length} មន្ត្រីសរុប`}
                </DialogDescription>
              </div>
            </div>

            {/* Quick Action Button */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex h-8 rounded-xl border-slate-200 text-xs font-medium hover:bg-slate-50 gap-1.5 text-slate-600"
              onClick={() => {
                onOpenChange(false);
                if (activeTab === 'officers') router.push('/dashboard/officers');
                else router.push('/dashboard/organization');
              }}
            >
              <span>ទំព័រពេញ</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab('departments')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'departments'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                ការិយាល័យ ({departments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('positions')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'positions'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                តួនាទី ({positions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('officers')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'officers'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                មន្ត្រី ({officers.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="ស្វែងរកតាមឈ្មោះ ឬកូដ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8.5 rounded-xl border-slate-200 bg-slate-50/50 pl-8.5 text-xs focus-visible:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List Content */}
        <ScrollArea className="max-h-[65vh] min-h-[300px] overflow-y-auto">
          {/* 1. DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className="divide-y divide-slate-100 p-2 sm:p-4">
              {filteredDepartments.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 font-medium">
                  មិនមានទិន្នន័យការិយាល័យស្របតាមការស្វែងរកទេ
                </div>
              ) : (
                filteredDepartments.map((dept) => {
                  const isActive = dept.status === 'active';
                  return (
                    <div
                      key={dept.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-900">{dept.name}</span>
                          {dept.code && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 whitespace-nowrap">
                              {dept.code}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          {dept.manager && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span>ប្រធាន៖ {dept.manager}</span>
                            </div>
                          )}
                          {typeof dept.officerCount === 'number' && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              <span>{dept.officerCount} មន្ត្រី</span>
                            </div>
                          )}
                        </div>

                        {dept.description && (
                          <p className="text-xs text-slate-400 italic line-clamp-1">
                            {dept.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-0 sm:pl-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            សកម្ម
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            មិនសកម្ម
                          </span>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-2 rounded-lg"
                          onClick={() => {
                            onOpenChange(false);
                            router.push(`/dashboard/organization/departments/${dept.id}`);
                          }}
                        >
                          មើលលម្អិត
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 2. POSITIONS */}
          {activeTab === 'positions' && (
            <div className="divide-y divide-slate-100 p-2 sm:p-4">
              {filteredPositions.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 font-medium">
                  មិនមានទិន្នន័យតួនាទីស្របតាមការស្វែងរកទេ
                </div>
              ) : (
                filteredPositions.map((pos) => {
                  const isActive = pos.status === 'active';
                  return (
                    <div
                      key={pos.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-900">{pos.title}</span>
                          {pos.code && (
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[11px] font-medium text-blue-700 whitespace-nowrap border border-blue-100">
                              {pos.code}
                            </span>
                          )}
                        </div>

                        {pos.departmentName && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>{pos.departmentName}</span>
                          </div>
                        )}

                        {pos.description && (
                          <p className="text-xs text-slate-400 italic line-clamp-1">
                            {pos.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-0 sm:pl-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            សកម្ម
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            មិនសកម្ម
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 3. OFFICERS */}
          {activeTab === 'officers' && (
            <div className="divide-y divide-slate-100 p-2 sm:p-4">
              {filteredOfficers.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 font-medium">
                  មិនមានទិន្នន័យមន្ត្រីស្របតាមការស្វែងរកទេ
                </div>
              ) : (
                filteredOfficers.map((officer) => {
                  const fullNameKh =
                    `${officer.last_name_kh || officer.last_name || ''} ${officer.first_name_kh || officer.first_name || ''}`.trim();
                  const fullNameEn =
                    `${officer.first_name || ''} ${officer.last_name || ''}`.trim();
                  const imageUrl = getOfficerImageUrl(officer);
                  const initials = getOfficerInitials(officer);
                  const status = (officer.status || '').toLowerCase();

                  return (
                    <div
                      key={officer.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                          <AvatarImage src={imageUrl} alt={fullNameKh} className="object-cover" />
                          <AvatarFallback className="bg-blue-600 text-xs font-bold text-white">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900 truncate">
                              {fullNameKh || fullNameEn}
                            </span>
                            {officer.officerCode && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 whitespace-nowrap">
                                {officer.officerCode}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                            <span>{officer.position || 'មន្ត្រី'}</span>
                            {(officer.department || officer.office) && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400">
                                  {officer.department || officer.office}
                                </span>
                              </>
                            )}
                            {officer.phone && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-slate-400">{officer.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-13 sm:pl-0">
                        {status === 'active' || status === 'សកម្ម' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            សកម្ម
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            មិនសកម្ម
                          </span>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-2 rounded-lg"
                          onClick={() => {
                            onOpenChange(false);
                            router.push(`/dashboard/officers/${officer.id}`);
                          }}
                        >
                          មើលលម្អិត
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
