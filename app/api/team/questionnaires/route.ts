import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Questionnaire from "@/lib/models/Questionnaire"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    console.log("Team questionnaires API - Current user:", currentUser)
    
    if (!currentUser || currentUser.role !== "team") {
      console.log("Team questionnaires API - Unauthorized:", { user: currentUser })
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const questionnaires = await Questionnaire.find({ isActive: true })
      .sort({ createdAt: -1 })

    console.log("Team questionnaires API - Found questionnaires:", questionnaires.length)
    console.log("Team questionnaires API - Questionnaires:", questionnaires.map(q => ({ 
      id: q._id, 
      title: q.title, 
      isActive: q.isActive,
      sectionsCount: q.sections?.length || 0
    })))

    return NextResponse.json(questionnaires)
  } catch (error) {
    console.error("Error fetching questionnaires:", error)
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

    const { title, description, sections } = await request.json()

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    // Create a simple questionnaire for testing
    const questionnaire = new Questionnaire({
      title: title || "Team Created Questionnaire",
      description: description || "Created by team member",
      sections: sections || [
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

    await questionnaire.save()

    return NextResponse.json({
      message: "Questionnaire created successfully",
      questionnaire: {
        _id: questionnaire._id,
        title: questionnaire.title,
        description: questionnaire.description,
      }
    })
  } catch (error) {
    console.error("Error creating questionnaire:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 