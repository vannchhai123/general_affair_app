'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Download,
  Tag,
  History,
  AlertTriangle,
  ShieldAlert,
  FolderOpen,
  UploadCloud,
  X,
  CheckCircle2,
  FileCheck2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

import { useRouter } from 'next/navigation';
import {
  getStoredDocuments,
  saveStoredDocuments,
  INITIAL_TYPES,
  INITIAL_ORGS,
  INITIAL_TAGS,
  DocumentItem,
  DocumentFile,
  DocumentTag,
  DocumentType as AppDocumentType,
  Organization,
} from './document-store';
import { apiFetch } from '@/lib/client';
import { parseApiError } from '@/lib/api-error';
import { RequireAccess } from '@/components/auth/require-access';
import { useAuth } from '@/components/auth/auth-provider';
import { showAlert } from '@/lib/toast';

const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) {
      pages.push('...');
    }
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    let adjustedStart = start;
    let adjustedEnd = end;
    if (currentPage <= 3) {
      adjustedEnd = 4;
    } else if (currentPage >= totalPages - 2) {
      adjustedStart = totalPages - 3;
    }
    for (let i = adjustedStart; i <= adjustedEnd; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    pages.push(totalPages);
  }
  return pages;
};

export default function DocumentManagementPage() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('DOCUMENT_CREATE');
  const canUpdate = hasPermission('DOCUMENT_UPDATE');
  const canDelete = hasPermission('DOCUMENT_DELETE');

  // Lists
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [documentTypes, setDocumentTypes] = useState<AppDocumentType[]>(INITIAL_TYPES);

  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const response = await apiFetch('/documents/types');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setDocumentTypes(
              data.map((t: any) => ({
                id: t.id,
                name: t.name,
                code: t.code || '',
              })),
            );
          }
        }
      } catch (err) {
        console.error('Failed to fetch document types:', err);
      }
    };
    fetchDocTypes();
  }, []);

  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/documents');
      if (response.ok) {
        const data = await response.json();
        const mappedDocs = data.map((d: any) => ({
          id: d.id,
          documentNumber: d.documentNumber || '',
          direction: d.direction || 'OUTGOING',
          documentType: d.documentType
            ? {
                id: d.documentType.id,
                name: d.documentType.name,
                code: d.documentType.code || '',
              }
            : { id: 0, name: '', code: '' },
          documentDate: d.documentDate || '',
          receivedDate: d.receivedDate || '',
          subject: d.subject || '',
          summary: d.summary || '',
          senderOrganization: d.senderOrganization
            ? {
                id: d.senderOrganization.id,
                name: d.senderOrganization.name,
                shortName: d.senderOrganization.shortName,
              }
            : null,
          receiverOrganization: d.receiverOrganization
            ? {
                id: d.receiverOrganization.id,
                name: d.receiverOrganization.name,
                shortName: d.receiverOrganization.shortName,
              }
            : null,
          confidentiality: d.confidentiality || 'NORMAL',
          priority: d.priority || 'NORMAL',
          status: d.status === 'LOGGED' ? 'LOGGED' : 'PENDING',
          tags: d.tags || [],
          files: d.files || [],
          logs: d.logs || [],
        }));
        setDocuments(mappedDocs);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Metrics calculations
  const stats = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter((d) => d.status === 'PENDING').length;
    const logged = documents.filter((d) => d.status === 'LOGGED').length;
    const urgent = documents.filter(
      (d) => d.priority === 'CRITICAL' || d.priority === 'HIGH',
    ).length;

    return {
      total,
      pending,
      logged,
      urgent,
    };
  }, [documents]);

  // Filtered lists
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || doc.documentType.id.toString() === typeFilter;

      const matchesDate = !dateFilter || doc.documentDate === dateFilter;

      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;

      return matchesSearch && matchesType && matchesDate && matchesStatus;
    });
  }, [documents, searchQuery, typeFilter, dateFilter, statusFilter]);

  // Pagination states & calculations
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, dateFilter, statusFilter]);

  const paginatedDocs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocs, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredDocs.length / itemsPerPage);
  }, [filteredDocs]);

  const handleDeleteDoc = async (id: number) => {
    const res = await showAlert.confirm(
      'តើអ្នកពិតជាចង់លុបឯកសារនេះមែនទេ?',
      'ឯកសារដែលបានលុបមិនអាចទាញយកមកវិញបានឡើយ។',
      'លុបចេញ',
    );
    if (res.isConfirmed) {
      try {
        const response = await apiFetch(`/documents/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setDocuments((prev) => prev.filter((d) => d.id !== id));
          showAlert.success('បានលុបឯកសារដោយជោគជ័យ!');
        } else {
          const errorMsg = await parseApiError(
            response,
            'មានបញ្ហាក្នុងការលុបឯកសារនេះពីម៉ាស៊ីនបម្រើ',
          );
          showAlert.error('មិនអាចលុបឯកសារបានឡើយ', errorMsg);
        }
      } catch (err: any) {
        console.error('Failed to delete document:', err);
        showAlert.error('មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើដើម្បីលុបបានឡើយ', err.message);
      }
    }
  };

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleStatusChange = async (id: number, newStatus: 'PENDING' | 'LOGGED') => {
    try {
      setUpdatingId(id);
      const response = await apiFetch(`/documents/${id}/status?status=${newStatus}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
        showAlert.success('បានផ្លាស់ប្តូរស្ថានភាពឯកសារដោយជោគជ័យ!');
      } else {
        const errorMsg = await parseApiError(response, 'មិនអាចផ្លាស់ប្តូរស្ថានភាពឯកសារបានឡើយ');
        showAlert.error('មិនអាចផ្លាស់ប្តូរស្ថានភាពឯកសារបានឡើយ', errorMsg);
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      showAlert.error('មានបញ្ហាក្នុងការតភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើ', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'LOGGED' ? 'PENDING' : 'LOGGED';
    handleStatusChange(id, nextStatus);
  };

  return (
    <RequireAccess permission="DOCUMENT_VIEW">
      <div className="space-y-6">
        {/* 1. Statistics Cards Row */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-khmer-moul-light">
                    ឯកសារសរុប
                  </p>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {stats.total}
                  </h3>
                </div>
                <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-3 text-indigo-600 shadow-sm">
                  <FolderOpen className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-khmer-moul-light">
                    កំពុងពិនិត្យ
                  </p>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {stats.pending}
                  </h3>
                </div>
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 text-amber-600 shadow-sm">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-khmer-moul-light">
                    បានចុះបញ្ជី
                  </p>
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {stats.logged}
                  </h3>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-emerald-600 shadow-sm">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Main Workspace Layout */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="gap-4 border-b bg-slate-50/70 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h3 className="page-title text-md font-bold text-slate-900">
                    ផ្ទាំងគ្រប់គ្រងឯកសារ
                  </h3>
                </div>
                {canCreate && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        router.push('/dashboard/document-management/add');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      ចុះបញ្ជីឯកសារថ្មី
                    </Button>
                  </div>
                )}
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-col md:flex-row md:items-center gap-3 pt-2">
                <div className="relative w-full md:w-[280px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white"
                    placeholder="ស្វែងរកឯកសារ..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[190px] bg-white text-slate-700">
                      <SelectValue placeholder="ប្រភេទលិខិត" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ប្រភេទ</SelectItem>
                      {documentTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] bg-white text-slate-700">
                      <SelectValue placeholder="ស្ថានភាព" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ស្ថានភាព</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="LOGGED">Logged</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-[180px] bg-white text-slate-700"
                    placeholder="កាលបរិច្ឆេទ"
                  />

                  {(searchQuery ||
                    typeFilter !== 'all' ||
                    dateFilter ||
                    statusFilter !== 'all') && (
                    <Button
                      variant="ghost"
                      className="text-indigo-600 hover:text-indigo-750 hover:bg-indigo-50"
                      onClick={() => {
                        setSearchQuery('');
                        setTypeFilter('all');
                        setDateFilter('');
                        setStatusFilter('all');
                      }}
                    >
                      សម្អាតតម្រង
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Document Data Table */}
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/70 font-khmer-moul-light">
                  <TableRow>
                    <TableHead className="w-[160px] font-bold px-6 py-4">លេខឯកសារ</TableHead>
                    <TableHead className="font-bold px-6 py-4">កម្មវត្ថុឯកសារ</TableHead>
                    <TableHead className="w-[180px] font-bold px-6 py-4">ប្រភេទ</TableHead>
                    <TableHead className="w-[130px] font-bold text-center px-6 py-4">
                      ស្ថានភាព
                    </TableHead>
                    <TableHead className="w-[140px] font-bold text-right px-6 py-4">
                      កាលបរិច្ឆេទ
                    </TableHead>
                    <TableHead className="w-[120px] text-center font-bold px-6 py-4">
                      សកម្មភាព
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                          កំពុងទាញយកទិន្នន័យ...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredDocs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                        <FolderOpen className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                        មិនមានឯកសារស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDocs.map((doc) => (
                      <TableRow
                        key={doc.id}
                        onClick={() => {
                          router.push(`/dashboard/document-management/${doc.id}`);
                        }}
                        className="cursor-pointer transition-colors hover:bg-slate-50/60"
                      >
                        <TableCell className="font-semibold text-slate-700 px-6 py-4">
                          {doc.documentNumber}
                        </TableCell>
                        <TableCell className="max-w-[340px] px-6 py-4 align-middle">
                          <div
                            className="font-medium text-slate-900 leading-relaxed text-sm line-clamp-2 py-0.5"
                            title={doc.subject}
                          >
                            {doc.subject}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant="outline" className="bg-white text-xs border-slate-200">
                            {doc.documentType.name}
                          </Badge>
                        </TableCell>

                        <TableCell
                          className="text-center px-6 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center">
                            <Select
                              value={doc.status}
                              onValueChange={(val: 'PENDING' | 'LOGGED') =>
                                handleStatusChange(doc.id, val)
                              }
                              disabled={updatingId === doc.id}
                            >
                              <SelectTrigger
                                className={`h-7 w-[108px] text-xs font-semibold rounded-full border shadow-none transition-all px-2.5 ${
                                  doc.status === 'LOGGED'
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                                    : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                }`}
                              >
                                <SelectValue>
                                  {updatingId === doc.id ? (
                                    <span className="text-2xs text-slate-500">កំពុងប្តូរ...</span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                          doc.status === 'LOGGED' ? 'bg-indigo-600' : 'bg-amber-600'
                                        }`}
                                      />
                                      {doc.status === 'LOGGED' ? 'Logged' : 'Pending'}
                                    </span>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent align="center">
                                <SelectItem
                                  value="PENDING"
                                  className="text-xs font-medium text-amber-700"
                                >
                                  🟡 Pending
                                </SelectItem>
                                <SelectItem
                                  value="LOGGED"
                                  className="text-xs font-medium text-indigo-700"
                                >
                                  🔵 Logged
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6 py-4">
                          <span className="inline-block text-slate-800 text-xs font-bold font-mono bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg shadow-2xs">
                            {doc.documentDate}
                          </span>
                        </TableCell>
                        <TableCell
                          className="text-center px-6 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-0.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-8 w-8 ${
                                doc.status === 'LOGGED'
                                  ? 'text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              onClick={() => handleToggleStatus(doc.id, doc.status)}
                              title={
                                doc.status === 'LOGGED' ? 'ប្តូរទៅជា Pending' : 'ប្តូរទៅជា Logged'
                              }
                              disabled={updatingId === doc.id}
                            >
                              {doc.status === 'LOGGED' ? (
                                <Clock className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                              onClick={() => {
                                router.push(`/dashboard/document-management/${doc.id}`);
                              }}
                              title="មើលលម្អិត"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-indigo-600 hover:bg-indigo-50"
                              onClick={() => {
                                router.push(`/dashboard/document-management/${doc.id}/edit`);
                              }}
                              title="កែប្រែ"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                              onClick={() => handleDeleteDoc(doc.id)}
                              title="លុប"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/40 px-6 py-4 rounded-b-2xl">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-white border-slate-200"
                  >
                    ថយក្រោយ
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-white border-slate-200"
                  >
                    បន្ទាប់
                  </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-slate-500">
                      បង្ហាញលទ្ធផលពី{' '}
                      <span className="font-semibold text-slate-900">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{' '}
                      ដល់{' '}
                      <span className="font-semibold text-slate-900">
                        {Math.min(currentPage * itemsPerPage, filteredDocs.length)}
                      </span>{' '}
                      នៃ <span className="font-semibold text-slate-900">{filteredDocs.length}</span>{' '}
                      ឯកសារ
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-xl gap-1"
                      aria-label="Pagination"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8.5 w-8.5 rounded-lg border-slate-200 bg-white"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 text-slate-600" />
                      </Button>

                      {getPageNumbers(currentPage, totalPages).map((page, index) => {
                        if (page === '...') {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="h-8.5 w-8.5 flex items-center justify-center text-slate-400 text-xs font-semibold"
                            >
                              ...
                            </span>
                          );
                        }
                        const pageNum = page as number;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            className={`h-8.5 w-8.5 rounded-lg font-semibold text-xs transition-all duration-150 ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8.5 w-8.5 rounded-lg border-slate-200 bg-white"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </RequireAccess>
  );
}
