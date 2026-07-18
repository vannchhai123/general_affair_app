'use client';

import { use, ElementType } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  BriefcaseBusiness,
  Calendar,
  Hash,
  IdCard,
  Mail,
  Phone,
  UserRound,
  Users,
  ArrowLeft,
  Edit,
  Camera,
  Layers,
  GraduationCap,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RequireAccess } from '@/components/auth/require-access';
import { useOfficer } from '@/hooks/officers/use-officer';
import { useUploadOfficerImage } from '@/hooks/officers/use-officer-mutations';
import { normalizeOfficerStatus } from '@/lib/officers/page-utils';
import type { Officer } from '@/lib/schemas';
import { useAuth } from '@/components/auth/auth-provider';

interface PageProps {
  params: Promise<{ id: string }>;
}

function getStatusLabel(status: string) {
  switch (normalizeOfficerStatus(status)) {
    case 'active':
      return 'សកម្ម';
    case 'on_leave':
      return 'ច្បាប់ឈប់សម្រាក';
    case 'inactive':
      return 'មិនសកម្ម';
    default:
      return status || '-';
  }
}

function getStatusStyle(status: string) {
  switch (normalizeOfficerStatus(status)) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
    case 'on_leave':
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
    case 'inactive':
      return 'bg-slate-200 text-slate-700 hover:bg-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
  }
}

function getSexLabel(sex?: string | null) {
  if (!sex) return '-';
  const s = sex.toLowerCase();
  if (s === 'male' || s === 'm') return 'ប្រុស';
  if (s === 'female' || s === 'f') return 'ស្រី';
  return sex;
}

function getContractTypeLabel(type?: string | null) {
  switch (type) {
    case 'FULL_TIME':
      return 'មន្រ្តីក្របខណ្ធ';
    case 'CONTRACT':
      return 'មន្រ្តីកិច្ចសន្យា';
    default:
      return type || '-';
  }
}

function getEducationLevelLabel(level?: string | null) {
  if (!level) return '-';

  const normalized = level.trim().toLowerCase();
  switch (normalized) {
    case 'associate':
      return 'បរិញ្ញាបត្ររង (Associate)';
    case 'bachelor':
      return 'បរិញ្ញាបត្រ (Bachelor)';
    case 'master':
      return 'បរិញ្ញាបត្រជាន់ខ្ពស់ (Master)';
    case 'phd':
    case 'doctor':
      return 'បណ្ឌិត (PhD)';
    default:
      return level;
  }
}

function getOfficerImageUrl(officer: Officer) {
  return (
    officer.image_url ||
    officer.imageUrl ||
    officer.avatar_url ||
    officer.profileImage ||
    officer.profile_image ||
    officer.photoUrl ||
    officer.photo_url ||
    undefined
  );
}

function getOfficerInitials(officer: Officer) {
  const initials = [officer.first_name, officer.last_name]
    .filter(Boolean)
    .map((name) => name[0])
    .join('');

  return initials || 'ម';
}

function DetailItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: ElementType;
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Icon className="h-4 w-4 text-slate-400" />
        <span>{label}</span>
      </div>
      <span className="mt-2 block break-words text-sm font-medium text-slate-900">
        {value || '-'}
      </span>
    </div>
  );
}

export default function OfficerDetailPage({ params }: PageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const id = Number(resolvedParams.id);

  const { data: officer, isLoading, isError, refetch } = useOfficer(id);
  const uploadImage = useUploadOfficerImage();
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission('OFFICER_UPDATE');

  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('សូមជ្រើសរើសរូបភាពប្រភេទ JPG, PNG ឬ WEBP');
      return;
    }

    try {
      await uploadImage.mutateAsync({ id, file });
      queryClient.invalidateQueries({ queryKey: ['officers'] });
      refetch();
    } catch {
      // toast handled in hook
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm text-muted-foreground">
        កំពុងផ្ទុកព័ត៌មានលម្អិតរបស់មន្ត្រី...
      </div>
    );
  }

  if (isError || !officer) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-sm text-destructive font-medium">
          មានបញ្ហាក្នុងការទាញយកទិន្នន័យមន្ត្រី។
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            ព្យាយាមឡើងវិញ
          </Button>
          <Button onClick={() => router.push('/dashboard/officers')}>ត្រឡប់</Button>
        </div>
      </div>
    );
  }

  const fullName =
    `${officer.first_name_en || officer.first_name || ''} ${officer.last_name_en || officer.last_name || ''}`.trim();
  const fullNameKh = `${officer.first_name_kh || ''} ${officer.last_name_kh || ''}`.trim();
  const imageUrl = getOfficerImageUrl(officer);

  return (
    <RequireAccess permission="OFFICER_READ">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200"
              onClick={() => router.push('/dashboard/officers')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="page-title text-xl font-bold tracking-tight text-slate-900">
                ព័ត៌មានលម្អិតមន្រ្តី
              </h1>
            </div>
          </div>
          {canUpdate && (
            <Button
              onClick={() => {
                router.push(`/dashboard/officers/${id}/edit`);
              }}
              className="gap-2 rounded-xl"
            >
              <Edit className="h-4 w-4" />
              <span>កែប្រែព័ត៌មាន</span>
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Profiler Card */}
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center h-fit">
            <div className="relative group">
              <Avatar className="h-28 w-28 rounded-3xl border border-slate-100 bg-slate-50 shadow-sm overflow-hidden">
                <AvatarImage src={imageUrl} alt={fullName} className="object-cover" />
                <AvatarFallback className="rounded-3xl bg-slate-100 text-3xl font-semibold text-slate-600">
                  {getOfficerInitials(officer)}
                </AvatarFallback>
              </Avatar>
              {canUpdate && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                >
                  <Camera className="h-6 w-6" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadImage.isPending}
                  />
                </label>
              )}
            </div>

            <div className="mt-4 w-full">
              <h3 className="text-base font-bold text-slate-900 break-words">
                {fullNameKh || fullName}
              </h3>
              {fullNameKh && fullName && (
                <p className="text-xs text-muted-foreground mt-0.5 break-words font-medium">
                  {fullName}
                </p>
              )}
              <p className="mt-2 text-xs font-semibold text-indigo-600 bg-indigo-50/50 rounded-lg py-1 px-2.5 inline-block max-w-full truncate">
                {officer.position || 'មិនទាន់កំណត់តំណែង'}
              </p>

              <div className="mt-6 pt-6 border-t border-slate-100 w-full flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold">ស្ថានភាព</span>
                  <Badge
                    className={`rounded-lg py-0.5 px-2 text-[10px] font-bold ${getStatusStyle(officer.status)}`}
                  >
                    {getStatusLabel(officer.status)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold">គណនី (Username)</span>
                  <span
                    className="font-semibold text-slate-900 max-w-[140px] truncate"
                    title={officer.username || '-'}
                  >
                    {officer.username || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold">ការិយាល័យ</span>
                  <span
                    className="font-semibold text-slate-700 max-w-[140px] truncate"
                    title={officer.office || '-'}
                  >
                    {officer.office || '-'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Details Tabs Content */}
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="font-khmer-moul-light text-xs text-indigo-600 tracking-wider mb-4">
              ព័ត៌មានលម្អិតផ្ទាល់ខ្លួន
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <DetailItem icon={Hash} label="លេខកូដមន្រ្តី" value={officer.officerCode} />
              <DetailItem icon={Users} label="ភេទ" value={getSexLabel(officer.sex)} />
              <DetailItem icon={UserRound} label="ឈ្មោះជាឡាតាំង (EN)" value={fullName} />
              <DetailItem icon={UserRound} label="ឈ្មោះជាអក្សរខ្មែរ (KH)" value={fullNameKh} />
              <DetailItem
                icon={Calendar}
                label="ថ្ងៃ ខែ ឆ្នាំកំណើត"
                value={officer.date_of_birth}
              />
              <DetailItem icon={IdCard} label="អត្តសញ្ញាណប័ណ្ណ" value={officer.national_id} />
              <DetailItem icon={MapPin} label="សញ្ជាតិ" value={officer.nationality} />
              <DetailItem icon={MapPin} label="ជនជាតិ" value={officer.ethnicity} />
              <DetailItem
                icon={GraduationCap}
                label="កម្រិតវប្បធម៌/ការអប់រំ"
                value={getEducationLevelLabel(officer.education_level)}
              />
            </div>

            <h4 className="font-khmer-moul-light text-xs text-indigo-600 tracking-wider mt-6 mb-4">
              ព័ត៌មានការងារ & កិច្ចសន្យា
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <DetailItem icon={BriefcaseBusiness} label="តំណែង" value={officer.position} />
              <DetailItem icon={Layers} label="ផ្នែក/ការិយាល័យ" value={officer.office} />
              <DetailItem icon={Layers} label="អង្គភាព/ការិយាល័យ" value={officer.department} />
              <DetailItem
                icon={Calendar}
                label="ថ្ងៃចូលធ្វើការផ្លូវការ"
                value={officer.hire_date}
              />
              <DetailItem
                icon={IdCard}
                label="ប្រភេទកិច្ចសន្យា"
                value={getContractTypeLabel(officer.contract_type)}
              />
              <DetailItem
                icon={Sparkles}
                label="អទិភាពនៃការអញ្ជើញ"
                value={officer.invitation_priority ? 'មានអទិភាព (Priority)' : 'ធម្មតា (Standard)'}
              />
            </div>

            <h4 className="font-khmer-moul-light text-xs text-indigo-600 tracking-wider mt-6 mb-4">
              ព័ត៌មានទំនាក់ទំនង
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem icon={Mail} label="អ៊ីមែល" value={officer.email} />
              <DetailItem icon={Phone} label="លេខទូរស័ព្ទ" value={officer.phone} />
            </div>
          </Card>
        </div>
      </div>
    </RequireAccess>
  );
}
