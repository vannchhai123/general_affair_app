"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileBarChart, Download, FileText, Users, ClipboardCheck, Mail, Loader2 } from "lucide-react"
import { initialOfficers, initialInvitations, initialAttendance } from "@/lib/data"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"

type ReportType = "officer" | "attendance" | "invitation"

interface GeneratedReport {
  id: string
  title: string
  type: ReportType
  generatedAt: string
  dateRange: string
  recordCount: number
}

const COLORS = [
  "oklch(0.65 0.19 250)",
  "oklch(0.7 0.15 170)",
  "oklch(0.75 0.15 60)",
  "oklch(0.6 0.2 300)",
  "oklch(0.65 0.2 25)",
]

export function ReportGeneration() {
  const [reportType, setReportType] = useState<ReportType>("attendance")
  const [dateFrom, setDateFrom] = useState("2026-02-01")
  const [dateTo, setDateTo] = useState("2026-02-24")
  const [generating, setGenerating] = useState(false)
  const [reports, setReports] = useState<GeneratedReport[]>([
    { id: "RPT-001", title: "Monthly Attendance Report", type: "attendance", generatedAt: "2026-02-20 14:30", dateRange: "Feb 1-20, 2026", recordCount: 156 },
    { id: "RPT-002", title: "Officer Status Summary", type: "officer", generatedAt: "2026-02-18 10:15", dateRange: "Feb 2026", recordCount: 8 },
    { id: "RPT-003", title: "Invitation Summary Report", type: "invitation", generatedAt: "2026-02-15 09:00", dateRange: "Jan-Feb 2026", recordCount: 6 },
  ])

  async function handleGenerate() {
    setGenerating(true)
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500))

    const typeLabels = { officer: "Officer", attendance: "Attendance", invitation: "Invitation" }
    const newReport: GeneratedReport = {
      id: `RPT-${String(reports.length + 1).padStart(3, "0")}`,
      title: `${typeLabels[reportType]} Report`,
      type: reportType,
      generatedAt: new Date().toLocaleString(),
      dateRange: `${dateFrom} to ${dateTo}`,
      recordCount: reportType === "officer" ? initialOfficers.length : reportType === "invitation" ? initialInvitations.length : initialAttendance.length,
    }
    setReports(prev => [newReport, ...prev])
    toast.success("Report generated successfully")
    setGenerating(false)
  }

  // Report preview data
  const attendanceByStatus = [
    { status: "Present", count: initialAttendance.filter(a => a.status === "present").length },
    { status: "Absent", count: initialAttendance.filter(a => a.status === "absent").length },
    { status: "Late", count: initialAttendance.filter(a => a.status === "late").length },
    { status: "Half Day", count: initialAttendance.filter(a => a.status === "half-day").length },
  ]

  const officersByDept = [
    { dept: "Operations", count: initialOfficers.filter(o => o.department === "Operations").length },
    { dept: "Investigations", count: initialOfficers.filter(o => o.department === "Investigations").length },
    { dept: "Patrol", count: initialOfficers.filter(o => o.department === "Patrol").length },
    { dept: "Traffic", count: initialOfficers.filter(o => o.department === "Traffic").length },
    { dept: "Community", count: initialOfficers.filter(o => o.department === "Community").length },
  ]

  const invitationsByStatus = [
    { name: "Pending", value: initialInvitations.filter(i => i.status === "pending").length },
    { name: "Sent", value: initialInvitations.filter(i => i.status === "sent").length },
    { name: "Completed", value: initialInvitations.filter(i => i.status === "completed").length },
    { name: "Cancelled", value: initialInvitations.filter(i => i.status === "cancelled").length },
  ].filter(i => i.value > 0)

  const dailyHours = [
    { date: "Feb 20", hours: 8.5 },
    { date: "Feb 21", hours: 8.8 },
    { date: "Feb 22", hours: 7.2 },
    { date: "Feb 23", hours: 8.6 },
    { date: "Feb 24", hours: 8.1 },
  ]

  const typeIcon = (type: ReportType) => {
    switch (type) {
      case "officer": return <Users className="h-3.5 w-3.5" />
      case "attendance": return <ClipboardCheck className="h-3.5 w-3.5" />
      case "invitation": return <Mail className="h-3.5 w-3.5" />
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Report Generation</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate and view reports from officer, invitation, and attendance data</p>
      </div>

      {/* Generate Report Form */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
            <FileBarChart className="h-4 w-4 text-primary" />
            Generate New Report
          </CardTitle>
          <CardDescription>Select report type and date range to generate a report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-2 flex-1">
              <Label className="text-foreground">Report Type</Label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="officer">Officer Report</SelectItem>
                  <SelectItem value="invitation">Invitation Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-input border-border text-foreground" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-input border-border text-foreground" />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="shrink-0">
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileBarChart className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Tabs defaultValue="preview" className="gap-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="preview">Report Preview</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Attendance Status Chart */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Attendance by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceByStatus}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.27 0.005 260)" />
                      <XAxis dataKey="status" tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.17 0.005 260)",
                          border: "1px solid oklch(0.27 0.005 260)",
                          borderRadius: "8px",
                          color: "oklch(0.95 0 0)",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" fill="oklch(0.65 0.19 250)" radius={[4, 4, 0, 0]} name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Officers by Department */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Officers by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={officersByDept} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.27 0.005 260)" />
                      <XAxis type="number" tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="dept" tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.17 0.005 260)",
                          border: "1px solid oklch(0.27 0.005 260)",
                          borderRadius: "8px",
                          color: "oklch(0.95 0 0)",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" fill="oklch(0.7 0.15 170)" radius={[0, 4, 4, 0]} name="Officers" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Avg Daily Hours Trend */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Average Daily Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyHours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.27 0.005 260)" />
                      <XAxis dataKey="date" tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }} axisLine={false} tickLine={false} domain={[6, 10]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.17 0.005 260)",
                          border: "1px solid oklch(0.27 0.005 260)",
                          borderRadius: "8px",
                          color: "oklch(0.95 0 0)",
                          fontSize: "12px",
                        }}
                      />
                      <Line type="monotone" dataKey="hours" stroke="oklch(0.75 0.15 60)" strokeWidth={2} dot={{ fill: "oklch(0.75 0.15 60)", r: 4 }} name="Hours" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Invitation Status Pie */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Invitation Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 h-[240px]">
                  <div className="flex-1 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={invitationsByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {invitationsByStatus.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "oklch(0.17 0.005 260)",
                            border: "1px solid oklch(0.27 0.005 260)",
                            borderRadius: "8px",
                            color: "oklch(0.95 0 0)",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2">
                    {invitationsByStatus.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                        <span className="text-xs font-medium text-card-foreground ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Generated Reports
                </CardTitle>
                <span className="text-xs text-muted-foreground">{reports.length} report(s)</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">ID</TableHead>
                    <TableHead className="text-muted-foreground">Report</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Date Range</TableHead>
                    <TableHead className="text-muted-foreground">Records</TableHead>
                    <TableHead className="text-muted-foreground">Generated</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">{report.id}</TableCell>
                      <TableCell className="font-medium text-card-foreground">{report.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 w-fit">
                          {typeIcon(report.type)}
                          {report.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-card-foreground text-sm">{report.dateRange}</TableCell>
                      <TableCell className="text-card-foreground">{report.recordCount}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{report.generatedAt}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast.success("Report downloaded")} className="text-muted-foreground hover:text-foreground">
                          <Download className="h-3.5 w-3.5" />
                          <span className="sr-only">Download {report.title}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
