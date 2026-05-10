'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
  Sparkles,
  UserCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ProfileSession = {
  uuid: string;
  username?: string;
  fullName: string;
  role: string;
  enabled: boolean;
  avatarUrl?: string;
  permissions: string[];
};

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/;

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<ProfileSession | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/auth/profile', { cache: 'no-store' });
        if (!response.ok) throw new Error('មិនអាចទាញយកព័ត៌មានគណនីបានទេ។');
        const data = (await response.json()) as ProfileSession;
        setProfile(data);
        setFullName(data.fullName || '');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'មិនអាចទាញយកព័ត៌មានគណនីបានទេ។');
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleSaveProfile() {
    if (!profile) return;
    if (!fullName.trim()) {
      toast.error('សូមបំពេញឈ្មោះពេញ។');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim() }),
      });

      if (!response.ok) throw new Error('មិនអាចកែប្រែព័ត៌មានគណនីបានទេ។');
      const data = (await response.json()) as ProfileSession;
      setProfile(data);
      setFullName(data.fullName);
      toast.success('បានកែប្រែព័ត៌មានគណនីរួចរាល់។');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'មិនអាចកែប្រែព័ត៌មានគណនីបានទេ។');
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/auth/profile/image', { method: 'POST', body: formData });
      const data = (await response.json().catch(() => ({}))) as {
        avatar_url?: string;
        error?: string;
      };

      if (!response.ok) throw new Error(data.error || 'មិនអាចបង្ហោះរូបភាពបានទេ។');

      setProfile((current) => (current ? { ...current, avatarUrl: data.avatar_url } : current));
      toast.success('បានធ្វើបច្ចុប្បន្នភាពរូបភាពប្រវត្តិរូប។');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'មិនអាចបង្ហោះរូបភាពបានទេ។');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('សូមបំពេញព័ត៌មានពាក្យសម្ងាត់ទាំងអស់។');
      return;
    }

    if (newPassword.length < 8 || !PASSWORD_PATTERN.test(newPassword)) {
      toast.error(
        'ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួអក្សរ និងមានអក្សរធំ អក្សរតូច លេខ និងនិមិត្តសញ្ញា។',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('ការបញ្ជាក់ពាក្យសម្ងាត់មិនត្រូវគ្នា។');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) throw new Error(data.error || 'មិនអាចប្តូរពាក្យសម្ងាត់បានទេ។');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(data.message || 'បានប្តូរពាក្យសម្ងាត់រួចរាល់។');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'មិនអាចប្តូរពាក្យសម្ងាត់បានទេ។');
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-sm text-destructive">មិនអាចបង្ហាញព័ត៌មានគណនីបានទេ។</div>;
  }

  const initials = profile.fullName
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <section className="overflow-hidden rounded-[28px] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_36%),linear-gradient(135deg,_#f8fffc_0%,_#eefbf4_45%,_#ffffff_100%)] shadow-sm">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-7">
          <div className="space-y-4">
            <Badge className="w-fit border-emerald-200 bg-white/80 text-emerald-700 hover:bg-white">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              គណនី និងសុវត្ថិភាព
            </Badge>
            <div className="space-y-2">
              <h1 className="page-title text-2xl font-semibold tracking-tight text-slate-950">
                ប្រវត្តិរូប និងការកំណត់
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">រូបភាពប្រវត្តិរូប</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-dashed border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] p-4">
                <div className="flex justify-center">
                  <Avatar className="h-60 w-full max-w-[240px] rounded-[24px] border bg-white shadow-sm">
                    <AvatarImage
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-[24px] bg-emerald-50 text-3xl font-semibold text-emerald-700">
                      {initials || <UserCircle2 className="h-9 w-9" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleUploadImage}
              />

              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingImage ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 h-4 w-4" />
                )}
                {uploadingImage ? 'កំពុងបង្ហោះរូបភាព...' : 'ប្តូររូបភាព'}
              </Button>

              <p className="text-xs leading-5 text-slate-500">
                គាំទ្រ `JPG`, `PNG`, `WEBP` សម្រាប់ការបង្ហាញនៅលើគណនីរបស់អ្នក។
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                សង្ខេបសុវត្ថិភាព
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="ការចូលប្រើ" value={profile.enabled ? 'អនុញ្ញាត' : 'បានបិទ'} />
              <InfoRow label="ប្រភេទគណនី" value={getRoleLabel(profile.role)} />
              <InfoRow label="ចំនួនសិទ្ធិ" value={`${profile.permissions.length} សិទ្ធិ`} />
              <div className="rounded-2xl bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-800">
                សម្រាប់សុវត្ថិភាពល្អប្រសើរ សូមប្រើពាក្យសម្ងាត់ខ្លាំង និងកុំចែករំលែកគណនីរបស់អ្នក។
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">ព័ត៌មានគណនី</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* <InfoCard label="លេខសម្គាល់ UUID" value={profile.uuid || '-'} /> */}
                <InfoCard label="ឈ្មោះអ្នកប្រើ" value={profile.username || '-'} />
                <InfoCard label="តួនាទី" value={getRoleLabel(profile.role)} />
                <div className="rounded-2xl border bg-slate-50 p-4">
                  <p className="text-xs text-muted-foreground">ស្ថានភាព</p>
                  <Badge className="mt-2" variant={profile.enabled ? 'default' : 'secondary'}>
                    {profile.enabled ? 'សកម្ម' : 'មិនសកម្ម'}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullName">ឈ្មោះពេញ</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="បញ្ចូលឈ្មោះពេញ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">ឈ្មោះអ្នកប្រើ</Label>
                  <Input id="username" value={profile.username || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">តួនាទី</Label>
                  <Input id="role" value={getRoleLabel(profile.role)} disabled />
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="min-w-36"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកព័ត៌មាន'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">ប្តូរពាក្យសម្ងាត់</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                ពាក្យសម្ងាត់ថ្មីត្រូវមានអក្សរធំ អក្សរតូច លេខ និងនិមិត្តសញ្ញា ដើម្បីបង្កើនសុវត្ថិភាព។
              </div>

              <PasswordField
                id="current-password"
                label="ពាក្យសម្ងាត់បច្ចុប្បន្ន"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrentPassword}
                onToggle={() => setShowCurrentPassword((current) => !current)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField
                  id="new-password"
                  label="ពាក្យសម្ងាត់ថ្មី"
                  value={newPassword}
                  onChange={setNewPassword}
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((current) => !current)}
                />
                <PasswordField
                  id="confirm-password"
                  label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((current) => !current)}
                />
              </div>

              <div className="flex justify-end border-t pt-4">
                <Button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="min-w-40"
                >
                  {changingPassword ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LockKeyhole className="mr-2 h-4 w-4" />
                  )}
                  {changingPassword ? 'កំពុងប្តូរ...' : 'ប្តូរពាក្យសម្ងាត់'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
          aria-label={visible ? 'លាក់ពាក្យសម្ងាត់' : 'បង្ហាញពាក្យសម្ងាត់'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'ROLE_SUPER_ADMIN':
      return 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់';
    case 'ROLE_ADMIN':
      return 'អ្នកគ្រប់គ្រង';
    case 'ROLE_MANAGER':
      return 'អ្នកគ្រប់គ្រងផ្នែក';
    case 'ROLE_OFFICER':
      return 'មន្រ្តី';
    default:
      return role;
  }
}
