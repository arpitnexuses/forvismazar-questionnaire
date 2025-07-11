import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

// In a real application, you'd want to create a proper Draft model
// For now, we'll just return success to demonstrate the functionality

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== "team") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { client, questionnaire, answers, currentSection } = body

    if (!client || !questionnaire || !answers) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // In a real implementation, you would save this to a Draft model
    // For now, we'll just return success
    console.log("Draft saved:", {
      client,
      questionnaire,
      answers,
      currentSection,
      submittedBy: currentUser.userId,
      savedAt: new Date(),
    })

    return NextResponse.json({
      message: "Draft saved successfully",
      savedAt: new Date(),
    })
  } catch (error) {
    console.error("Error saving draft:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 