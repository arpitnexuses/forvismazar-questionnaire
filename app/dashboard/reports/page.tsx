"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart3, Search, Filter, Eye, Download, Calendar, User, FileText, TrendingUp, Building, Award, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Submission {
  _id: string
  client: {
    _id: string
    name: string
    company?: string
  } | null
  questionnaire: {
    _id: string
    title: string
  } | null
  totalScore: number
  maxTotalScore: number
  sectionScores: {
    sectionId: string
    score: number
    maxScore: number
  }[]
  answers: {
    questionId: string
    selectedOption: number
    points: number
    testResult?: string
    comments?: string
    recommendation?: string
    agreedActionPlan?: string
    actionDate?: string
  }[]
  submittedAt: string
}

interface Client {
  _id: string
  name: string
  company?: string
}

export default function ReportsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      
      const [submissionsResponse, clientsResponse] = await Promise.all([
        fetch("/api/team/submissions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/team/clients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData)
      }

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json()
        setClients(clientsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch reports data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    const clientName = submission.client?.name?.toLowerCase() || ""
    const clientCompany = submission.client?.company?.toLowerCase() || ""
    const questionnaireTitle = submission.questionnaire?.title?.toLowerCase() || ""
    
    const matchesSearch = 
      clientName.includes(searchTerm.toLowerCase()) ||
      clientCompany.includes(searchTerm.toLowerCase()) ||
      questionnaireTitle.includes(searchTerm.toLowerCase())
    
    const matchesClient = !selectedClient || selectedClient === "all" || submission.client?._id === selectedClient
    
    return matchesSearch && matchesClient
  })

  const getScorePercentage = (score: number, maxScore: number) => {
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default"
    if (percentage >= 60) return "secondary"
    return "destructive"
  }

  const getScoreDescription = (percentage: number) => {
    if (percentage >= 80) return "Excellent"
    if (percentage >= 60) return "Good"
    if (percentage >= 40) return "Fair"
    return "Needs Improvement"
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const exportReport = (submission: Submission) => {
    const clientName = submission.client?.name || "Unknown Client"
    const questionnaireTitle = submission.questionnaire?.title || "Risk Management Assessment"
    
    const report = `
Assessment Report
================

Client: ${clientName}
${submission.client?.company ? `Company: ${submission.client.company}` : ''}
Assessment: ${questionnaireTitle}
Date: ${new Date(submission.submittedAt).toLocaleDateString()}
Score: ${submission.totalScore}/${submission.maxTotalScore} (${getScorePercentage(submission.totalScore, submission.maxTotalScore)}%)

Section Scores:
${submission.sectionScores.map(section => 
  `- Section: ${section.score}/${section.maxScore} (${getScorePercentage(section.score, section.maxScore)}%)`
).join('\n')}

Detailed Answers:
${submission.answers.map((answer, index) => `
Question ${index + 1}:
Selected Option: ${answer.selectedOption}
Points: ${answer.points}
${answer.comments ? `Comments: ${answer.comments}` : ''}
${answer.recommendation ? `Recommendation: ${answer.recommendation}` : ''}
${answer.agreedActionPlan ? `Action Plan: ${answer.agreedActionPlan}` : ''}
${answer.actionDate ? `Action Date: ${answer.actionDate}` : ''}
`).join('\n')}
    `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `assessment-${clientName.replace(/\s+/g, '-')}-${new Date(submission.submittedAt).toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Success",
      description: "Report exported successfully",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  const validSubmissions = submissions.filter(s => s.client && s.questionnaire)
  const totalAssessments = submissions.length
  const uniqueClients = new Set(validSubmissions.map(s => s.client!._id)).size
  const averageScore = validSubmissions.length > 0 
    ? Math.round(validSubmissions.reduce((acc, s) => acc + getScorePercentage(s.totalScore, s.maxTotalScore), 0) / validSubmissions.length)
    : 0

  const thisMonthSubmissions = submissions.filter(s => {
    const submissionDate = new Date(s.submittedAt)
    const now = new Date()
    return submissionDate.getMonth() === now.getMonth() && 
           submissionDate.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assessment Reports</h1>
              <p className="text-gray-600 mt-2">View and analyze completed risk assessments</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{totalAssessments}</p>
              <p className="text-sm text-gray-500">Total Reports</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-gray-600">Total Assessments</CardTitle>
                  <div className="text-2xl font-bold text-gray-900">{totalAssessments}</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-gray-600">Active Clients</CardTitle>
                  <div className="text-2xl font-bold text-gray-900">{uniqueClients}</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
                  <div className="text-2xl font-bold text-gray-900">{averageScore}%</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
                  <div className="text-2xl font-bold text-gray-900">{thisMonthSubmissions}</div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by client name, company, or assessment type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-64 h-12">
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client._id} value={client._id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((submission) => {
              const scorePercentage = getScorePercentage(submission.totalScore, submission.maxTotalScore)
              const clientName = submission.client?.name || "Unknown Client"
              const questionnaireTitle = submission.questionnaire?.title || "Risk Management Assessment"
              
              return (
                <Card key={submission._id} className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            {getInitials(clientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{clientName}</h3>
                            {!submission.client && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Missing Client Data
                              </Badge>
                            )}
                          </div>
                          {submission.client?.company && (
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <Building className="h-4 w-4 mr-1" />
                              {submission.client.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <Badge 
                            className={`text-base px-3 py-1 ${
                              scorePercentage >= 80 ? 'bg-green-100 text-green-700 border-green-300' :
                              scorePercentage >= 60 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                              'bg-red-100 text-red-700 border-red-300'
                            }`}
                          >
                            {scorePercentage}%
                          </Badge>
                          {/* <p className="text-xs text-gray-500 mt-1">{getScoreDescription(scorePercentage)}</p> */}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(submission)
                              setShowDetailsDialog(true)
                            }}
                            className="h-10"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportReport(submission)}
                            className="h-10"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Assessment:</span>
                      <span>{questionnaireTitle}</span>
                      {/* {!submission.questionnaire && (
                        <Badge variant="destructive" className="text-xs ml-2">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Missing Data
                        </Badge>
                      )} */}
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Award className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Score</span>
                        </div>
                        <p className={`text-2xl font-bold ${getScoreColor(scorePercentage)}`}>
                          {submission.totalScore}/{submission.maxTotalScore}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Completed</span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium">
                          {new Date(submission.submittedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                        </div>
                        <Progress value={scorePercentage} className="mt-2 h-2" />
                        <p className="text-xs text-gray-500 mt-1">{scorePercentage}% Complete</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="bg-gray-100 rounded-full p-6 mb-6">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports found</h3>
                                 <p className="text-gray-600 text-center max-w-md">
                   {searchTerm || (selectedClient && selectedClient !== "all")
                     ? "No reports match your current filters. Try adjusting your search criteria."
                     : "Complete your first assessment to see reports here."
                   }
                 </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Assessment Details</DialogTitle>
              <DialogDescription className="text-gray-600">
                Comprehensive view of the assessment report and findings
              </DialogDescription>
            </DialogHeader>
            
            {selectedSubmission && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sections">Section Scores</TabsTrigger>
                  <TabsTrigger value="answers">Detailed Answers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-900">Client Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p><strong>Name:</strong> {selectedSubmission.client?.name || "Unknown"}</p>
                        {selectedSubmission.client?.company && (
                          <p><strong>Company:</strong> {selectedSubmission.client.company}</p>
                        )}
                        <p><strong>Assessment Date:</strong> {new Date(selectedSubmission.submittedAt).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-green-900">Assessment Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p><strong>Type:</strong> {selectedSubmission.questionnaire?.title || "Unknown"}</p>
                        <p><strong>Total Score:</strong> {selectedSubmission.totalScore}/{selectedSubmission.maxTotalScore}</p>
                        <p><strong>Percentage:</strong> {getScorePercentage(selectedSubmission.totalScore, selectedSubmission.maxTotalScore)}%</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="sections" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    {selectedSubmission.sectionScores.map((section, index) => {
                      const sectionPercentage = getScorePercentage(section.score, section.maxScore)
                      return (
                        <Card key={section.sectionId} className="border border-gray-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">Section {index + 1}</CardTitle>
                              <Badge 
                                className={`${
                                  sectionPercentage >= 80 ? 'bg-green-100 text-green-700' :
                                  sectionPercentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}
                              >
                                {sectionPercentage}%
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span>Score: {section.score}/{section.maxScore}</span>
                                <span className="font-medium">{getScoreDescription(sectionPercentage)}</span>
                              </div>
                              <Progress value={sectionPercentage} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="answers" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    {selectedSubmission.answers.map((answer, index) => (
                      <Card key={answer.questionId} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Question {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm"><strong>Points Scored:</strong> {answer.points}</p>
                          </div>
                          {answer.comments && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Comments:</p>
                              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{answer.comments}</p>
                            </div>
                          )}
                          {answer.recommendation && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Recommendation:</p>
                              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">{answer.recommendation}</p>
                            </div>
                          )}
                          {answer.agreedActionPlan && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Action Plan:</p>
                              <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">{answer.agreedActionPlan}</p>
                            </div>
                          )}
                          {answer.actionDate && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Target Date:</p>
                              <p className="text-sm text-gray-600">{new Date(answer.actionDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 