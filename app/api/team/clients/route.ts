import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Client from "@/lib/models/Client"
import Submission from "@/lib/models/Submission"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== "team") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const clients = await Client.find({ createdBy: currentUser.userId }).sort({ createdAt: -1 })

    // Get submission data for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const submissions = await Submission.find({ 
          client: client._id,
          submittedBy: currentUser.userId 
        }).sort({ createdAt: -1 })

        const lastSubmission = submissions[0]
        
        return {
          _id: client._id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          createdAt: client.createdAt,
          lastAssessment: lastSubmission?.createdAt,
          totalAssessments: submissions.length,
        }
      })
    )

    return NextResponse.json(clientsWithStats)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const client = new Client({
      name: name.trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      company: company?.trim() || undefined,
      createdBy: currentUser.userId,
    })

    await client.save()

    return NextResponse.json({
      _id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      createdAt: client.createdAt,
      totalAssessments: 0,
    })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 