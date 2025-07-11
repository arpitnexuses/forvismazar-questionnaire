import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Submission from "@/lib/models/Submission"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Import models to ensure they are registered
    await import("@/lib/models/Client")
    await import("@/lib/models/Questionnaire")
    await import("@/lib/models/User")
    
    const submissions = await Submission.find()
      .populate("client", "name email company")
      .populate("questionnaire", "title description")
      .populate("submittedBy", "name email")
      .sort({ submittedAt: -1 })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 