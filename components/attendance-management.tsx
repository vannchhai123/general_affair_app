'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ClipboardCheck, Clock, UserCheck, UserX, Edit } from 'lucide-react';
import { type AttendanceRecord, initialAttendance, initialOfficers } from '@/lib/data';
import { toast } from 'sonner';

export function AttendanceManagement() {
  const [records, setRecords] = useState<AttendanceRecord[]>(initialAttendance);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('2026-02-24');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editForm, setEditForm] = useState({
    checkIn: '',
    checkOut: '',
    status: '' as AttendanceRecord['status'],
  });

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.officerName.toLowerCase().includes(search.toLowerCase()) ||
        r.officerId.toString().toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesDate = !dateFilter || r.date === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [records, search, statusFilter, dateFilter]);

  const todayRecords = useMemo(
    () => records.filter((r) => r.date === dateFilter),
    [records, dateFilter],
  );
  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const absentCount = todayRecords.filter((r) => r.status === 'absent').length;
  const lateCount = todayRecords.filter((r) => r.status === 'late').length;
  const avgHours =
    todayRecords.length > 0
      ? (
          todayRecords.reduce((sum, r) => sum + r.hours, 0) /
          todayRecords.filter((r) => r.hours > 0).length
        ).toFixed(1)
      : '0';

  function openEdit(record: AttendanceRecord) {
    setEditingRecord(record);
    setEditForm({ checkIn: record.checkIn, checkOut: record.checkOut, status: record.status });
    setEditDialogOpen(true);
  }

  function handleSaveEdit() {
    if (!editingRecord) return;
    const hours =
      editForm.checkIn && editForm.checkOut
        ? Math.round(
            ((new Date(`2026-01-01T${editForm.checkOut}`).getTime() -
              new Date(`2026-01-01T${editForm.checkIn}`).getTime()) /
              3600000) *
              100,
          ) / 100
        : 0;

    setRecords((prev) =>
      prev.map((r) =>
        r.id === editingRecord.id
          ? {
              ...r,
              checkIn: editForm.checkIn,
              checkOut: editForm.checkOut,
              status: editForm.status,
              hours: Math.max(0, hours),
            }
          : r,
      ),
    );
    toast.success('Attendance record updated');
    setEditDialogOpen(false);
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-success/10 text-success border-success/20';
      case 'absent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'late':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'half-day':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage officer attendance records
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 border border-success/20">
                <UserCheck className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-xl font-bold text-success">{presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 border border-destructive/20">
                <UserX className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Absent</p>
                <p className="text-xl font-bold text-destructive">{absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 border border-warning/20">
                <Clock className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Late</p>
                <p className="text-xl font-bold text-warning">{lateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <ClipboardCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Hours</p>
                <p className="text-xl font-bold text-primary">{avgHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by officer name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-44 bg-input border-border text-foreground"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-input border-border text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Attendance Records
            </CardTitle>
            <span className="text-xs text-muted-foreground">{filtered.length} record(s)</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Officer ID</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Check In</TableHead>
                <TableHead className="text-muted-foreground">Check Out</TableHead>
                <TableHead className="text-muted-foreground">Hours</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((record) => (
                <TableRow key={record.id} className="border-border">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {record.officerId}
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground">
                    {record.officerName}
                  </TableCell>
                  <TableCell className="text-card-foreground">{record.date}</TableCell>
                  <TableCell className="font-mono text-sm text-card-foreground">
                    {record.checkIn || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-card-foreground">
                    {record.checkOut || '-'}
                  </TableCell>
                  <TableCell className="text-card-foreground">
                    {record.hours > 0 ? `${record.hours}h` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(record)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit attendance for {record.officerName}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Edit Attendance Record</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Officer</span>
                <span className="text-sm font-medium text-card-foreground">
                  {editingRecord.officerName} ({editingRecord.officerId})
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Check In</Label>
                  <Input
                    type="time"
                    value={editForm.checkIn}
                    onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Check Out</Label>
                  <Input
                    type="time"
                    value={editForm.checkOut}
                    onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm({ ...editForm, status: v as AttendanceRecord['status'] })
                  }
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="half-day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Update</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
