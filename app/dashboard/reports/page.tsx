"use client"

import useSWR from "swr"
import { format } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const CHART_COLORS = [
  "oklch(0.45 0.18 250)",
  "oklch(0.60 0.15 170)",
  "oklch(0.65 0.20 45)",
  "oklch(0.55 0.12 310)",
  "oklch(0.70 0.15 80)",
]

function actionBadge(action: string) {
  switch (action) {
    case "CREATE":
      return <Badge className="bg-emerald-100 text-emerald-700 border-0">Create</Badge>
    case "UPDATE":
      return <Badge className="bg-blue-100 text-blue-700 border-0">Update</Badge>
    case "DELETE":
      return <Badge className="bg-red-100 text-red-700 border-0">Delete</Badge>
    case "APPROVE":
      return <Badge className="bg-amber-100 text-amber-700 border-0">Approve</Badge>
    case "LOGIN":
      return <Badge className="bg-indigo-100 text-indigo-700 border-0">Login</Badge>
    default:
      return <Badge variant="secondary">{action}</Badge>
  }
}

export default function ReportsPage() {
  const { data, isLoading } = useSWR("/api/reports", fetcher)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analytics and system reports</p>
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-[250px]" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  const attendanceChartData = data?.attendanceSummary?.map((dept: { department: string; approved: number; pending: number; absent: number }) => ({
    department: dept.department,
    Approved: Number(dept.approved),
    Pending: Number(dept.pending),
    Absent: Number(dept.absent),
  })) || []

  const missionPieData = data?.missionSummary?.map((m: { status: string; count: number }) => ({
    name: m.status,
    value: Number(m.count),
  })) || []

  const leaveChartData = data?.leaveSummary?.map((l: { leave_type: string; total: number; approved: number; pending: number }) => ({
    type: l.leave_type,
    Total: Number(l.total),
    Approved: Number(l.approved),
    Pending: Number(l.pending),
  })) || []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Analytics and system reports</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Attendance by Department</CardTitle>
                <CardDescription>Breakdown of attendance status per department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={attendanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="department" className="text-xs" tick={{ fill: "oklch(0.50 0.02 250)" }} />
                    <YAxis className="text-xs" tick={{ fill: "oklch(0.50 0.02 250)" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.91 0.01 250)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="Approved" fill="oklch(0.60 0.15 170)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pending" fill="oklch(0.65 0.20 45)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Absent" fill="oklch(0.577 0.245 27.325)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mission Status</CardTitle>
                <CardDescription>Distribution of mission statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={missionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                    >
                      {missionPieData.map((_: { name: string; value: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.91 0.01 250)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Leave Requests by Type</CardTitle>
                <CardDescription>Summary of leave requests by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={leaveChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fill: "oklch(0.50 0.02 250)", fontSize: 12 }} />
                    <YAxis dataKey="type" type="category" width={100} tick={{ fill: "oklch(0.50 0.02 250)", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.91 0.01 250)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="Total" fill="oklch(0.45 0.18 250)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Approved" fill="oklch(0.60 0.15 170)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Pending" fill="oklch(0.65 0.20 45)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invitation Response Rates</CardTitle>
              <CardDescription>Assignment and response breakdown per invitation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invitation</TableHead>
                      <TableHead>Total Assigned</TableHead>
                      <TableHead>Accepted</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Declined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.invitationStats?.map((inv: { title: string; total_assigned: number; accepted: number; pending: number; declined: number }, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{inv.title}</TableCell>
                        <TableCell>{inv.total_assigned}</TableCell>
                        <TableCell><span className="text-emerald-600 font-medium">{inv.accepted}</span></TableCell>
                        <TableCell><span className="text-amber-600 font-medium">{inv.pending}</span></TableCell>
                        <TableCell><span className="text-red-600 font-medium">{inv.declined}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Log</CardTitle>
              <CardDescription>Recent system actions and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Record ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.auditLog?.map((log: { id: number; timestamp: string; full_name: string; action: string; table_name: string; record_id: number }) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {log.timestamp ? format(new Date(log.timestamp), "MMM d, yyyy HH:mm") : "-"}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{log.full_name || "System"}</TableCell>
                        <TableCell>{actionBadge(log.action)}</TableCell>
                        <TableCell className="text-sm font-mono">{log.table_name}</TableCell>
                        <TableCell className="text-sm">#{log.record_id}</TableCell>
                      </TableRow>
                    ))}
                    {(!data?.auditLog || data.auditLog.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-12">No audit logs found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
