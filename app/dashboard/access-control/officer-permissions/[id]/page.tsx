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
  Search,
  Copy,
  RotateCcw,
  Sparkles,
  Check,
  Filter,
  Eye,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RequireAccess } from '@/components/auth/require-access';
import { useOfficer } from '@/hooks/officers/use-officer';
import { useOfficers } from '@/hooks/officers/use-officers';
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

import { useRoles, type DynamicRole } from '@/hooks/roles/use-roles';
import { useAuth } from '@/components/auth/auth-provider';
import { useUserAccess, useUpdateUserAccess } from '@/hooks/officer-permissions/use-user-access';

export function extractRoleCode(r: any): string {
  if (!r) return 'ROLE_OFFICER';
  if (typeof r === 'string') {
    const s = r.trim().toUpperCase();
    return s.startsWith('ROLE_') ? s : `ROLE_${s}`;
  }
  if (typeof r === 'object') {
    const raw = String(
      r.code || r.roleCode || r.role_code || r.roleName || r.role_name || r.name || '',
    )
      .trim()
      .toUpperCase();
    if (raw) {
      return raw.startsWith('ROLE_') ? raw : `ROLE_${raw}`;
    }
    if (r.id) {
      return `ROLE_${r.id}`;
    }
  }
  return String(r).toUpperCase();
}

function getOfficerInitialRoles(officer: Officer | null, availableRoles: DynamicRole[]): string[] {
  if (!officer) return availableRoles.length > 0 ? [availableRoles[0].code] : ['ROLE_OFFICER'];

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

  return availableRoles.length > 0 ? [availableRoles[0].code] : ['ROLE_OFFICER'];
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
  const { officers: allOfficers = [] } = useOfficers({ pageSize: 1000 });
  const targetUserId = officer?.user_id || officer?.id;
  const { data: userAccess, isLoading: isAccessLoading } = useUserAccess(targetUserId);
  const { data: dynamicRoles = [], isLoading: isRolesLoading } = useRoles();
  const { hasPermission } = useAuth();
  const canAssignRole = hasPermission('OFFICER_ASSIGN_PERMISSION');
  const assignRoleMutation = useAssignRoleToOfficer();
  const updateUserAccessMutation = useUpdateUserAccess();

  const [selectedRoleCodes, setSelectedRoleCodes] = useState<string[]>([]);
  const [directPermissions, setDirectPermissions] = useState<string[]>([]);
  const [changeReason, setChangeReason] = useState('');

  // Search & Filter state for Permission Matrix
  const [searchPerm, setSearchPerm] = useState('');
  const [filterPermMode, setFilterPermMode] = useState<'all' | 'granted' | 'direct' | 'ungranted'>(
    'all',
  );

  // Clone from Officer modal state
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [cloneSearch, setCloneSearch] = useState('');

  // Combined roles list: dynamic roles from backend with fallback
  const displayRoles = useMemo(() => {
    if (dynamicRoles.length > 0) {
      return dynamicRoles.map((dr) => {
        const canonical = dr.code.toUpperCase().startsWith('ROLE_')
          ? dr.code.toUpperCase()
          : `ROLE_${dr.code.toUpperCase()}`;
        return {
          id: dr.id,
          code: canonical,
          nameKm: dr.nameKm || dr.name,
          nameEn: dr.name,
          hierarchyLevel: 50,
          description: dr.description,
          permissions: dr.permissions || [],
        };
      });
    }
    return PRESET_ROLES;
  }, [dynamicRoles]);

  // Track initialization so re-renders do not overwrite user's in-progress role selection
  const hasInitializedRef = React.useRef(false);

  useEffect(() => {
    hasInitializedRef.current = false;
  }, [officerId]);

  useEffect(() => {
    if (hasInitializedRef.current) return;

    if (userAccess && userAccess.assignedRoleCodes.length > 0) {
      setSelectedRoleCodes(userAccess.assignedRoleCodes);
      setDirectPermissions(userAccess.directPermissions || []);
      hasInitializedRef.current = true;
    } else if (officer && !isOfficerLoading) {
      const initialRoles = getOfficerInitialRoles(officer, dynamicRoles);
      setSelectedRoleCodes(initialRoles);
      if (dynamicRoles.length > 0 || !isRolesLoading) {
        hasInitializedRef.current = true;
      }
    }
  }, [userAccess, officer, dynamicRoles, isOfficerLoading, isRolesLoading]);

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
    if (!canAssignRole) {
      toast.warning('អ្នកពុំមានសិទ្ធិកែប្រែតួនាទីមន្ត្រីឡើយ (No permission to assign roles)');
      return;
    }
    const targetCode = extractRoleCode(roleCode);

    setSelectedRoleCodes((prev) => {
      const currentCodes = prev.map((c) => extractRoleCode(c)).filter(Boolean);

      if (currentCodes.includes(targetCode)) {
        // Prevent deselecting if it is the only selected role
        if (currentCodes.length <= 1) {
          toast.warning('មន្ត្រីត្រូវមានតួនាទីយ៉ាងហោចណាស់មួយ');
          return prev;
        }
        return prev.filter((c) => extractRoleCode(c) !== targetCode);
      } else {
        return [...currentCodes, targetCode];
      }
    });
  };

  // Selected Role Items
  const selectedRolePresets = useMemo(() => {
    return normalizedSelectedCodes
      .map((code) => displayRoles.find((r) => r.code === code))
      .filter((r): r is (typeof displayRoles)[0] => Boolean(r));
  }, [normalizedSelectedCodes, displayRoles]);

  // Highest hierarchy role
  const highestRole = useMemo(() => {
    return selectedRolePresets[0] || displayRoles[0] || { code: 'ROLE_OFFICER', nameKm: 'មន្ត្រី' };
  }, [selectedRolePresets, displayRoles]);

  // Permissions bundled inside selected roles
  const rolePermissionsSet = useMemo(() => {
    const permsSet = new Set<string>();
    selectedRolePresets.forEach((r) => {
      (r.permissions || []).forEach((p) => permsSet.add(p.toUpperCase()));
    });
    if (permsSet.size === 0) {
      getMergedPermissionsForRoles(normalizedSelectedCodes).forEach((p) =>
        permsSet.add(p.toUpperCase()),
      );
    }
    return permsSet;
  }, [selectedRolePresets, normalizedSelectedCodes]);

  // Merged Effective Permissions (Roles + Direct Grants)
  const effectivePermissions = useMemo<string[]>(() => {
    const merged = new Set<string>(rolePermissionsSet);
    directPermissions.forEach((p) => merged.add(p.toUpperCase()));
    return Array.from(merged);
  }, [rolePermissionsSet, directPermissions]);

  const effectivePermissionsSet = useMemo(() => {
    return new Set(effectivePermissions);
  }, [effectivePermissions]);

  function getPermissionNameKm(permCode: string): string {
    const upper = permCode.toUpperCase();
    for (const mod of OPERATIONAL_MODULES) {
      const found = mod.permissions.find((p) => p.code.toUpperCase() === upper);
      if (found) return found.nameKm;
    }
    return permCode;
  }

  // Toggle individual direct permission
  const handleToggleDirectPermission = (permCode: string) => {
    if (!canAssignRole) {
      toast.warning('អ្នកពុំមានសិទ្ធិកែប្រែសិទ្ធិមន្ត្រីឡើយ');
      return;
    }

    const upper = permCode.toUpperCase();
    const permNameKm = getPermissionNameKm(upper);

    if (rolePermissionsSet.has(upper)) {
      toast.info(
        `សិទ្ធិ "${permNameKm}" នេះត្រូវបានផ្តល់ជូនរួចហើយតាមរយៈតួនាទី (${selectedRolePresets.map((r) => r.nameKm).join(', ')})`,
      );
      return;
    }

    setDirectPermissions((prev) => {
      if (prev.includes(upper)) {
        return prev.filter((p) => p !== upper);
      } else {
        return [...prev, upper];
      }
    });
  };

  // Bulk action: Select all unassigned permissions in a module
  const handleSelectAllInModule = (module: OperationalModule) => {
    if (!canAssignRole) return;
    const toAdd: string[] = [];
    module.permissions.forEach((p) => {
      const upper = p.code.toUpperCase();
      if (!rolePermissionsSet.has(upper) && !directPermissions.includes(upper)) {
        toAdd.push(upper);
      }
    });

    if (toAdd.length === 0) {
      toast.info(`សិទ្ធិទាំងអស់ក្នុងផ្នែក ${module.nameKm} ត្រូវបានផ្តល់រួចហើយ`);
      return;
    }

    setDirectPermissions((prev) => [...prev, ...toAdd]);
    toast.success(`បានបន្ថែមសិទ្ធិពិសេស ${toAdd.length} ក្នុងផ្នែក ${module.nameKm}`);
  };

  // Bulk action: Select only VIEW permissions in a module
  const handleSelectViewOnlyInModule = (module: OperationalModule) => {
    if (!canAssignRole) return;
    const toAdd: string[] = [];
    module.permissions.forEach((p) => {
      const upper = p.code.toUpperCase();
      if (
        (upper.endsWith('_VIEW') || upper.includes('VIEW_PERMISSION')) &&
        !rolePermissionsSet.has(upper) &&
        !directPermissions.includes(upper)
      ) {
        toAdd.push(upper);
      }
    });

    if (toAdd.length === 0) {
      toast.info(`សិទ្ធិមើល (View) ក្នុងផ្នែក ${module.nameKm} ត្រូវបានផ្តល់រួចហើយ`);
      return;
    }

    setDirectPermissions((prev) => [...prev, ...toAdd]);
    toast.success(`បានបន្ថែមសិទ្ធិមើល (View) ក្នុងផ្នែក ${module.nameKm}`);
  };

  // Bulk action: Clear direct overrides in a module
  const handleClearModuleOverrides = (module: OperationalModule) => {
    if (!canAssignRole) return;
    const modulePermCodes = new Set(module.permissions.map((p) => p.code.toUpperCase()));
    const beforeCount = directPermissions.length;
    setDirectPermissions((prev) => prev.filter((p) => !modulePermCodes.has(p)));
    const removedCount =
      beforeCount - directPermissions.filter((p) => !modulePermCodes.has(p)).length;
    if (removedCount > 0) {
      toast.success(`បានដកសិទ្ធិពិសេស ${removedCount} ចេញពីផ្នែក ${module.nameKm}`);
    }
  };

  // Clone Access from another Officer
  const handleCloneAccessFromOfficer = (sourceOfficer: Officer) => {
    const roles = getOfficerInitialRoles(sourceOfficer, dynamicRoles);
    setSelectedRoleCodes(roles);

    // If source officer has direct permissions, copy them
    const sourceDirects: string[] = [];
    if (Array.isArray(sourceOfficer.permissions)) {
      sourceOfficer.permissions.forEach((p: string) => {
        if (typeof p === 'string') sourceDirects.push(p.toUpperCase());
      });
    }
    setDirectPermissions(sourceDirects);
    setCloneDialogOpen(false);

    const officerName = sourceOfficer.first_name_kh || sourceOfficer.first_name;
    toast.success(
      `បានចម្លងតួនាទី និងសិទ្ធិពី "${officerName}" រួចរាល់! សូមពិនិត្យ និងចុចរក្សាទុក។`,
    );
  };

  const handleSaveChanges = async () => {
    if (!officer || normalizedSelectedCodes.length === 0 || !canAssignRole) return;

    const roleIds = selectedRolePresets
      .map((r) => r.id)
      .filter((id): id is number => typeof id === 'number');
    const effectiveUserId = targetUserId || officer.id;

    try {
      // 1. Unified save via PUT /super-admin/users/{userId}/access
      await updateUserAccessMutation.mutateAsync({
        userId: effectiveUserId,
        roleIds,
        directPermissions,
        reason: changeReason || 'Updated roles and permission overrides',
      });

      const roleNamesText = selectedRolePresets.map((r) => `"${r.nameKm}"`).join(', ');
      toast.success(
        `បានកំណត់តួនាទី ${roleNamesText} និងសិទ្ធិពិសេស (${directPermissions.length}) ជូន ${officer.first_name_kh || officer.first_name} ដោយជោគជ័យ!`,
      );
      router.push('/dashboard/access-control/officer-permissions');
    } catch {
      // Fallback to legacy assign role mutation if access endpoint failed
      try {
        await assignRoleMutation.mutateAsync({
          officerId: officer.id,
          userId: officer.user_id,
          roleIds,
          roleCodes: normalizedSelectedCodes,
          roleName: highestRole.code,
        });
        toast.success(
          `បានកំណត់តួនាទីជូន ${officer.first_name_kh || officer.first_name} ដោយជោគជ័យ!`,
        );
        router.push('/dashboard/access-control/officer-permissions');
      } catch {
        // Handled by toast
      }
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
            ត្រឡប់ទៅកាន់បញ្ជីមន្ត្រី
          </Link>

          <div className="text-sm text-muted-foreground font-medium">
            កំណត់សិទ្ធិ និងតួនាទីពហុមុខងារ
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCloneDialogOpen(true)}
                    className="h-8 text-xs font-semibold gap-1.5 rounded-xl border-emerald-300 bg-white/80 dark:bg-card hover:bg-emerald-50 text-emerald-800 dark:text-emerald-300 shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>ចម្លងសិទ្ធិពីមន្ត្រីផ្សេង</span>
                  </Button>

                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs px-3 py-1 font-semibold"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                    {officer.status || 'ACTIVE'}
                  </Badge>
                </div>

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
              {displayRoles.map((role) => {
                const isRoleActive = normalizedSelectedCodes.includes(role.code);

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
                    ២. សិទ្ធិអនុញ្ញាតសរុបទទួលបាន
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                <Badge
                  variant="outline"
                  className="text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 px-3 py-1 font-semibold"
                >
                  ពីតួនាទី: {rolePermissionsSet.size} សិទ្ធិ
                </Badge>
                {directPermissions.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-400 px-3 py-1 font-bold"
                  >
                    សិទ្ធិពិសេស: +{directPermissions.length}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-xs bg-muted text-foreground px-3 py-1 font-bold"
                >
                  សរុប {effectivePermissions.length} សិទ្ធិសកម្ម
                </Badge>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border border-border">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchPerm}
                  onChange={(e) => setSearchPerm(e.target.value)}
                  placeholder="ស្វែងរកសិទ្ធិ (ឧ. វត្តមាន, Leave, Export, Scan...)"
                  className="pl-9 h-9 text-xs rounded-lg bg-background"
                />
                {searchPerm && (
                  <button
                    onClick={() => setSearchPerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <Button
                  variant={filterPermMode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPermMode('all')}
                  className="h-8 text-xs px-2.5 rounded-lg font-medium"
                >
                  ទាំងអស់
                </Button>
                <Button
                  variant={filterPermMode === 'granted' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPermMode('granted')}
                  className="h-8 text-xs px-2.5 rounded-lg font-medium"
                >
                  បានអនុញ្ញាត ({effectivePermissions.length})
                </Button>
                <Button
                  variant={filterPermMode === 'direct' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPermMode('direct')}
                  className="h-8 text-xs px-2.5 rounded-lg font-medium"
                >
                  សិទ្ធិពិសេស (+{directPermissions.length})
                </Button>
                <Button
                  variant={filterPermMode === 'ungranted' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPermMode('ungranted')}
                  className="h-8 text-xs px-2.5 rounded-lg font-medium"
                >
                  មិនទាន់មាន
                </Button>
              </div>
            </div>

            {/* Operational Modules List */}
            <div className="space-y-4">
              {OPERATIONAL_MODULES.map((module) => {
                const ModuleIcon = module.icon;

                // Filter permissions within this module
                const filteredPerms = module.permissions.filter((perm) => {
                  const upper = perm.code.toUpperCase();
                  const isFromRole = rolePermissionsSet.has(upper);
                  const isDirect = directPermissions.includes(upper);
                  const isGranted = isFromRole || isDirect;

                  // Text search filter
                  if (searchPerm.trim()) {
                    const q = searchPerm.toLowerCase();
                    const matchKh = perm.nameKm?.toLowerCase().includes(q);
                    const matchEn = perm.nameEn?.toLowerCase().includes(q);
                    const matchCode = perm.code?.toLowerCase().includes(q);
                    const matchDesc = perm.description?.toLowerCase().includes(q);
                    if (!matchKh && !matchEn && !matchCode && !matchDesc) return false;
                  }

                  // Mode filter
                  if (filterPermMode === 'granted') return isGranted;
                  if (filterPermMode === 'direct') return isDirect;
                  if (filterPermMode === 'ungranted') return !isGranted;
                  return true;
                });

                if (filteredPerms.length === 0 && (searchPerm.trim() || filterPermMode !== 'all')) {
                  return null;
                }

                const activeCountInModule = module.permissions.filter((p) =>
                  effectivePermissionsSet.has(p.code.toUpperCase()),
                ).length;
                const directCountInModule = module.permissions.filter((p) =>
                  directPermissions.includes(p.code.toUpperCase()),
                ).length;

                const isFullyActive = activeCountInModule === module.permissions.length;
                const isPartiallyActive = activeCountInModule > 0 && !isFullyActive;

                return (
                  <div
                    key={module.id}
                    className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs"
                  >
                    {/* Module Header with Bulk Quick Actions */}
                    <div className="px-5 py-3 bg-muted/40 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${module.badgeBg}`}>
                          <ModuleIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-foreground">{module.nameKm}</span>
                          <span className="text-xs text-muted-foreground hidden sm:inline font-medium ml-2">
                            ({module.nameEn})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                        {/* Quick Module Bulk Actions */}
                        {canAssignRole && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectAllInModule(module)}
                              className="h-7 px-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg"
                              title="ផ្តល់សិទ្ធិទាំងអស់ក្នុងផ្នែកនេះ"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />+ ជ្រើសទាំងអស់
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectViewOnlyInModule(module)}
                              className="h-7 px-2 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg"
                              title="ផ្តល់តែសិទ្ធិមើល (View) ក្នុងផ្នែកនេះ"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              មើលប៉ុណ្ណោះ
                            </Button>
                            {directCountInModule > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClearModuleOverrides(module)}
                                className="h-7 px-2 text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                                title="ដកសិទ្ធិពិសេសទាំងអស់ក្នុងផ្នែកនេះ"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                សម្អាត
                              </Button>
                            )}
                          </div>
                        )}

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
                    </div>

                    {/* Module Permissions Grid */}
                    <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {filteredPerms.map((perm) => {
                        const upperCode = perm.code.toUpperCase();
                        const isFromRole = rolePermissionsSet.has(upperCode);
                        const isDirect = directPermissions.includes(upperCode);
                        const isGranted = isFromRole || isDirect;

                        return (
                          <div
                            key={perm.code}
                            onClick={() => handleToggleDirectPermission(perm.code)}
                            className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all cursor-pointer select-none ${
                              isFromRole
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-800/60 shadow-2xs'
                                : isDirect
                                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs ring-2 ring-blue-500/50'
                                  : 'opacity-50 border-border/60 hover:opacity-100 hover:border-border hover:bg-muted/40'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5 shrink-0">
                                {isFromRole ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : isDirect ? (
                                  <CheckSquare2 className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-950" />
                                ) : (
                                  <Square className="w-4 h-4 text-muted-foreground/60" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`text-sm font-bold ${
                                      isGranted ? 'text-foreground' : 'text-muted-foreground'
                                    }`}
                                  >
                                    {perm.nameKm}
                                  </span>

                                  {isFromRole && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 bg-emerald-100/60 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300"
                                    >
                                      ពីតួនាទី
                                    </Badge>
                                  )}

                                  {isDirect && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 bg-blue-100/80 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-400 font-bold"
                                    >
                                      សិទ្ធិពិសេស (+Direct)
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                  {perm.description}
                                </p>
                              </div>
                            </div>

                            <span className="font-mono text-[11px] text-muted-foreground/80 px-2 py-0.5 rounded-md bg-muted shrink-0 font-medium">
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
              <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                <span>
                  តួនាទី:{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {selectedRolePresets.map((r) => r.nameKm).join(', ')}
                  </strong>
                </span>
                {directPermissions.length > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 text-xs"
                  >
                    +{directPermissions.length} សិទ្ធិពិសេស
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground font-mono">
                  (សរុប {effectivePermissions.length} សិទ្ធិ)
                </span>
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
                  disabled={
                    updateUserAccessMutation.isPending ||
                    assignRoleMutation.isPending ||
                    normalizedSelectedCodes.length === 0
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs px-7 h-10 text-sm font-bold gap-2 rounded-xl"
                >
                  {updateUserAccessMutation.isPending || assignRoleMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      កំពុងរក្សាទុក...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      រក្សាទុកការផ្លាស់ប្តូរទាំងអស់
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. CLONE ACCESS FROM ANOTHER OFFICER DIALOG */}
        <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Copy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ចម្លងសិទ្ធិ និងតួនាទីពីមន្ត្រីផ្សេង (Clone Access)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                ជ្រើសរើសមន្ត្រីគំរូដើម្បីចម្លងតួនាទី និងសិទ្ធិទាំងអស់មកកាន់ {displayNameKhmer}
              </DialogDescription>
            </DialogHeader>

            <div className="relative my-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={cloneSearch}
                onChange={(e) => setCloneSearch(e.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, ការិយាល័យ ឬតំណែង..."
                className="pl-9 h-10 text-sm rounded-xl"
              />
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1 max-h-[380px]">
              {allOfficers
                .filter((o: Officer) => o.id !== officer.id)
                .filter((o: Officer) => {
                  if (!cloneSearch.trim()) return true;
                  const q = cloneSearch.toLowerCase();
                  const nameKh = `${o.last_name_kh || ''} ${o.first_name_kh || ''}`.toLowerCase();
                  const nameEn = `${o.first_name || ''} ${o.last_name || ''}`.toLowerCase();
                  const dep = (o.department || '').toLowerCase();
                  const pos = (o.position || '').toLowerCase();
                  const code = String(o.officerCode || o.id);
                  return (
                    nameKh.includes(q) ||
                    nameEn.includes(q) ||
                    dep.includes(q) ||
                    pos.includes(q) ||
                    code.includes(q)
                  );
                })
                .map((o: Officer) => {
                  const oNameKh =
                    o.first_name_kh && o.last_name_kh
                      ? `${o.last_name_kh} ${o.first_name_kh}`
                      : `${o.last_name} ${o.first_name}`;
                  const oRoles = getOfficerInitialRoles(o, dynamicRoles);

                  return (
                    <div
                      key={o.id}
                      onClick={() => handleCloneAccessFromOfficer(o)}
                      className="p-3 rounded-xl border border-border bg-card hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-border shrink-0">
                          <AvatarImage src={o.image_url || o.avatar_url || o.photo_url || ''} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-xs">
                            {o.first_name?.[0] || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                            {oNameKh}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {o.position || 'មន្ត្រី'} • {o.department || 'រដ្ឋបាល'} •{' '}
                            <span className="font-mono">#{o.officerCode || o.id}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className="text-[11px] bg-muted/60 text-muted-foreground"
                        >
                          {oRoles.length} តួនាទី
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs font-semibold text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white rounded-lg"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          ចម្លង
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAccess>
  );
}
