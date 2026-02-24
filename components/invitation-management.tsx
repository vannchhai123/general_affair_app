"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Mail, Send, Calendar, MapPin, Eye } from "lucide-react"
import { type Invitation, initialInvitations } from "@/lib/data"
import { toast } from "sonner"

const emptyInvitation: Omit<Invitation, "id"> = {
  title: "",
  eventDate: "",
  location: "",
  invitedOfficers: 0,
  confirmedOfficers: 0,
  status: "pending",
  createdAt: new Date().toISOString().split("T")[0],
}

export function InvitationManagement() {
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null)
  const [editingInvitation, setEditingInvitation] = useState<Invitation | null>(null)
  const [form, setForm] = useState<Omit<Invitation, "id">>(emptyInvitation)

  const filtered = invitations.filter((inv) => {
    const matchesSearch =
      inv.title.toLowerCase().includes(search.toLowerCase()) ||
      inv.location.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function openCreate() {
    setEditingInvitation(null)
    setForm(emptyInvitation)
    setDialogOpen(true)
  }

  function openEdit(invitation: Invitation) {
    setEditingInvitation(invitation)
    setForm({
      title: invitation.title,
      eventDate: invitation.eventDate,
      location: invitation.location,
      invitedOfficers: invitation.invitedOfficers,
      confirmedOfficers: invitation.confirmedOfficers,
      status: invitation.status,
      createdAt: invitation.createdAt,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.title || !form.eventDate || !form.location) {
      toast.error("Please fill in all required fields")
      return
    }
    if (editingInvitation) {
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === editingInvitation.id ? { ...inv, ...form } : inv))
      )
      toast.success("Invitation updated successfully")
    } else {
      const newInvitation: Invitation = {
        ...form,
        id: `INV-${String(invitations.length + 1).padStart(3, "0")}`,
      }
      setInvitations((prev) => [...prev, newInvitation])
      toast.success("Invitation created successfully")
    }
    setDialogOpen(false)
  }

  function handleDelete(id: string) {
    setInvitations((prev) => prev.filter((inv) => inv.id !== id))
    toast.success("Invitation removed")
  }

  function handleSendInvitation(id: string) {
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "sent" as const } : inv))
    )
    toast.success("Invitation sent to officers")
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success border-success/20"
      case "sent": return "bg-primary/10 text-primary border-primary/20"
      case "pending": return "bg-warning/10 text-warning border-warning/20"
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20"
      default: return ""
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Invitation Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage event invitations for officers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Invitation
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-card-foreground sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">{editingInvitation ? "Edit Invitation" : "Create Invitation"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Event Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-input border-border text-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Event Date *</Label>
                  <Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="bg-input border-border text-foreground" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Location *</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-input border-border text-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Invited Officers</Label>
                  <Input type="number" value={form.invitedOfficers} onChange={(e) => setForm({ ...form, invitedOfficers: Number(e.target.value) })} className="bg-input border-border text-foreground" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Invitation["status"] })}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingInvitation ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: invitations.length, color: "text-foreground" },
          { label: "Pending", value: invitations.filter(i => i.status === "pending").length, color: "text-warning" },
          { label: "Sent", value: invitations.filter(i => i.status === "sent").length, color: "text-primary" },
          { label: "Completed", value: invitations.filter(i => i.status === "completed").length, color: "text-success" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50 bg-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invitations..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
              <Mail className="h-4 w-4 text-primary" />
              Invitation Records
            </CardTitle>
            <span className="text-xs text-muted-foreground">{filtered.length} invitation(s)</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Event</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Location</TableHead>
                <TableHead className="text-muted-foreground">Confirmation</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow key={inv.id} className="border-border">
                  <TableCell className="font-mono text-xs text-muted-foreground">{inv.id}</TableCell>
                  <TableCell className="font-medium text-card-foreground">{inv.title}</TableCell>
                  <TableCell className="text-card-foreground">
                    <span className="flex items-center gap-1.5 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {inv.eventDate}
                    </span>
                  </TableCell>
                  <TableCell className="text-card-foreground">
                    <span className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {inv.location}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">{inv.confirmedOfficers}/{inv.invitedOfficers}</span>
                      <Progress
                        value={inv.invitedOfficers > 0 ? (inv.confirmedOfficers / inv.invitedOfficers) * 100 : 0}
                        className="h-1.5 bg-secondary"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor(inv.status)}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedInvitation(inv); setDetailOpen(true) }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="sr-only">View {inv.title}</span>
                      </Button>
                      {inv.status === "pending" && (
                        <Button variant="ghost" size="sm" onClick={() => handleSendInvitation(inv.id)} className="text-muted-foreground hover:text-primary">
                          <Send className="h-3.5 w-3.5" />
                          <span className="sr-only">Send {inv.title}</span>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(inv)} className="text-muted-foreground hover:text-foreground">
                        <Edit className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit {inv.title}</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete {inv.title}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No invitations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Invitation Details</DialogTitle>
          </DialogHeader>
          {selectedInvitation && (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Event</span>
                <span className="text-sm font-medium text-card-foreground">{selectedInvitation.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Date</span>
                  <span className="text-sm text-card-foreground">{selectedInvitation.eventDate}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Location</span>
                  <span className="text-sm text-card-foreground">{selectedInvitation.location}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Invited</span>
                  <span className="text-sm text-card-foreground">{selectedInvitation.invitedOfficers}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Confirmed</span>
                  <span className="text-sm text-card-foreground">{selectedInvitation.confirmedOfficers}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge variant="outline" className={`w-fit ${statusColor(selectedInvitation.status)}`}>
                  {selectedInvitation.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
