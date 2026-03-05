import { NextResponse } from "next/server"
import { missions, getNextMissionId, officers } from "@/lib/mock-data"

export async function GET() {
  try {
    const sorted = [...missions].sort((a, b) =>
      b.start_date.localeCompare(a.start_date)
    )
    return NextResponse.json(sorted)
  } catch (error) {
    console.error("Missions fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch missions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { officer_id, start_date, end_date, purpose, location } = body

    const officer = officers.find((o) => o.id === officer_id)
    if (!officer) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 })
    }

    const newMission = {
      id: getNextMissionId(),
      officer_id,
      approved_by: null,
      start_date,
      end_date,
      purpose: purpose || "",
      location: location || "",
      status: "Pending",
      approved_date: null,
      first_name: officer.first_name,
      last_name: officer.last_name,
      department: officer.department,
      approver_name: null,
    }

    missions.unshift(newMission)
    return NextResponse.json(newMission, { status: 201 })
  } catch (error) {
    console.error("Mission create error:", error)
    return NextResponse.json({ error: "Failed to create mission" }, { status: 500 })
  }
}
