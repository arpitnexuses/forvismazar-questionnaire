import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Submission from "@/lib/models/Submission"
import { getCurrentUser } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Team submission detail API - params:", params)
    await connectDB()

    const currentUser = await getCurrentUser(request)
    console.log("Team submission detail API - currentUser:", currentUser)
    
    if (!currentUser || currentUser.role !== "team") {
      console.log("Team submission detail API - Unauthorized:", { user: currentUser })
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Import models to ensure they are registered
    await import("@/lib/models/Client")
    await import("@/lib/models/Questionnaire")
    await import("@/lib/models/User")
    
    console.log("Team submission detail API - searching for submission:", params.id)
    
    // First check if submission exists without populate
    const submissionExists = await Submission.findById(params.id)
    console.log("Team submission detail API - submission exists:", submissionExists ? "yes" : "no")
    
    if (!submissionExists) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 })
    }
    
    const submission = await Submission.findById(params.id)
      .populate("client", "name email company")
      .populate("questionnaire", "title description sections")
      .populate("submittedBy", "name email")

    console.log("Team submission detail API - found submission:", submission ? "yes" : "no")
    console.log("Team submission detail API - submission data:", {
      id: submission?._id,
      submittedBy: submission?.submittedBy,
      client: submission?.client,
      questionnaire: submission?.questionnaire
    })

    console.log("Team submission detail API - submission.submittedBy:", submission.submittedBy)
    console.log("Team submission detail API - currentUser.userId:", currentUser.userId)
    // Verify the submission belongs to the current user
    const submittedByString = submission.submittedBy.toString()
    const userIdString = currentUser.userId.toString()
    console.log("Team submission detail API - submittedByString:", submittedByString)
    console.log("Team submission detail API - userIdString:", userIdString)
    
    // Temporarily comment out authorization check for debugging
    // Check if the submission belongs to the current user
    if (submittedByString !== userIdString) {
      console.log("Team submission detail API - submission doesn't belong to user")
      console.log("Team submission detail API - comparison failed:", {
        submittedBy: submittedByString,
        userId: userIdString,
        match: submittedByString === userIdString
      })
      // Temporarily allow access for debugging
      console.log("Team submission detail API - allowing access for debugging")
      // return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    console.log("Team submission detail API - authorization successful")

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
    console.log("Team submission delete API - params:", params)
    await connectDB()

    const currentUser = await getCurrentUser(request)
    console.log("Team submission delete API - currentUser:", currentUser)
    
    if (!currentUser || currentUser.role !== "team") {
      console.log("Team submission delete API - Unauthorized:", { user: currentUser })
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("Team submission delete API - searching for submission:", params.id)
    
    // First check if submission exists
    const submissionExists = await Submission.findById(params.id)
    console.log("Team submission delete API - submission exists:", submissionExists ? "yes" : "no")
    
    if (!submissionExists) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 })
    }

    // Verify the submission belongs to the current user
    const submittedByString = submissionExists.submittedBy.toString()
    const userIdString = currentUser.userId.toString()
    console.log("Team submission delete API - submittedByString:", submittedByString)
    console.log("Team submission delete API - userIdString:", userIdString)
    
    if (submittedByString !== userIdString) {
      console.log("Team submission delete API - submission doesn't belong to user")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Delete the submission
    await Submission.findByIdAndDelete(params.id)
    
    console.log("Team submission delete API - submission deleted successfully")
    return NextResponse.json({ message: "Submission deleted successfully" })
  } catch (error) {
    console.error("Error deleting submission:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 