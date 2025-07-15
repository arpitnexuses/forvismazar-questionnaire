import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Questionnaire from "@/lib/models/Questionnaire"
import Submission from "@/lib/models/Submission"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await connectDB()

    // Get all questionnaires with submission counts and creator info
    const questionnaires = await Questionnaire.find({})
      .populate("createdBy", "name")
      .lean()
    
    console.log("Admin questionnaires API - Total questionnaires:", questionnaires.length)
    if (questionnaires.length > 0) {
      console.log("Admin questionnaires API - First questionnaire:", {
        id: questionnaires[0]._id,
        title: questionnaires[0].title,
        description: questionnaires[0].description,
        isActive: questionnaires[0].isActive
      })
    }
    
    // Get submission counts for each questionnaire
    const submissionCounts = await Submission.aggregate([
      {
        $group: {
          _id: "$questionnaire",
          count: { $sum: 1 }
        }
      }
    ])

    console.log("Admin questionnaires API - Submission counts:", submissionCounts)

    // Create lookup map
    const submissionCountMap = new Map(submissionCounts.map(item => [item._id.toString(), item.count]))

    // Add submission counts to questionnaires
    const questionnairesWithCounts = questionnaires.map((questionnaire: any) => ({
      ...questionnaire,
      submissionCount: submissionCountMap.get(questionnaire._id.toString()) || 0
    }))

    return NextResponse.json({ questionnaires: questionnairesWithCounts })
  } catch (error) {
    console.error("Error fetching questionnaires:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { title, description, sections, isActive } = await request.json()

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    await connectDB()

    // Create new questionnaire
    const questionnaire = new Questionnaire({
      title,
      description: description || "",
      sections: sections || [],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: decoded.userId
    })

    await questionnaire.save()

    // Populate creator info
    await questionnaire.populate("createdBy", "name")
    
    return NextResponse.json({ 
      message: "Questionnaire created successfully",
      questionnaire 
    })
  } catch (error) {
    console.error("Error creating questionnaire:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await connectDB()

    // Delete all questionnaires
    const result = await Questionnaire.deleteMany({})
    
    return NextResponse.json({ 
      message: `Deleted ${result.deletedCount} questionnaires successfully`
    })
  } catch (error) {
    console.error("Error deleting questionnaires:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 