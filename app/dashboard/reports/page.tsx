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
import { BarChart3, Search, Filter, Eye, Download, Calendar, User, FileText, TrendingUp, Building, Award, AlertTriangle, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import jsPDF from "jspdf"

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
    description?: string
    sections?: {
      id: string
      title: string
      questions: {
        id: string
        text: string
        expectedEvidence: string
        options: {
          text: string
          points: number
        }[]
      }[]
    }[]
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
  submittedAt?: string
  createdAt?: string
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
  const [detailedSubmission, setDetailedSubmission] = useState<Submission | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [deletingSubmission, setDeletingSubmission] = useState<string | null>(null)

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
        console.log("Submissions data received:", submissionsData)
        if (submissionsData.length > 0) {
          console.log("First submission structure:", submissionsData[0])
          console.log("First submission dates:", {
            createdAt: submissionsData[0].createdAt,
            submittedAt: submissionsData[0].submittedAt,
            type: typeof submissionsData[0].createdAt
          })
        }
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

  const formatDate = (dateString: string | Date | undefined) => {
    try {
      console.log("Formatting date:", dateString)
      console.log("Date type:", typeof dateString)
      
      if (!dateString) {
        console.warn("No date provided")
        return "No Date Available"
      }
      
      let date: Date
      if (typeof dateString === 'string') {
        date = new Date(dateString)
      } else if (dateString instanceof Date) {
        date = dateString
      } else {
        date = new Date(dateString)
      }
      
      console.log("Parsed date:", date)
      console.log("Is valid date:", !isNaN(date.getTime()))
      
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      } else {
        console.warn("Invalid date:", dateString)
        return "Invalid Date"
      }
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Invalid Date"
    }
  }

  const deleteSubmission = async (submissionId: string) => {
    try {
      setDeletingSubmission(submissionId)
      const token = localStorage.getItem("auth-token")
      
      const response = await fetch(`/api/team/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        // Remove from local state
        setSubmissions(prev => prev.filter(s => s._id !== submissionId))
        toast({
          title: "Success",
          description: "Report deleted successfully",
          duration: 3000,
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to delete report")
      }
    } catch (error) {
      console.error("Error deleting submission:", error)
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      })
    } finally {
      setDeletingSubmission(null)
    }
  }

  const fetchDetailedSubmission = async (submissionId: string) => {
    try {
      setLoadingDetails(true)
      const token = localStorage.getItem("auth-token")
      console.log("Fetching detailed submission:", submissionId)
      console.log("Auth token:", token ? "present" : "missing")
      
      const response = await fetch(`/api/team/submissions/${submissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)
      
      if (response.ok) {
        const detailedData = await response.json()
        console.log("Detailed data received:", detailedData)
        setDetailedSubmission(detailedData)
        return detailedData
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Response error:", errorData)
        throw new Error(`Failed to fetch detailed submission: ${response.status} ${errorData.message || ''}`)
      }
    } catch (error) {
      console.error("Error fetching detailed submission:", error)
      toast({
        title: "Error",
        description: "Failed to fetch detailed submission data",
        variant: "destructive",
      })
      return null
    } finally {
      setLoadingDetails(false)
    }
  }

  const exportReport = async (submission: Submission) => {
    try {
      console.log("Starting export for submission:", submission._id)
      
      // Fetch detailed submission data if not already available
      let detailedData = detailedSubmission
      if (!detailedData || detailedData._id !== submission._id) {
        console.log("Fetching detailed data for export")
        detailedData = await fetchDetailedSubmission(submission._id)
        if (!detailedData) {
          console.error("Failed to fetch detailed data for export")
          toast({
            title: "Error",
            description: "Failed to fetch detailed submission data for export",
            variant: "destructive",
          })
          return
        }
      }
      
      console.log("Detailed data available for export:", detailedData)

      // Validate that we have the required data
      if (!detailedData.questionnaire?.sections) {
        console.error("Missing questionnaire sections in detailed data")
        toast({
          title: "Error",
          description: "Missing questionnaire data for export",
          variant: "destructive",
        })
        return
      }

      // Validate that this is the correct client's data
      if (detailedData.client?._id !== submission.client?._id) {
        console.error("Client mismatch in detailed data")
        toast({
          title: "Error",
          description: "Client data mismatch for export",
          variant: "destructive",
        })
        return
      }

      const clientName = submission.client?.name || "Unknown Client"
      const questionnaireTitle = submission.questionnaire?.title || "Risk Management Assessment"
      
      console.log("Creating PDF for:", { clientName, questionnaireTitle })
      
      // Check if jsPDF is available
      if (typeof jsPDF === 'undefined') {
        console.error("jsPDF library not loaded")
        toast({
          title: "Error",
          description: "PDF library not available",
          variant: "destructive",
        })
        return
      }
      
      // Create PDF
      const pdf = new jsPDF()
      
      // Add Forvis Mazars logo at the top center
      try {
        // Add logo image centered at the top
        const logoUrl = '/fmlogo.png'
        // Center the logo: (page width - logo width) / 2 = (210 - 60) / 2 = 75
        pdf.addImage(logoUrl, 'PNG', 75, 10, 60, 30)
      } catch (logoError) {
        console.warn("Logo loading failed:", logoError)
      }
      
      // Add title
      pdf.setFontSize(16)
      pdf.text("Risk Management Assessment Report", 105, 50, { align: "center" })
      
      // Add client information
      pdf.setFontSize(12)
      pdf.text(`Client: ${clientName}`, 20, 65)
      if (submission.client?.company) {
        pdf.text(`Company: ${submission.client.company}`, 20, 75)
      }
      
      // Add submission ID for reference
      pdf.text(`Submission ID: ${submission._id}`, 20, 85)
      pdf.text(`Assessment: ${questionnaireTitle}`, 20, 95)
      
      // Safe date handling for display
      let submissionDateStr = "Unknown Date"
      try {
        const dateToUse = submission.createdAt || submission.submittedAt
        console.log("Original date:", dateToUse)
        console.log("Type of date:", typeof dateToUse)
        
        if (dateToUse) {
          let submissionDate: Date
          if (typeof dateToUse === 'string') {
            submissionDate = new Date(dateToUse)
          } else if (dateToUse) {
            // If it's a timestamp or other format
            submissionDate = new Date(dateToUse)
          } else {
            submissionDate = new Date()
          }
          
          console.log("Parsed submissionDate:", submissionDate)
          console.log("Is valid date:", !isNaN(submissionDate.getTime()))
          
          if (!isNaN(submissionDate.getTime())) {
            submissionDateStr = submissionDate.toLocaleDateString()
          }
        }
      } catch (dateError) {
        console.warn("Date display error:", dateError)
      }
      pdf.text(`Date: ${submissionDateStr}`, 20, 105)
      pdf.text(`Score: ${submission.totalScore}/${submission.maxTotalScore} (${getScorePercentage(submission.totalScore, submission.maxTotalScore)}%)`, 20, 115)
      
      // Add section scores
      let yPosition = 135
      pdf.setFontSize(14)
      pdf.text("Section Scores:", 20, yPosition)
      yPosition += 10
      
      pdf.setFontSize(10)
      submission.sectionScores.forEach((section, index) => {
        const sectionPercentage = getScorePercentage(section.score, section.maxScore)
        pdf.text(`Section ${index + 1}: ${section.score}/${section.maxScore} (${sectionPercentage}%)`, 30, yPosition)
        yPosition += 7
      })
      
            // Add detailed answers organized by sections
      yPosition += 10
      pdf.setFontSize(14)
      pdf.text("Detailed Assessment by Sections:", 20, yPosition)
      yPosition += 10
      
      console.log("Starting to process sections for PDF")
      try {
        detailedData.questionnaire.sections.forEach((section, sectionIndex) => {
          console.log(`Processing section ${sectionIndex + 1}:`, section.title)
          
          // Check if we need a new page for this section
          if (yPosition > 220) {
            pdf.addPage()
            yPosition = 20
          }
          
          // Add section header
          pdf.setFontSize(14)
          pdf.setTextColor(0, 0, 139) // Dark blue for section headers
          pdf.text(`Section ${sectionIndex + 1}: ${section.title}`, 20, yPosition)
          yPosition += 8
          
          // Add section score
          const sectionScore = submission.sectionScores.find(s => s.sectionId === section.id)
          if (sectionScore) {
            pdf.setFontSize(10)
            pdf.setTextColor(0, 0, 0)
            const sectionPercentage = getScorePercentage(sectionScore.score, sectionScore.maxScore)
            pdf.text(`Section Score: ${sectionScore.score}/${sectionScore.maxScore} (${sectionPercentage}%)`, 30, yPosition)
            yPosition += 6
          }
          
          yPosition += 5
          
          // Process questions in this section
          let questionNumber = 1
          section.questions.forEach((question, index) => {
            const answer = submission.answers.find(a => a.questionId === question.id)
            if (answer) {
              console.log(`Processing question ${questionNumber}:`, question.text.substring(0, 50) + "...")
              
              // Check if we need a new page
              if (yPosition > 250) {
                pdf.addPage()
                yPosition = 20
              }
              
              pdf.setFontSize(12)
              pdf.setTextColor(0, 0, 0)
              pdf.text(`Question ${questionNumber}:`, 20, yPosition)
              yPosition += 7
              
              // Add question text (wrap if needed)
              const questionText = question.text
              const maxWidth = 170
              const lines = pdf.splitTextToSize(questionText, maxWidth)
              pdf.setFontSize(10)
              lines.forEach((line: string) => {
                pdf.text(line, 30, yPosition)
                yPosition += 5
              })
              
              // Add expected evidence
              yPosition += 3
              pdf.setFontSize(9)
              pdf.setTextColor(100, 100, 100) // Gray for evidence
              pdf.text("Expected Evidence:", 30, yPosition)
              yPosition += 4
              const evidenceLines = pdf.splitTextToSize(question.expectedEvidence, maxWidth - 10)
              evidenceLines.forEach((line: string) => {
                pdf.text(line, 35, yPosition)
                yPosition += 4
              })
              yPosition += 3
              
              // Add selected option
              pdf.setFontSize(10)
              pdf.setTextColor(0, 0, 0)
              pdf.text("Selected Option:", 30, yPosition)
              yPosition += 5
              
              const selectedOption = question.options[answer.selectedOption]
              if (selectedOption) {
                pdf.setTextColor(0, 100, 0) // Green for selected option
                pdf.text(`• ${selectedOption.text} (${selectedOption.points} points)`, 40, yPosition)
                yPosition += 7
              }
              
              // Add comments if available
              if (answer.comments) {
                pdf.setTextColor(0, 0, 0)
                pdf.text("Comments:", 30, yPosition)
                yPosition += 5
                const commentLines = pdf.splitTextToSize(answer.comments, maxWidth - 10)
                commentLines.forEach((line: string) => {
                  pdf.text(line, 40, yPosition)
                  yPosition += 5
                })
                yPosition += 3
              }
              
              // Add recommendation if available
              if (answer.recommendation) {
                pdf.setTextColor(139, 69, 19) // Brown for recommendations
                pdf.text("Recommendation:", 30, yPosition)
                yPosition += 5
                const recLines = pdf.splitTextToSize(answer.recommendation, maxWidth - 10)
                recLines.forEach((line: string) => {
                  pdf.text(line, 40, yPosition)
                  yPosition += 5
                })
                yPosition += 3
              }
              
              // Add action plan if available
              if (answer.agreedActionPlan) {
                pdf.setTextColor(0, 100, 0) // Green for action plans
                pdf.text("Action Plan:", 30, yPosition)
                yPosition += 5
                const actionLines = pdf.splitTextToSize(answer.agreedActionPlan, maxWidth - 10)
                actionLines.forEach((line: string) => {
                  pdf.text(line, 40, yPosition)
                  yPosition += 5
                })
                yPosition += 3
              }
              
              // Add action date if available
              if (answer.actionDate) {
                let actionDateStr = "Invalid Date"
                try {
                  const actionDate = new Date(answer.actionDate)
                  if (!isNaN(actionDate.getTime())) {
                    actionDateStr = actionDate.toLocaleDateString()
                  }
                } catch (dateError) {
                  console.warn("Action date display error:", dateError)
                }
                pdf.setTextColor(0, 0, 0)
                pdf.text(`Target Date: ${actionDateStr}`, 30, yPosition)
                yPosition += 7
              }
              
              yPosition += 8
              questionNumber++
            }
          })
          
          // Add section separator
          yPosition += 5
        })
      
      console.log("PDF generation completed, saving file...")
      
      // Save the PDF with safe date handling
      let fileName: string
      try {
        const dateToUse = submission.createdAt || submission.submittedAt
        if (dateToUse) {
          const submissionDate = new Date(dateToUse)
          if (isNaN(submissionDate.getTime())) {
            // If date is invalid, use current date
            fileName = `assessment-${clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
          } else {
            fileName = `assessment-${clientName.replace(/\s+/g, '-')}-${submissionDate.toISOString().split('T')[0]}.pdf`
          }
        } else {
          // No date available, use current date
          fileName = `assessment-${clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
        }
      } catch (dateError) {
        console.warn("Date parsing error, using current date:", dateError)
        fileName = `assessment-${clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      }
      
      console.log("Saving PDF as:", fileName)
      pdf.save(fileName)
    } catch (pdfError) {
      console.error("Error during PDF generation:", pdfError)
      throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`)
    }
      
      console.log("PDF export completed successfully")
      toast({
        title: "Success",
        description: "Report exported as PDF successfully",
        duration: 5000, // Auto-dismiss after 5 seconds
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      })
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      })
    }
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
    try {
      const dateToUse = s.createdAt || s.submittedAt
      if (!dateToUse) return false
      
      const submissionDate = new Date(dateToUse)
      if (!isNaN(submissionDate.getTime())) {
        const now = new Date()
        return submissionDate.getMonth() === now.getMonth() && 
               submissionDate.getFullYear() === now.getFullYear()
      }
      return false
    } catch (error) {
      console.warn("Error processing submission date for monthly count:", error)
      return false
    }
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
                            onClick={async () => {
                              setSelectedSubmission(submission)
                              setShowDetailsDialog(true)
                              // Fetch detailed data when opening dialog
                              console.log("Opening details for submission:", submission._id)
                              const detailed = await fetchDetailedSubmission(submission._id)
                              if (detailed) {
                                setDetailedSubmission(detailed)
                              }
                            }}
                            className="h-10"
                            disabled={loadingDetails}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {loadingDetails ? "Loading..." : "View Details"}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSubmission(submission._id)}
                            className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingSubmission === submission._id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingSubmission === submission._id ? "Deleting..." : "Delete"}
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
                          {formatDate(submission.createdAt || submission.submittedAt || undefined)}
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
                        <p><strong>Assessment Date:</strong> {formatDate(selectedSubmission.createdAt || selectedSubmission.submittedAt)}</p>
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
                    {loadingDetails ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                        <span className="ml-3 text-gray-600">Loading detailed answers...</span>
                      </div>
                    ) : detailedSubmission?.questionnaire?.sections ? (
                      detailedSubmission.questionnaire.sections.map((section, sectionIndex) => (
                        <div key={section.id} className="space-y-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-900">Section {sectionIndex + 1}: {section.title}</h3>
                          </div>
                          {section.questions.map((question, questionIndex) => {
                            const answer = selectedSubmission?.answers.find(a => a.questionId === question.id)
                            if (!answer) return null
                            
                            const selectedOption = question.options[answer.selectedOption]
                            
                            return (
                              <Card key={question.id} className="border border-gray-200">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base">Question {questionIndex + 1}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Question:</p>
                                    <p className="text-sm text-gray-900 mb-3">{question.text}</p>
                                    
                                    <p className="text-sm font-medium text-gray-700 mb-2">Expected Evidence:</p>
                                    <p className="text-sm text-gray-600 mb-3">{question.expectedEvidence}</p>
                                    
                                    <p className="text-sm font-medium text-gray-700 mb-2">Available Options:</p>
                                    <div className="space-y-1">
                                      {question.options.map((option, optionIndex) => (
                                        <div 
                                          key={optionIndex} 
                                          className={`text-sm p-2 rounded ${
                                            optionIndex === answer.selectedOption 
                                              ? 'bg-green-100 border border-green-300 text-green-800' 
                                              : 'bg-gray-100 text-gray-600'
                                          }`}
                                        >
                                          <span className="font-medium">Option {optionIndex + 1}:</span> {option.text} ({option.points} points)
                                          {optionIndex === answer.selectedOption && (
                                            <span className="ml-2 text-green-600 font-semibold">✓ Selected</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-sm"><strong>Points Scored:</strong> {answer.points}</p>
                                    </div>
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
                                       <p className="text-sm text-gray-600">{formatDate(answer.actionDate || undefined)}</p>
                                     </div>
                                   )}
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No detailed answers available
                      </div>
                    )}
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