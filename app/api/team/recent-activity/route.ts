import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Client from "@/lib/models/Client"
import Submission from "@/lib/models/Submission"
import { getCurrentUser } from "@/lib/auth"

interface Activity {
  type: string
  title: string
  client: string
  time: Date
  status: string
  icon: string
  color: string
  score?: string
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== "team") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get recent submissions (completed assessments)
    const recentSubmissions = await Submission.find({ 
      submittedBy: currentUser.userId 
    })
      .populate('client', 'name company')
      .sort({ createdAt: -1 })
      .limit(3)

    // Get recent clients added
    const recentClients = await Client.find({ 
      createdBy: currentUser.userId 
    })
      .sort({ createdAt: -1 })
      .limit(3)

    // Combine and sort activities by date
    const activities: Activity[] = []

    // Add submission activities
    recentSubmissions.forEach(submission => {
      activities.push({
        type: "completion",
        title: "Risk Assessment Completed",
        client: submission.client?.company || submission.client?.name || "Unknown Client",
        time: submission.createdAt,
        status: "completed",
        icon: "CheckCircle",
        color: "text-green-600 bg-green-100",
        score: `${submission.totalScore}/${submission.maxTotalScore} points`
      })
    })

    // Add client activities
    recentClients.forEach(client => {
      activities.push({
        type: "addition",
        title: "New Client Onboarded",
        client: client.company || client.name,
        time: client.createdAt,
        status: "new",
        icon: "Plus",
        color: "text-blue-600 bg-blue-100"
      })
    })

    // Sort by time and take the 5 most recent
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    const recentActivities = activities.slice(0, 5)

    // Format time for display
    const formatTime = (date: Date) => {
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
      } else {
        return date.toLocaleDateString()
      }
    }

    const formattedActivities = recentActivities.map(activity => ({
      ...activity,
      time: formatTime(new Date(activity.time))
    }))

    return NextResponse.json(formattedActivities)
  } catch (error) {
    console.error("Recent activity fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 