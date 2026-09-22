'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderOpen,
  Search,
  X,
  Clock,
  CheckCircle2,
  FileText,
  Building2,
  Calendar,
  Paperclip,
  ShieldAlert,
  Tag,
  ExternalLink,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DocumentItem } from '@/app/dashboard/document-management/document-store';

interface DocumentStatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: DocumentItem[];
  initialStatusFilter?: string;
  onViewDocument?: (document: DocumentItem) => void;
}

export function DocumentStatDialog({
  open,
  onOpenChange,
  documents = [],
  initialStatusFilter = 'all',
  onViewDocument,
}: DocumentStatDialogProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);

  useEffect(() => {
    if (open) {
      setStatusFilter(initialStatusFilter || 'all');
      setSearch('');
    }
  }, [open, initialStatusFilter]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearch('');
      setStatusFilter(initialStatusFilter || 'all');
    }
    onOpenChange(isOpen);
  };

  const total = documents.length;
  const pendingCount = useMemo(
    () => documents.filter((d) => d.status === 'PENDING').length,
    [documents],
  );
  const loggedCount = useMemo(
    () => documents.filter((d) => d.status === 'LOGGED').length,
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((doc) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'PENDING' && doc.status === 'PENDING') ||
        (statusFilter === 'LOGGED' && doc.status === 'LOGGED');

      if (!matchesStatus) return false;
      if (!query) return true;

      const searchableText = [
        doc.documentNumber,
        doc.subject,
        doc.summary,
        doc.documentType?.name,
        doc.documentType?.code,
        doc.senderOrganization?.name,
        doc.senderOrganization?.shortName,
        doc.receiverOrganization?.name,
        doc.receiverOrganization?.shortName,
        ...(doc.tags || []).map((t) => t.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [documents, search, statusFilter]);

  const getDirectionBadge = (direction: string) => {
    switch (direction) {
      case 'INCOMING':
        return (
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-100 whitespace-nowrap">
            ឯកសារចូល
          </span>
        );
      case 'OUTGOING':
        return (
          <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 border border-purple-100 whitespace-nowrap">
            ឯកសារចេញ
          </span>
        );
      case 'INTERNAL':
        return (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200 whitespace-nowrap">
            ផ្ទៃក្នុង
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-5xl md:max-w-6xl lg:max-w-7xl p-0 gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80">
                <FolderOpen className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold text-slate-900 font-khmer-moul-light">
                    បញ្ជីឯកសាររដ្ឋបាល
                  </DialogTitle>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {filteredDocuments.length} ឯកសារ
                  </span>
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  {`${pendingCount} កំពុងពិនិត្យ · ${loggedCount} បានចុះបញ្ជី`}
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
                router.push('/dashboard/document-management/add');
              }}
            >
              <span>បន្ថែមឯកសារថ្មី</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ទាំងអស់ ({total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDING')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                កំពុងពិនិត្យ ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('LOGGED')}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === 'LOGGED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                បានចុះបញ្ជី ({loggedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="ស្វែងរកលេខកូដ កម្មវត្ថុ..."
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
          <div className="divide-y divide-slate-100 p-2 sm:p-4">
            {filteredDocuments.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 font-medium">
                មិនមានទិន្នន័យឯកសារត្រូវនឹងការស្វែងរកទេ
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const isPending = doc.status === 'PENDING';
                const isLogged = doc.status === 'LOGGED';
                const isConfidential = doc.confidentiality === 'CONFIDENTIAL';
                const isHighPriority = doc.priority === 'HIGH' || doc.priority === 'CRITICAL';
                const org = doc.senderOrganization || doc.receiverOrganization;

                return (
                  <div
                    key={doc.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 line-clamp-1">
                          {doc.subject}
                        </span>
                        {doc.documentNumber && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 whitespace-nowrap">
                            {doc.documentNumber}
                          </span>
                        )}
                        {getDirectionBadge(doc.direction)}
                        {doc.documentType?.name && (
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-100">
                            {doc.documentType.name}
                          </span>
                        )}
                        {isConfidential && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 border border-rose-100">
                            <ShieldAlert className="h-3 w-3" />
                            សម្ងាត់
                          </span>
                        )}
                        {isHighPriority && (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-100">
                            {doc.priority === 'CRITICAL' ? 'បន្ទាន់បំផុត' : 'បន្ទាន់'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3.5 text-xs text-slate-500 flex-wrap">
                        {org?.name && (
                          <div className="flex items-center gap-1 font-medium text-slate-600">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>{org.name}</span>
                          </div>
                        )}

                        {doc.documentDate && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{doc.documentDate}</span>
                          </div>
                        )}

                        {doc.files && doc.files.length > 0 && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                            <span>{doc.files.length} ឯកសារភ្ជាប់</span>
                          </div>
                        )}
                      </div>

                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <Tag className="h-3 w-3 text-slate-400" />
                          {doc.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-0 sm:pl-3">
                      {isLogged ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          បានចុះបញ្ជី
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          កំពុងពិនិត្យ
                        </span>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {doc.status}
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-2 rounded-lg"
                        onClick={() => {
                          onOpenChange(false);
                          if (onViewDocument) {
                            onViewDocument(doc);
                          } else {
                            router.push(`/dashboard/document-management/${doc.id}`);
                          }
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
