'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  Users,
  Search,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOfficers } from '@/hooks/officers/use-officers';
import {
  PRESET_ROLES,
  type RolePreset,
  getRoleDisplayKm,
  getHighestHierarchyRole,
} from '@/lib/auth/permissions';
import type { Officer } from '@/lib/schemas';

// Helper to extract officer role codes (supports multi-role API response and legacy position matching)
function getOfficerRoleCodes(officer: Officer | null): string[] {
  if (!officer) return ['ROLE_OFFICER'];
  if (officer.roleCodes && officer.roleCodes.length > 0) {
    return officer.roleCodes;
  }
  const pos = (officer.position || '').toLowerCase();
  if (pos.includes('អភិបាលរង') || pos.includes('governor')) return ['ROLE_GOVERNOR_DEP_1'];
  if (pos.includes('នាយករដ្ឋបាល') && !pos.includes('រង')) return ['ROLE_ADMIN_DIRECTOR'];
  if (pos.includes('នាយករងរដ្ឋបាល')) return ['ROLE_DEPUTY_ADMIN_DIRECTOR'];
  if (pos.includes('ប្រធានផ្នែក')) return ['ROLE_DEPT_HEAD'];
  if (pos.includes('ប្រធានការិយាល័យ') && !pos.includes('អនុ')) return ['ROLE_OFFICE_CHIEF'];
  if (pos.includes('អនុប្រធាន')) return ['ROLE_DEPUTY_OFFICE_CHIEF'];
  return ['ROLE_OFFICER'];
}

function getHierarchyBadgeColor(level: number) {
  if (level >= 90)
    return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50';
  if (level >= 75)
    return 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/50';
  if (level >= 50)
    return 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/50';
  return 'bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700/50';
}

export function RolePermissionsManagement() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Data queries
  const {
    officers,
    total,
    pagination,
    isLoading: isOfficersLoading,
  } = useOfficers({
    search: search || undefined,
    department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
    page,
    pageSize,
  });

  // Navigate to dedicated officer role management page
  const handleSelectOfficer = (officer: Officer) => {
    router.push(`/dashboard/access-control/officer-permissions/${officer.id}`);
  };

  // Departments list for dropdown filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    officers.forEach((o) => {
      if (o.department) set.add(o.department);
    });
    return Array.from(set);
  }, [officers]);

  // Filter officers based on client-side role filter (multi-role aware)
  const filteredOfficers = useMemo(() => {
    if (roleFilter === 'ALL') return officers;
    return officers.filter((o) => {
      const roles = getOfficerRoleCodes(o);
      return roles.includes(roleFilter);
    });
  }, [officers, roleFilter]);

  const totalPages = Math.max(1, pagination.totalPages || Math.ceil(total / pageSize));

  return (
    <div className="space-y-5 max-w-full">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & FILTER BAR (VIBRANT LIGHT GREEN THEME)                   */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 text-white rounded-2xl p-6 shadow-md border border-emerald-500/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                កំណត់សិទ្ធិ និងតួនាទី
                <Badge
                  variant="outline"
                  className="text-xs py-0.5 px-2 bg-white/20 border-white/30 text-white font-normal"
                >
                  Access & Permissions
                </Badge>
              </h1>
              <p className="text-sm text-emerald-50 mt-0.5">
                គ្រប់គ្រងតួនាទីពហុមុខងារ (Multi-Role)
                និងកញ្ចប់សិទ្ធិអនុញ្ញាតសម្រាប់មន្ត្រីក្នុងអង្គភាព
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-emerald-800/60 border border-white/20 text-sm text-white flex items-center gap-2 self-start sm:self-center shadow-xs">
            <Users className="w-4 h-4 text-emerald-200" />
            <span>
              មន្ត្រីក្នុងប្រព័ន្ធ:{' '}
              <strong className="text-white font-bold">{total || officers.length}</strong> នាក់
            </span>
          </div>
        </div>

        {/* Global Filter Toolbar */}
        <div className="mt-5 pt-5 border-t border-white/20 grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-emerald-100 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, មុខតំណែង..."
              className="bg-emerald-950/40 border-white/20 text-white placeholder:text-emerald-100/70 pl-10 text-sm h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:border-white/70 focus-visible:outline-none focus:outline-none"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-emerald-100 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter by Role */}
          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-emerald-950/40 border border-white/20 text-white rounded-xl px-3 py-2 text-sm h-10 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/70"
            >
              <option value="ALL" className="bg-slate-900 text-slate-100">
                -- គ្រប់តួនាទីទាំងអស់ --
              </option>
              {PRESET_ROLES.map((r) => (
                <option key={r.code} value={r.code} className="bg-slate-900 text-slate-100">
                  {r.nameKm} (Lv {r.hierarchyLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Department */}
          <div className="sm:col-span-3">
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-emerald-950/40 border border-white/20 text-white rounded-xl px-3 py-2 text-sm h-10 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-white/70"
            >
              <option value="ALL" className="bg-slate-900 text-slate-100">
                -- គ្រប់ការិយាល័យ --
              </option>
              {departments.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-slate-100">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SPACIOUS FULL-WIDTH OFFICER DIRECTORY TABLE                           */}
      {/* ========================================================================= */}
      <Card className="border-border shadow-xs overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-foreground">
                បញ្ជីមន្ត្រីរាជការក្នុងអង្គភាព
              </h2>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              បង្ហាញ <strong className="text-foreground">{filteredOfficers.length}</strong> នាក់
              (សរុប {total || filteredOfficers.length} នាក់)
            </span>
          </div>

          {isOfficersLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2.5 text-muted-foreground">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
              <span className="text-sm">កំពុងផ្ទុកបញ្ជីមន្ត្រី...</span>
            </div>
          ) : filteredOfficers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-muted-foreground">
              <Users className="w-12 h-12 stroke-1 mb-2 text-muted-foreground/50" />
              <p className="text-base font-semibold">រកមិនឃើញមន្ត្រីឡើយ</p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                សូមព្យាយាមស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[320px] text-sm font-bold py-3.5">មន្ត្រី</TableHead>
                    <TableHead className="text-sm font-bold py-3.5">អត្តលេខ</TableHead>
                    <TableHead className="text-sm font-bold py-3.5">ការិយាល័យ & មុខតំណែង</TableHead>
                    <TableHead className="text-sm font-bold py-3.5">តួនាទីកាន់កាប់</TableHead>
                    <TableHead className="text-sm font-bold py-3.5">ស្ថានភាព</TableHead>
                    <TableHead className="text-right text-sm font-bold pr-6 py-3.5">
                      សកម្មភាព
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfficers.map((officer) => {
                    const officerRoleCodes = getOfficerRoleCodes(officer);
                    const displayNameKhmer =
                      officer.first_name_kh && officer.last_name_kh
                        ? `${officer.last_name_kh} ${officer.first_name_kh}`
                        : `${officer.last_name} ${officer.first_name}`;

                    return (
                      <TableRow
                        key={officer.id}
                        onClick={() => handleSelectOfficer(officer)}
                        className="cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors group"
                      >
                        {/* Officer Avatar & Name */}
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-3.5">
                            <Avatar className="w-10 h-10 border border-border shrink-0 shadow-2xs">
                              <AvatarImage
                                src={
                                  officer.image_url || officer.avatar_url || officer.photo_url || ''
                                }
                              />
                              <AvatarFallback className="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold text-sm">
                                {officer.first_name?.[0] || 'M'}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                {displayNameKhmer}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {officer.first_name} {officer.last_name} •{' '}
                                <span className="font-mono text-muted-foreground/90">
                                  @{officer.username || 'officer'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Officer Code */}
                        <TableCell className="py-3.5">
                          {officer.officerCode ? (
                            <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-muted text-foreground">
                              #{officer.officerCode}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        {/* Department & Position */}
                        <TableCell className="py-3.5">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-foreground">
                              {officer.position || 'មន្ត្រី'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {officer.department || 'រដ្ឋបាលទូទៅ'}
                            </p>
                          </div>
                        </TableCell>

                        {/* Multi-Role Badges Stack */}
                        <TableCell className="py-3.5">
                          <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                            {officerRoleCodes.map((code) => {
                              const preset = PRESET_ROLES.find((r) => r.code === code);
                              const level = preset?.hierarchyLevel || 10;
                              const nameKm = preset?.nameKm || getRoleDisplayKm(code);

                              return (
                                <Badge
                                  key={code}
                                  variant="outline"
                                  className={`text-xs px-2 py-0.5 font-semibold ${getHierarchyBadgeColor(level)}`}
                                >
                                  <ShieldCheck className="w-3 h-3 mr-1 shrink-0" />
                                  {nameKm} (Lv {level})
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3.5">
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs py-0.5 px-2 font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                            {officer.status || 'ACTIVE'}
                          </Badge>
                        </TableCell>

                        {/* Action Button */}
                        <TableCell className="text-right pr-6 py-3.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOfficer(officer);
                            }}
                            className="h-9 text-xs font-semibold border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1.5 shadow-2xs px-3.5"
                          >
                            <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            កំណត់សិទ្ធិ ({officerRoleCodes.length})
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Table Pagination Footer */}
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span>
              ទំព័រទី <strong className="text-foreground">{page}</strong> នៃ{' '}
              <strong className="text-foreground">{totalPages}</strong> (សរុប{' '}
              {total || filteredOfficers.length} នាក់)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3.5 text-xs font-medium"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isOfficersLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                ទំព័រមុន
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3.5 text-xs font-medium"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isOfficersLoading}
              >
                ទំព័របន្ទាប់
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
