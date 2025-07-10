import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
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

    const { name, email, password, role } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 })
    }

    await connectDB()

    // Check if user exists
    const existingUser = await User.findById(params.id)
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if email is already taken by another user
    const userWithEmail = await User.findOne({ email: email.toLowerCase(), _id: { $ne: params.id } })
    if (userWithEmail) {
      return NextResponse.json({ message: "Email is already taken by another user" }, { status: 400 })
    }

    // Update user
    const updateData: any = {
      name,
      email: email.toLowerCase(),
      role: role || existingUser.role
    }

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = password
    }

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password")

    return NextResponse.json({ 
      message: "User updated successfully",
      user: updatedUser 
    })
  } catch (error) {
    console.error("Error updating user:", error)
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

    // Check if user exists
    const existingUser = await User.findById(params.id)
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Prevent admin from deleting themselves
    if (decoded.userId === params.id) {
      return NextResponse.json({ message: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete user
    await User.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 