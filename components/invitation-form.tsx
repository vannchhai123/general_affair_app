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
  const label =
    selectedOfficers.length > 0
      ? `បានជ្រើសរើសមន្ត្រីចំនួន ${selectedOfficers.length} រូប`
      : 'ចាត់តាំងមន្ត្រី';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
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
              await onSubmit(values);
              form.reset();
            })}
            className="space-y-5"
          >
            {!isAssignMode ? (
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>កម្មវត្ថុ / ប្រធានបទ</FormLabel>
                      <FormControl>
                        <Input placeholder="ឧ. កិច្ចប្រជុំបូកសរុបការងារប្រចាំត្រីមាស" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>អង្គភាព / ស្ថាប័នផ្ញើមក</FormLabel>
                      <FormControl>
                        <Input placeholder="ឧ. ក្រសួងសាធារណការ និងដឹកជញ្ជូន" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ប្រភេទលិខិត</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ជ្រើសរើសប្រភេទ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="incoming">លិខិតចូល (Incoming)</SelectItem>
                          <SelectItem value="outgoing">លិខិតចេញ (Outgoing)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>ទីតាំង</FormLabel>
                      <FormControl>
                        <Input placeholder="ឧ. សាលប្រជុំកោះពេជ្រ អគារ A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>ពិពណ៌នាបន្ថែម</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="សូមបញ្ជាក់អំពីខ្លឹមសារ កម្មវិធីការងារ ឬតម្រូវការផ្សេងៗ..."
                          rows={4}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ស្ថានភាព</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageIds"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>លិខិតអញ្ជើញ (រូបភាព / Image Documents)</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              id="invitation-image-upload"
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;

                                const newIds: number[] = [];
                                const newUrls: string[] = [];

                                for (let i = 0; i < files.length; i++) {
                                  try {
                                    const result = await uploadImageMutation.mutateAsync(files[i]);
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
                                  toast.success(`បានបញ្ចូលរូបភាពចំនួន ${newIds.length} ជោគជ័យ`);
                                }
                              }}
                              disabled={uploadImageMutation.isPending}
                            />
                            <label
                              htmlFor="invitation-image-upload"
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
                                      const nextIds = currentIds.filter((_, idx) => idx !== index);
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
            ) : null}

            <FormField
              control={form.control}
              name="officers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>មន្ត្រីដែលចាត់តាំង</FormLabel>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                បោះបង់
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
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
