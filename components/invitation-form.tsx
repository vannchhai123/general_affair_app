'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
  Users,
  Upload,
  Loader2,
  Trash2,
  Building2,
  Globe,
  Search,
  X,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { useUploadInvitationImage } from '@/hooks/invitations/use-invitation-mutations';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  invitationFormSchema,
  type InvitationFormValues,
} from '@/lib/schemas/invitation/invitation';
import { resolveImageUrl } from '@/lib/image-utils';
import type { Invitation, Officer } from '@/lib/schemas';

function OfficerMultiSelect({
  officers,
  value,
  onChange,
  showOfficeFilter = false,
}: {
  officers: Officer[];
  value: number[];
  onChange: (value: number[]) => void;
  showOfficeFilter?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState('');

  const selectedOfficers = officers.filter((officer) => value.includes(officer.id));
  const label =
    selectedOfficers.length > 0
      ? `បានជ្រើសរើស ${selectedOfficers.length} រូប`
      : 'ជ្រើសរើសសមាសភាពចូលរួម...';

  const officeList = Array.from(
    new Set(officers.map((o) => (o.department || o.office || '').trim()).filter(Boolean)),
  ).sort();

  const filteredOfficers = officers.filter((officer) => {
    if (selectedOffice === 'all') return true;
    const officerDept = (officer.department || officer.office || '').trim();
    return officerDept === selectedOffice;
  });

  const allFilteredSelected =
    filteredOfficers.length > 0 && filteredOfficers.every((officer) => value.includes(officer.id));

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredOfficers.map((o) => o.id));
      onChange(value.filter((id) => !filteredIds.has(id)));
    } else {
      const filteredIds = filteredOfficers.map((o) => o.id);
      const updated = Array.from(new Set([...value, ...filteredIds]));
      onChange(updated);
    }
  };

  const visibleOfficers = isExpanded
    ? selectedOfficers.filter((o) => {
        if (!selectedSearch.trim()) return true;
        const q = selectedSearch.toLowerCase();
        const kh = `${o.last_name_kh || ''} ${o.first_name_kh || ''}`.toLowerCase();
        const en = `${o.last_name || ''} ${o.first_name || ''}`.toLowerCase();
        return kh.includes(q) || en.includes(q) || (o.officerCode || '').toLowerCase().includes(q);
      })
    : selectedOfficers.slice(0, 5);

  const remainingCount = selectedOfficers.length - 5;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-between min-h-11 h-auto py-2.5 px-3.5 text-left font-normal border-slate-200 rounded-xl bg-white leading-relaxed',
              selectedOfficers.length > 0 && 'border-blue-200 bg-blue-50/20',
            )}
          >
            <span className="flex items-center gap-2.5 min-w-0 text-left py-0.5">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold',
                  selectedOfficers.length > 0
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200',
                )}
              >
                <Users className="h-3.5 w-3.5" />
              </div>
              <span className="truncate text-sm font-medium text-slate-900 leading-relaxed py-0.5">
                {label}
              </span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[340px] sm:w-[460px] p-0 rounded-2xl shadow-xl border-slate-200"
          align="start"
        >
          <Command>
            <div className="p-3 border-b space-y-2.5 bg-slate-50/70 rounded-t-2xl">
              <CommandInput
                placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, តួនាទី..."
                className="h-9 text-xs rounded-xl bg-white border-slate-200 leading-relaxed"
              />
              {showOfficeFilter && officeList.length > 0 && (
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                    <SelectTrigger className="h-8 text-xs flex-1 bg-white border-slate-200 rounded-lg leading-relaxed">
                      <SelectValue placeholder="គ្រប់ការិយាល័យ / អង្គភាព" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[220px] rounded-xl">
                      <SelectItem value="all" className="py-1.5 text-xs leading-relaxed">
                        គ្រប់ការិយាល័យ / អង្គភាព ({officers.length})
                      </SelectItem>
                      {officeList.map((office) => {
                        const count = officers.filter(
                          (o) => (o.department || o.office || '').trim() === office,
                        ).length;
                        return (
                          <SelectItem
                            key={office}
                            value={office}
                            className="py-1.5 text-xs leading-relaxed"
                          >
                            {office} ({count})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {filteredOfficers.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs text-blue-600 font-medium hover:bg-blue-50 rounded-lg shrink-0 leading-relaxed"
                      onClick={toggleSelectAllFiltered}
                    >
                      {allFilteredSelected ? 'ដកចេញទាំងអស់' : 'ជ្រើសទាំងអស់'}
                    </Button>
                  )}
                </div>
              )}
            </div>
            <CommandList className="max-h-[280px] overflow-y-auto p-1">
              <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
                រកមិនឃើញមន្ត្រីឡើយ។
              </CommandEmpty>
              <CommandGroup>
                {filteredOfficers.map((officer) => {
                  const checked = value.includes(officer.id);
                  const fullNameKh =
                    `${officer.last_name_kh || ''} ${officer.first_name_kh || ''}`.trim();
                  const fullNameEn =
                    `${officer.last_name || ''} ${officer.first_name || ''}`.trim();
                  const displayName = fullNameKh || fullNameEn;
                  const deptDisplay = officer.department || officer.office || '';
                  return (
                    <CommandItem
                      key={officer.id}
                      onSelect={() => {
                        onChange(
                          checked
                            ? value.filter((id) => id !== officer.id)
                            : [...value, officer.id],
                        );
                      }}
                      className="items-center gap-3 py-2.5 px-3 rounded-xl cursor-pointer hover:bg-slate-50 aria-selected:bg-slate-100"
                    >
                      <Checkbox checked={checked} className="rounded-md" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-slate-900 leading-relaxed">
                          {displayName}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted-foreground leading-normal mt-0.5">
                          {officer.position} {deptDisplay ? `· ${deptDisplay}` : ''}
                        </p>
                      </div>
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4 shrink-0 text-blue-600',
                          checked ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Officers Clean Display Panel */}
      {selectedOfficers.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 space-y-2">
          {/* Header Summary Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800">
                បានជ្រើសរើស{' '}
                <span className="text-blue-600 font-bold">{selectedOfficers.length}</span> រូប
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedOfficers.length > 5 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <span>
                    {isExpanded ? 'បង្រួម' : `បង្ហាញទាំងអស់ (${selectedOfficers.length})`}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline transition-colors ml-1"
              >
                សម្អាតទាំងអស់
              </button>
            </div>
          </div>

          {/* Quick Filter when expanded */}
          {isExpanded && selectedOfficers.length > 8 && (
            <div className="relative pt-0.5">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="ស្វែងរកក្នុងបញ្ជីដែលបានជ្រើស..."
                value={selectedSearch}
                onChange={(e) => setSelectedSearch(e.target.value)}
                className="pl-8 h-8 text-xs rounded-lg bg-white border-slate-200"
              />
            </div>
          )}

          {/* Officer Pills List */}
          <div
            className={cn(
              'flex flex-wrap gap-1.5 pt-0.5',
              isExpanded && 'max-h-[160px] overflow-y-auto pr-1',
            )}
          >
            {visibleOfficers.map((officer) => {
              const fullNameKh =
                `${officer.last_name_kh || ''} ${officer.first_name_kh || ''}`.trim();
              const fullNameEn = `${officer.last_name || ''} ${officer.first_name || ''}`.trim();
              const displayName = fullNameKh || fullNameEn;

              return (
                <span
                  key={officer.id}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white text-slate-800 font-medium border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <span className="leading-relaxed">{displayName}</span>
                  <button
                    type="button"
                    title={`ដក ${displayName}`}
                    className="rounded-full p-0.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    onClick={() => onChange(value.filter((id) => id !== officer.id))}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}

            {!isExpanded && remainingCount > 0 && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-blue-50 text-blue-700 font-semibold border border-blue-200 hover:bg-blue-100 transition-colors leading-relaxed"
              >
                +{remainingCount} ផ្សេងទៀត...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function InvitationForm({
  open,
  onOpenChange,
  invitation,
  officers,
  mode,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation?: Invitation | null;
  officers: Officer[];
  mode: 'create' | 'edit' | 'assign';
  isPending: boolean;
  onSubmit: (values: InvitationFormValues) => Promise<void> | void;
}) {
  const uploadImageMutation = useUploadInvitationImage();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [category, setCategory] = useState<'internal' | 'external'>('internal');

  const activeOfficers = officers.filter((officer) => officer.status?.toUpperCase() === 'ACTIVE');
  const eligiblePriorityOfficers = activeOfficers.filter(
    (officer) => officer.invitation_priority === true,
  );
  const allOfficersList = activeOfficers.length > 0 ? activeOfficers : officers;

  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      subject: '',
      organization: '',
      type: 'incoming',
      category: 'internal',
      date: '',
      time: '',
      location: '',
      description: '',
      officers: [],
      imageIds: [],
      status: 'pending',
    },
  });

  const selectedCategory = form.watch('category') ?? category;
  const isInternal = selectedCategory === 'internal';

  // ផ្ទៃក្នុង (internal) = incoming -> only select eligible priority officers
  // ផ្ទៃក្រៅ (external) = outgoing -> select all active officers
  const currentOfficers = isInternal ? eligiblePriorityOfficers : allOfficersList;

  useEffect(() => {
    if (!open) {
      setPreviewUrls([]);
      return;
    }

    const initialCategory =
      (invitation?.category as 'internal' | 'external') ??
      (invitation?.type === 'outgoing' ? 'external' : 'internal');
    const initialType =
      (invitation?.type as 'incoming' | 'outgoing') ??
      (initialCategory === 'internal' ? 'incoming' : 'outgoing');

    setCategory(initialCategory);

    form.reset({
      subject: invitation?.subject ?? '',
      organization: invitation?.organization ?? '',
      type: initialType,
      category: initialCategory,
      date: invitation?.date ?? '',
      time: invitation?.time ?? '',
      location: invitation?.location ?? '',
      description: invitation?.description ?? '',
      officers: invitation?.assigned_officer_ids ?? [],
      imageIds: invitation?.imageIds ?? [],
      status: invitation?.status ?? 'pending',
    });

    if (invitation?.imageUrls && invitation.imageUrls.length > 0) {
      setPreviewUrls(invitation.imageUrls);
    }
  }, [form, invitation, open, mode]);

  const isAssignMode = mode === 'assign';

  const handleCategorySelect = (selected: 'internal' | 'external') => {
    setCategory(selected);
    form.setValue('category', selected);
    form.setValue('type', selected === 'internal' ? 'incoming' : 'outgoing');

    if (selected === 'internal') {
      const currentSelected = form.getValues('officers') ?? [];
      const eligibleIds = new Set(eligiblePriorityOfficers.map((o) => o.id));
      const validSelected = currentSelected.filter((id) => eligibleIds.has(id));
      if (validSelected.length !== currentSelected.length) {
        form.setValue('officers', validSelected);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader className="py-1">
          <DialogTitle className="page-title font-khmer-moul-light text-base leading-relaxed py-1">
            {mode === 'create'
              ? 'បង្កើតលិខិតអញ្ជើញថ្មី'
              : mode === 'assign'
                ? 'ចាត់តាំងមន្ត្រី'
                : 'កែសម្រួលព័ត៌មានលិខិតអញ្ជើញ'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              if (uploadImageMutation.isPending) {
                return;
              }
              await onSubmit(values);
              form.reset();
            })}
            className="space-y-5"
          >
            {isAssignMode ? (
              <div className="space-y-5">
                {/* Category Selection: ផ្ទៃក្នុង (Incoming) vs ផ្ទៃក្រៅ (Outgoing) */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ប្រភេទលិខិតអញ្ជើញ</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleCategorySelect('internal')}
                            className={cn(
                              'flex flex-col items-start p-3 border-2 rounded-xl transition text-left cursor-pointer',
                              field.value === 'internal' || category === 'internal'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700',
                            )}
                          >
                            <div className="flex items-center gap-2 font-medium text-sm">
                              <Building2 className="h-4 w-4" />
                              <span>លិខិតអញ្ជើញគណៈអភិបាល</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              ជ្រើសរើសបានតែមន្ត្រីមានអាទិភាព
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCategorySelect('external')}
                            className={cn(
                              'flex flex-col items-start p-3 border-2 rounded-xl transition text-left cursor-pointer',
                              field.value === 'external' || category === 'external'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700',
                            )}
                          >
                            <div className="flex items-center gap-2 font-medium text-sm">
                              <Globe className="h-4 w-4" />
                              <span>លិខិតអញ្ជើញផ្ទៃក្នុង</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              ជ្រើសរើសមន្ត្រីទាំងអស់បាន
                            </span>
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="officers"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline justify-between gap-2 py-0.5">
                        <FormLabel className="text-sm font-medium leading-relaxed text-slate-800">
                          សមាសភាពចូលរួម
                        </FormLabel>
                        <span className="text-xs text-muted-foreground font-normal leading-relaxed whitespace-nowrap">
                          {isInternal
                            ? `(មន្ត្រីមានអាទិភាព ${currentOfficers.length} រូប)`
                            : `(មន្ត្រីទាំងអស់ ${currentOfficers.length} រូប)`}
                        </span>
                      </div>
                      <FormControl>
                        <OfficerMultiSelect
                          officers={currentOfficers}
                          value={field.value ?? []}
                          onChange={field.onChange}
                          showOfficeFilter={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Category Selection: ផ្ទៃក្នុង (Incoming) vs ផ្ទៃក្រៅ (Outgoing) */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ប្រភេទលិខិតអញ្ជើញ</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleCategorySelect('internal')}
                            className={cn(
                              'flex flex-col items-start p-3 border-2 rounded-xl transition text-left cursor-pointer',
                              field.value === 'internal' || category === 'internal'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700',
                            )}
                          >
                            <div className="flex items-center gap-2 font-medium text-sm">
                              <Building2 className="h-4 w-4" />
                              <span>លិខិតអញ្ជើញគណៈអភិបាល</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              ជ្រើសរើសបានតែមន្ត្រីមានអាទិភាព
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCategorySelect('external')}
                            className={cn(
                              'flex flex-col items-start p-3 border-2 rounded-xl transition text-left cursor-pointer',
                              field.value === 'external' || category === 'external'
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700',
                            )}
                          >
                            <div className="flex items-center gap-2 font-medium text-sm">
                              <Globe className="h-4 w-4" />
                              <span>លិខិតអញ្ជើញផ្ទៃក្នុង</span>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              ជ្រើសរើសមន្ត្រីទាំងអស់បាន
                            </span>
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 1. officers -> សមាសភាពចូលរួម */}
                <FormField
                  control={form.control}
                  name="officers"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-baseline justify-between gap-2 py-0.5">
                        <FormLabel className="text-sm font-medium leading-relaxed text-slate-800">
                          សមាសភាពចូលរួម
                        </FormLabel>
                        <span className="text-xs text-muted-foreground font-normal leading-relaxed whitespace-nowrap">
                          {isInternal
                            ? `(មន្ត្រីមានអាទិភាព ${currentOfficers.length} រូប)`
                            : `(មន្ត្រីទាំងអស់ ${currentOfficers.length} រូប)`}
                        </span>
                      </div>
                      <FormControl>
                        <OfficerMultiSelect
                          officers={currentOfficers}
                          value={field.value ?? []}
                          onChange={field.onChange}
                          showOfficeFilter={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  {/* 2. subject -> បរិយាយ as a Textarea */}
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>បរិយាយ</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="ឧ. សិក្ខាសាលាផ្សព្វផ្សាយស្តីពី..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 3. date & time side-by-side */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>កាលបរិច្ឆេទ</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ម៉ោង</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 4. location -> ទីកន្លែង */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>ទីកន្លែង</FormLabel>
                        <FormControl>
                          <Input placeholder="ឧ. សណ្ឋាគារកាំបូឌីយ៉ាណា" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 5. organization -> ក្រោមអធិបតីភាព */}
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>ក្រោមអធិបតីភាព</FormLabel>
                        <FormControl>
                          <Input placeholder="ឧ. ឯកឧត្តម..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 6. description -> ចំណាំ */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>ចំណាំ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ឧ. ឯកសណ្ឋានការងារ"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 7. imageIds -> បញ្ចូលរូបភាព */}
                  <FormField
                    control={form.control}
                    name="imageIds"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>បញ្ចូលរូបភាព</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                id="invitation-image-upload"
                                onClick={(e) => e.stopPropagation()}
                                onChange={async (e) => {
                                  const files = e.target.files;
                                  if (!files || files.length === 0) return;

                                  const newIds: number[] = [];
                                  const newUrls: string[] = [];

                                  for (let i = 0; i < files.length; i++) {
                                    try {
                                      const result = await uploadImageMutation.mutateAsync(
                                        files[i],
                                      );
                                      newIds.push(result.id);
                                      newUrls.push(result.url);
                                    } catch (error: any) {
                                      toast.error(
                                        `បរាជ័យក្នុងការបញ្ចូលរូបភាព ${files[i].name}: ${error.message}`,
                                      );
                                    }
                                  }

                                  if (newIds.length > 0) {
                                    const currentIds = field.value ?? [];
                                    field.onChange([...currentIds, ...newIds]);
                                    setPreviewUrls((prev) => [...prev, ...newUrls]);
                                  }
                                }}
                                disabled={uploadImageMutation.isPending}
                              />
                              <label
                                htmlFor="invitation-image-upload"
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                  'flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:bg-slate-50 transition w-full',
                                  uploadImageMutation.isPending && 'opacity-50 pointer-events-none',
                                )}
                              >
                                {uploadImageMutation.isPending ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      កំពុងបញ្ជូន...
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-sm font-medium text-slate-700">
                                      ចុចទីនេះដើម្បីបញ្ចូលរូបភាពលិខិត
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      JPEG, PNG, WebP (ទំហំអតិបរមា 5MB)
                                    </span>
                                  </div>
                                )}
                              </label>
                            </div>

                            {previewUrls.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                {previewUrls.map((url, index) => {
                                  const resolvedUrl = resolveImageUrl(url) || url;
                                  return (
                                    <div
                                      key={url + index}
                                      className="relative rounded-lg border overflow-hidden bg-slate-50 flex justify-center items-center p-2 h-[150px]"
                                    >
                                      <img
                                        src={resolvedUrl}
                                        alt={`Invitation Document ${index + 1}`}
                                        className="h-full object-contain rounded"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full shadow hover:bg-destructive/90"
                                        onClick={() => {
                                          const currentIds = field.value ?? [];
                                          const nextIds = currentIds.filter(
                                            (_, idx) => idx !== index,
                                          );
                                          const nextUrls = previewUrls.filter(
                                            (_, idx) => idx !== index,
                                          );

                                          field.onChange(nextIds);
                                          setPreviewUrls(nextUrls);
                                        }}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                បោះបង់
              </Button>
              <Button type="submit" disabled={isPending || uploadImageMutation.isPending}>
                {uploadImageMutation.isPending
                  ? 'កំពុងបញ្ចូលរូបភាព...'
                  : isPending
                    ? 'កំពុងរក្សាទុក...'
                    : mode === 'create'
                      ? 'បង្កើតលិខិតអញ្ជើញ'
                      : mode === 'assign'
                        ? 'រក្សាទុកការចាត់តាំង'
                        : 'រក្សាទុក'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
