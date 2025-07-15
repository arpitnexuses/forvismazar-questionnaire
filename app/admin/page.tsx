"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, BarChart3, TrendingUp, Shield, Settings, Plus, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  totalQuestionnaires: number
  totalSubmissions: number
  activeClients: number
}

interface AdminActivity {
  type: string
  title: string
  description: string
  time: string
  status: string
  icon: string
  color: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalQuestionnaires: 0,
    totalSubmissions: 0,
    activeClients: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/admin/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
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
      title: "Total Users",
      value: stats.totalUsers,
      description: "Active team members",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      iconColor: "text-blue-600",
      trend: "+5%"
    },
    {
      title: "Questionnaires",
      value: stats.totalQuestionnaires,
      description: "Created assessments",
      icon: FileText,
      color: "bg-green-50 text-green-600",
      iconColor: "text-green-600",
      trend: "+12%"
    },
    {
      title: "Submissions",
      value: stats.totalSubmissions,
      description: "Form submissions",
      icon: BarChart3,
      color: "bg-purple-50 text-purple-600",
      iconColor: "text-purple-600",
      trend: "+8%"
    },
    {
      title: "Active Clients",
      value: stats.activeClients,
      description: "Client assessments",
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-600",
      iconColor: "text-orange-600",
      trend: "+15%"
    }
  ]

  const quickActions = [
    {
      title: "Manage Users",
      description: "Add, edit, and manage team members",
      href: "/admin/users",
      icon: Users,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Questionnaires",
      description: "Create and manage assessment templates",
      href: "/admin/questionnaires",
      icon: FileText,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "View Submissions",
      description: "Monitor all client submissions",
      href: "/admin/submissions",
      icon: BarChart3,
      color: "bg-purple-600 hover:bg-purple-700"
    }
  ]

  const recentActivities = [
    {
      type: "user",
      title: "New team member added",
      description: "John Doe joined the platform",
      time: "2 hours ago",
      status: "completed",
      icon: "Plus",
      color: "bg-green-100 text-green-600"
    },
    {
      type: "questionnaire",
      title: "Questionnaire created",
      description: "Risk assessment template updated",
      time: "4 hours ago",
      status: "completed",
      icon: "FileText",
      color: "bg-blue-100 text-blue-600"
    },
    {
      type: "submission",
      title: "New submission received",
      description: "Client ABC completed assessment",
      time: "6 hours ago",
      status: "pending",
      icon: "Activity",
      color: "bg-orange-100 text-orange-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor and manage your questionnaire management system</p>
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
                Common administrative tasks
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
                Latest system activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => {
                const IconComponent = activity.icon === "Plus" ? Plus : 
                                     activity.icon === "FileText" ? FileText : 
                                     activity.icon === "Activity" ? Activity : Plus
                
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full ${activity.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            activity.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
