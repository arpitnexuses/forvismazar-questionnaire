import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Questionnaire from "@/lib/models/Questionnaire"
import { verifyToken } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if questionnaire exists
    const existingQuestionnaire = await Questionnaire.findById(params.id)
    if (!existingQuestionnaire) {
      return NextResponse.json({ message: "Questionnaire not found" }, { status: 404 })
    }

    // Update questionnaire
    const updatedQuestionnaire = await Questionnaire.findByIdAndUpdate(
      params.id,
      {
        title,
        description: description || "",
        sections: sections || [],
        isActive: isActive !== undefined ? isActive : existingQuestionnaire.isActive
      },
      { new: true, runValidators: true }
    ).populate("createdBy", "name")

    return NextResponse.json({ 
      message: "Questionnaire updated successfully",
      questionnaire: updatedQuestionnaire 
    })
  } catch (error) {
    console.error("Error updating questionnaire:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const updateData = await request.json()

    await connectDB()

    // Check if questionnaire exists
    const existingQuestionnaire = await Questionnaire.findById(params.id)
    if (!existingQuestionnaire) {
      return NextResponse.json({ message: "Questionnaire not found" }, { status: 404 })
    }

    // Update questionnaire
    const updatedQuestionnaire = await Questionnaire.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "name")

    return NextResponse.json({ 
      message: "Questionnaire updated successfully",
      questionnaire: updatedQuestionnaire 
    })
  } catch (error) {
    console.error("Error updating questionnaire:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if questionnaire exists
    const existingQuestionnaire = await Questionnaire.findById(params.id)
    if (!existingQuestionnaire) {
      return NextResponse.json({ message: "Questionnaire not found" }, { status: 404 })
    }

    // Delete questionnaire
    await Questionnaire.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Questionnaire deleted successfully" })
  } catch (error) {
    console.error("Error deleting questionnaire:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 