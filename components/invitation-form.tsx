'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, Users, Upload, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import type { Invitation, Officer } from '@/lib/schemas';

function OfficerMultiSelect({
  officers,
  value,
  onChange,
}: {
  officers: Officer[];
  value: number[];
  onChange: (value: number[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedOfficers = officers.filter((officer) => value.includes(officer.id));
  const label = selectedOfficers.length > 0 ? `${selectedOfficers.length} រូប` : 'ចាត់តាំងមន្ត្រី';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="justify-between">
          <span className="flex items-center gap-2 truncate">
            <Users className="h-4 w-4 text-muted-foreground" />
            {label}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <Command>
          <CommandInput placeholder="ស្វែងរកមន្ត្រី..." />
          <CommandList>
            <CommandEmpty>រកមិនឃើញមន្ត្រីឡើយ។</CommandEmpty>
            <CommandGroup>
              {officers.map((officer) => {
                const checked = value.includes(officer.id);
                const fullNameKh =
                  `${officer.first_name_kh || ''} ${officer.last_name_kh || ''}`.trim();
                const fullNameEn = `${officer.first_name} ${officer.last_name}`.trim();
                const displayName = fullNameKh ? `${fullNameKh} (${fullNameEn})` : fullNameEn;
                return (
                  <CommandItem
                    key={officer.id}
                    onSelect={() => {
                      onChange(
                        checked ? value.filter((id) => id !== officer.id) : [...value, officer.id],
                      );
                    }}
                    className="items-start gap-3 py-3"
                  >
                    <Checkbox checked={checked} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {officer.position} · {officer.department}
                      </p>
                    </div>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        checked ? 'opacity-100 text-primary' : 'opacity-0',
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

  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      subject: '',
      organization: '',
      type: 'incoming',
      date: '',
      time: '',
      location: '',
      description: '',
      officers: [],
      imageIds: [],
      status: 'pending',
    },
  });

  useEffect(() => {
    if (!open) {
      setPreviewUrls([]);
      return;
    }

    form.reset({
      subject: invitation?.subject ?? '',
      organization: invitation?.organization ?? '',
      type: invitation?.type ?? 'incoming',
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
  }, [form, invitation, open]);

  const isAssignMode = mode === 'assign';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="page-title font-khmer-moul-light text-base">
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
              <FormField
                control={form.control}
                name="officers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>សមាសភាពចូលរួម</FormLabel>
                    <FormControl>
                      <OfficerMultiSelect
                        officers={officers}
                        value={field.value ?? []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-5">
                {/* 1. officers -> សមាសភាពចូលរួម at the top */}
                <FormField
                  control={form.control}
                  name="officers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>សមាសភាពចូលរួម</FormLabel>
                      <FormControl>
                        <OfficerMultiSelect
                          officers={officers}
                          value={field.value ?? []}
                          onChange={field.onChange}
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
                                {previewUrls.map((url, index) => (
                                  <div
                                    key={url}
                                    className="relative rounded-lg border overflow-hidden bg-slate-50 flex justify-center items-center p-2 h-[150px]"
                                  >
                                    <img
                                      src={url}
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
                                ))}
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
