import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Client from "@/lib/models/Client"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== "team") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, company } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ message: "Client name is required" }, { status: 400 })
    }

    const client = await Client.findOne({
      _id: params.id,
      createdBy: currentUser.userId,
    })

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    client.name = name.trim()
    client.email = email?.trim() || undefined
    client.phone = phone?.trim() || undefined
    client.company = company?.trim() || undefined

    await client.save()

    return NextResponse.json({
      _id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      createdAt: client.createdAt,
    })
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== "team") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const client = await Client.findOne({
      _id: params.id,
      createdBy: currentUser.userId,
    })

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    await Client.deleteOne({ _id: params.id })

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 