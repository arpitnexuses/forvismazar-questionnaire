import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Client from "@/lib/models/Client"
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

    // Get all users with their client and submission counts
    const users = await User.find({}).select("-password")
    
    // Get client counts for each user
    const clientCounts = await Client.aggregate([
      {
        $group: {
          _id: "$createdBy",
          count: { $sum: 1 }
        }
      }
    ])

    // Get submission counts for each user
    const submissionCounts = await Submission.aggregate([
      {
        $group: {
          _id: "$submittedBy",
          count: { $sum: 1 }
        }
      }
    ])

    // Create lookup maps
    const clientCountMap = new Map(clientCounts.map(item => [item._id.toString(), item.count]))
    const submissionCountMap = new Map(submissionCounts.map(item => [item._id.toString(), item.count]))

    // Add counts to users
    const usersWithCounts = users.map(user => ({
      ...user.toObject(),
      clientCount: clientCountMap.get(user._id.toString()) || 0,
      submissionCount: submissionCountMap.get(user._id.toString()) || 0
    }))

    return NextResponse.json({ users: usersWithCounts })
  } catch (error) {
    console.error("Error fetching users:", error)
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

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || "team"
    })

    await user.save()

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject()
    
    return NextResponse.json({ 
      message: "User created successfully",
      user: userWithoutPassword 
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 