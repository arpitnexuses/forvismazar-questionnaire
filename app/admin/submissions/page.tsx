"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Search, 
  Eye, 
  Download, 
  Calendar, 
  User, 
  FileText, 
  TrendingUp,
  Trash2,
  AlertCircle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Client {
  _id: string
  name: string
  email?: string
  company?: string
}

interface Questionnaire {
  _id: string
  title: string
  description: string
}

interface User {
  _id: string
  name: string
  email: string
}

interface Answer {
  questionId: string
  selectedOption: number
  points: number
  testResult?: string
  comments?: string
  recommendation?: string
  agreedActionPlan?: string
  actionDate?: string | Date
}

interface Submission {
  _id: string
  client: Client
  questionnaire: Questionnaire
  submittedBy: User
  answers: Answer[]
  sectionScores: {
    sectionId: string
    score: number
    maxScore: number
  }[]
  totalScore: number
  maxTotalScore: number
  submittedAt: string | Date
  createdAt: string | Date
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingSubmission, setDeletingSubmission] = useState<string | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchTerm, statusFilter])

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/admin/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched submissions data:", data)
        // Log the first submission's questionnaire data for debugging
        if (data.length > 0) {
          console.log("First submission questionnaire:", data[0].questionnaire)
          console.log("First submission questionnaire type:", typeof data[0].questionnaire)
          console.log("First submission questionnaire ID:", data[0].questionnaire?._id)
          console.log("First submission questionnaire title:", data[0].questionnaire?.title)
          console.log("First submission questionnaire description:", data[0].questionnaire?.description)
          
          // Check how many submissions have missing questionnaire data
          const submissionsWithMissingQuestionnaire = data.filter((s: Submission) => !s.questionnaire)
          console.log("Submissions with missing questionnaire data:", submissionsWithMissingQuestionnaire.length)
        }
        setSubmissions(data)
      } else {
        console.error("Failed to fetch submissions")
        toast({
          title: "Error",
          description: "Failed to fetch submissions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterSubmissions = () => {
    let filtered = submissions

    if (searchTerm) {
      filtered = filtered.filter(submission => 
        submission.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (submission.questionnaire?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.client.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      const scorePercentage = (submission: Submission) => {
        if (submission.maxTotalScore === 0 || isNaN(submission.totalScore) || isNaN(submission.maxTotalScore)) {
          return 0
        }
        return (submission.totalScore / submission.maxTotalScore) * 100
      }

      switch (statusFilter) {
        case "excellent":
          filtered = filtered.filter(s => scorePercentage(s) >= 80)
          break
        case "good":
          filtered = filtered.filter(s => scorePercentage(s) >= 60 && scorePercentage(s) < 80)
          break
        case "fair":
          filtered = filtered.filter(s => scorePercentage(s) >= 40 && scorePercentage(s) < 60)
          break
        case "poor":
          filtered = filtered.filter(s => scorePercentage(s) < 40)
          break
      }
    }

    setFilteredSubmissions(filtered)
  }

  const getScoreStatus = (submission: Submission) => {
    // Safety check for division by zero or invalid scores
    if (submission.maxTotalScore === 0 || isNaN(submission.totalScore) || isNaN(submission.maxTotalScore)) {
      return { label: "N/A", variant: "outline" as const, color: "text-gray-600" }
    }
    
    const percentage = (submission.totalScore / submission.maxTotalScore) * 100
    
    // Ensure percentage is within valid range
    if (percentage < 0 || percentage > 100) {
      return { label: "Invalid", variant: "destructive" as const, color: "text-red-600" }
    }
    
    if (percentage >= 80) return { label: "Excellent", variant: "default" as const, color: "text-green-600" }
    if (percentage >= 60) return { label: "Good", variant: "secondary" as const, color: "text-blue-600" }
    if (percentage >= 40) return { label: "Fair", variant: "outline" as const, color: "text-yellow-600" }
    return { label: "Poor", variant: "destructive" as const, color: "text-red-600" }
  }

  const getQuestionnaireDisplay = (submission: Submission) => {
    if (!submission.questionnaire) {
      return { title: 'Questionnaire Not Found', description: 'Questionnaire may have been deleted' }
    }
    
    // Handle case where questionnaire might be an ObjectId string
    if (typeof submission.questionnaire === 'string') {
      return { title: 'Questionnaire ID: ' + submission.questionnaire, description: 'Raw questionnaire reference' }
    }
    
    // Handle populated questionnaire object
    return {
      title: submission.questionnaire.title || 'Untitled Questionnaire',
      description: submission.questionnaire.description || 'No description available'
    }
  }

  const formatDate = (dateString: string | Date) => {
    try {
      // Handle various date formats
      let date: Date
      
      // If it's already a Date object (from MongoDB)
      if (dateString instanceof Date) {
        date = dateString
      } else if (typeof dateString === 'string') {
        // Try parsing as ISO string first
        date = new Date(dateString)
        
        // If that fails, try other common formats
        if (isNaN(date.getTime())) {
          // Try parsing as timestamp
          const timestamp = parseInt(dateString)
          if (!isNaN(timestamp)) {
            date = new Date(timestamp)
          } else {
            return "Invalid Date"
          }
        }
      } else {
        return "Invalid Date"
      }
      
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date:", error, "Date string:", dateString)
      return "Invalid Date"
    }
  }

  const exportSubmissions = () => {
    const csvContent = [
      ["Client", "Questionnaire", "Submitted By", "Score", "Max Score", "Percentage", "Status", "Submitted At"],
      ...filteredSubmissions.map(submission => [
        submission.client.name,
        getQuestionnaireDisplay(submission).title,
        submission.submittedBy.name,
        submission.totalScore.toString(),
        submission.maxTotalScore.toString(),
        submission.maxTotalScore > 0 
          ? `${((submission.totalScore / submission.maxTotalScore) * 100).toFixed(1)}%`
          : "N/A",
        getScoreStatus(submission).label,
        formatDate(submission.submittedAt)
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `submissions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Submissions exported successfully",
    })
  }

  const handleDeleteSubmission = async (submissionId: string) => {
    setDeletingSubmission(submissionId)
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/admin/submissions/${submissionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Submission deleted successfully",
        })
        fetchSubmissions()
        setShowDeleteDialog(false)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to delete submission",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting submission:", error)
      toast({
        title: "Error",
        description: "Failed to delete submission",
        variant: "destructive",
      })
    } finally {
      setDeletingSubmission(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Submissions</h1>
              <p className="text-gray-600 mt-2">View and manage all questionnaire submissions</p>
            </div>
            <Button 
              onClick={exportSubmissions} 
              disabled={filteredSubmissions.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{submissions.length}</p>
                  <p className="text-xs text-gray-500 mt-1">All time submissions</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {submissions.length > 0 
                      ? `${((submissions.reduce((sum, s) => {
                          if (s.maxTotalScore > 0 && !isNaN(s.totalScore) && !isNaN(s.maxTotalScore)) {
                            return sum + (s.totalScore / s.maxTotalScore)
                          }
                          return sum
                        }, 0) / submissions.filter(s => s.maxTotalScore > 0).length) * 100).toFixed(1)}%`
                      : "0%"
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Overall performance</p>
                </div>
                <div className="p-3 rounded-full bg-green-50 text-green-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {new Set(submissions.map(s => s.client._id)).size}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Unique clients</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                  <User className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {submissions.filter(s => {
                      try {
                        const submissionDate = s.submittedAt instanceof Date ? s.submittedAt : new Date(s.submittedAt)
                        if (isNaN(submissionDate.getTime())) return false
                        const now = new Date()
                        return submissionDate.getMonth() === now.getMonth() && 
                               submissionDate.getFullYear() === now.getFullYear()
                      } catch (error) {
                        return false
                      }
                    }).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Recent submissions</p>
                </div>
                <div className="p-3 rounded-full bg-orange-50 text-orange-600">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Filters</CardTitle>
            <CardDescription className="text-gray-600">Search and filter submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by client, questionnaire, or submitter..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Submissions</SelectItem>
                  <SelectItem value="excellent">Excellent (≥80%)</SelectItem>
                  <SelectItem value="good">Good (60-79%)</SelectItem>
                  <SelectItem value="fair">Fair (40-59%)</SelectItem>
                  <SelectItem value="poor">Poor (below 40%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">All Submissions</CardTitle>
                <CardDescription className="text-gray-600">
                  Showing {filteredSubmissions.length} of {submissions.length} submissions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium text-gray-700">Client</TableHead>
                    <TableHead className="font-medium text-gray-700">Questionnaire</TableHead>
                    <TableHead className="font-medium text-gray-700">Submitted By</TableHead>
                    <TableHead className="font-medium text-gray-700">Score</TableHead>
                    <TableHead className="font-medium text-gray-700">Status</TableHead>
                    <TableHead className="font-medium text-gray-700">Submitted</TableHead>
                    <TableHead className="font-medium text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => {
                    const scoreStatus = getScoreStatus(submission)
                    const questionnaireDisplay = getQuestionnaireDisplay(submission)
                    
                    return (
                      <TableRow key={submission._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{submission.client.name}</p>
                            {submission.client.company && (
                              <p className="text-sm text-gray-500">{submission.client.company}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{questionnaireDisplay.title}</p>
                            <p className="text-sm text-gray-500">{questionnaireDisplay.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{submission.submittedBy.name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {submission.totalScore}/{submission.maxTotalScore}
                            </p>
                            <p className="text-sm text-gray-500">
                              {submission.maxTotalScore > 0 
                                ? `${((submission.totalScore / submission.maxTotalScore) * 100).toFixed(1)}%`
                                : "N/A"
                              }
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={scoreStatus.variant}
                            className={`${
                              scoreStatus.label === "Excellent" ? "bg-green-100 text-green-700" :
                              scoreStatus.label === "Good" ? "bg-blue-100 text-blue-700" :
                              scoreStatus.label === "Fair" ? "bg-yellow-100 text-yellow-700" :
                              scoreStatus.label === "Poor" ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {scoreStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDate(submission.submittedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission)
                                setShowDetailsDialog(true)
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this submission? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSubmission(submission._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deletingSubmission === submission._id}
                                  >
                                    {deletingSubmission === submission._id ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Submission Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Submission Details</DialogTitle>
              <DialogDescription>View detailed information about this submission</DialogDescription>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Name</Label>
                        <p className="text-gray-900">{selectedSubmission.client.name}</p>
                      </div>
                      {selectedSubmission.client.email && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Email</Label>
                          <p className="text-gray-900">{selectedSubmission.client.email}</p>
                        </div>
                      )}
                      {selectedSubmission.client.company && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Company</Label>
                          <p className="text-gray-900">{selectedSubmission.client.company}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold">Submission Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Questionnaire</Label>
                        <p className="text-gray-900">{getQuestionnaireDisplay(selectedSubmission).title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Submitted By</Label>
                        <p className="text-gray-900">{selectedSubmission.submittedBy.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Submitted At</Label>
                        <p className="text-gray-900">{formatDate(selectedSubmission.submittedAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Score Information */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Score Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedSubmission.totalScore}/{selectedSubmission.maxTotalScore}
                        </p>
                        <p className="text-sm text-gray-600">Total Score</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedSubmission.maxTotalScore > 0 
                            ? `${((selectedSubmission.totalScore / selectedSubmission.maxTotalScore) * 100).toFixed(1)}%`
                            : "N/A"
                          }
                        </p>
                        <p className="text-sm text-gray-600">Percentage</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Badge 
                          variant={getScoreStatus(selectedSubmission).variant}
                          className={`text-sm ${
                            getScoreStatus(selectedSubmission).label === "Excellent" ? "bg-green-100 text-green-700" :
                            getScoreStatus(selectedSubmission).label === "Good" ? "bg-blue-100 text-blue-700" :
                            getScoreStatus(selectedSubmission).label === "Fair" ? "bg-yellow-100 text-yellow-700" :
                            getScoreStatus(selectedSubmission).label === "Poor" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {getScoreStatus(selectedSubmission).label}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">Status</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section Scores */}
                {selectedSubmission.sectionScores && selectedSubmission.sectionScores.length > 0 && (
                  <Card className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold">Section Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedSubmission.sectionScores.map((sectionScore, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">Section {index + 1}</p>
                              <p className="text-sm text-gray-600">
                                {sectionScore.score}/{sectionScore.maxScore} points
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {sectionScore.maxScore > 0 
                                  ? `${((sectionScore.score / sectionScore.maxScore) * 100).toFixed(1)}%`
                                  : "N/A"
                                }
                              </p>
                              <Progress 
                                value={sectionScore.maxScore > 0 ? (sectionScore.score / sectionScore.maxScore) * 100 : 0} 
                                className="w-24 h-2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 