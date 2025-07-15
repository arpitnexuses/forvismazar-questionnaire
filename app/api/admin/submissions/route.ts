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

    // Debug: Log the first few submissions to see what's happening
    console.log("Admin submissions API - Total submissions:", submissions.length)
    if (submissions.length > 0) {
      console.log("Admin submissions API - First submission questionnaire:", submissions[0].questionnaire)
      console.log("Admin submissions API - First submission questionnaire type:", typeof submissions[0].questionnaire)
      console.log("Admin submissions API - First submission questionnaire ID:", submissions[0].questionnaire?._id)
      
      // Check if the questionnaire reference exists in the database
      const questionnaireIds = submissions.map(s => s.questionnaire?._id).filter(Boolean)
      console.log("Admin submissions API - Unique questionnaire IDs:", [...new Set(questionnaireIds)])
      
      // Check if these questionnaires actually exist
      const Questionnaire = (await import("@/lib/models/Questionnaire")).default
      const existingQuestionnaires = await Questionnaire.find({ _id: { $in: questionnaireIds } })
      console.log("Admin submissions API - Existing questionnaires count:", existingQuestionnaires.length)
      console.log("Admin submissions API - Missing questionnaires:", questionnaireIds.length - existingQuestionnaires.length)
      
      // Check for submissions with null/undefined questionnaire references
      const submissionsWithNullQuestionnaire = submissions.filter(s => !s.questionnaire)
      console.log("Admin submissions API - Submissions with null questionnaire:", submissionsWithNullQuestionnaire.length)
      
      if (submissionsWithNullQuestionnaire.length > 0) {
        console.log("Admin submissions API - Sample submission with null questionnaire:", {
          id: submissionsWithNullQuestionnaire[0]._id,
          client: submissionsWithNullQuestionnaire[0].client?.name,
          submittedBy: submissionsWithNullQuestionnaire[0].submittedBy?.name
        })
      }
    }

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 