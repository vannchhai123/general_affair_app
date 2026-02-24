"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Users } from "lucide-react"
import { type Officer, initialOfficers } from "@/lib/data"
import { toast } from "sonner"

type OfficerFormData = Omit<Officer, "id">

const emptyForm: OfficerFormData = {
  user_id: 0,
  first_name: "",
  last_name: "",
  email: "",
  position: "",
  department: "",
  phone: "",
  status: "active",
}

export function OfficerManagement() {
  const [officers, setOfficers] = useState<Officer[]>(initialOfficers)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null)
  const [form, setForm] = useState<OfficerFormData>(emptyForm)

  const filtered = officers.filter((o) => {
    const fullName = `${o.first_name} ${o.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.department.toLowerCase().includes(search.toLowerCase()) ||
      o.position.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function openCreate() {
    setEditingOfficer(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(officer: Officer) {
    setEditingOfficer(officer)
    setForm({
      user_id: officer.user_id,
      first_name: officer.first_name,
      last_name: officer.last_name,
      email: officer.email,
      position: officer.position,
      department: officer.department,
      phone: officer.phone,
      status: officer.status,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.first_name || !form.last_name || !form.position || !form.department) {
      toast.error("Please fill in all required fields")
      return
    }

    if (editingOfficer) {
      setOfficers((prev) =>
        prev.map((o) => (o.id === editingOfficer.id ? { ...o, ...form } : o))
      )
      toast.success("Officer record updated successfully")
    } else {
      const newId = Math.max(...officers.map((o) => o.id), 0) + 1
      const newUserId = Math.max(...officers.map((o) => o.user_id), 0) + 1
      const newOfficer: Officer = {
        ...form,
        id: newId,
        user_id: form.user_id || newUserId,
      }
      setOfficers((prev) => [...prev, newOfficer])
      toast.success("New officer record created")
    }
    setDialogOpen(false)
  }

  function handleDelete(id: number) {
    setOfficers((prev) => prev.filter((o) => o.id !== id))
    toast.success("Officer record removed")
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success border-success/20"
      case "inactive": return "bg-destructive/10 text-destructive border-destructive/20"
      case "on-leave": return "bg-warning/10 text-warning border-warning/20"
      default: return ""
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Officer Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage officer records and details</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Officer
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-card-foreground sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">{editingOfficer ? "Edit Officer" : "Add New Officer"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">First Name *</Label>
                <Input
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="Enter first name"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Last Name *</Label>
                <Input
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Enter last name"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="officer@dept.gov"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1-555-0000"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Position *</Label>
                <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {["Officer", "Detective", "Sergeant", "Lieutenant", "Captain"].map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Department *</Label>
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {["Operations", "Investigations", "Patrol", "Traffic", "Community"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">User ID</Label>
                <Input
                  type="number"
                  value={form.user_id || ""}
                  onChange={(e) => setForm({ ...form, user_id: parseInt(e.target.value) || 0 })}
                  placeholder="Auto-assigned"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Officer["status"] })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingOfficer ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, position, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-input border-border text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
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
              <Users className="h-4 w-4 text-primary" />
              Officer Records
            </CardTitle>
            <span className="text-xs text-muted-foreground">{filtered.length} officer(s)</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">User ID</TableHead>
                <TableHead className="text-muted-foreground">First Name</TableHead>
                <TableHead className="text-muted-foreground">Last Name</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Position</TableHead>
                <TableHead className="text-muted-foreground">Department</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((officer) => (
                <TableRow key={officer.id} className="border-border">
                  <TableCell className="font-mono text-xs text-muted-foreground">{officer.id}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{officer.user_id}</TableCell>
                  <TableCell className="font-medium text-card-foreground">{officer.first_name}</TableCell>
                  <TableCell className="font-medium text-card-foreground">{officer.last_name}</TableCell>
                  <TableCell className="text-card-foreground text-sm">{officer.email}</TableCell>
                  <TableCell className="text-card-foreground">{officer.position}</TableCell>
                  <TableCell className="text-card-foreground">{officer.department}</TableCell>
                  <TableCell className="text-card-foreground text-sm">{officer.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor(officer.status)}>
                      {officer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(officer)} className="text-muted-foreground hover:text-foreground">
                        <Edit className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit {officer.first_name} {officer.last_name}</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(officer.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete {officer.first_name} {officer.last_name}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    No officers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
