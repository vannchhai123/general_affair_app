'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const permissionSchema = z.object({
  permission_name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
});

export type PermissionFormData = z.infer<typeof permissionSchema>;

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission?: {
    id: number;
    permission_name: string;
    description?: string | null;
    category?: string | null;
  };
  onSubmit: (data: PermissionFormData) => void;
}

const categories = [
  'Officers',
  'Attendance',
  'Missions',
  'Leave Management',
  'Invitations',
  'Shifts',
  'Reports',
  'System',
  'General',
];

export function PermissionDialog({
  open,
  onOpenChange,
  permission,
  onSubmit,
}: PermissionDialogProps) {
  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      permission_name: '',
      description: '',
      category: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        permission_name: permission?.permission_name || '',
        description: permission?.description || '',
        category: permission?.category || '',
      });
    }
  }, [open, permission, form]);

  const handleSubmit = (data: PermissionFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{permission ? 'Edit Permission' : 'Create Permission'}</DialogTitle>
          <DialogDescription>
            {permission
              ? 'Update the permission details and settings.'
              : 'Add a new permission to the system.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="permission_name">Permission Name</Label>
              <Input
                id="permission_name"
                placeholder="e.g., officer.view"
                {...form.register('permission_name')}
              />
              {form.formState.errors.permission_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.permission_name.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this permission allows..."
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(value) => form.setValue('category', value)}
                defaultValue={form.getValues('category')}
                value={form.watch('category')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{permission ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
