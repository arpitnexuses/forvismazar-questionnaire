import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET() {
  try {
    await connectDB()

    const userCount = await User.countDocuments()

    return NextResponse.json({
      isFirstUser: userCount === 0,
    })
  } catch (error) {
    console.error("Error checking first user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
