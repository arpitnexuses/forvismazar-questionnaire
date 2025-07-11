import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Submission from "@/lib/models/Submission"
import Client from "@/lib/models/Client"
import Questionnaire from "@/lib/models/Questionnaire"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== "team") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { client, questionnaire, answers } = body

    if (!client || !questionnaire || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Verify client exists and belongs to user
    const clientDoc = await Client.findOne({
      _id: client,
      createdBy: currentUser.userId,
    })

    if (!clientDoc) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    // Verify questionnaire exists and is active
    const questionnaireDoc = await Questionnaire.findOne({
      _id: questionnaire,
      isActive: true,
    })

    if (!questionnaireDoc) {
      return NextResponse.json({ message: "Questionnaire not found" }, { status: 404 })
    }

    // Calculate scores
    let totalScore = 0
    let maxTotalScore = 0
    const sectionScores: { sectionId: string; score: number; maxScore: number }[] = []

    for (const section of questionnaireDoc.sections) {
      let sectionScore = 0
      let sectionMaxScore = 0

      for (const question of section.questions) {
        const answer = answers.find((a: any) => a.questionId === question.id)
        if (answer) {
          sectionScore += answer.points || 0
        }
        sectionMaxScore += Math.max(...question.options.map((opt: any) => opt.points))
      }

      sectionScores.push({
        sectionId: section.id,
        score: sectionScore,
        maxScore: sectionMaxScore,
      })

      totalScore += sectionScore
      maxTotalScore += sectionMaxScore
    }

    // Create submission
    const submission = new Submission({
      client,
      questionnaire,
      submittedBy: currentUser.userId,
      answers,
      sectionScores,
      totalScore,
      maxTotalScore,
    })

    await submission.save()

    return NextResponse.json({
      _id: submission._id,
      totalScore,
      maxTotalScore,
      submittedAt: submission.createdAt,
    })
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== "team") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const submissions = await Submission.find({ submittedBy: currentUser.userId })
      .populate('client', 'name company')
      .populate('questionnaire', 'title')
      .sort({ createdAt: -1 })
      .limit(50)

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 