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
  actionDate?: string
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
  submittedAt: string
  createdAt: string
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
        submission.questionnaire.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.client.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      const scorePercentage = (submission: Submission) => 
        (submission.totalScore / submission.maxTotalScore) * 100

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
    const percentage = (submission.totalScore / submission.maxTotalScore) * 100
    if (percentage >= 80) return { label: "Excellent", variant: "default" as const, color: "text-green-600" }
    if (percentage >= 60) return { label: "Good", variant: "secondary" as const, color: "text-blue-600" }
    if (percentage >= 40) return { label: "Fair", variant: "outline" as const, color: "text-yellow-600" }
    return { label: "Poor", variant: "destructive" as const, color: "text-red-600" }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportSubmissions = () => {
    const csvContent = [
      ["Client", "Questionnaire", "Submitted By", "Score", "Max Score", "Percentage", "Status", "Submitted At"],
      ...filteredSubmissions.map(submission => [
        submission.client.name,
        submission.questionnaire.title,
        submission.submittedBy.name,
        submission.totalScore.toString(),
        submission.maxTotalScore.toString(),
        `${((submission.totalScore / submission.maxTotalScore) * 100).toFixed(1)}%`,
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Submissions</h2>
          <p className="text-muted-foreground">View and manage all questionnaire submissions</p>
        </div>
        <Button onClick={exportSubmissions} disabled={filteredSubmissions.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.length > 0 
                ? `${((submissions.reduce((sum, s) => sum + (s.totalScore / s.maxTotalScore), 0) / submissions.length) * 100).toFixed(1)}%`
                : "0%"
              }
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(submissions.map(s => s.client._id)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter(s => {
                const submissionDate = new Date(s.submittedAt)
                const now = new Date()
                return submissionDate.getMonth() === now.getMonth() && 
                       submissionDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Recent submissions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client, questionnaire, or submitter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
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

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            Showing {filteredSubmissions.length} of {submissions.length} submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No submissions found</h3>
              <p className="text-muted-foreground">
                {submissions.length === 0 ? "No submissions have been made yet." : "No submissions match your filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Questionnaire</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => {
                  const status = getScoreStatus(submission)
                  return (
                    <TableRow key={submission._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.client.name}</div>
                          {submission.client.company && (
                            <div className="text-sm text-muted-foreground">{submission.client.company}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{submission.questionnaire.title}</div>
                        <div className="text-sm text-muted-foreground">{submission.questionnaire.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{submission.submittedBy.name}</div>
                        <div className="text-sm text-muted-foreground">{submission.submittedBy.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {submission.totalScore} / {submission.maxTotalScore}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {((submission.totalScore / submission.maxTotalScore) * 100).toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(submission.submittedAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(submission)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(submission)
                              setShowDeleteDialog(true)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Detailed view of the questionnaire submission
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Client Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Name:</span> {selectedSubmission.client.name}
                      </div>
                      {selectedSubmission.client.email && (
                        <div>
                          <span className="font-medium">Email:</span> {selectedSubmission.client.email}
                        </div>
                      )}
                      {selectedSubmission.client.company && (
                        <div>
                          <span className="font-medium">Company:</span> {selectedSubmission.client.company}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Submission Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Questionnaire:</span> {selectedSubmission.questionnaire.title}
                      </div>
                      <div>
                        <span className="font-medium">Submitted By:</span> {selectedSubmission.submittedBy.name}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {formatDate(selectedSubmission.submittedAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Score Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Score</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {selectedSubmission.totalScore} / {selectedSubmission.maxTotalScore}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {((selectedSubmission.totalScore / selectedSubmission.maxTotalScore) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={(selectedSubmission.totalScore / selectedSubmission.maxTotalScore) * 100} 
                      className="w-full" 
                    />
                    <Badge variant={getScoreStatus(selectedSubmission).variant} className={getScoreStatus(selectedSubmission).color}>
                      {getScoreStatus(selectedSubmission).label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {selectedSubmission.sectionScores.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Section Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedSubmission.sectionScores.map((section, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">Section {index + 1}</span>
                          <div className="text-right">
                            <div className="font-medium">
                              {section.score} / {section.maxScore}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {((section.score / section.maxScore) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Question Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedSubmission.answers.map((answer, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium">Question {index + 1}</span>
                            <div className="text-sm text-muted-foreground mt-1">
                              Points: {answer.points}
                            </div>
                          </div>
                          
                          {answer.testResult && (
                            <div>
                              <span className="font-medium text-sm">Test Result:</span>
                              <div className="text-sm mt-1">{answer.testResult}</div>
                            </div>
                          )}
                          
                          {answer.comments && (
                            <div>
                              <span className="font-medium text-sm">Comments:</span>
                              <div className="text-sm mt-1">{answer.comments}</div>
                            </div>
                          )}
                          
                          {answer.recommendation && (
                            <div>
                              <span className="font-medium text-sm">Recommendation:</span>
                              <div className="text-sm mt-1">{answer.recommendation}</div>
                            </div>
                          )}
                          
                          {answer.agreedActionPlan && (
                            <div>
                              <span className="font-medium text-sm">Agreed Action Plan:</span>
                              <div className="text-sm mt-1">{answer.agreedActionPlan}</div>
                            </div>
                          )}
                          
                          {answer.actionDate && (
                            <div>
                              <span className="font-medium text-sm">Action Date:</span>
                              <div className="text-sm mt-1">{answer.actionDate}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this submission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will permanently delete the submission and all associated data.
              </AlertDescription>
            </Alert>
            {selectedSubmission && (
              <div className="p-4 border rounded-lg">
                <div className="font-medium">{selectedSubmission.client.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedSubmission.questionnaire.title} - {formatDate(selectedSubmission.submittedAt)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedSubmission && handleDeleteSubmission(selectedSubmission._id)}
              disabled={deletingSubmission !== null}
            >
              {deletingSubmission ? "Deleting..." : "Delete Submission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 