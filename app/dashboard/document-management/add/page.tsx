'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileCheck2, UploadCloud, X, Plus } from 'lucide-react';
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
  INITIAL_TAGS,
  DocumentItem,
  DocumentFile,
} from '../document-store';

export default function AddDocumentPage() {
  const router = useRouter();

  // Form states
  const [formDirection, setFormDirection] = useState<'INCOMING' | 'OUTGOING' | 'INTERNAL'>(
    'INCOMING',
  );
  const [formType, setFormType] = useState('1');
  const [formSender, setFormSender] = useState('1');
  const [formReceiver, setFormReceiver] = useState('3');
  const [formNumber, setFormNumber] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formConfidentiality, setFormConfidentiality] = useState<'NORMAL' | 'CONFIDENTIAL'>(
    'NORMAL',
  );
  const [formPriority, setFormPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');
  const [formRemarks, setFormRemarks] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string }>>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      }));
      setUploadedFiles((prev) => [...prev, ...filesArr]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber || !formSubject || !formDate) {
      alert('សូមបំពេញលេខឯកសារ កម្មវត្ថុ និងកាលបរិច្ឆេទឱ្យបានត្រឹមត្រូវ!');
      return;
    }

    const docType = INITIAL_TYPES.find((t) => t.id.toString() === formType) || INITIAL_TYPES[0];
    const sender = INITIAL_ORGS.find((o) => o.id.toString() === formSender) || INITIAL_ORGS[0];
    const receiver = INITIAL_ORGS.find((o) => o.id.toString() === formReceiver) || INITIAL_ORGS[2];

    const mappedFiles: DocumentFile[] = uploadedFiles.map((f, i) => ({
      id: Date.now() + i,
      fileName: f.name,
      filePath: `/documents/2026/07/${f.name}`,
      mimeType: f.name.endsWith('.pdf') ? 'application/pdf' : 'image/png',
      fileSize: f.size,
      isPrimary: i === 0,
      uploadedBy: 'ឆៃ វណ្ណ',
    }));

    const newDoc: DocumentItem = {
      id: Date.now(),
      uuid:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'mock-uuid-' + Date.now(),
      direction: formDirection,
      documentType: docType,
      senderOrganization: formDirection === 'INTERNAL' ? undefined : sender,
      receiverOrganization: formDirection === 'INTERNAL' ? undefined : receiver,
      documentNumber: formNumber,
      documentDate: formDate,
      subject: formSubject,
      summary: formSummary,
      confidentiality: formConfidentiality,
      priority: formPriority,
      status: formDirection === 'OUTGOING' ? 'PENDING' : 'RECEIVED',
      remarks: formRemarks,
      createdBy: 'ឆៃ វណ្ណ',
      createdAt: new Date().toISOString(),
      tags: formConfidentiality === 'CONFIDENTIAL' ? [INITIAL_TAGS[1]] : [INITIAL_TAGS[4]],
      files: mappedFiles,
      logs: [
        {
          id: Date.now() + 50,
          officerName: 'ឆៃ វណ្ណ',
          action: 'CREATE',
          description: 'បានចុះបញ្ជី និងផ្ទុកឡើងឯកសារថ្មី',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
      ],
    };

    const currentList = getStoredDocuments();
    saveStoredDocuments([newDoc, ...currentList]);

    router.push('/dashboard/document-management');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Panel */}
      <div className="flex items-center gap-3 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
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
            គ្រប់គ្រងឯកសារ • REGISTER ROUTE
          </span>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            ចុះបញ្ជីឯកសារផ្លូវការថ្មី (Register Document)
          </h1>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Direction selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">ទិសដៅឯកសារ *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['INCOMING', 'OUTGOING', 'INTERNAL'] as const).map((dir) => (
                  <div
                    key={dir}
                    onClick={() => setFormDirection(dir)}
                    className={`cursor-pointer p-4 rounded-xl border text-center text-xs font-bold transition-all ${
                      formDirection === dir
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {dir === 'INCOMING'
                      ? '📥 ឯកសារចូល'
                      : dir === 'OUTGOING'
                        ? '📤 ឯកសារចេញ'
                        : '💻 ឯកសារផ្ទៃក្នុង'}
                  </div>
                ))}
              </div>
            </div>

            {/* Number and Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">លេខឯកសារ / លេខលិខិត *</label>
                <Input
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  placeholder="ឧ. MoI-2026-1049"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-slate-600">ប្រភេទលិខិត *</label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="w-full bg-white border-slate-200">
                    <SelectValue placeholder="ជ្រើសរើសប្រភេទ" />
                  </SelectTrigger>
                  <SelectContent>
                    {INITIAL_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name.split(' ')[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formDirection !== 'INTERNAL' && (
                <>
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-bold text-slate-600">ស្ថាប័នបញ្ជូន (ពី) *</label>
                    <Select value={formSender} onValueChange={setFormSender}>
                      <SelectTrigger className="w-full bg-white border-slate-200">
                        <SelectValue placeholder="ស្ថាប័នបញ្ជូន" />
                      </SelectTrigger>
                      <SelectContent>
                        {INITIAL_ORGS.map((o) => (
                          <SelectItem key={o.id} value={o.id.toString()}>
                            {o.shortName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-xs font-bold text-slate-600">ស្ថាប័នទទួល (ទៅ) *</label>
                    <Select value={formReceiver} onValueChange={setFormReceiver}>
                      <SelectTrigger className="w-full bg-white border-slate-200">
                        <SelectValue placeholder="ស្ថាប័នទទួល" />
                      </SelectTrigger>
                      <SelectContent>
                        {INITIAL_ORGS.map((o) => (
                          <SelectItem key={o.id} value={o.id.toString()}>
                            {o.shortName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">កម្មវត្ថុឯកសារ *</label>
              <Input
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                placeholder="កម្មវត្ថុនៃលិខិត..."
                required
              />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">សេចក្តីសង្ខេប (Summary)</label>
              <textarea
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                placeholder="សង្ខេបមាតិកាសំខាន់ៗនៃលិខិត..."
              />
            </div>

            {/* Priority and Confidentiality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">កម្រិតអាទិភាព *</label>
                <Select value={formPriority} onValueChange={(val: any) => setFormPriority(val)}>
                  <SelectTrigger className="w-full bg-white border-slate-200">
                    <SelectValue placeholder="ជ្រើសរើសអាទិភាព" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">ធម្មតា (Normal)</SelectItem>
                    <SelectItem value="HIGH">ខ្ពស់ (High)</SelectItem>
                    <SelectItem value="CRITICAL">បន្ទាន់បំផុត (Critical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">កម្រិតភាពសម្ងាត់ *</label>
                <Select
                  value={formConfidentiality}
                  onValueChange={(val: any) => setFormConfidentiality(val)}
                >
                  <SelectTrigger className="w-full bg-white border-slate-200">
                    <SelectValue placeholder="ជ្រើសរើសភាពសម្ងាត់" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">ធម្មតា (Normal)</SelectItem>
                    <SelectItem value="CONFIDENTIAL">សម្ងាត់ (Confidential)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <Input
                value={formRemarks}
                onChange={(e) => setFormRemarks(e.target.value)}
                placeholder="ព័ត៌មានបន្ថែម..."
              />
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end gap-2 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/document-management')}
              >
                បោះបង់
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
              >
                រក្សាទុកឯកសារ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
