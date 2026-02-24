"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Target, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react"
import { type Mission, initialMissions, initialOfficers } from "@/lib/data"
import { toast } from "sonner"

type MissionFormData = Omit<Mission, "id">

const emptyForm: MissionFormData = {
  officer_id: 0,
  approved_id: null,
  start_date: "",
  end_date: "",
  purpose: "",
  location: "",
  status: "Pending",
  approved_date: null,
}

export function MissionManagement() {
  const [missions, setMissions] = useState<Mission[]>(initialMissions)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMission, setEditingMission] = useState<Mission | null>(null)
  const [form, setForm] = useState<MissionFormData>(emptyForm)

  const officerMap = new Map(initialOfficers.map((o) => [o.id, `${o.first_name} ${o.last_name}`]))

  const filtered = missions.filter((m) => {
    const officerName = officerMap.get(m.officer_id)?.toLowerCase() || ""
    const matchesSearch =
      m.purpose.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase()) ||
      officerName.includes(search.toLowerCase()) ||
      m.id.toString().includes(search)
    const matchesStatus = statusFilter === "all" || m.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: missions.length,
    pending: missions.filter((m) => m.status === "Pending").length,
    approved: missions.filter((m) => m.status === "Approved").length,
    inProgress: missions.filter((m) => m.status === "In Progress").length,
    completed: missions.filter((m) => m.status === "Completed").length,
  }

  function openCreate() {
    setEditingMission(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(mission: Mission) {
    setEditingMission(mission)
    setForm({
      officer_id: mission.officer_id,
      approved_id: mission.approved_id,
      start_date: mission.start_date,
      end_date: mission.end_date,
      purpose: mission.purpose,
      location: mission.location,
      status: mission.status,
      approved_date: mission.approved_date,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.officer_id || !form.start_date || !form.end_date || !form.purpose || !form.location) {
      toast.error("Please fill in all required fields")
      return
    }

    if (editingMission) {
      setMissions((prev) =>
        prev.map((m) => (m.id === editingMission.id ? { ...m, ...form } : m))
      )
      toast.success("Mission updated successfully")
    } else {
      const newId = Math.max(...missions.map((m) => m.id), 0) + 1
      const newMission: Mission = { ...form, id: newId }
      setMissions((prev) => [...prev, newMission])
      toast.success("New mission created")
    }
    setDialogOpen(false)
  }

  function handleDelete(id: number) {
    setMissions((prev) => prev.filter((m) => m.id !== id))
    toast.success("Mission removed")
  }

  function handleApprove(mission: Mission) {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === mission.id
          ? { ...m, status: "Approved" as const, approved_id: 1, approved_date: new Date().toISOString().split("T")[0] }
          : m
      )
    )
    toast.success(`Mission #${mission.id} approved`)
  }

  function handleReject(mission: Mission) {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === mission.id ? { ...m, status: "Rejected" as const } : m
      )
    )
    toast.success(`Mission #${mission.id} rejected`)
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-success/10 text-success border-success/20"
      case "Pending": return "bg-warning/10 text-warning border-warning/20"
      case "Rejected": return "bg-destructive/10 text-destructive border-destructive/20"
      case "In Progress": return "bg-primary/10 text-primary border-primary/20"
      case "Completed": return "bg-muted text-muted-foreground border-border"
      default: return ""
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircle className="h-3.5 w-3.5" />
      case "Pending": return <Clock className="h-3.5 w-3.5" />
      case "Rejected": return <XCircle className="h-3.5 w-3.5" />
      case "In Progress": return <Loader2 className="h-3.5 w-3.5" />
      case "Completed": return <CheckCircle className="h-3.5 w-3.5" />
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mission Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Create, approve, and track officer missions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Mission
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-card-foreground sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">{editingMission ? "Edit Mission" : "Create New Mission"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Officer *</Label>
                <Select
                  value={form.officer_id ? form.officer_id.toString() : ""}
                  onValueChange={(v) => setForm({ ...form, officer_id: parseInt(v) })}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select officer" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {initialOfficers
                      .filter((o) => o.status === "active")
                      .map((o) => (
                        <SelectItem key={o.id} value={o.id.toString()}>
                          {o.first_name} {o.last_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Mission["status"] })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Start Date *</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">End Date *</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <Label className="text-foreground">Location *</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Enter mission location"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <Label className="text-foreground">Purpose *</Label>
                <Textarea
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="Describe the mission purpose..."
                  rows={3}
                  className="bg-input border-border text-foreground resize-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Approved By (Officer ID)</Label>
                <Select
                  value={form.approved_id ? form.approved_id.toString() : "none"}
                  onValueChange={(v) => setForm({ ...form, approved_id: v === "none" ? null : parseInt(v) })}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Not yet approved" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="none">Not assigned</SelectItem>
                    {initialOfficers
                      .filter((o) => ["Captain", "Lieutenant"].includes(o.position))
                      .map((o) => (
                        <SelectItem key={o.id} value={o.id.toString()}>
                          {o.first_name} {o.last_name} ({o.position})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Approved Date</Label>
                <Input
                  type="date"
                  value={form.approved_date || ""}
                  onChange={(e) => setForm({ ...form, approved_date: e.target.value || null })}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingMission ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "Total", value: stats.total, icon: Target, color: "text-foreground" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-warning" },
          { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-success" },
          { label: "In Progress", value: stats.inProgress, icon: Loader2, color: "text-primary" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-muted-foreground" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
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
                placeholder="Search by purpose, location, or officer..."
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
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
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
              <Target className="h-4 w-4 text-primary" />
              Mission Records
            </CardTitle>
            <span className="text-xs text-muted-foreground">{filtered.length} mission(s)</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Officer</TableHead>
                <TableHead className="text-muted-foreground">Purpose</TableHead>
                <TableHead className="text-muted-foreground">Location</TableHead>
                <TableHead className="text-muted-foreground">Start</TableHead>
                <TableHead className="text-muted-foreground">End</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Approved By</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((mission) => (
                <TableRow key={mission.id} className="border-border">
                  <TableCell className="font-mono text-xs text-muted-foreground">{mission.id}</TableCell>
                  <TableCell className="font-medium text-card-foreground whitespace-nowrap">
                    {officerMap.get(mission.officer_id) || `Officer #${mission.officer_id}`}
                  </TableCell>
                  <TableCell className="text-card-foreground text-sm max-w-[200px] truncate" title={mission.purpose}>
                    {mission.purpose}
                  </TableCell>
                  <TableCell className="text-card-foreground text-sm">{mission.location}</TableCell>
                  <TableCell className="text-card-foreground text-sm whitespace-nowrap">{mission.start_date}</TableCell>
                  <TableCell className="text-card-foreground text-sm whitespace-nowrap">{mission.end_date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${statusColor(mission.status)} flex w-fit items-center gap-1`}>
                      {statusIcon(mission.status)}
                      {mission.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-card-foreground text-sm">
                    {mission.approved_id
                      ? officerMap.get(mission.approved_id) || `#${mission.approved_id}`
                      : <span className="text-muted-foreground">--</span>}
                    {mission.approved_date && (
                      <span className="block text-xs text-muted-foreground">{mission.approved_date}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {mission.status === "Pending" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleApprove(mission)} className="text-success hover:text-success hover:bg-success/10">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span className="sr-only">Approve mission {mission.id}</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleReject(mission)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="sr-only">Reject mission {mission.id}</span>
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(mission)} className="text-muted-foreground hover:text-foreground">
                        <Edit className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit mission {mission.id}</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(mission.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete mission {mission.id}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    No missions found.
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
