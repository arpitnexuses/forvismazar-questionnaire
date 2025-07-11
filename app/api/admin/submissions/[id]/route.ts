import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Submission from "@/lib/models/Submission"
import { getCurrentUser } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const submission = await Submission.findById(params.id)
      .populate("client", "name email company")
      .populate("questionnaire", "title description sections")
      .populate("submittedBy", "name email")

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Error fetching submission:", error)
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
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const submission = await Submission.findByIdAndDelete(params.id)

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Submission deleted successfully" })
  } catch (error) {
    console.error("Error deleting submission:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 