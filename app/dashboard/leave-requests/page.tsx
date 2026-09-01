'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Eye,
  FileCheck2,
  FileClock,
  FileX2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateLeaveRequestDialog } from '@/components/leave-requests/create-leave-request-dialog';
import { LeaveRequestDetailsDialog } from '@/components/leave-requests/leave-request-details-dialog';
import { useLeaveRequests } from '@/hooks/leave-requests/use-leave-requests';
import { useOfficers } from '@/hooks/officers/use-officers';
import { getOfficerImageUrl, getOfficerInitials } from '@/lib/image-utils';
import type { Officer } from '@/lib/schemas';
import { useUpdateLeaveRequest } from '@/hooks/leave-requests/use-leave-request-mutations';
import type { LeaveRequest } from '@/lib/schemas';
import { toast } from '@/lib/toast';
import { RequireAccess } from '@/components/auth/require-access';
import { useAuth } from '@/components/auth/auth-provider';

function statusBadge(status: string) {
  switch (status) {
    case 'Approved':
      return (
        <Badge className="border-0 bg-emerald-100 font-medium text-emerald-800 hover:bg-emerald-200">
          Approved
        </Badge>
      );
    case 'Pending':
      return (
        <Badge className="border-0 bg-amber-100 font-medium text-amber-800 hover:bg-amber-200">
          Pending
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge className="border-0 bg-red-100 font-medium text-red-800 hover:bg-red-200">
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function typeBadge(type: string) {
  switch (type) {
    case 'Annual Leave':
      return (
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
          ច្បាប់សម្រាកប្រចាំឆ្នាំ
        </Badge>
      );
    case 'Sick Leave':
      return (
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
          ច្បាប់ជំងឺ
        </Badge>
      );
    case 'Personal Leave':
      return (
        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
          ច្បាប់ផ្ទាល់ខ្លួន
        </Badge>
      );
    case 'Special Leave':
      return (
        <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
          ច្បាប់ពិសេស
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

export default function LeaveRequestsPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('LEAVE_CREATE');
  const canApprove = hasPermission('LEAVE_APPROVE');

  const { data: leaves = [], isLoading, isError, error, refetch, isFetching } = useLeaveRequests();
  const { officers = [] } = useOfficers({ pageSize: 1000 });
  const updateLeaveRequest = useUpdateLeaveRequest();

  const officersMap = useMemo(
    () => new Map<number, Officer>(officers.map((o: Officer) => [o.id, o])),
    [officers],
  );

  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Departments list for filter
  const departments = useMemo(() => {
    const deps = new Set<string>();
    officers.forEach((o: Officer) => {
      if (o.department) deps.add(o.department);
    });
    return Array.from(deps);
  }, [officers]);

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave: LeaveRequest) => {
      const officer = officersMap.get(leave.officer_id);
      const officerName = officer
        ? `${officer.first_name} ${officer.last_name} ${officer.first_name_kh || ''} ${officer.last_name_kh || ''}`
        : '';
      const matchesSearch =
        search === '' ||
        officerName.toLowerCase().includes(search.toLowerCase()) ||
        (officer?.department && officer.department.toLowerCase().includes(search.toLowerCase())) ||
        (leave.reason && leave.reason.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
      const matchesType = typeFilter === 'all' || leave.leave_type === typeFilter;
      const matchesDepartment =
        departmentFilter === 'all' || officer?.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesType && matchesDepartment;
    });
  }, [leaves, search, statusFilter, typeFilter, departmentFilter, officersMap]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter((l: LeaveRequest) => l.status === 'Pending').length;
    const approved = leaves.filter((l: LeaveRequest) => l.status === 'Approved').length;
    const rejected = leaves.filter((l: LeaveRequest) => l.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [leaves]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateLeaveRequest.mutateAsync({
        id,
        data: { status },
      });
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status });
      }
    } catch {
      // Toast already handled by mutation
    }
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  return (
    <RequireAccess permission="LEAVE_VIEW">
      <div className="space-y-6">
        {/* Page Header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="page-title text-md font-bold tracking-tight text-slate-950">
                សំណើច្បាប់ឈប់សម្រាក
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {canCreate && (
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="h-10 rounded-xl bg-blue-600 px-4 font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  បង្កើតសំណើថ្មី
                </Button>
              )}
            </div>
          </div>
        </section>

        {isError && (
          <Alert
            variant="destructive"
            className="rounded-2xl border-red-200 bg-red-50 text-red-900"
          >
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertTitle className="font-bold">បរាជ័យក្នុងការទាញយកទិន្នន័យ (API Error)</AlertTitle>
            <AlertDescription className="text-xs text-red-700 mt-1">
              {error?.message ||
                'មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធ API បានទេ។ សូមពិនិត្យមើល Backend Server ឬ ព្យាយាមម្ដងទៀត។'}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-md font-bold text-slate-500">សំណើសរុប</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FileClock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-md font-bold text-slate-500">រង់ចាំការអនុម័ត</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-md font-bold text-slate-500">បានអនុម័ត</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.approved}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FileCheck2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-md font-bold text-slate-500">បានបដិសេធ</p>
                <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                <FileX2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Status Tabs */}
              <Tabs
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="w-full md:w-auto"
              >
                <TabsList className="h-10 rounded-xl bg-slate-100 p-1">
                  <TabsTrigger value="all" className="rounded-lg text-xs font-medium px-3">
                    ទាំងអស់ ({stats.total})
                  </TabsTrigger>
                  <TabsTrigger
                    value="Pending"
                    className="rounded-lg text-xs font-medium px-3 text-amber-700"
                  >
                    រង់ចាំ ({stats.pending})
                  </TabsTrigger>
                  <TabsTrigger
                    value="Approved"
                    className="rounded-lg text-xs font-medium px-3 text-emerald-700"
                  >
                    បានអនុម័ត ({stats.approved})
                  </TabsTrigger>
                  <TabsTrigger
                    value="Rejected"
                    className="rounded-lg text-xs font-medium px-3 text-red-700"
                  >
                    បដិសេធ ({stats.rejected})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="ស្វែងរកឈ្មោះមន្ត្រី ឬ ការិយាល័យ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 pl-9 text-sm"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-10 w-44 rounded-xl border-slate-200 text-xs font-medium">
                    <SelectValue placeholder="ប្រភេទច្បាប់" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">ប្រភេទច្បាប់</SelectItem>
                    <SelectItem value="Annual Leave">ច្បាប់សម្រាកប្រចាំឆ្នាំ</SelectItem>
                    <SelectItem value="Sick Leave">ច្បាប់ជំងឺ</SelectItem>
                    <SelectItem value="Personal Leave">ច្បាប់ផ្ទាល់ខ្លួន</SelectItem>
                    <SelectItem value="Special Leave">ច្បាប់ពិសេស</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="py-3.5 pl-6 text-xs font-semibold text-slate-600">
                      មន្ត្រី
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold text-slate-600">
                      ប្រភេទច្បាប់
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold text-slate-600">
                      រយៈពេលសុំច្បាប់
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold text-slate-600">
                      ចំនួនថ្ងៃ
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold text-slate-600 max-w-[200px]">
                      មូលហេតុ
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold text-slate-600">
                      ស្ថានភាព
                    </TableHead>
                    <TableHead className="py-3.5 pr-6 text-right text-xs font-semibold text-slate-600">
                      សកម្មភាព
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell className="pl-6 py-4">
                          <div className="h-10 w-44 rounded-lg bg-slate-100" />
                        </TableCell>
                        <TableCell>
                          <div className="h-6 w-24 rounded bg-slate-100" />
                        </TableCell>
                        <TableCell>
                          <div className="h-6 w-28 rounded bg-slate-100" />
                        </TableCell>
                        <TableCell>
                          <div className="h-6 w-12 rounded bg-slate-100" />
                        </TableCell>
                        <TableCell>
                          <div className="h-6 w-36 rounded bg-slate-100" />
                        </TableCell>
                        <TableCell>
                          <div className="h-6 w-20 rounded bg-slate-100" />
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="h-8 w-16 ml-auto rounded bg-slate-100" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-16 text-center text-slate-500">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <FileClock className="h-7 w-7" />
                        </div>
                        <p className="mt-3 text-base font-semibold text-slate-800">
                          មិនមានទិន្នន័យសំណើច្បាប់ទេ
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {search || statusFilter !== 'all' || typeFilter !== 'all'
                            ? 'មិនមានលទ្ធផលស្របតាមការស្វែងរករបស់អ្នកទេ'
                            : 'សូមចុច "បង្កើតសំណើថ្មី" ដើម្បីបន្ថែមសំណើច្បាប់'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaves.map((leave: LeaveRequest) => {
                      const officer = officersMap.get(leave.officer_id);
                      const imageUrl = getOfficerImageUrl(officer) || getOfficerImageUrl(leave);
                      const initials = getOfficerInitials(officer || leave);
                      const fullNameKh = officer
                        ? `${officer.last_name_kh || officer.last_name || ''} ${
                            officer.first_name_kh || officer.first_name || ''
                          }`.trim()
                        : `${leave.first_name} ${leave.last_name}`.trim();

                      return (
                        <TableRow key={leave.id} className="hover:bg-slate-50/60 transition-colors">
                          <TableCell className="pl-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-slate-200">
                                <AvatarImage
                                  src={imageUrl}
                                  alt={fullNameKh}
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-sm text-slate-900">{fullNameKh}</p>
                                <p className="text-xs text-slate-500">
                                  {officer?.department || leave.department || 'General'}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="py-3.5">{typeBadge(leave.leave_type)}</TableCell>

                          <TableCell className="py-3.5 text-sm text-slate-700">
                            <div className="flex items-center gap-1.5 font-medium text-xs text-slate-600">
                              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              {leave.start_date
                                ? format(new Date(leave.start_date), 'MMM d, yyyy')
                                : '?'}
                              {' - '}
                              {leave.end_date
                                ? format(new Date(leave.end_date), 'MMM d, yyyy')
                                : '?'}
                            </div>
                          </TableCell>

                          <TableCell className="py-3.5 text-sm">
                            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                              <Clock className="h-3 w-3 text-slate-500" />
                              {leave.total_days} ថ្ងៃ
                            </div>
                          </TableCell>

                          <TableCell className="py-3.5 text-sm max-w-[200px]">
                            <p className="truncate text-slate-600 text-xs" title={leave.reason}>
                              {leave.reason || '-'}
                            </p>
                          </TableCell>

                          <TableCell className="py-3.5">{statusBadge(leave.status)}</TableCell>

                          <TableCell className="py-3.5 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100"
                                onClick={() => handleViewDetails(leave)}
                                title="មើលព័ត៌មានលម្អិត"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {leave.status === 'Pending' && canApprove && (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                    onClick={() => handleUpdateStatus(leave.id, 'Approved')}
                                    title="អនុម័ត (Approve)"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => handleUpdateStatus(leave.id, 'Rejected')}
                                    title="បដិសេធ (Reject)"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CreateLeaveRequestDialog open={createOpen} onOpenChange={setCreateOpen} />

        <LeaveRequestDetailsDialog
          request={selectedRequest}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onApprove={canApprove ? (id) => handleUpdateStatus(id, 'Approved') : undefined}
          onReject={canApprove ? (id) => handleUpdateStatus(id, 'Rejected') : undefined}
          isUpdating={updateLeaveRequest.isPending}
        />
      </div>
    </RequireAccess>
  );
}
