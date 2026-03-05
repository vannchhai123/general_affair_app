import { NextResponse } from "next/server"
import { missions } from "@/lib/mock-data"
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

    const index = missions.findIndex((m) => m.id === parseInt(id))
    if (index === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    missions[index] = {
      ...missions[index],
      status,
      approved_by: status === "Approved" && session ? session.id : missions[index].approved_by,
      approved_date: status === "Approved" ? new Date().toISOString().split("T")[0] : missions[index].approved_date,
      approver_name: status === "Approved" && session ? session.full_name : missions[index].approver_name,
    }

    return NextResponse.json(missions[index])
  } catch (error) {
    console.error("Mission update error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const index = missions.findIndex((m) => m.id === parseInt(id))
    if (index === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    missions.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mission delete error:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
