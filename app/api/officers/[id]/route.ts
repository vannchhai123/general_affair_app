import { NextResponse } from "next/server"
import { officers } from "@/lib/mock-data"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { first_name, last_name, email, position, department, phone, status } = body

    const index = officers.findIndex((o) => o.id === parseInt(id))
    if (index === -1) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 })
    }

    officers[index] = {
      ...officers[index],
      first_name,
      last_name,
      email: email || "",
      position: position || "",
      department: department || "",
      phone: phone || "",
      status: status || "active",
    }

    return NextResponse.json(officers[index])
  } catch (error) {
    console.error("Officer update error:", error)
    return NextResponse.json({ error: "Failed to update officer" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const index = officers.findIndex((o) => o.id === parseInt(id))
    if (index === -1) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 })
    }

    officers.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Officer delete error:", error)
    return NextResponse.json({ error: "Failed to delete officer" }, { status: 500 })
  }
}
