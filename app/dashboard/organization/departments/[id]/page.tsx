'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleOff,
  Clock,
  Eye,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react';

import { RequireAccess } from '@/components/auth/require-access';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDepartment } from '@/hooks/organization/use-departments';
import { useOfficers } from '@/hooks/officers/use-officers';
import { useCreateOfficer, useUpdateOfficer } from '@/hooks/officers/use-officer-mutations';
import { usePositions } from '@/hooks/organization/use-positions';
import type { Officer } from '@/lib/schemas';
import { OfficerDialog, type OfficerFormData } from '@/components/officers/officer-dialog';
import { OfficerDetailDialog } from '@/components/officers/officer-detail-dialog';
import { getOfficerFormData, compareOfficerPositions } from '@/lib/officers/page-utils';

function getOfficerInitials(officer: Officer) {
  const initials = [
    officer.first_name_kh || officer.first_name,
    officer.last_name_kh || officer.last_name,
  ]
    .filter(Boolean)
    .map((name) => name[0])
    .join('');

  return initials || 'OF';
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') {
    return (
      <Badge className="border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        សកម្ម
      </Badge>
    );
  }

  if (status === 'on_leave') {
    return (
      <Badge className="border-amber-200/80 bg-amber-50 text-amber-700 hover:bg-amber-50">
        <Clock className="mr-1 h-3 w-3" />
        ច្បាប់ឈប់សម្រាក
      </Badge>
    );
  }

  return (
    <Badge className="border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100">
      <CircleOff className="mr-1 h-3 w-3" />
      មិនសកម្ម
    </Badge>
  );
}

export default function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const departmentId = Number(resolvedParams.id);
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [viewDetailOfficer, setViewDetailOfficer] = useState<Officer | null>(null);
  const [createOfficerOpen, setCreateOfficerOpen] = useState(false);

  const createOfficer = useCreateOfficer();
  const updateOfficer = useUpdateOfficer();

  const handleSaveOfficer = async (data: OfficerFormData) => {
    if (selectedOfficer) {
      await updateOfficer.mutateAsync({ id: selectedOfficer.id, data });
    } else {
      await createOfficer.mutateAsync({
        ...data,
        office_id: data.office_id || departmentId,
      });
    }
    setSelectedOfficer(null);
    setCreateOfficerOpen(false);
  };

  const { data: department, isLoading: isDeptLoading } = useDepartment(departmentId);
  const departmentName = department?.name ?? '';

  const { officers, isLoading: isOfficersLoading } = useOfficers({
    pageSize: 1000,
  });

  const { positions } = usePositions({ size: 100 });

  const departmentOfficers = useMemo(() => {
    return officers.filter((officer: Officer) => {
      const isSameId = officer.office_id === departmentId;
      const isSameDept =
        departmentName &&
        (officer.department?.trim().toLowerCase() === departmentName.trim().toLowerCase() ||
          officer.office?.trim().toLowerCase() === departmentName.trim().toLowerCase());
      return isSameId || isSameDept;
    });
  }, [officers, departmentId, departmentName]);

  const filteredOfficers = useMemo(() => {
    return departmentOfficers
      .filter((officer: Officer) => {
        const fullName = `${officer.last_name_kh || officer.last_name || ''} ${
          officer.first_name_kh || officer.first_name || ''
        }`.toLowerCase();
        const code = (officer.officerCode || '').toLowerCase();
        const matchesSearch =
          !search ||
          fullName.includes(search.toLowerCase()) ||
          code.includes(search.toLowerCase()) ||
          (officer.position || '').toLowerCase().includes(search.toLowerCase());

        const matchesPosition = positionFilter === 'all' || officer.position === positionFilter;
        const matchesStatus = statusFilter === 'all' || officer.status === statusFilter;

        return matchesSearch && matchesPosition && matchesStatus;
      })
      .sort(compareOfficerPositions);
  }, [departmentOfficers, search, positionFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = departmentOfficers.length;
    const active = departmentOfficers.filter((o: Officer) => o.status === 'active').length;
    const onLeave = departmentOfficers.filter((o: Officer) => o.status === 'on_leave').length;
    const inactive = departmentOfficers.filter((o: Officer) => o.status === 'inactive').length;

    return { total, active, onLeave, inactive };
  }, [departmentOfficers]);

  const uniquePositions = useMemo(() => {
    return Array.from(
      new Set(departmentOfficers.map((o: Officer) => o.position).filter(Boolean)),
    ) as string[];
  }, [departmentOfficers]);

  return (
    <RequireAccess roles={['ROLE_ADMIN']} permission="ORGANIZATION_VIEW">
      <div className="space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
              onClick={() => router.push('/dashboard/organization')}
            >
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
            <div>
              <h1 className="page-title text-2xl font-bold tracking-tight text-slate-900 mt-1">
                {isDeptLoading ? <Skeleton className="h-7 w-48" /> : department?.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSelectedOfficer(null);
                setCreateOfficerOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              បន្ថែមមន្ត្រីថ្មី
            </Button>
          </div>
        </div>

        {/* Office Overview Banner Card */}
        <Card className="overflow-hidden border-slate-200 bg-white shadow-xs">
          <CardContent className="p-6">
            {isDeptLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-3 text-indigo-700">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900 leading-relaxed">
                          {department?.name}
                        </h2>
                        <StatusBadge status={department?.status || 'active'} />
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        កូដការិយាល័យ:{' '}
                        <span className="font-semibold text-slate-700">{department?.code}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {department?.description || 'មិនមានការពិពណ៌នាបន្ថែមសម្រាប់ការិយាល័យនេះទេ។'}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-700 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">អ្នកគ្រប់គ្រងការិយាល័យ:</span>
                      <span className="font-semibold text-slate-900 leading-relaxed">
                        {department?.manager || 'មិនទាន់បានកំណត់'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stat Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 border-t pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <Users className="h-4 w-4 text-slate-500" />
                      មន្ត្រីសរុប
                    </div>
                    <CardNumber
                      value={stats.total}
                      className="mt-2 block text-2xl font-bold text-slate-900"
                    />
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                      <UserCheck className="h-4 w-4 text-emerald-600" />
                      កំពុងបម្រើការ
                    </div>
                    <CardNumber
                      value={stats.active}
                      className="mt-2 block text-2xl font-bold text-emerald-800"
                    />
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
                      <Clock className="h-4 w-4 text-amber-600" />
                      ច្បាប់ឈប់សម្រាក
                    </div>
                    <CardNumber
                      value={stats.onLeave}
                      className="mt-2 block text-2xl font-bold text-amber-800"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-100/60 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <UserMinus className="h-4 w-4 text-slate-500" />
                      មិនសកម្ម
                    </div>
                    <CardNumber
                      value={stats.inactive}
                      className="mt-2 block text-2xl font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Officers Section */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="gap-4 border-b bg-slate-50/70 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  បញ្ជីមន្ត្រីក្នុង{department?.name || 'ការិយាល័យ'}
                </CardTitle>
              </div>

              {/* Filters Toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-[240px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ស្វែងរកមន្ត្រី..."
                    className="pl-9 bg-white text-sm"
                  />
                </div>

                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger className="w-[180px] bg-white text-sm leading-relaxed">
                    <SelectValue placeholder="តួនាទី" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="py-1.5 leading-relaxed">
                      តួនាទី
                    </SelectItem>
                    {uniquePositions.map((pos: string) => (
                      <SelectItem key={pos} value={pos} className="py-1.5 leading-relaxed">
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-white text-sm leading-relaxed">
                    <SelectValue placeholder="ស្ថានភាព" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="py-1.5 leading-relaxed">
                      ស្ថានភាព
                    </SelectItem>
                    <SelectItem value="active" className="py-1.5 leading-relaxed">
                      សកម្ម
                    </SelectItem>
                    <SelectItem value="on_leave" className="py-1.5 leading-relaxed">
                      ច្បាប់ឈប់សម្រាក
                    </SelectItem>
                    <SelectItem value="inactive" className="py-1.5 leading-relaxed">
                      មិនសកម្ម
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isOfficersLoading ? (
              <div className="p-8 text-center text-sm text-slate-400">
                កំពុងទាញយកទិន្នន័យមន្ត្រី...
              </div>
            ) : filteredOfficers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-slate-100 p-4 text-slate-400 mb-3">
                  <Users className="h-8 w-8" />
                </div>
                <p className="font-semibold text-slate-800 text-base">
                  មិនទាន់មានមន្ត្រីនៅក្នុងការិយាល័យនេះនៅឡើយទេ
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  អ្នកអាចចុចប៊ូតុងខាងលើដើម្បីបន្ថែមមន្ត្រីថ្មីចូលមកកាន់
                  {department?.name || 'ការិយាល័យនេះ'}។
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/80 font-khmer-moul-light">
                  <TableRow>
                    <TableHead className="px-6 py-4">មន្ត្រី</TableHead>
                    <TableHead className="px-6 py-4">កូដមន្ត្រី</TableHead>
                    <TableHead className="px-6 py-4">តួនាទី</TableHead>
                    <TableHead className="px-6 py-4">ទំនាក់ទំនង</TableHead>
                    <TableHead className="px-6 py-4">ស្ថានភាព</TableHead>
                    <TableHead className="px-6 py-4 text-right">សកម្មភាព</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfficers.map((officer: Officer) => {
                    const fullNameKh = `${officer.last_name_kh || officer.last_name || ''} ${
                      officer.first_name_kh || officer.first_name || ''
                    }`.trim();
                    const initials = getOfficerInitials(officer);

                    return (
                      <TableRow
                        key={officer.id}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() => router.push(`/dashboard/officers/${officer.id}`)}
                      >
                        <TableCell className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-200">
                              <AvatarImage
                                src={officer.photo_url || officer.profile_image || undefined}
                                alt={fullNameKh}
                              />
                              <AvatarFallback className="bg-indigo-50 font-semibold text-indigo-700 text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm leading-relaxed">
                                {fullNameKh}
                              </p>
                              <p className="text-xs text-slate-500">
                                {officer.first_name} {officer.last_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4 align-middle">
                          <span className="inline-block text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded">
                            {officer.officerCode || '-'}
                          </span>
                        </TableCell>

                        <TableCell className="px-6 py-4 align-middle text-sm font-medium text-slate-800 leading-relaxed">
                          {officer.position || '-'}
                        </TableCell>

                        <TableCell className="px-6 py-4 align-middle text-sm text-slate-600">
                          <div className="space-y-1">
                            {officer.phone ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                <span>{officer.phone}</span>
                              </div>
                            ) : null}
                            {officer.email ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                <span>{officer.email}</span>
                              </div>
                            ) : null}
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4 align-middle">
                          <StatusBadge status={officer.status} />
                        </TableCell>

                        <TableCell
                          className="px-6 py-4 align-middle text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                              onClick={() => setViewDetailOfficer(officer)}
                              title="មើលព័ត៌មាន"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                              onClick={() => setSelectedOfficer(officer)}
                              title="កែប្រែ"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Officer Dialog */}
      <OfficerDialog
        open={Boolean(selectedOfficer) || createOfficerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOfficer(null);
            setCreateOfficerOpen(false);
          }
        }}
        officer={selectedOfficer ? getOfficerFormData(selectedOfficer) : undefined}
        onSubmit={handleSaveOfficer}
      />

      {/* View Officer Detail Dialog */}
      <OfficerDetailDialog
        open={Boolean(viewDetailOfficer)}
        onOpenChange={(open) => !open && setViewDetailOfficer(null)}
        officer={viewDetailOfficer}
      />
    </RequireAccess>
  );
}
