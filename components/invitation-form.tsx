'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, Users } from 'lucide-react';
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
      status: 'pending',
    },
  });

  useEffect(() => {
    if (!open) {
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
      status: invitation?.status ?? 'pending',
    });
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
                          <SelectItem value="pending">កំពុងរង់ចាំ (Pending)</SelectItem>
                          <SelectItem value="accepted">បានទទួលយក (Accepted)</SelectItem>
                          <SelectItem value="rejected">បានបដិសេធ (Rejected)</SelectItem>
                          <SelectItem value="completed">បានបញ្ចប់ (Completed)</SelectItem>
                        </SelectContent>
                      </Select>
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
