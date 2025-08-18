"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, BarChart3, Calendar, TrendingUp, CheckCircle, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"

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
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchTeamStats(), fetchRecentActivity(), fetchSubmissions()])
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
    }
  }

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/team/submissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
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
      color: "bg-blue-600",
      iconColor: "text-blue-600",
      trend: "+12%"
    },
    {
      title: "Submissions",
      value: stats.totalSubmissions,
      description: "Total assessments",
      icon: FileText,
      color: "bg-green-600",
      iconColor: "text-green-600",
      trend: "+8%"
    },
    {
      title: "Pending",
      value: stats.pendingAssessments,
      description: "Awaiting assessment",
      icon: Clock,
      color: "bg-orange-600",
      iconColor: "text-orange-600",
      trend: "-3%"
    },
    {
      title: "This Month",
      value: stats.completedThisMonth,
      description: "Completed assessments",
      icon: TrendingUp,
      color: "bg-purple-600",
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

  const getMonthlySubmissionData = (submissions: any[]) => {
    const monthlyData: { [key: string]: number } = {}
    
    submissions.forEach(submission => {
      const date = new Date(submission.createdAt || submission.submittedAt)
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (monthlyData[monthYear]) {
        monthlyData[monthYear]++
      } else {
        monthlyData[monthYear] = 1
      }
    })
    
    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      assessments: count
    }))
  }

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
            <Card key={index} className={`${stat.color} border-0 shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                    <p className="text-xs text-white/70 mt-1">{stat.description}</p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                    {stat.trend} from last month
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bar Chart */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Monthly Client Assessments</CardTitle>
              <CardDescription className="text-gray-600">
                Assessment completion trends over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <ChartContainer
                  config={{
                    assessments: {
                      label: "Assessments",
                      color: "#3b82f6",
                    },
                  }}
                  className="h-[300px] pr-6 mt-4"
                >
                  <BarChart data={getMonthlySubmissionData(submissions)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs text-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      className="text-xs text-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Month
                                  </span>
                                  <span className="font-bold text-muted-foreground">
                                    {payload[0].payload.month}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Assessments
                                  </span>
                                  <span className="font-bold">
                                    {payload[0].value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar 
                      dataKey="assessments" 
                      fill="var(--color-assessments)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No submission data available</p>
                    <p className="text-sm mt-1">Complete some assessments to see data here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Client Performance Overview</CardTitle>
              <CardDescription className="text-gray-600">
                Current vs Target performance across key client dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  current: {
                    label: "Current",
                    color: "#3b82f6",
                  },
                  target: {
                    label: "Target",
                    color: "#10b981",
                  },
                }}
                className="h-[300px] mt-4"
              >
                <RadarChart data={[
                  { dimension: "Risk Management", current: 3.5, target: 4.0 },
                  { dimension: "Compliance", current: 4.2, target: 4.0 },
                  { dimension: "Financial Health", current: 3.8, target: 4.2 },
                  { dimension: "Operational", current: 3.2, target: 3.8 },
                  { dimension: "Security", current: 3.9, target: 4.3 },
                  { dimension: "Governance", current: 3.6, target: 4.1 },
                ]}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 5]} 
                    scale="linear"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                  />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="var(--color-current)"
                    fill="var(--color-current)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="var(--color-target)"
                    fill="var(--color-target)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </RadarChart>
              </ChartContainer>
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 justify-center">
                {[
                  { name: "Current", color: "#3b82f6" },
                  { name: "Target", color: "#10b981" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                <div className="max-h-80 overflow-y-auto pr-2">
                  {recentActivity.slice(0, 3).map((activity, index) => {
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
                  })}
                  

                </div>
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
