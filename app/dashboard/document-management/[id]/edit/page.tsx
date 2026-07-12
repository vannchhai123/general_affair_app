'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileCheck2, UploadCloud, X, AlertTriangle } from 'lucide-react';
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
  getStoredDocuments,
  saveStoredDocuments,
  INITIAL_TYPES,
  INITIAL_ORGS,
  DocumentItem,
  DocumentFile,
  Organization,
  DocumentType as AppDocumentType,
} from '../../document-store';
import { apiFetch } from '@/lib/client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditDocumentPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Document state
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formDirection, setFormDirection] = useState<'INCOMING' | 'OUTGOING' | 'INTERNAL'>(
    'INCOMING',
  );
  const [formType, setFormType] = useState('1');
  const [formSender, setFormSender] = useState('1');
  const [formReceiver, setFormReceiver] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formSubject, setFormSubject] = useState('');

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
  const [formConfidentiality, setFormConfidentiality] = useState<'NORMAL' | 'CONFIDENTIAL'>(
    'NORMAL',
  );
  const [formPriority, setFormPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');
  const [formRemarks, setFormRemarks] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id?: number; name: string; size: string; url?: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load document
  useEffect(() => {
    const fetchDocDetails = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/documents/${id}`);
        if (response.ok) {
          const data = await response.json();
          const mappedDoc: DocumentItem = {
            id: data.id,
            uuid: data.uuid || '',
            documentNumber: data.documentNumber || '',
            direction: data.direction || 'OUTGOING',
            documentType: data.documentType
              ? {
                  id: data.documentType.id,
                  name: data.documentType.name,
                  code: data.documentType.code || '',
                }
              : { id: 0, name: '', code: '' },
            documentDate: data.documentDate || '',
            receivedDate: data.receivedDate || '',
            subject: data.subject || '',
            summary: data.summary || '',
            senderOrganization: data.senderOrganization
              ? {
                  id: data.senderOrganization.id,
                  name: data.senderOrganization.name,
                  shortName: data.senderOrganization.shortName,
                }
              : undefined,
            receiverOrganization: data.receiverOrganization
              ? {
                  id: data.receiverOrganization.id,
                  name: data.receiverOrganization.name,
                  shortName: data.receiverOrganization.shortName,
                }
              : undefined,
            confidentiality: data.confidentiality || 'NORMAL',
            priority: data.priority || 'NORMAL',
            status: data.status || 'DRAFT',
            tags: data.tags || [],
            files: (data.files || []).map((file: any) => ({
              id: file.id,
              fileName: file.fileName,
              filePath: file.fileUrl || '',
              mimeType: file.mimeType,
              fileSize: file.fileSize,
              isPrimary: file.isPrimary,
              uploadedBy: file.uploadedBy
                ? `${file.uploadedBy.firstName} ${file.uploadedBy.lastName}`
                : '',
            })),
            logs: data.logs || [],
            createdBy: data.createdBy
              ? `${data.createdBy.firstName} ${data.createdBy.lastName}`
              : '',
            createdAt: data.createdAt || '',
          };
          setDoc(mappedDoc);

          // Prefill fields
          setFormDirection(mappedDoc.direction);
          setFormType(mappedDoc.documentType.id.toString());
          setFormSender(mappedDoc.senderOrganization?.id.toString() || '1');
          setFormReceiver(mappedDoc.receiverOrganization?.name || '');
          setFormNumber(mappedDoc.documentNumber);
          setFormDate(mappedDoc.documentDate);
          setFormSubject(mappedDoc.subject);
          setFormConfidentiality(mappedDoc.confidentiality);
          setFormPriority(mappedDoc.priority);
          setFormRemarks(mappedDoc.remarks || '');
          setUploadedFiles(
            mappedDoc.files.map((f) => ({
              id: f.id,
              name: f.fileName,
              size: f.fileSize,
              url: f.filePath,
            })),
          );
        }
      } catch (err) {
        console.error('Failed to load document details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocDetails();
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const files = Array.from(e.target.files);
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          const response = await apiFetch('/files/upload', {
            method: 'POST',
            body: formData,
          });
          if (response.ok) {
            const data = await response.json();
            setUploadedFiles((prev) => [
              ...prev,
              {
                id: data.id,
                name: data.fileName,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                url: data.url,
              },
            ]);
          } else {
            alert('ផ្ទុកឡើងឯកសារបរាជ័យ៖ ' + file.name);
          }
        }
      } catch (err) {
        console.error(err);
        alert('មានកំហុសក្នុងការផ្ទុកឡើងឯកសារ');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc) return;

    if (!formNumber || !formSubject || !formDate) {
      alert('សូមបំពេញលេខឯកសារ កម្មវត្ថុ និងកាលបរិច្ឆេទឱ្យបានត្រឹមត្រូវ!');
      return;
    }

    if (!formType) {
      alert('សូមជ្រើសរើសប្រភេទលិខិត!');
      return;
    }

    setIsSubmitting(true);
    try {
      const fileIds = uploadedFiles.map((f) => f.id).filter((id): id is number => id !== undefined);

      const payload = {
        direction: formDirection,
        documentTypeId: parseInt(formType, 10),
        receiverOrganizationName: formReceiver,
        documentNumber: formNumber,
        documentDate: formDate,
        subject: formSubject,
        summary: formSubject,
        status: doc.status || 'DRAFT',
        remarks: formRemarks,
        fileIds: fileIds,
      };

      const response = await apiFetch(`/documents/${doc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'ធ្វើបច្ចុប្បន្នភាពឯកសារបរាជ័យ');
      }

      router.push(`/dashboard/document-management/${doc.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'មានកំហុសក្នុងការធ្វើបច្ចុប្បន្នភាពឯកសារ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">កំពុងអានព័ត៌មានឯកសារ...</div>;
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto mt-10">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-800">រកមិនឃើញឯកសារសម្រាប់កែប្រែ</h2>
        <p className="text-xs text-slate-400">សូមពិនិត្យមើលម្តងទៀត ឬត្រឡប់ទៅបញ្ជីឯកសារវិញ</p>
        <Button
          variant="outline"
          className="border-slate-200"
          onClick={() => router.push('/dashboard/document-management')}
        >
          ត្រឡប់ទៅកាន់បញ្ជីឯកសារ
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Panel */}
      <div className="flex items-center gap-3 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 text-slate-600 border-slate-200 hover:bg-slate-50"
          onClick={() => router.push(`/dashboard/document-management/${doc.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="page-title text-lg font-bold text-slate-900 mt-0.5">កែប្រែព័ត៌មានឯកសារ</h1>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Direction selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">ទិសដៅឯកសារ *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['INCOMING', 'OUTGOING', 'INTERNAL'] as const).map((dir) => {
                  const isOutgoing = dir === 'OUTGOING';
                  return (
                    <div
                      key={dir}
                      onClick={() => {
                        if (isOutgoing) {
                          setFormDirection(dir);
                        }
                      }}
                      className={`p-4 rounded-xl border text-center text-xs font-bold transition-all ${
                        isOutgoing
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm cursor-default'
                          : 'border-slate-100 bg-slate-50/30 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {dir === 'INCOMING' ? (
                        <div className="flex flex-col items-center">
                          <span>📥 ឯកសារចូល</span>
                          <span className="text-[10px] font-normal text-slate-400 mt-1">
                            (ក្រៅវិសាលភាព)
                          </span>
                        </div>
                      ) : dir === 'OUTGOING' ? (
                        <div className="flex flex-col items-center">
                          <span>📤 ឯកសារចេញ</span>
                          <span className="text-[10px] font-semibold text-indigo-500 mt-1">
                            (វិសាលភាពបច្ចុប្បន្ន)
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span>💻 ឯកសារផ្ទៃក្នុង</span>
                          <span className="text-[10px] font-normal text-slate-400 mt-1">
                            (ក្រៅវិសាលភាព)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Number and Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">លេខឯកសារ / លេខលិខិត *</label>
                <Input
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  placeholder="MoI-2026-1049"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">កាលបរិច្ឆេទលិខិត *</label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Type and organizations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-slate-600">ប្រភេទលិខិត *</label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="w-full bg-white border-slate-200">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name.split(' ')[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formDirection !== 'INTERNAL' && (
                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-slate-600">ស្ថាប័នទទួល (ទៅ) *</label>
                  <Input
                    value={formReceiver}
                    onChange={(e) => setFormReceiver(e.target.value)}
                    placeholder="ឈ្មោះស្ថាប័ន..."
                    className="bg-white border-slate-200"
                    required
                  />
                </div>
              )}
            </div>

            {/* Subject / Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">
                កម្មវត្ថុឯកសារ / សេចក្តីសង្ខេប *
              </label>
              <textarea
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                placeholder=""
                required
              />
            </div>

            {/* File Upload Zone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">
                ផ្ទុកឡើងឯកសារលិខិត (PDF / IMAGES)
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  ចុចទីនេះ ឬអូសទាញឯកសារដើម្បីផ្ទុកឡើង
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  គាំទ្រត្រឹម PDF, PNG, JPG (ទំហំអតិបរមា 10MB)
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-2xs font-bold text-slate-500">
                    ឯកសារត្រូវបានជ្រើសរើស ({uploadedFiles.length})
                  </p>
                  <div className="space-y-1">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between text-xs border border-slate-100"
                      >
                        <span className="font-medium text-slate-700 truncate max-w-[80%]">
                          {file.name} ({file.size})
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                          onClick={() =>
                            setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">កំណត់សម្គាល់ផ្សេងៗ</label>
              <Input value={formRemarks} onChange={(e) => setFormRemarks(e.target.value)} />
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end gap-2 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/document-management/${doc.id}`)}
              >
                បោះបង់
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
              >
                {isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកែប្រែ'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
