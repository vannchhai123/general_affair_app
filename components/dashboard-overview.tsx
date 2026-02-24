'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, ClipboardCheck, FileBarChart, TrendingUp, Clock } from 'lucide-react';
import { initialOfficers, initialInvitations, initialAttendance } from '@/lib/data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const stats = [
  {
    title: 'Total Officers',
    value: initialOfficers.length.toString(),
    description: `${initialOfficers.filter((o) => o.status === 'active').length} active`,
    icon: Users,
  },
  {
    title: 'Active Invitations',
    value: initialInvitations
      .filter((i) => i.status === 'sent' || i.status === 'pending')
      .length.toString(),
    description: `${initialInvitations.length} total`,
    icon: Mail,
  },
  {
    title: "Today's Attendance",
    value: `${initialAttendance.filter((a) => a.date === '2026-02-24' && a.status === 'present').length}/${initialAttendance.filter((a) => a.date === '2026-02-24').length}`,
    description: 'Officers present today',
    icon: ClipboardCheck,
  },
  {
    title: 'Reports Generated',
    value: '24',
    description: 'This month',
    icon: FileBarChart,
  },
];

const weeklyAttendance = [
  { day: 'Mon', present: 7, absent: 1 },
  { day: 'Tue', present: 6, absent: 2 },
  { day: 'Wed', present: 8, absent: 0 },
  { day: 'Thu', present: 5, absent: 3 },
  { day: 'Fri', present: 7, absent: 1 },
];

const departmentData = [
  { name: 'Operations', value: 2 },
  { name: 'Investigations', value: 2 },
  { name: 'Patrol', value: 2 },
  { name: 'Traffic', value: 1 },
  { name: 'Community', value: 1 },
];

const COLORS = [
  'oklch(0.68 0.17 150)',
  'oklch(0.6 0.13 170)',
  'oklch(0.75 0.12 130)',
  'oklch(0.55 0.1 190)',
  'oklch(0.8 0.14 140)',
];

export function DashboardOverview() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your officer management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50 bg-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                  <span className="text-2xl font-bold text-card-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.description}</span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Weekly Attendance */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Weekly Attendance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttendance} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.27 0.01 155)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'oklch(0.6 0 0)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'oklch(0.6 0 0)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.17 0.01 155)',
                      border: '1px solid oklch(0.27 0.01 155)',
                      borderRadius: '8px',
                      color: 'oklch(0.95 0 0)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="present"
                    fill="oklch(0.68 0.17 150)"
                    radius={[4, 4, 0, 0]}
                    name="Present"
                  />
                  <Bar
                    dataKey="absent"
                    fill="oklch(0.577 0.245 27.325)"
                    radius={[4, 4, 0, 0]}
                    name="Absent"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Department Distribution
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 h-[260px]">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {departmentData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.17 0.01 155)',
                        border: '1px solid oklch(0.27 0.01 155)',
                        borderRadius: '8px',
                        color: 'oklch(0.95 0 0)',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {departmentData.map((dept, index) => (
                  <div key={dept.name} className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-xs text-muted-foreground">{dept.name}</span>
                    <span className="text-xs font-medium text-card-foreground ml-auto">
                      {dept.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Recent Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {[
              { action: 'James Wilson checked in', time: '08:00 AM', type: 'attendance' },
              {
                action: 'Annual Training Conference invitation sent',
                time: 'Yesterday',
                type: 'invitation',
              },
              { action: 'Emily Davis record updated', time: 'Yesterday', type: 'officer' },
              { action: 'Monthly attendance report generated', time: '2 days ago', type: 'report' },
              { action: 'Sarah Chen promoted to Lieutenant', time: '3 days ago', type: 'officer' },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm text-card-foreground">{activity.action}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
