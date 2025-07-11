import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Questionnaire from "@/lib/models/Questionnaire"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    console.log("Debug API - Current user:", currentUser)
    
    if (!currentUser || currentUser.role !== "team") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get ALL questionnaires (not just active ones)
    const allQuestionnaires = await Questionnaire.find({})
      .select('_id title description sections isActive createdBy')
      .sort({ createdAt: -1 })

    console.log("Debug API - All questionnaires:", allQuestionnaires.length)
    console.log("Debug API - Questionnaires details:", allQuestionnaires.map(q => ({
      id: q._id,
      title: q.title,
      isActive: q.isActive,
      createdBy: q.createdBy
    })))

    // Get only active questionnaires
    const activeQuestionnaires = await Questionnaire.find({ isActive: true })
      .select('_id title description sections')
      .sort({ createdAt: -1 })

    console.log("Debug API - Active questionnaires:", activeQuestionnaires.length)

    return NextResponse.json({
      allQuestionnaires: allQuestionnaires.length,
      activeQuestionnaires: activeQuestionnaires.length,
      questionnaires: activeQuestionnaires,
      debug: {
        user: currentUser,
        allCount: allQuestionnaires.length,
        activeCount: activeQuestionnaires.length
      }
    })
  } catch (error) {
    console.error("Error in debug questionnaires:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 