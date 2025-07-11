import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Questionnaire from "@/lib/models/Questionnaire"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== "team") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Create a simple test questionnaire
    const testQuestionnaire = new Questionnaire({
      title: "Test Assessment",
      description: "A simple test questionnaire",
      sections: [
        {
          id: "section-1",
          title: "Basic Questions",
          questions: [
            {
              id: "q1",
              text: "How would you rate your organization's risk management?",
              expectedEvidence: "• Risk management policy document\n• Board approval minutes\n• Implementation evidence",
              options: [
                { text: "Not available", points: 0 },
                { text: "Poor", points: 1 },
                { text: "Fair", points: 2 },
                { text: "Good", points: 3 },
                { text: "Very Good", points: 4 },
                { text: "Excellent", points: 5 }
              ]
            }
          ]
        }
      ],
      isActive: true,
      createdBy: currentUser.userId,
    })

    await testQuestionnaire.save()

    return NextResponse.json({
      message: "Test questionnaire created successfully",
      questionnaire: {
        _id: testQuestionnaire._id,
        title: testQuestionnaire.title,
        description: testQuestionnaire.description,
      }
    })
  } catch (error) {
    console.error("Error creating test questionnaire:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 