'use client';

import React, { useState, useMemo, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Layers,
  Save,
  Loader2,
  FileText,
  Clock,
  Mail,
  CalendarCheck,
  FileSpreadsheet,
  Users,
  Building2,
  Shield,
  CheckSquare2,
  Square,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RequireAccess } from '@/components/auth/require-access';
import { useOfficer } from '@/hooks/officers/use-officer';
import { useAssignRoleToOfficer } from '@/hooks/officer-permissions/use-officer-permission-mutations';
import {
  PRESET_ROLES,
  type RolePreset,
  getRoleDisplayKm,
  getMergedPermissionsForRoles,
  getHighestHierarchyRole,
  extractCanonicalRoleCode,
} from '@/lib/auth/permissions';
import type { Officer } from '@/lib/schemas';
import { toast } from '@/lib/toast';

interface ModulePermission {
  code: string;
  nameKm: string;
  nameEn: string;
  description: string;
}

interface OperationalModule {
  id: string;
  nameKm: string;
  nameEn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  badgeBg: string;
  permissions: ModulePermission[];
}

const OPERATIONAL_MODULES: OperationalModule[] = [
  {
    id: 'officers',
    nameKm: 'ការគ្រប់គ្រងបុគ្គលិក និងមន្ត្រី',
    nameEn: 'Staff & Officer Management',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    permissions: [
      {
        code: 'OFFICER_VIEW',
        nameKm: 'មើលបញ្ជី និងប្រវត្តិរូបមន្ត្រី',
        nameEn: 'View Officer Directory',
        description: 'អាចមើលបញ្ជីឈ្មោះ ប្រវត្តិរូប និងព័ត៌មានលម្អិតរបស់មន្ត្រីក្នុងអង្គភាព',
      },
      {
        code: 'OFFICER_CREATE',
        nameKm: 'បន្ថែមមន្ត្រីថ្មី',
        nameEn: 'Create Officer Profile',
        description: 'អាចបង្កើតគណនី និងបញ្ចូលមន្ត្រីថ្មីទៅក្នុងប្រព័ន្ធរដ្ឋបាល',
      },
      {
        code: 'OFFICER_UPDATE',
        nameKm: 'កែប្រែព័ត៌មានមន្ត្រី',
        nameEn: 'Update Officer Details',
        description: 'អាចកែសម្រួលព័ត៌មានផ្ទាល់ខ្លួន មុខតំណែង និងការិយាល័យរបស់មន្ត្រី',
      },
      {
        code: 'OFFICER_DELETE',
        nameKm: 'លុប ឬផ្អាកគណនីមន្ត្រី',
        nameEn: 'Delete / Deactivate Officer',
        description: 'អាចលុប ឬផ្អាកដំណើរការគណនីមន្ត្រីដែលបានចាកចេញ',
      },
      {
        code: 'OFFICER_VIEW_PERMISSION',
        nameKm: 'មើលសិទ្ធិមន្ត្រី',
        nameEn: 'View Officer Permissions',
        description: 'អាចពិនិត្យមើលតារាងសិទ្ធិ និងតួនាទីដែលមន្ត្រីកំពុងកាន់កាប់',
      },
      {
        code: 'OFFICER_ASSIGN_PERMISSION',
        nameKm: 'ចាត់ចែង និងកំណត់សិទ្ធិ',
        nameEn: 'Assign Officer Permissions',
        description: 'អាចផ្តល់សិទ្ធិ ឬដកសិទ្ធិអនុញ្ញាតផ្សេងៗពីមន្ត្រី',
      },
    ],
  },
  {
    id: 'attendance',
    nameKm: 'វត្តមាន និងការចុះឈ្មោះ QR',
    nameEn: 'Attendance & QR Check-in',
    icon: Clock,
    color: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    permissions: [
      {
        code: 'ATTENDANCE_VIEW',
        nameKm: 'មើលទិន្នន័យវត្តមានទូទៅ',
        nameEn: 'View Attendance Records',
        description: 'មើលស្ថិតិវត្តមាន ម៉ោងចូល/ចេញ និងអវត្តមានរបស់មន្ត្រី',
      },
      {
        code: 'ATTENDANCE_SCAN',
        nameKm: 'ស្កេន QR វត្តមានផ្ទាល់ខ្លួន',
        nameEn: 'Scan QR Check-in',
        description: 'អាចស្កេនកូដ QR ដើម្បីកត់ត្រាវត្តមានចូល និងចេញពីធ្វើការ',
      },
      {
        code: 'ATTENDANCE_CREATE',
        nameKm: 'កត់ត្រាវត្តមានដោយផ្ទាល់',
        nameEn: 'Manual Attendance Entry',
        description: 'អាចកត់ត្រាវត្តមានជំនួសមន្ត្រីករណីភ្លេចស្កេន ឬមានធុរៈចាំបាច់',
      },
      {
        code: 'ATTENDANCE_UPDATE',
        nameKm: 'កែសម្រួលទិន្នន័យវត្តមាន',
        nameEn: 'Update Attendance Logs',
        description: 'អាចកែប្រែម៉ោង ឬស្ថានភាពវត្តមានដែលខុសប្រក្រតី',
      },
      {
        code: 'ATTENDANCE_EXPORT',
        nameKm: 'ទាញយកទិន្នន័យវត្តមាន (Excel/PDF)',
        nameEn: 'Export Attendance Data',
        description: 'ទាញយករបាយការណ៍វត្តមានប្រចាំខែ ឬប្រចាំថ្ងៃទៅជាឯកសារ Excel',
      },
      {
        code: 'QR_SESSION_VIEW',
        nameKm: 'មើលសម័យកាល QR Code',
        nameEn: 'View QR Sessions',
        description: 'អាចមើលកូដ QR សកម្ម និងតាមដានការស្កេនលើផ្ទាំង Kiosk',
      },
      {
        code: 'QR_SESSION_CREATE',
        nameKm: 'បង្កើតសម័យកាល QR ថ្មី',
        nameEn: 'Create QR Session',
        description: 'អាចបង្កើតកូដ QR ថ្មីសម្រាប់វេនព្រឹក ឬវេនរសៀល',
      },
      {
        code: 'QR_SESSION_END',
        nameKm: 'បិទបញ្ចប់សម័យកាល QR',
        nameEn: 'End QR Session',
        description: 'អាចបិទកូដ QR មុនកាលកំណត់នៅពេលផុតម៉ោងធ្វើការ',
      },
    ],
  },
  {
    id: 'shifts',
    nameKm: 'វេន និងកាលវិភាគការងារ',
    nameEn: 'Shift Scheduling',
    icon: CalendarCheck,
    color: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-200 dark:border-violet-800',
    badgeBg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    permissions: [
      {
        code: 'SHIFT_VIEW',
        nameKm: 'មើលកាលវិភាគវេនការងារ',
        nameEn: 'View Work Shifts',
        description: 'មើលបញ្ជីវេន ម៉ោងការងារ និងមន្ត្រីដែលត្រូវបំពេញវេន',
      },
      {
        code: 'SHIFT_CREATE',
        nameKm: 'បង្កើតវេនការងារថ្មី',
        nameEn: 'Create New Shift',
        description: 'បង្កើតវេនប្រចាំថ្ងៃ វេនប្រចាំការ ឬវេនចុងសប្តាហ៍',
      },
      {
        code: 'SHIFT_UPDATE',
        nameKm: 'កែប្រែម៉ោង និងវេនការងារ',
        nameEn: 'Update Shift Schedules',
        description: 'កែសម្រួលម៉ោងចូល ម៉ោងចេញ និងលក្ខខណ្ឌវេន',
      },
      {
        code: 'SHIFT_ASSIGN',
        nameKm: 'បែងចែកមន្ត្រីចូលវេន',
        nameEn: 'Assign Officers to Shift',
        description: 'ចាត់តាំងមន្ត្រី ឬក្រុមការងារឱ្យបំពេញវេននីមួយៗ',
      },
      {
        code: 'SHIFT_DELETE',
        nameKm: 'លុបវេនការងារ',
        nameEn: 'Delete Work Shift',
        description: 'លុបវេនការងារដែលឈប់ដំណើរការ',
      },
    ],
  },
  {
    id: 'invitations',
    nameKm: 'លិខិតអញ្ជើញ និងឯកសាររដ្ឋបាល',
    nameEn: 'Invitations & Documents',
    icon: Mail,
    color: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800',
    badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    permissions: [
      {
        code: 'INVITATION_VIEW',
        nameKm: 'មើលលិខិតអញ្ជើញ និងកម្មវិធី',
        nameEn: 'View Invitations',
        description: 'មើលលិខិតអញ្ជើញ កាលវិភាគកម្មវិធី និងទីកន្លែងប្រជុំ',
      },
      {
        code: 'INVITATION_CREATE',
        nameKm: 'បង្កើតលិខិតអញ្ជើញថ្មី',
        nameEn: 'Create Invitation',
        description: 'បញ្ចូលកម្មវិធីប្រជុំ ពិធីបុណ្យ ឬកិច្ចប្រជុំគណៈអភិបាលថ្មី',
      },
      {
        code: 'INVITATION_UPDATE',
        nameKm: 'កែសម្រួលលិខិតអញ្ជើញ',
        nameEn: 'Update Invitation',
        description: 'កែប្រែកាលបរិច្ឆេទ ទីកន្លែង និងបញ្ជីមន្ត្រីអញ្ជើញចូលរួម',
      },
      {
        code: 'INVITATION_DELETE',
        nameKm: 'លុបលិខិតអញ្ជើញ',
        nameEn: 'Delete Invitation',
        description: 'លុបកម្មវិធី ឬលិខិតអញ្ជើញដែលត្រូវបានលុបចោល',
      },
    ],
  },
  {
    id: 'organization',
    nameKm: 'រចនាសម្ព័ន្ធ និងអង្គភាព',
    nameEn: 'Organization & Departments',
    icon: Building2,
    color: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
    permissions: [
      {
        code: 'ORGANIZATION_VIEW',
        nameKm: 'មើលរចនាសម្ព័ន្ធការិយាល័យ',
        nameEn: 'View Department Structure',
        description: 'មើលបញ្ជីការិយាល័យ ផ្នែក និងរចនាសម្ព័ន្ធគ្រប់គ្រងក្នុងសាលាខេត្ត/រាជធានី',
      },
      {
        code: 'ORGANIZATION_CREATE',
        nameKm: 'បង្កើតការិយាល័យ ឬផ្នែកថ្មី',
        nameEn: 'Create Office/Unit',
        description: 'បន្ថែមការិយាល័យ ឬផ្នែករដ្ឋបាលថ្មីទៅក្នុងប្រព័ន្ធ',
      },
      {
        code: 'ORGANIZATION_UPDATE',
        nameKm: 'កែប្រែព័ត៌មានការិយាល័យ',
        nameEn: 'Update Department Info',
        description: 'កែប្រែឈ្មោះ ប្រធានទទួលខុសត្រូវ និងព័ត៌មានការិយាល័យ',
      },
      {
        code: 'ORGANIZATION_DELETE',
        nameKm: 'លុបការិយាល័យ ឬផ្នែក',
        nameEn: 'Delete Department',
        description: 'លុបការិយាល័យដែលត្រូវបានរំសាយ ឬបញ្ចូលគ្នា',
      },
    ],
  },
  {
    id: 'dashboard',
    nameKm: 'ផ្ទាំងគ្រប់គ្រង និងរបាយការណ៍',
    nameEn: 'Dashboard & Reports',
    icon: FileSpreadsheet,
    color: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    badgeBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
    permissions: [
      {
        code: 'DASHBOARD_VIEW',
        nameKm: 'មើលផ្ទាំងគ្រប់គ្រងទូទៅ',
        nameEn: 'View Dashboard Statistics',
        description: 'មើលផ្ទាំងស្ថិតិសង្ខេប ប្រសិទ្ធភាពការងារ និងសកម្មភាពប្រចាំថ្ងៃ',
      },
    ],
  },
  {
    id: 'rbac',
    nameKm: 'សិទ្ធិប្រព័ន្ធ និងសុវត្ថិភាព',
    nameEn: 'System RBAC & Security',
    icon: Shield,
    color: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-200 dark:border-rose-800',
    badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    permissions: [
      {
        code: 'PERMISSION_VIEW',
        nameKm: 'មើលបញ្ជីសិទ្ធិប្រព័ន្ធ',
        nameEn: 'View System Permissions',
        description: 'មើលសិទ្ធិទាំងអស់ដែលប្រព័ន្ធបានកំណត់',
      },
      {
        code: 'ROLE_ASSIGN_PERMISSION',
        nameKm: 'ចាត់តាំងសិទ្ធិទៅកាន់តួនាទី',
        nameEn: 'Assign Permissions to Role',
        description: 'កែសម្រួលកញ្ចប់សិទ្ធិរបស់តួនាទីនីមួយៗ',
      },
    ],
  },
];

export function extractRoleCode(r: any): string {
  return extractCanonicalRoleCode(r);
}

function getOfficerInitialRoles(officer: Officer | null): string[] {
  if (!officer) return ['ROLE_OFFICER'];

  const extracted: string[] = [];

  if (Array.isArray(officer.roles) && officer.roles.length > 0) {
    officer.roles.forEach((r) => {
      const code = extractRoleCode(r);
      if (code && !extracted.includes(code)) extracted.push(code);
    });
  }

  if (Array.isArray(officer.roleCodes) && officer.roleCodes.length > 0) {
    officer.roleCodes.forEach((r) => {
      const code = extractRoleCode(r);
      if (code && !extracted.includes(code)) extracted.push(code);
    });
  }

  if (extracted.length > 0) {
    return extracted;
  }

  const pos = (officer.position || '').toLowerCase();
  if (pos.includes('អភិបាលរង') || pos.includes('governor')) return ['ROLE_GOVERNOR_DEP_1'];
  if (pos.includes('នាយករដ្ឋបាល') && !pos.includes('រង')) return ['ROLE_ADMIN_DIRECTOR'];
  if (pos.includes('នាយករងរដ្ឋបាល')) return ['ROLE_DEPUTY_ADMIN_DIRECTOR'];
  if (pos.includes('ប្រធានផ្នែក')) return ['ROLE_DEPT_HEAD'];
  if (pos.includes('ប្រធានការិយាល័យ') && !pos.includes('អនុ')) return ['ROLE_OFFICE_CHIEF'];
  if (pos.includes('អនុប្រធាន')) return ['ROLE_DEPUTY_OFFICE_CHIEF'];
  return ['ROLE_OFFICER'];
}

function getHierarchyBadgeColor(level: number) {
  if (level >= 90)
    return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50';
  if (level >= 75)
    return 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/50';
  if (level >= 50)
    return 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/50';
  return 'bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700/50';
}

export default function OfficerRoleManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const officerId = Number(resolvedParams.id);

  const { data: officer, isLoading: isOfficerLoading, error } = useOfficer(officerId);
  const assignRoleMutation = useAssignRoleToOfficer();

  const [selectedRoleCodes, setSelectedRoleCodes] = useState<string[]>([]);
  const [changeReason, setChangeReason] = useState('');

  // Initialize roles whenever officer data loads or updates
  useEffect(() => {
    if (officer) {
      const initialRoles = getOfficerInitialRoles(officer);
      setSelectedRoleCodes(initialRoles);
    }
  }, [officer?.id, JSON.stringify(officer?.roles), JSON.stringify(officer?.roleCodes)]);

  // Normalized set of selected role codes
  const normalizedSelectedCodes = useMemo<string[]>(() => {
    const list: string[] = [];
    selectedRoleCodes.forEach((r) => {
      const code = extractRoleCode(r);
      if (code && !list.includes(code)) list.push(code);
    });
    return list;
  }, [selectedRoleCodes]);

  // Toggle role selection (Multi-Role Support)
  const handleToggleRole = (roleCode: string) => {
    const targetCode = extractRoleCode(roleCode);

    setSelectedRoleCodes((prev) => {
      const currentCodes = prev.map((c) => extractRoleCode(c)).filter(Boolean);

      if (currentCodes.includes(targetCode)) {
        // Prevent deselecting if it is the only selected role
        if (currentCodes.length <= 1) {
          toast.warning('មន្ត្រីត្រូវមានតួនាទីយ៉ាងហោចណាស់មួយ (Must have at least one role)');
          return prev;
        }
        return prev.filter((c) => extractRoleCode(c) !== targetCode);
      } else {
        return [...prev, targetCode];
      }
    });
  };

  // Selected Role Presets
  const selectedRolePresets = useMemo<RolePreset[]>(() => {
    return normalizedSelectedCodes
      .map((code) => PRESET_ROLES.find((r) => r.code === code))
      .filter((r): r is RolePreset => Boolean(r));
  }, [normalizedSelectedCodes]);

  // Highest hierarchy role
  const highestRole = useMemo<RolePreset>(() => {
    return getHighestHierarchyRole(normalizedSelectedCodes);
  }, [normalizedSelectedCodes]);

  // Merged Effective Permissions across all selected roles
  const effectivePermissions = useMemo<string[]>(() => {
    return getMergedPermissionsForRoles(normalizedSelectedCodes);
  }, [normalizedSelectedCodes]);

  const effectivePermissionsSet = useMemo(() => {
    return new Set(effectivePermissions);
  }, [effectivePermissions]);

  const handleSaveChanges = async () => {
    if (!officer || normalizedSelectedCodes.length === 0) return;

    const roleIds = selectedRolePresets.map((r) => r.id);

    try {
      await assignRoleMutation.mutateAsync({
        officerId: officer.id,
        userId: officer.user_id,
        roleIds,
        roleCodes: normalizedSelectedCodes,
        roleName: highestRole.code,
      });

      const roleNamesText = selectedRolePresets.map((r) => `"${r.nameKm}"`).join(', ');
      toast.success(
        `បានកំណត់តួនាទី ${roleNamesText} ជូន ${officer.first_name_kh || officer.first_name} ដោយជោគជ័យ!`,
      );
      router.push('/dashboard/access-control/officer-permissions');
    } catch {
      // Error handled by mutation toast
    }
  };

  if (isOfficerLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-base font-medium text-muted-foreground">កំពុងផ្ទុកព័ត៌មានមន្ត្រី...</p>
      </div>
    );
  }

  if (error || !officer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4 text-center p-6">
        <p className="text-base font-bold text-destructive">មិនអាចស្វែងរកព័ត៌មានមន្ត្រីនេះបានឡើយ</p>
        <Link href="/dashboard/access-control/officer-permissions">
          <Button variant="outline" size="sm" className="gap-2 text-sm h-10 px-4">
            <ArrowLeft className="w-4 h-4" />
            ត្រឡប់ទៅបញ្ជីមន្ត្រី
          </Button>
        </Link>
      </div>
    );
  }

  const displayNameKhmer =
    officer.first_name_kh && officer.last_name_kh
      ? `${officer.last_name_kh} ${officer.first_name_kh}`
      : `${officer.last_name} ${officer.first_name}`;

  return (
    <RequireAccess permission="OFFICER_VIEW_PERMISSION" redirectTo="/dashboard">
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/access-control/officer-permissions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3.5 py-2 rounded-xl hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            ត្រឡប់ទៅកាន់បញ្ជីមន្ត្រី (Back to Staff List)
          </Link>

          <div className="text-sm text-muted-foreground font-medium">
            កំណត់សិទ្ធិ និងតួនាទីពហុមុខងារ (Multi-Role Management)
          </div>
        </div>

        {/* Officer Profile Header Banner */}
        <Card className="border-border shadow-xs overflow-hidden rounded-2xl">
          <CardContent className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-background dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="flex items-center gap-4.5">
                <Avatar className="w-16 h-16 border-2 border-emerald-600 shadow-sm shrink-0">
                  <AvatarImage
                    src={officer.image_url || officer.avatar_url || officer.photo_url || ''}
                  />
                  <AvatarFallback className="bg-emerald-700 text-white font-bold text-lg">
                    {officer.first_name?.[0] || 'M'}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-bold text-foreground">{displayNameKhmer}</h1>
                    <span className="text-sm text-muted-foreground font-normal">
                      ({officer.first_name} {officer.last_name})
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    <strong className="text-foreground">{officer.position || 'មន្ត្រី'}</strong> •{' '}
                    {officer.department || 'រដ្ឋបាលទូទៅ'} •{' '}
                    <span className="font-mono text-muted-foreground/90">
                      @{officer.username || 'officer'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs px-3 py-1 font-semibold"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  {officer.status || 'ACTIVE'}
                </Badge>
                <span className="text-sm font-mono font-semibold text-muted-foreground">
                  អត្តលេខ: #{officer.officerCode || officer.id}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. MULTI-ROLE SELECTOR CARDS (CLICK TO TOGGLE MULTIPLE ROLES) */}
        <Card className="border-border shadow-xs rounded-2xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border gap-2">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-foreground">១. ជ្រើសរើសតួនាទី</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    ចុចលើកាតដើម្បីជ្រើសរើស ឬដកតួនាទី (អាចជ្រើសរើសច្រើនតួនាទីដំណាលគ្នា)
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300 text-xs px-3 py-1 font-bold self-start sm:self-center"
              >
                បានជ្រើសរើស {normalizedSelectedCodes.length} តួនាទី
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {PRESET_ROLES.map((role) => {
                const isRoleActive =
                  normalizedSelectedCodes.includes(role.code) ||
                  normalizedSelectedCodes.some((c) => role.aliases?.includes(c));

                return (
                  <div
                    key={role.code}
                    onClick={() => handleToggleRole(role.code)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 select-none ${
                      isRoleActive
                        ? 'border-emerald-600 bg-emerald-50/90 dark:bg-emerald-950/50 shadow-sm ring-2 ring-emerald-600/70'
                        : 'border-border bg-card hover:bg-accent/40 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {isRoleActive ? (
                            <CheckSquare2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Square className="w-5 h-5 text-muted-foreground/50" />
                          )}
                        </div>
                        <div>
                          <h3
                            className={`text-sm font-bold ${isRoleActive ? 'text-emerald-950 dark:text-emerald-100' : 'text-foreground'}`}
                          >
                            {role.nameKm}
                          </h3>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 font-bold ${getHierarchyBadgeColor(
                          role.hierarchyLevel,
                        )}`}
                      >
                        Lv {role.hierarchyLevel}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground/90 leading-relaxed pl-7">
                      {role.description}
                    </p>

                    <div className="pt-2.5 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground pl-7">
                      <span>កញ្ចប់សិទ្ធិ:</span>
                      <strong className="text-foreground font-bold">
                        {role.permissions.length} សិទ្ធិអនុញ្ញាត
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 2. MERGED EFFECTIVE PRIVILEGES MATRIX */}
        <Card className="border-border shadow-xs rounded-2xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border gap-2">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    ២. សិទ្ធិអនុញ្ញាតសរុបទទួលបាន (Merged Effective Privileges)
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    សិទ្ធិទាំងអស់ដែលទទួលបានពីការបូកបញ្ចូលតួនាទីទាំង {normalizedSelectedCodes.length}{' '}
                    ({selectedRolePresets.map((r) => r.nameKm).join(', ')})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <Badge
                  variant="outline"
                  className="text-xs bg-muted text-foreground px-3 py-1 font-semibold"
                >
                  សរុប {effectivePermissions.length} សិទ្ធិសកម្ម
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 font-bold px-2.5 py-1"
                >
                  កម្រិតខ្ពស់បំផុត Lv {highestRole.hierarchyLevel}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {OPERATIONAL_MODULES.map((module) => {
                const ModuleIcon = module.icon;
                const activeCountInModule = module.permissions.filter((p) =>
                  effectivePermissionsSet.has(p.code),
                ).length;

                const isFullyActive = activeCountInModule === module.permissions.length;
                const isPartiallyActive = activeCountInModule > 0 && !isFullyActive;

                return (
                  <div
                    key={module.id}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    {/* Module Header */}
                    <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${module.badgeBg}`}>
                          <ModuleIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-foreground">{module.nameKm}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline font-medium">
                          ({module.nameEn})
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold px-2.5 py-0.5 ${
                          isFullyActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300'
                            : isPartiallyActive
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300'
                              : 'bg-muted text-muted-foreground border-transparent'
                        }`}
                      >
                        {activeCountInModule} / {module.permissions.length} សិទ្ធិ
                      </Badge>
                    </div>

                    {/* Module Permissions Grid */}
                    <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {module.permissions.map((perm) => {
                        const isGranted = effectivePermissionsSet.has(perm.code);

                        return (
                          <div
                            key={perm.code}
                            className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${
                              isGranted
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                                : 'opacity-40 border-transparent'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5 shrink-0">
                                {isGranted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-muted-foreground/60" />
                                )}
                              </div>
                              <div>
                                <span
                                  className={`text-sm font-bold ${
                                    isGranted ? 'text-foreground' : 'text-muted-foreground'
                                  }`}
                                >
                                  {perm.nameKm}
                                </span>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                  {perm.description}
                                </p>
                              </div>
                            </div>

                            <span className="font-mono text-xs text-muted-foreground/80 px-2 py-0.5 rounded-md bg-muted shrink-0 font-medium">
                              {perm.code}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 3. REASON & SAVE ACTIONS BAR */}
        <Card className="border-border shadow-xs rounded-2xl">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                មូលហេតុនៃការផ្លាស់ប្តូរ:
              </label>
              <Input
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="ឧ. ផ្ទេរភារកិច្ចថ្មី, បន្ថែមតួនាទីបន្ទាប់បន្សំ, ឬកែសម្រួលសិទ្ធិការងារ..."
                className="text-sm h-11 rounded-xl bg-background"
              />
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                <span>តួនាទីជ្រើសរើស ({normalizedSelectedCodes.length}): </span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                  {selectedRolePresets.map((r) => r.nameKm).join(', ')}
                </strong>{' '}
                (សរុប {effectivePermissions.length} សិទ្ធិ)
              </div>

              <div className="flex items-center gap-3">
                <Link href="/dashboard/access-control/officer-permissions">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-5 text-sm font-medium rounded-xl"
                  >
                    បោះបង់
                  </Button>
                </Link>

                <Button
                  onClick={handleSaveChanges}
                  disabled={assignRoleMutation.isPending || normalizedSelectedCodes.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs px-7 h-10 text-sm font-bold gap-2 rounded-xl"
                >
                  {assignRoleMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      កំពុងរក្សាទុក...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      រក្សាទុកការផ្លាស់ប្តូរ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RequireAccess>
  );
}
