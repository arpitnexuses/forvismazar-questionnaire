import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Questionnaire from "@/lib/models/Questionnaire"
import { getCurrentUser } from "@/lib/auth"
import { riskManagementTemplate } from "@/lib/risk-management-template"

console.log("Template loaded:", riskManagementTemplate.title)
console.log("Template sections:", riskManagementTemplate.sections.length)

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== "team") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if any questionnaires exist
    const existingQuestionnaires = await Questionnaire.find({})
    console.log("Existing questionnaires count:", existingQuestionnaires.length)
    
    // Check if existing questionnaires have expectedEvidence field
    let needsRecreation = false
    if (existingQuestionnaires.length > 0) {
      const firstQ = existingQuestionnaires[0]
      if (firstQ.sections?.[0]?.questions?.[0]) {
        const hasEvidence = !!firstQ.sections[0].questions[0].expectedEvidence
        console.log("First question has expectedEvidence:", hasEvidence)
        if (!hasEvidence) {
          needsRecreation = true
          console.log("🔄 RECREATING: Existing questionnaires missing expectedEvidence field")
        }
      }
    }
    
    if (existingQuestionnaires.length === 0 || needsRecreation) {
      if (needsRecreation) {
        // Delete existing questionnaires that are missing expectedEvidence
        await Questionnaire.deleteMany({})
        console.log("Deleted existing questionnaires missing evidence data")
      }
      
      console.log("Creating questionnaire with expectedEvidence...")
      // Create the risk management questionnaire
      const questionnaire = new Questionnaire({
        title: riskManagementTemplate.title,
        description: riskManagementTemplate.description,
        sections: riskManagementTemplate.sections,
        isActive: true,
        createdBy: currentUser.userId,
      })

      await questionnaire.save()
      console.log("Questionnaire saved with ID:", questionnaire._id)
      
      // Verify the evidence data was saved
      const savedQ = await Questionnaire.findById(questionnaire._id)
      const firstSavedQ = savedQ?.sections?.[0]?.questions?.[0]
      console.log("✅ Verification - First question expectedEvidence:", firstSavedQ?.expectedEvidence?.substring(0, 100) + "...")

      return NextResponse.json({
        message: needsRecreation ? "Questionnaire recreated with evidence data" : "Sample questionnaire created successfully",
        questionnaire: {
          _id: questionnaire._id,
          title: questionnaire.title,
          description: questionnaire.description,
        }
      })
    }

    return NextResponse.json({
      message: "Questionnaires already exist and have evidence data",
      count: existingQuestionnaires.length
    })
  } catch (error) {
    console.error("Error initializing questionnaire:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 