'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OfficerDialog, type OfficerFormData } from '@/components/officer-dialog';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Officer extends OfficerFormData {
  id: number;
  user_id: number | null;
  username: string | null;
}

function statusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-100 text-emerald-700 border-0">Active</Badge>;
    case 'on_leave':
      return <Badge className="bg-amber-100 text-amber-700 border-0">On Leave</Badge>;
    case 'inactive':
      return <Badge className="bg-muted text-muted-foreground border-0">Inactive</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function OfficersPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOfficer, setEditOfficer] = useState<Officer | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (department && department !== 'all') queryParams.set('department', department);
  if (status && status !== 'all') queryParams.set('status', status);

  const { data: officers, mutate } = useSWR<Officer[]>(
    `/api/officers?${queryParams.toString()}`,
    fetcher,
  );

  async function handleCreate(data: OfficerFormData) {
    const res = await fetch('/api/officers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error('Failed to create officer');
      return;
    }
    toast.success('Officer created successfully');
    mutate();
  }

  async function handleUpdate(data: OfficerFormData) {
    if (!editOfficer) return;
    const res = await fetch(`/api/officers/${editOfficer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error('Failed to update officer');
      return;
    }
    toast.success('Officer updated successfully');
    setEditOfficer(undefined);
    mutate();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/officers/${deleteId}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Failed to delete officer');
      return;
    }
    toast.success('Officer deleted successfully');
    setDeleteId(null);
    mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Officers</h1>
          <p className="text-muted-foreground">Manage officer records and information</p>
        </div>
        <Button
          onClick={() => {
            setEditOfficer(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Officer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Officer List</CardTitle>
          <CardDescription>
            {officers ? `${officers.length} officers found` : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search officers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officers?.map((officer) => {
                    const initials =
                      `${officer.first_name?.[0] || ''}${officer.last_name?.[0] || ''}`.toUpperCase();
                    return (
                      <TableRow key={officer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {officer.first_name} {officer.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">{officer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{officer.position}</TableCell>
                        <TableCell className="text-sm">{officer.department}</TableCell>
                        <TableCell className="text-sm">{officer.phone}</TableCell>
                        <TableCell>{statusBadge(officer.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditOfficer(officer);
                                  setDialogOpen(true);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteId(officer.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {officers?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                        No officers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <OfficerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        officer={editOfficer}
        onSubmit={editOfficer ? handleUpdate : handleCreate}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Officer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this officer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
