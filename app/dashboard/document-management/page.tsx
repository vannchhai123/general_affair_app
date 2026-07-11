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
  DocumentType,
  Organization,
} from './document-store';

export default function DocumentManagementPage() {
  const router = useRouter();

  // Lists
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Sync state with localStorage store
  useEffect(() => {
    setDocuments(getStoredDocuments());

    const handleSync = () => {
      setDocuments(getStoredDocuments());
    };

    window.addEventListener('document-store-update', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('document-store-update', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [confidentialityFilter, setConfidentialityFilter] = useState<string>('all');

  // Metrics calculations
  const stats = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter((d) => d.status === 'PENDING' || d.status === 'DRAFT').length;
    const urgent = documents.filter(
      (d) => d.priority === 'CRITICAL' || d.priority === 'HIGH',
    ).length;

    return {
      total,
      pending,
      urgent,
      storage: '3.07 MB',
    };
  }, [documents]);

  // Filtered lists
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDirection = directionFilter === 'all' || doc.direction === directionFilter;
      const matchesType = typeFilter === 'all' || doc.documentType.id.toString() === typeFilter;
      const matchesConfidentiality =
        confidentialityFilter === 'all' || doc.confidentiality === confidentialityFilter;

      return matchesSearch && matchesDirection && matchesType && matchesConfidentiality;
    });
  }, [documents, searchQuery, directionFilter, typeFilter, confidentialityFilter]);

  const handleDeleteDoc = (id: number) => {
    if (confirm('តើអ្នកពិតជាចង់លុបឯកសារនេះមែនទេ?')) {
      setDocuments((prev) => {
        const nextDocs = prev.filter((d) => d.id !== id);
        saveStoredDocuments(nextDocs);
        return nextDocs;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  ឯកសារសរុប
                </p>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {stats.total}
                </h3>
                <p className="mt-1 text-xs text-slate-400">ឯកសារទាំងអស់ក្នុងប្រព័ន្ធ</p>
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
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  កំពុងពិនិត្យ / ព្រាង
                </p>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {stats.pending}
                </h3>
                <p className="mt-1 text-xs text-slate-400">ឯកសារត្រូវការត្រួតពិនិត្យ</p>
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
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  អាទិភាពបន្ទាន់បំផុត
                </p>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {stats.urgent}
                </h3>
                <p className="mt-1 text-xs text-slate-400">ឯកសារកម្រិតបន្ទាន់ និងបន្ទាន់បំផុត</p>
              </div>
              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-3 text-rose-600 shadow-sm">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  ទំហំផ្ទុកសរុប
                </p>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {stats.storage}
                </h3>
                <p className="mt-1 text-xs text-slate-400">គិតជាទំហំឯកសារ PDF / រូបភាព</p>
              </div>
              <div className="rounded-2xl bg-cyan-50 border border-cyan-100 p-3 text-cyan-600 shadow-sm">
                <FileCheck2 className="h-6 w-6" />
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
                <h3 className="text-lg font-bold text-slate-900">
                  ផ្ទាំងគ្រប់គ្រងឯកសារ (Document Management)
                </h3>
                <p className="text-xs text-muted-foreground">
                  ស្វែងរក ចុះបញ្ជី និងតាមដានរាល់ឯកសារចេញ-ចូលផ្លូវការទាំងអស់
                </p>
              </div>
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
            </div>

            {/* Filtering Controls */}
            <div className="flex flex-col md:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white"
                  placeholder="ស្វែងរកតាមលេខ លេខលិខិត កម្មវត្ថុ..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={directionFilter} onValueChange={setDirectionFilter}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="ទិសដៅទាំងអស់" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ទិសដៅទាំងអស់</SelectItem>
                    <SelectItem value="INCOMING">ឯកសារចូល</SelectItem>
                    <SelectItem value="OUTGOING">ឯកសារចេញ</SelectItem>
                    <SelectItem value="INTERNAL">ឯកសារផ្ទៃក្នុង</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px] bg-white">
                    <SelectValue placeholder="ប្រភេទលិខិត" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ប្រភេទ</SelectItem>
                    {INITIAL_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name.split(' ')[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={confidentialityFilter} onValueChange={setConfidentialityFilter}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="ភាពសម្ងាត់" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ភាពសម្ងាត់ទាំងអស់</SelectItem>
                    <SelectItem value="NORMAL">កម្រិតធម្មតា</SelectItem>
                    <SelectItem value="CONFIDENTIAL">កម្រិតសម្ងាត់</SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery ||
                  directionFilter !== 'all' ||
                  typeFilter !== 'all' ||
                  confidentialityFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    className="text-indigo-600 hover:text-indigo-750 hover:bg-indigo-50"
                    onClick={() => {
                      setSearchQuery('');
                      setDirectionFilter('all');
                      setTypeFilter('all');
                      setConfidentialityFilter('all');
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
              <TableHeader className="bg-slate-50/70">
                <TableRow>
                  <TableHead className="w-[130px] font-bold">លេខឯកសារ</TableHead>
                  <TableHead className="font-bold">កម្មវត្ថុឯកសារ</TableHead>
                  <TableHead className="w-[120px] font-bold">ប្រភេទ</TableHead>
                  <TableHead className="w-[120px] font-bold">ប្រភព/ទិសដៅ</TableHead>
                  <TableHead className="w-[110px] font-bold text-center">ស្ថានភាព</TableHead>
                  <TableHead className="w-[110px] font-bold text-right">កាលបរិច្ឆេទ</TableHead>
                  <TableHead className="w-[110px] text-center font-bold">សកម្មភាព</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                      <FolderOpen className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                      មិនមានឯកសារស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocs.map((doc) => (
                    <TableRow
                      key={doc.id}
                      onClick={() => {
                        router.push(`/dashboard/document-management/${doc.id}`);
                      }}
                      className="cursor-pointer transition-colors hover:bg-slate-50/60"
                    >
                      <TableCell className="font-semibold text-slate-700">
                        {doc.documentNumber}
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <div className="font-medium text-slate-900 truncate" title={doc.subject}>
                          {doc.subject}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{doc.summary}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-white text-xs border-slate-200">
                          {doc.documentType.name.split(' ')[0]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium">
                          {doc.direction === 'INCOMING' && (
                            <span className="text-emerald-600">
                              📥 ពី: {doc.senderOrganization?.shortName}
                            </span>
                          )}
                          {doc.direction === 'OUTGOING' && (
                            <span className="text-blue-600">
                              📤 ទៅ: {doc.receiverOrganization?.shortName}
                            </span>
                          )}
                          {doc.direction === 'INTERNAL' && (
                            <span className="text-purple-600">💻 ផ្ទៃក្នុង</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            doc.status === 'RECEIVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.status === 'SENT'
                                ? 'bg-blue-100 text-blue-800'
                                : doc.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {doc.status === 'RECEIVED'
                            ? 'បានទទួល'
                            : doc.status === 'SENT'
                              ? 'បានផ្ញើ'
                              : doc.status === 'PENDING'
                                ? 'រង់ចាំ'
                                : 'សេចក្តីព្រាង'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-slate-600 text-xs font-mono">
                        {doc.documentDate}
                      </TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-0.5">
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
        </Card>
      </div>
    </div>
  );
}
