import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const questionId = formData.get("questionId") as string

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 })
    }

    if (!questionId) {
      return NextResponse.json({ message: "Question ID required" }, { status: 400 })
    }

    const uploadedFiles = []

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", currentUser.userId, questionId)
    await mkdir(uploadsDir, { recursive: true })

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return NextResponse.json({ message: `File ${file.name} is too large (max 10MB)` }, { status: 400 })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = join(uploadsDir, fileName)

      // Convert file to buffer and save
      const buffer = await file.arrayBuffer()
      await writeFile(filePath, Buffer.from(buffer))

      uploadedFiles.push({
        originalName: file.name,
        fileName: fileName,
        size: file.size,
        type: file.type,
        url: `/uploads/${currentUser.userId}/${questionId}/${fileName}`
      })
    }

    return NextResponse.json({ 
      message: "Files uploaded successfully",
      files: uploadedFiles 
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
} 