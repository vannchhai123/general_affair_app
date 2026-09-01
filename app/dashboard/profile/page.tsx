'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserCircle2,
  CheckCircle2,
  XCircle,
  KeyRound,
  Shield,
  Layers,
  User,
  Check,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRoleDisplayKm } from '@/lib/auth/permissions';

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
  const [activeTab, setActiveTab] = useState('general');

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

  // Password validation checks
  const passwordCriteria = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSpecial: /[^\w\s]/.test(newPassword),
      matchesConfirm: Boolean(newPassword && newPassword === confirmPassword),
    };
  }, [newPassword, confirmPassword]);

  const isPasswordValid =
    passwordCriteria.minLength &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasNumber &&
    passwordCriteria.hasSpecial &&
    passwordCriteria.matchesConfirm;

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

    if (!isPasswordValid) {
      toast.error('សូមផ្ទៀងផ្ទាត់លក្ខខណ្ឌសុវត្ថិភាពពាក្យសម្ងាត់ឱ្យបានគ្រប់ជ្រុងជ្រោយ។');
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
      <div className="flex h-64 items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span className="text-sm font-medium text-muted-foreground">កំពុងផ្ទុកព័ត៌មានគណនី...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-destructive font-medium text-sm">
        មិនអាចបង្ហាញព័ត៌មានគណនីបានទេ។
      </div>
    );
  }

  const initials = profile.fullName
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleNameKm = getRoleDisplayKm(profile.role);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* 1. USER PROFILE HERO BANNER (CLEAN WHITE THEME)                           */}
      {/* ========================================================================= */}
      <Card className="border-border shadow-xs overflow-hidden rounded-2xl bg-white dark:bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar with Camera Trigger */}
              <div className="relative group shrink-0">
                <Avatar className="w-20 h-20 border-2 border-emerald-600 shadow-sm rounded-2xl overflow-hidden">
                  <AvatarImage
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-2xl bg-emerald-700 text-white font-bold text-xl">
                    {initials || <UserCircle2 className="w-10 h-10" />}
                  </AvatarFallback>
                </Avatar>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute inset-0 bg-black/40 backdrop-blur-xs rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:pointer-events-none"
                  title="ប្តូររូបភាពប្រវត្តិរូប"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleUploadImage}
                />
              </div>

              {/* Name & Basic Meta */}
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">{profile.fullName}</h1>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 text-xs px-2.5 py-0.5 font-bold"
                  >
                    {roleNameKm}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-mono text-muted-foreground/90">
                    @{profile.username || 'user'}
                  </span>
                </p>

                <p className="text-xs text-muted-foreground/75 mt-1.5 flex items-center gap-2">
                  <span>
                    សិទ្ធិអនុញ្ញាតសកម្ម:{' '}
                    <strong className="text-foreground font-semibold">
                      {profile.permissions.length} សិទ្ធិ
                    </strong>
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs px-3 py-1 font-semibold"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                {profile.enabled ? 'គណនីសកម្ម (ACTIVE)' : 'គណនីផ្អាក (DISABLED)'}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {profile.uuid ? `UUID: ${profile.uuid.slice(0, 8)}...` : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 2. TABBED SETTINGS & PRIVILEGES CONTAINER                                */}
      {/* ========================================================================= */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="bg-muted/80 p-1 rounded-xl h-11 border border-border w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger
            value="general"
            className="rounded-lg text-xs sm:text-sm font-semibold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xs"
          >
            <User className="w-4 h-4" />
            ព័ត៌មានផ្ទាល់ខ្លួន
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-lg text-xs sm:text-sm font-semibold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xs"
          >
            <LockKeyhole className="w-4 h-4" />
            សុវត្ថិភាព & ពាក្យសម្ងាត់
          </TabsTrigger>
          <TabsTrigger
            value="permissions"
            className="rounded-lg text-xs sm:text-sm font-semibold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            សិទ្ធិរបស់ខ្ញុំ ({profile.permissions.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ព័ត៌មានផ្ទាល់ខ្លួន (GENERAL INFO) */}
        <TabsContent value="general" className="space-y-6 mt-0">
          <Card className="border-border shadow-xs rounded-2xl bg-white dark:bg-card">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-foreground">ព័ត៌មានគណនី</h2>
                </div>
              </div>

              {/* Quick Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl border border-border/80 bg-muted/40">
                  <p className="text-xs text-muted-foreground font-medium">ឈ្មោះអ្នកប្រើប្រាស់</p>
                  <p className="mt-1 text-sm font-bold text-foreground font-mono">
                    @{profile.username || '-'}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border/80 bg-muted/40">
                  <p className="text-xs text-muted-foreground font-medium">តួនាទីចម្បង</p>
                  <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {roleNameKm}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border/80 bg-muted/40">
                  <p className="text-xs text-muted-foreground font-medium">ស្ថានភាពគណនី</p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {profile.enabled ? 'អនុញ្ញាតប្រើប្រាស់' : 'ត្រូវបានបិទ'}
                  </p>
                </div>
              </div>

              {/* Profile Inputs */}
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-bold text-foreground">
                    ឈ្មោះពេញ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="បញ្ចូលឈ្មោះពេញរបស់អ្នក..."
                    className="h-11 text-sm rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-bold text-muted-foreground">
                      ឈ្មោះគណនី (Username)
                    </Label>
                    <Input
                      id="username"
                      value={profile.username || ''}
                      disabled
                      className="h-11 text-sm rounded-xl bg-muted/50 cursor-not-allowed font-mono text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-bold text-muted-foreground">
                      តួនាទី (Role)
                    </Label>
                    <Input
                      id="role"
                      value={roleNameKm}
                      disabled
                      className="h-11 text-sm rounded-xl bg-muted/50 cursor-not-allowed text-muted-foreground font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-border shrink-0">
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">រូបភាពប្រវត្តិរូប</h4>
                    <p className="text-xs text-muted-foreground">
                      គាំទ្រប្រភេទ JPG, PNG, WEBP (ទំហំអតិបរមា 5MB)
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-4 text-xs font-semibold gap-2 rounded-xl"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  {uploadingImage ? 'កំពុងបង្ហោះ...' : 'ប្តូររូបភាព'}
                </Button>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving || !fullName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 rounded-xl shadow-xs gap-2 text-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកព័ត៌មាន'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: សុវត្ថិភាព & ពាក្យសម្ងាត់ (SECURITY & PASSWORD) */}
        <TabsContent value="security" className="space-y-6 mt-0">
          <Card className="border-border shadow-xs rounded-2xl bg-white dark:bg-card">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <LockKeyhole className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-foreground">ប្តូរពាក្យសម្ងាត់ថ្មី</h2>
                </div>
              </div>

              <div className="space-y-4">
                <PasswordField
                  id="current-password"
                  label="ពាក្យសម្ងាត់បច្ចុប្បន្ន"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  visible={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword((current) => !current)}
                  placeholder="បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្នរបស់អ្នក..."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordField
                    id="new-password"
                    label="ពាក្យសម្ងាត់ថ្មី"
                    value={newPassword}
                    onChange={setNewPassword}
                    visible={showNewPassword}
                    onToggle={() => setShowNewPassword((current) => !current)}
                    placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី..."
                  />
                  <PasswordField
                    id="confirm-password"
                    label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((current) => !current)}
                    placeholder="វាយបញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត..."
                  />
                </div>

                {/* Password Strength Checklist */}
                {newPassword && (
                  <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-2.5">
                    <p className="text-xs font-bold text-foreground">
                      លក្ខខណ្ឌតម្រូវសុវត្ថិភាពពាក្យសម្ងាត់:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <CriterionItem
                        met={passwordCriteria.minLength}
                        text="យ៉ាងតិច ៨ តួអក្សរ (8+ characters)"
                      />
                      <CriterionItem
                        met={passwordCriteria.hasUpper}
                        text="មានអក្សរធំយ៉ាងតិចមួយ (Uppercase A-Z)"
                      />
                      <CriterionItem
                        met={passwordCriteria.hasLower}
                        text="មានអក្សរតូចយ៉ាងតិចមួយ (Lowercase a-z)"
                      />
                      <CriterionItem
                        met={passwordCriteria.hasNumber}
                        text="មានលេខយ៉ាងតិចមួយ (Numbers 0-9)"
                      />
                      <CriterionItem
                        met={passwordCriteria.hasSpecial}
                        text="មាននិមិត្តសញ្ញាពិសេស (@$!%*?&)"
                      />
                      <CriterionItem
                        met={passwordCriteria.matchesConfirm}
                        text="ការបញ្ជាក់ពាក្យសម្ងាត់ត្រូវគ្នា (Passwords match)"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Change Password Button */}
              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={changingPassword || !isPasswordValid || !currentPassword}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 rounded-xl shadow-xs gap-2 text-sm"
                >
                  {changingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  {changingPassword ? 'កំពុងប្តូរ...' : 'ប្តូរពាក្យសម្ងាត់'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: កញ្ចប់សិទ្ធិរបស់ខ្ញុំ (MY PERMISSIONS) */}
        <TabsContent value="permissions" className="space-y-6 mt-0">
          <Card className="border-border shadow-xs rounded-2xl bg-white dark:bg-card">
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      សិទ្ធិអនុញ្ញាតក្នុងប្រព័ន្ធ
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      សិទ្ធិទាំងអស់ដែលត្រូវបានផ្តល់ជូនគណនីរបស់អ្នកតាមរយៈតួនាទី និងការកំណត់ពិសេស
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 text-xs px-3 py-1 font-bold self-start sm:self-center"
                >
                  សរុប {profile.permissions.length} សិទ្ធិសកម្ម
                </Badge>
              </div>

              {profile.permissions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Shield className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-semibold">មិនទាន់មានសិទ្ធិត្រូវបានផ្តល់ជូនឡើយ</p>
                  <p className="text-xs mt-1">
                    សូមទាក់ទងអ្នកគ្រប់គ្រងដើម្បីផ្តល់សិទ្ធិជូនគណនីរបស់អ្នក
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {profile.permissions.map((permCode) => (
                    <div
                      key={permCode}
                      className="p-3 rounded-xl border border-emerald-300/80 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800/60 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-bold text-foreground font-mono">{permCode}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-white text-emerald-700 dark:bg-card border-emerald-300"
                      >
                        សកម្ម
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-bold text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="pr-10 h-11 text-sm rounded-xl bg-background"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1"
          aria-label={visible ? 'លាក់ពាក្យសម្ងាត់' : 'បង្ហាញពាក្យសម្ងាត់'}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}

function CriterionItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 transition-colors ${
        met ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
      }`}
    >
      {met ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
      )}
      <span>{text}</span>
    </div>
  );
}
