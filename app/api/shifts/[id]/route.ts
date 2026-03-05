import { NextResponse } from "next/server"
import { shifts } from "@/lib/mock-data"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, start_time, end_time, is_active } = body

    const index = shifts.findIndex((s) => s.id === parseInt(id))
    if (index === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    shifts[index] = { ...shifts[index], name, start_time, end_time, is_active }
    return NextResponse.json(shifts[index])
  } catch (error) {
    console.error("Shift update error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const index = shifts.findIndex((s) => s.id === parseInt(id))
    if (index === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    shifts.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Shift delete error:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
