'use client';

import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AlertTriangle, CalendarClock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { type Shift, shiftFormSchema, type ShiftFormInput } from '@/lib/schemas';
import {
  getCheckInWindowLabel,
  getCheckOutWindowLabel,
  getLateAfterTime,
  mapShiftToFormValues,
  validateShiftInput,
} from '@/lib/shifts/utils';

const emptyValues: ShiftFormInput = {
  shift_name: '',
  shift_code: '',
  start_time: '08:00',
  end_time: '17:00',
  cross_midnight: false,
  grace_minutes: 0,
  check_in_open_before_minutes: 15,
  check_out_close_after_minutes: 30,
  status: 'active',
  effective_from: new Date().toISOString().slice(0, 10),
  effective_to: '',
  description: '',
};

interface ShiftFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: Shift | null;
  shifts: Shift[];
  readOnly: boolean;
  onSubmit: (values: ShiftFormInput) => Promise<void>;
}

export function ShiftFormSheet({
  open,
  onOpenChange,
  shift,
  shifts,
  readOnly,
  onSubmit,
}: ShiftFormSheetProps) {
  const isMobile = useIsMobile();
  const form = useForm<ShiftFormInput>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: shift ? mapShiftToFormValues(shift) : emptyValues,
  });

  const startTime = form.watch('start_time');
  const endTime = form.watch('end_time');
  const graceMinutes = Number(form.watch('grace_minutes') ?? 0);
  const checkInOpenBeforeMinutes = Number(form.watch('check_in_open_before_minutes') ?? 0);
  const checkOutCloseAfterMinutes = Number(form.watch('check_out_close_after_minutes') ?? 0);

  useEffect(() => {
    form.reset(shift ? mapShiftToFormValues(shift) : emptyValues);
  }, [form, shift, open]);

  useEffect(() => {
    if (endTime < startTime && !form.getValues('cross_midnight')) {
      form.setValue('cross_midnight', true, { shouldValidate: true });
    }
  }, [endTime, form, startTime]);

  const preview = useMemo(
    () => ({
      startTime,
      endTime,
      graceMinutes,
      checkInOpenBeforeMinutes,
      checkOutCloseAfterMinutes,
    }),
    [checkInOpenBeforeMinutes, checkOutCloseAfterMinutes, endTime, graceMinutes, startTime],
  );

  async function handleSubmit(values: ShiftFormInput) {
    const validation = validateShiftInput(values, shifts, shift?.id);

    if (!validation.success) {
      Object.entries(validation.fieldErrors).forEach(([field, errors]) => {
        if (errors?.[0]) {
          form.setError(field as keyof ShiftFormInput, { type: 'manual', message: errors[0] });
        }
      });
      return;
    }

    await onSubmit(values);
  }

  const content = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        <Form {...form}>
          <form
            id="shift-editor-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="shift_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ឈ្មោះវេន</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={readOnly} placeholder="វេនជំនួយពេលព្រឹក" />
                    </FormControl>
                    {/* <FormDescription>ត្រូវបំពេញ ហើយអាចវាយបានអតិបរមា 50 តួអក្សរ។</FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shift_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>កូដវេន</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={readOnly}
                        onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                        placeholder="SHIFT-AM"
                      />
                    </FormControl>
                    {/* <FormDescription>ត្រូវតែមានតែមួយក្នុងបញ្ជីបច្ចុប្បន្ន។</FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ម៉ោងចាប់ផ្តើម</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={readOnly} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ម៉ោងបញ្ចប់</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={readOnly} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cross_midnight"
              render={({ field }) => (
                <FormItem className="rounded-2xl border bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <FormLabel>ឆ្លងកាត់អធ្រាត្រ</FormLabel>
                      {/* <FormDescription>
                        បើកជម្រើសនេះ ប្រសិនបើវេនបញ្ចប់នៅថ្ងៃបន្ទាប់។
                      </FormDescription> */}
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        disabled={readOnly}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="grace_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ពេលយឺតអនុគ្រោះ</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={readOnly} min={0} type="number" />
                    </FormControl>
                    {/* <FormDescription>ចំនួននាទីអនុញ្ញាត មុននឹងកំណត់ថាមកយឺត។</FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="check_in_open_before_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>បើកឆែកចូលមុន</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={readOnly} min={0} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="check_out_close_after_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>បិទឆែកចេញក្រោយ</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={readOnly} min={0} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ស្ថានភាព</FormLabel>
                    <Select disabled={readOnly} onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="ជ្រើសរើសស្ថានភាព" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">កំពុងប្រើ</SelectItem>
                        <SelectItem value="inactive">មិនប្រើ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effective_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>មានប្រសិទ្ធភាពចាប់ពី</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={readOnly} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="effective_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>មានប្រសិទ្ធភាពដល់</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={readOnly}
                      type="date"
                      value={typeof field.value === 'string' ? field.value : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>សេចក្តីពិពណ៌នា</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={readOnly}
                      rows={4}
                      value={typeof field.value === 'string' ? field.value : ''}
                      placeholder="កំណត់សម្គាល់ខ្លីសម្រាប់ផ្នែកធនធានមនុស្ស ការចូលវត្តមាន ឬអ្នកគ្រប់គ្រងផ្នែក។"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div className="rounded-3xl border bg-slate-950 p-5 text-white">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarClock className="h-4 w-4" />
            មើលច្បាប់វត្តមានជាមុន
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/8 p-3">
              <p className="text-xs text-white/60">ពេលវេលាឆែកចូល</p>
              <p className="mt-1 font-medium">
                {getCheckInWindowLabel({
                  startTime: preview.startTime,
                  checkInOpenBeforeMinutes: preview.checkInOpenBeforeMinutes,
                })}
              </p>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <p className="text-xs text-white/60">ចាត់ទុកថាយឺតក្រោយ</p>
              <p className="mt-1 font-medium">
                {getLateAfterTime({
                  startTime: preview.startTime,
                  graceMinutes: preview.graceMinutes,
                })}
              </p>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <p className="text-xs text-white/60">ពេលវេលាឆែកចេញ</p>
              <p className="mt-1 font-medium">
                {getCheckOutWindowLabel({
                  endTime: preview.endTime,
                  checkOutCloseAfterMinutes: preview.checkOutCloseAfterMinutes,
                })}
              </p>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <p className="text-xs text-white/60">លក្ខណៈវេនឆ្លងថ្ងៃ</p>
              <p className="mt-1 font-medium">
                {form.watch('cross_midnight') ? 'បន្តទៅថ្ងៃបន្ទាប់' : 'បញ្ចប់នៅថ្ងៃដដែល'}
              </p>
            </div>
          </div>
        </div>

        {Object.keys(form.formState.errors).length > 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              សូមកែប្រែកំហុសដែលបានបន្លិច មុនពេលរក្សាទុក។
            </div>
          </div>
        ) : null}
      </div>
      {!readOnly ? (
        <div className="border-t px-4 py-4">
          <Button className="w-full" form="shift-editor-form" type="submit">
            <Save className="mr-2 h-4 w-4" />
            {shift ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតវេន'}
          </Button>
        </div>
      ) : null}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[96dvh] max-h-[96dvh] overflow-hidden">
          <DrawerHeader className="shrink-0">
            <DrawerTitle>{shift ? 'កែសម្រួលវេន' : 'បង្កើតវេនថ្មី'}</DrawerTitle>
            {/* <DrawerDescription>
              កំណត់ម៉ោងវត្តមាន ពេលអនុគ្រោះ និងកាលបរិច្ឆេទមានប្រសិទ្ធភាព។
            </DrawerDescription> */}
          </DrawerHeader>
          {content}
          <DrawerFooter className="shrink-0" />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="h-dvh w-full overflow-hidden sm:max-w-2xl">
        <SheetHeader className="shrink-0">
          <SheetTitle>{shift ? 'កែសម្រួលវេន' : 'បង្កើតវេនថ្មី'}</SheetTitle>
          {/* <SheetDescription>
            កំណត់ម៉ោងវត្តមាន ពេលអនុគ្រោះ និងកាលបរិច្ឆេទមានប្រសិទ្ធភាព។
          </SheetDescription> */}
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
