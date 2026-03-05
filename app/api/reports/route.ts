import { NextResponse } from "next/server"
import {
  attendance,
  officers,
  invitations,
  leaveRequests,
  missions,
  auditLog,
} from "@/lib/mock-data"

export async function GET() {
  try {
    // Attendance summary by department
    const departments = [...new Set(officers.map((o) => o.department))]
    const attendanceSummary = departments.map((dept) => {
      const deptAttendance = attendance.filter((a) => a.department === dept)
      return {
        department: dept,
        total_records: deptAttendance.length,
        approved: deptAttendance.filter((a) => a.status === "APPROVED").length,
        pending: deptAttendance.filter((a) => a.status === "PENDING").length,
        absent: deptAttendance.filter((a) => a.status === "ABSENT").length,
        avg_work_minutes:
          deptAttendance.length > 0
            ? Math.round(
                deptAttendance.reduce((sum, a) => sum + a.total_work_minutes, 0) /
                  deptAttendance.length
              )
            : 0,
        avg_late_minutes:
          deptAttendance.length > 0
            ? Math.round(
                deptAttendance.reduce((sum, a) => sum + a.total_late_minutes, 0) /
                  deptAttendance.length
              )
            : 0,
      }
    })

    // Officers by department
    const officersByDepartment = departments.flatMap((dept) => {
      const statuses = [...new Set(officers.filter((o) => o.department === dept).map((o) => o.status))]
      return statuses.map((status) => ({
        department: dept,
        count: officers.filter((o) => o.department === dept && o.status === status).length,
        status,
      }))
    })

    // Invitation response rates
    const invitationStats = invitations.map((inv) => ({
      title: inv.title,
      total_assigned: inv.total_assigned,
      accepted: inv.accepted_count,
      pending: inv.pending_count,
      declined: inv.total_assigned - inv.accepted_count - inv.pending_count,
    }))

    // Leave request summary
    const leaveTypes = [...new Set(leaveRequests.map((l) => l.leave_type))]
    const leaveSummary = leaveTypes.map((type) => {
      const typeLeaves = leaveRequests.filter((l) => l.leave_type === type)
      return {
        leave_type: type,
        total: typeLeaves.length,
        total_days: typeLeaves.reduce((sum, l) => sum + l.total_days, 0),
        approved: typeLeaves.filter((l) => l.status === "Approved").length,
        pending: typeLeaves.filter((l) => l.status === "Pending").length,
      }
    })

    // Mission summary
    const missionStatuses = [...new Set(missions.map((m) => m.status))]
    const missionSummary = missionStatuses.map((status) => ({
      status,
      count: missions.filter((m) => m.status === status).length,
    }))

    return NextResponse.json({
      attendanceSummary,
      officersByDepartment,
      invitationStats,
      leaveSummary,
      missionSummary,
      auditLog: [...auditLog].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    })
  } catch (error) {
    console.error("Reports fetch error:", error)
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 })
  }
}
