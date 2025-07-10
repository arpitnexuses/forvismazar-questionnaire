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

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [totalClients, totalSubmissions, completedThisMonth] = await Promise.all([
      Client.countDocuments({ createdBy: currentUser.userId }),
      Submission.countDocuments({ submittedBy: currentUser.userId }),
      Submission.countDocuments({
        submittedBy: currentUser.userId,
        createdAt: { $gte: startOfMonth },
      }),
    ])

    // Calculate pending assessments (clients without recent submissions)
    const clientsWithRecentSubmissions = await Submission.distinct("client", {
      submittedBy: currentUser.userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    })

    const pendingAssessments = totalClients - clientsWithRecentSubmissions.length

    return NextResponse.json({
      totalClients,
      totalSubmissions,
      pendingAssessments: Math.max(0, pendingAssessments),
      completedThisMonth,
    })
  } catch (error) {
    console.error("Team dashboard stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
