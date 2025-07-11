"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, BarChart3, Calendar, TrendingUp, CheckCircle, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TeamStats {
  totalClients: number
  totalSubmissions: number
  pendingAssessments: number
  completedThisMonth: number
}

interface RecentActivity {
  type: string
  title: string
  client: string
  time: string
  status: string
  icon: string
  color: string
  score?: string
}

export default function TeamDashboard() {
  const [stats, setStats] = useState<TeamStats>({
    totalClients: 0,
    totalSubmissions: 0,
    pendingAssessments: 0,
    completedThisMonth: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchTeamStats(), fetchRecentActivity()])
  }, [])

  const fetchTeamStats = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/team/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching team stats:", error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/team/recent-activity", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data)
      }
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  const statsCards = [
    {
      title: "My Clients",
      value: stats.totalClients,
      description: "Active clients",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      iconColor: "text-blue-600",
      trend: "+12%"
    },
    {
      title: "Submissions",
      value: stats.totalSubmissions,
      description: "Total assessments",
      icon: FileText,
      color: "bg-green-50 text-green-600",
      iconColor: "text-green-600",
      trend: "+8%"
    },
    {
      title: "Pending",
      value: stats.pendingAssessments,
      description: "Awaiting assessment",
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
      iconColor: "text-orange-600",
      trend: "-3%"
    },
    {
      title: "This Month",
      value: stats.completedThisMonth,
      description: "Completed assessments",
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
      iconColor: "text-purple-600",
      trend: "+15%"
    }
  ]

  const quickActions = [
    {
      title: "Manage Clients",
      description: "View and organize your client portfolio",
      href: "/dashboard/clients",
      icon: Users,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Fill Questionnaire",
      description: "Complete risk assessments for clients",
      href: "/dashboard/questionnaire",
      icon: FileText,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "View Reports",
      description: "Access analytics and insights",
      href: "/dashboard/reports",
      icon: BarChart3,
      color: "bg-purple-600 hover:bg-purple-700"
    }
  ]



  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 mt-2">Here's what's happening with your clients today</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                    {stat.trend} from last month
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-gray-600">
                Jump to your most common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${action.color} text-white transition-colors`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Recent Activity</CardTitle>
              <CardDescription className="text-gray-600">
                Latest updates and actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  // Map icon names to actual icon components
                  const IconComponent = activity.icon === "CheckCircle" ? CheckCircle : 
                                       activity.icon === "Plus" ? Plus : 
                                       activity.icon === "Clock" ? Clock : CheckCircle
                  
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-full ${activity.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 truncate">{activity.client}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{activity.time}</p>
                          {activity.score && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              {activity.score}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600 mt-2">No recent activity</p>
                  <p className="text-xs text-gray-500">Complete some assessments to see activity here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
