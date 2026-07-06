'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  FileText,
  Download,
  Tag,
  History,
  X,
  UploadCloud,
  FileCheck2,
  Trash2,
  Calendar,
  Building2,
  Clock,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '../document-store';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Document local state
  const [doc, setDoc] = useState<DocumentItem | null>(null);

  // Load document from localStorage
  useEffect(() => {
    const list = getStoredDocuments();
    const found = list.find((d) => d.id.toString() === id || d.uuid === id);
    if (found) {
      setDoc(found);
    }
  }, [id]);

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-4 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto mt-10">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
        <h2 className="text-xl font-bold text-slate-800">រកមិនឃើញឯកសារ</h2>
        <p className="text-sm text-slate-400">
          សូមពិនិត្យមើលលេខសម្គាល់លិខិតម្តងទៀត ឬត្រឡប់ទៅទំព័រដើមវិញ
        </p>
        <Button
          variant="outline"
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={() => router.push('/dashboard/document-management')}
        >
          ត្រឡប់ទៅកាន់បញ្ជីឯកសារ
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 text-slate-600 border-slate-200 hover:bg-slate-50"
            onClick={() => router.push('/dashboard/document-management')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <span className="text-2xs text-slate-400 block font-semibold uppercase tracking-wider">
              ព័ត៌មានលម្អិតឯកសារ • DETAIL VIEW
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">{doc.subject}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push(`/dashboard/document-management/${doc.id}/edit`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
          >
            <Pencil className="mr-2 h-4 w-4" />
            កែប្រែព័ត៌មាន
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Core Details */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardHeader className="border-b bg-slate-50/50 p-5">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-600" />
                ព័ត៌មានទូទៅនៃលិខិត
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Summary Description */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  សេចក្តីសង្ខេប (Summary)
                </span>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {doc.summary || 'មិនមានសេចក្តីសង្ខេបឡើយ'}
                </p>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 block">ទិសដៅលិខិត</span>
                  <span className="font-semibold text-slate-900">
                    {doc.direction === 'INCOMING'
                      ? '📥 ឯកសារចូល'
                      : doc.direction === 'OUTGOING'
                        ? '📤 ឯកសារចេញ'
                        : '💻 ឯកសារផ្ទៃក្នុង'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 block">ប្រភេទឯកសារ</span>
                  <span className="font-semibold text-slate-900">
                    {doc.documentType.name.split(' ')[0]}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 block">លេខឯកសារ / លេខលិខិត</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {doc.documentNumber}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 block">កម្រិតអាទិភាព</span>
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-xs px-2.5 py-0.5 border ${
                        doc.priority === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : doc.priority === 'HIGH'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {doc.priority === 'CRITICAL'
                        ? 'បន្ទាន់បំផុត'
                        : doc.priority === 'HIGH'
                          ? 'បន្ទាន់'
                          : 'ធម្មតា'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 block">ភាពសម្ងាត់</span>
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-xs px-2.5 py-0.5 border ${
                        doc.confidentiality === 'CONFIDENTIAL'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {doc.confidentiality === 'CONFIDENTIAL' ? 'សម្ងាត់' : 'ធម្មតា'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 block">កាលបរិច្ឆេទលិខិត</span>
                  <span className="font-semibold text-slate-900 font-mono">{doc.documentDate}</span>
                </div>
                {doc.senderOrganization && (
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <span className="text-xs text-slate-500 block">ស្ថាប័នបញ្ជូន (ពី)</span>
                    <span className="font-semibold text-slate-900">
                      {doc.senderOrganization.name} ({doc.senderOrganization.shortName})
                    </span>
                  </div>
                )}
                {doc.receiverOrganization && (
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <span className="text-xs text-slate-500 block">ស្ថាប័នទទួល (ទៅ)</span>
                    <span className="font-semibold text-slate-900">
                      {doc.receiverOrganization.name} ({doc.receiverOrganization.shortName})
                    </span>
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                  <Tag className="h-3.5 w-3.5 text-slate-400" /> ស្លាកសម្គាល់ (Tags)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((t) => (
                    <Badge
                      key={t.id}
                      variant="outline"
                      className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs py-0.5 px-2"
                    >
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Attached Files */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardHeader className="border-b bg-slate-50/50 p-5">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Download className="h-4.5 w-4.5 text-indigo-600" />
                ឯកសារភ្ជាប់ និងទាញយក
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {doc.files.length === 0 ? (
                <div className="text-sm text-slate-400 bg-slate-50 p-8 rounded-2xl text-center border border-dashed border-slate-200">
                  មិនមានឯកសារភ្ជាប់ជាមួយលិខិតនេះឡើយ
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {doc.files.map((file) => (
                    <div
                      key={file.id}
                      className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs transition-all hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="bg-rose-50 p-2.5 rounded-lg text-rose-600 border border-rose-100">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="truncate">
                          <p className="font-medium text-slate-800 truncate" title={file.fileName}>
                            {file.fileName}
                          </p>
                          <p className="text-2xs text-slate-400 mt-1">
                            {file.fileSize} • Upload by: {file.uploadedBy}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-400 hover:text-slate-800 hover:bg-slate-200"
                      >
                        <Download className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Span 1) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card 3: Activity Log & Remarks */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardHeader className="border-b bg-slate-50/50 p-5">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-indigo-600" />
                ប្រវត្តិសកម្មភាព
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Activity Timeline */}
              <div className="relative border-l border-slate-200 pl-4 space-y-5 text-xs ml-2">
                {doc.logs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-600 border border-white ring-4 ring-indigo-50" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{log.officerName}</span>
                        <span className="text-2xs text-slate-400 font-mono">{log.createdAt}</span>
                      </div>
                      <p className="text-slate-600">{log.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Remarks */}
              {doc.remarks && (
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 text-xs mt-4">
                  <span className="text-amber-800 font-bold block mb-1">កំណត់សម្គាល់បន្ថែម:</span>
                  <p className="text-slate-700 leading-normal">{doc.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4: System Audit Trail */}
          <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
            <CardHeader className="border-b bg-slate-50/50 p-5">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-indigo-600" />
                ប្រព័ន្ធត្រួតពិនិត្យ (System Audit)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs space-y-3 text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">លេខកូដសម្គាល់ (UUID)</span>
                <span
                  className="font-mono text-indigo-700 font-semibold truncate max-w-[180px]"
                  title={doc.uuid}
                >
                  {doc.uuid}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">បង្កើតដោយ</span>
                <span className="font-medium text-slate-800">{doc.createdBy}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ថ្ងៃខែឆ្នាំបង្កើត</span>
                <span className="font-medium text-slate-800 font-mono">
                  {doc.createdAt.replace('T', ' ').substring(0, 16)}
                </span>
              </div>
              {doc.updatedBy && (
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">កែប្រែចុងក្រោយដោយ</span>
                  <span className="font-medium text-slate-800">{doc.updatedBy}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
