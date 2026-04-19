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
      ? `${selectedOfficers.length} officer${selectedOfficers.length > 1 ? 's' : ''} selected`
      : 'Assign officers';

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
          <CommandInput placeholder="Search officers..." />
          <CommandList>
            <CommandEmpty>No officers found.</CommandEmpty>
            <CommandGroup>
              {officers.map((officer) => {
                const checked = value.includes(officer.id);

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
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {officer.first_name} {officer.last_name}
                      </p>
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
          <DialogTitle>
            {mode === 'create'
              ? 'Create Invitation'
              : mode === 'assign'
                ? 'Assign Officers'
                : 'Edit Invitation'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Capture invitation details, assign officers, and define the current workflow state.'
              : mode === 'assign'
                ? 'Update the assigned officers for this invitation.'
                : 'Adjust the invitation details and keep stakeholders aligned.'}
          </DialogDescription>
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
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Quarterly strategy briefing" {...field} />
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
                      <FormLabel>Organization</FormLabel>
                      <FormControl>
                        <Input placeholder="Ministry of Public Works" {...field} />
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
                      <FormLabel>Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="incoming">Incoming</SelectItem>
                          <SelectItem value="outgoing">Outgoing</SelectItem>
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
                      <FormLabel>Date</FormLabel>
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
                      <FormLabel>Time</FormLabel>
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
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="National Convention Center" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Outline the purpose, agenda, and attendance expectations."
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
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
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
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="officers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Officers</FormLabel>
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
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'Saving...'
                  : mode === 'create'
                    ? 'Create Invitation'
                    : mode === 'assign'
                      ? 'Save Assignments'
                      : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
