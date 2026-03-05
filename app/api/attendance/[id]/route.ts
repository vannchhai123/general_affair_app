import { NextResponse } from "next/server"
import { attendance } from "@/lib/mock-data"
import { getSession } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body
    const session = await getSession()

    const index = attendance.findIndex((a) => a.id === parseInt(id))
    if (index === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    attendance[index] = {
      ...attendance[index],
      status,
      approved_by: status === "APPROVED" && session ? session.id : attendance[index].approved_by,
      approved_at: status === "APPROVED" ? new Date().toISOString() : attendance[index].approved_at,
    }

    return NextResponse.json(attendance[index])
  } catch (error) {
    console.error("Attendance update error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
