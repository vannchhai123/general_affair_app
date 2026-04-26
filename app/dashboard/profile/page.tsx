'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Eye, EyeOff, Loader2, LockKeyhole, Save, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ProfileSession = {
  id: number;
  username: string;
  full_name: string;
  role_name: string;
  avatar_url?: string;
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
        if (!response.ok) {
          throw new Error('Failed to load profile');
        }

        const data = (await response.json()) as ProfileSession;
        setProfile(data);
        setFullName(data.full_name || '');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleSaveProfile() {
    if (!profile) return;

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      toast.error('ឈ្មោះពេញត្រូវតែបំពេញ');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: trimmedName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = (await response.json()) as ProfileSession;
      setProfile(data);
      setFullName(data.full_name);
      toast.success('បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានគណនីដោយជោគជ័យ');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
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

      const response = await fetch('/api/auth/profile/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = (await response.json()) as { avatar_url: string };
      setProfile((prev) => (prev ? { ...prev, avatar_url: data.avatar_url } : prev));
      toast.success('បានធ្វើបច្ចុប្បន្នភាពរូបភាពគណនីដោយជោគជ័យ');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('សូមបំពេញពាក្យសម្ងាត់គ្រប់ប្រអប់');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 100) {
      toast.error('ពាក្យសម្ងាត់ថ្មីត្រូវមានចន្លោះពី 8 ដល់ 100 តួអក្សរ');
      return;
    }

    if (!PASSWORD_PATTERN.test(newPassword)) {
      toast.error('ពាក្យសម្ងាត់ថ្មីត្រូវមានអក្សរធំ អក្សរតូច លេខ និងសញ្ញាពិសេស');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់មិនដូចគ្នា');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      toast.success(data.message || 'បានប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
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
    return <div className="text-sm text-destructive">មិនអាចផ្ទុកព័ត៌មានគណនីបានទេ។</div>;
  }

  const initials = profile.full_name
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .toUpperCase();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Card className="overflow-hidden border-0 shadow-md">
        <CardContent className="relative bg-gradient-to-r from-emerald-50 via-cyan-50 to-sky-100 px-6 py-7">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),transparent_65%)] md:block" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">គណនីរបស់ខ្ញុំ</h1>
              <p className="mt-1 text-sm text-slate-600">
                គ្រប់គ្រងព័ត៌មានគណនី រូបភាព និងពាក្យសម្ងាត់របស់អ្នកគ្រប់គ្រងនៅកន្លែងតែមួយ។
              </p>
            </div>
            <Badge
              variant="secondary"
              className="w-fit border border-white/70 bg-white/85 text-slate-700"
            >
              {profile.role_name}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">រូបភាពគណនី</CardTitle>
            <CardDescription>
              បង្ហោះរូបភាពថ្មីសម្រាប់បង្ហាញនៅ Sidebar និងគណនីរបស់អ្នក។
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-slate-50 p-3">
              <div className="flex justify-center">
                <Avatar className="h-52 w-full max-w-[220px] rounded-xl border bg-white shadow-sm">
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-xl bg-primary/10 text-3xl font-semibold text-primary">
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
              ប្តូររូបភាព
            </Button>
            <p className="text-center text-xs text-muted-foreground">គាំទ្រ៖ JPG, PNG, WEBP</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">ព័ត៌មានផ្ទាល់ខ្លួន</CardTitle>
              <CardDescription>
                ធ្វើបច្ចុប្បន្នភាពព័ត៌មានគណនីសម្រាប់អ្នកគ្រប់គ្រងនេះ។
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground">លេខសម្គាល់គណនី</p>
                  <p className="mt-1 text-sm font-medium">#{profile.id}</p>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="mt-1 truncate text-sm font-medium">{profile.username}</p>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground">តួនាទី</p>
                  <p className="mt-1 truncate text-sm font-medium">{profile.role_name}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="full_name">ឈ្មោះពេញ</Label>
                  <Input
                    id="full_name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="សូមបញ្ចូលឈ្មោះពេញ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={profile.username} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">តួនាទី</Label>
                  <Input id="role" value={profile.role_name} disabled />
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
                  រក្សាទុកព័ត៌មាន
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">ប្តូរពាក្យសម្ងាត់</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="current_password">ពាក្យសម្ងាត់បច្ចុប្បន្ន</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder="សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន"
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    aria-label={
                      showCurrentPassword ? 'Hide current password' : 'Show current password'
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new_password">ពាក្យសម្ងាត់ថ្មី</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="សូមបញ្ចូលពាក្យសម្ងាត់ថ្មី"
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="សូមបញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                      aria-label={
                        showConfirmPassword
                          ? 'Hide password confirmation'
                          : 'Show password confirmation'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
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
                  ប្តូរពាក្យសម្ងាត់
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
