import { NextResponse } from "next/server"
import { leaveRequests, getNextLeaveId, officers } from "@/lib/mock-data"

export async function GET() {
  try {
    const sorted = [...leaveRequests].sort((a, b) =>
      b.start_date.localeCompare(a.start_date)
    )
    return NextResponse.json(sorted)
  } catch (error) {
    console.error("Leave requests fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { officer_id, start_date, end_date, leave_type, total_days, reason } = body

    const officer = officers.find((o) => o.id === officer_id)
    if (!officer) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 })
    }

    const newLeave = {
      id: getNextLeaveId(),
      officer_id,
      approved_by: null,
      start_date,
      end_date,
      leave_type,
      total_days,
      reason: reason || "",
      status: "Pending",
      approved_at: null,
      first_name: officer.first_name,
      last_name: officer.last_name,
      department: officer.department,
      approver_name: null,
    }

    leaveRequests.unshift(newLeave)
    return NextResponse.json(newLeave, { status: 201 })
  } catch (error) {
    console.error("Leave request create error:", error)
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 })
  }
}
