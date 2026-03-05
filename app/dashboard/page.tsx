"use client"

import useSWR from "swr"
import {
  Users,
  ClipboardCheck,
  Mail,
  Target,
  CalendarOff,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function StatsLoading() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function statusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return <Badge className="bg-emerald-100 text-emerald-700 border-0">Approved</Badge>
    case "PENDING":
      return <Badge className="bg-amber-100 text-amber-700 border-0">Pending</Badge>
    case "ABSENT":
      return <Badge className="bg-red-100 text-red-700 border-0">Absent</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function DashboardPage() {
  const { data, isLoading } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 30000,
  })

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of the officer management system</p>
        </div>
        <StatsLoading />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of the officer management system</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Officers"
          value={data.officers?.total ?? 0}
          description={`${data.officers?.active ?? 0} active, ${data.officers?.on_leave ?? 0} on leave`}
          icon={Users}
        />
        <StatCard
          title="Today's Attendance"
          value={data.attendance?.total ?? 0}
          description={`${data.attendance?.approved ?? 0} approved, ${data.attendance?.pending ?? 0} pending`}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Active Invitations"
          value={data.invitations?.active ?? 0}
          description={`${data.invitations?.total ?? 0} total invitations`}
          icon={Mail}
        />
        <StatCard
          title="Pending Missions"
          value={data.missions?.pending ?? 0}
          description={`${data.missions?.total ?? 0} total, ${data.missions?.approved ?? 0} approved`}
          icon={Target}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Attendance</CardTitle>
                <CardDescription>Latest attendance records</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Officer</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Work (min)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentAttendance?.map(
                  (record: {
                    id: number
                    first_name: string
                    last_name: string
                    department: string
                    total_work_minutes: number
                    status: string
                  }) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.first_name} {record.last_name}
                      </TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{record.total_work_minutes}</TableCell>
                      <TableCell>{statusBadge(record.status)}</TableCell>
                    </TableRow>
                  )
                )}
                {(!data.recentAttendance || data.recentAttendance.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Quick Stats</CardTitle>
                <CardDescription>Pending items requiring attention</CardDescription>
              </div>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100">
                    <CalendarOff className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pending Leave Requests</p>
                    <p className="text-xs text-muted-foreground">Requires approval</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{data.leaves?.pending ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100">
                    <Target className="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pending Missions</p>
                    <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{data.missions?.pending ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-100">
                    <ClipboardCheck className="h-4 w-4 text-red-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Absent Today</p>
                    <p className="text-xs text-muted-foreground">Officers not present</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{data.attendance?.absent ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100">
                    <Clock className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Active Invitations</p>
                    <p className="text-xs text-muted-foreground">Upcoming events</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{data.invitations?.active ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
