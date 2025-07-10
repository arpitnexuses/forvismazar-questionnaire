import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { name, email, password, role } = await request.json()

    // Check if this is the first user (admin creation)
    const userCount = await User.countDocuments()

    if (userCount > 0 && role === "admin") {
      return NextResponse.json({ message: "Admin account already exists" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: userCount === 0 ? "admin" : role || "team",
    })

    await user.save()

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
