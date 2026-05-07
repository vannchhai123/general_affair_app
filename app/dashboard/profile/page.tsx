'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Eye, EyeOff, Loader2, LockKeyhole, Save, UserCircle2 } from 'lucide-react';
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
        if (!response.ok) throw new Error('Failed to load profile');
        const data = (await response.json()) as ProfileSession;
        setProfile(data);
        setFullName(data.fullName || '');
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
    if (!fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim() }),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      const data = (await response.json()) as ProfileSession;
      setProfile(data);
      setFullName(data.fullName);
      toast.success('Profile updated.');
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
      const response = await fetch('/api/auth/profile/image', { method: 'POST', body: formData });
      const data = (await response.json().catch(() => ({}))) as {
        avatar_url?: string;
        error?: string;
      };

      if (!response.ok) throw new Error(data.error || 'Failed to upload image');

      setProfile((current) => (current ? { ...current, avatarUrl: data.avatar_url } : current));
      toast.success('Profile image updated.');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }

    if (newPassword.length < 8 || !PASSWORD_PATTERN.test(newPassword)) {
      toast.error(
        'New password must be at least 8 characters and include upper, lower, number, and symbol.',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Password confirmation does not match.');
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

      if (!response.ok) throw new Error(data.error || 'Failed to change password');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(data.message || 'Password changed.');
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
    return <div className="text-sm text-destructive">Unable to load profile.</div>;
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
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Profile / Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review your authenticated profile, update your display name, and change your password.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-slate-50 p-3">
              <div className="flex justify-center">
                <Avatar className="h-52 w-full max-w-[220px] rounded-xl border bg-white shadow-sm">
                  <AvatarImage
                    src={profile.avatarUrl}
                    alt={profile.fullName}
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
              Upload Photo
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Authenticated Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-4">
                <InfoCard label="UUID" value={profile.uuid || '-'} />
                <InfoCard label="Username" value={profile.username || '-'} />
                <InfoCard label="Role" value={profile.role} />
                <div className="rounded-lg border bg-slate-50 p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className="mt-2" variant={profile.enabled ? 'default' : 'secondary'}>
                    {profile.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={profile.username || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={profile.role} disabled />
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
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <PasswordField
                id="current-password"
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrentPassword}
                onToggle={() => setShowCurrentPassword((current) => !current)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField
                  id="new-password"
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((current) => !current)}
                />
                <PasswordField
                  id="confirm-password"
                  label="Confirm Password"
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
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
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
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
