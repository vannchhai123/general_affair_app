import { NextResponse } from "next/server"
import { shifts, getNextShiftId } from "@/lib/mock-data"

export async function GET() {
  try {
    const sorted = [...shifts].sort((a, b) =>
      a.start_time.localeCompare(b.start_time)
    )
    return NextResponse.json(sorted)
  } catch (error) {
    console.error("Shifts fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch shifts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, start_time, end_time, is_active } = body

    const newShift = {
      id: getNextShiftId(),
      name,
      start_time,
      end_time,
      is_active: is_active ?? true,
    }

    shifts.push(newShift)
    return NextResponse.json(newShift, { status: 201 })
  } catch (error) {
    console.error("Shift create error:", error)
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 })
  }
}
