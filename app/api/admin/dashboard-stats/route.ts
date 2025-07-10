import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Questionnaire from "@/lib/models/Questionnaire"
import Client from "@/lib/models/Client"
import Submission from "@/lib/models/Submission"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const [totalUsers, totalQuestionnaires, totalSubmissions, activeClients] = await Promise.all([
      User.countDocuments({ role: "team" }),
      Questionnaire.countDocuments(),
      Submission.countDocuments(),
      Client.countDocuments(),
    ])

    return NextResponse.json({
      totalUsers,
      totalQuestionnaires,
      totalSubmissions,
      activeClients,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
