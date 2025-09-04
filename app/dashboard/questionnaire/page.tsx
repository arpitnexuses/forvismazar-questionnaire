"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, User, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Send, Save, Building, Upload, HelpCircle, Play, Target, Award } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Client {
  _id: string
  name: string
  email?: string
  company?: string
}

interface Question {
  id: string
  text: string
  expectedEvidence: string
  options: {
    text: string
    points: number
  }[]
}

interface Section {
  id: string
  title: string
  questions: Question[]
}

interface Questionnaire {
  _id: string
  title: string
  description: string
  sections: Section[]
}

interface UploadedFile {
  originalName: string
  fileName: string
  size: number
  type: string
  url: string
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
  uploadedFiles?: UploadedFile[]
}

export default function QuestionnairePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string>("")
  const [currentSection, setCurrentSection] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [uploading, setUploading] = useState<{ [questionId: string]: boolean }>({})

  useEffect(() => {
    fetchData()
  }, [])



  const fetchData = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      
      const [clientsResponse, questionnairesResponse] = await Promise.all([
        fetch("/api/team/clients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/team/questionnaires", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json()
        setClients(clientsData)
      }

      if (questionnairesResponse.ok) {
        const questionnairesData = await questionnairesResponse.json()
        setQuestionnaires(questionnairesData)
        
        // If no questionnaires exist, create a sample one
        if (questionnairesData.length === 0) {
          const initResponse = await fetch("/api/team/init-questionnaire", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          })
          
          if (initResponse.ok) {
            // Refetch questionnaires after initialization
            const updatedQuestionnairesResponse = await fetch("/api/team/questionnaires", {
              headers: { Authorization: `Bearer ${token}` },
            })
            
            if (updatedQuestionnairesResponse.ok) {
              const updatedQuestionnairesData = await updatedQuestionnairesResponse.json()
              setQuestionnaires(updatedQuestionnairesData)
            }
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const currentQuestionnaire = questionnaires.find(q => q._id === selectedQuestionnaire)
  const currentSectionData = currentQuestionnaire?.sections[currentSection]
  const totalSections = currentQuestionnaire?.sections.length || 0
  const progress = totalSections > 0 ? ((currentSection + 1) / totalSections) * 100 : 0

  const handleAnswerChange = (questionId: string, optionIndex: number, points: number) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId)
      if (existing) {
        return prev.map(a => 
          a.questionId === questionId 
            ? { ...a, selectedOption: optionIndex, points }
            : a
        )
      } else {
        return [...prev, { questionId, selectedOption: optionIndex, points }]
      }
    })
  }

  const handleTextChange = (questionId: string, field: 'testResult' | 'comments' | 'recommendation' | 'agreedActionPlan', value: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId)
      if (existing) {
        return prev.map(a => 
          a.questionId === questionId 
            ? { ...a, [field]: value }
            : a
        )
      } else {
        return [...prev, { questionId, selectedOption: 0, points: 0, [field]: value }]
      }
    })
  }

  const handleDateChange = (questionId: string, value: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId)
      if (existing) {
        return prev.map(a => 
          a.questionId === questionId 
            ? { ...a, actionDate: value }
            : a
        )
      } else {
        return [...prev, { questionId, selectedOption: 0, points: 0, actionDate: value }]
      }
    })
  }

  const handleTooltipEnter = (questionId: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const tooltipWidth = 384 // w-96 = 24rem = 384px
    const tooltipHeight = 120 // Approximate height of tooltip
    
    // Calculate x position, ensuring tooltip doesn't go off screen
    let x = rect.left + rect.width / 2
    if (x + tooltipWidth / 2 > windowWidth - 20) {
      x = windowWidth - tooltipWidth / 2 - 20
    }
    if (x - tooltipWidth / 2 < 20) {
      x = tooltipWidth / 2 + 20
    }
    
    // Calculate y position, ensuring tooltip doesn't go off screen
    let y = rect.top - 10
    if (y - tooltipHeight < 20) {
      // If tooltip would go above viewport, position it below the button
      y = rect.bottom + 10
    }
    
    setTooltipPosition({
      x: x,
      y: y
    })
    setTooltipVisible(questionId)
  }

  const handleTooltipLeave = () => {
    // Add a small delay to prevent flashing
    setTimeout(() => {
      setTooltipVisible(null)
    }, 100)
  }

  const handleFileUpload = async (questionId: string, files: FileList) => {
    if (!files || files.length === 0) return

    setUploading(prev => ({ ...prev, [questionId]: true }))

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      formData.append('questionId', questionId)

      const token = localStorage.getItem("auth-token")
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update the answer with uploaded files
        setAnswers(prev => {
          const existing = prev.find(a => a.questionId === questionId)
          if (existing) {
            return prev.map(a => 
              a.questionId === questionId 
                ? { 
                    ...a, 
                    uploadedFiles: [...(a.uploadedFiles || []), ...result.files]
                  }
                : a
            )
          } else {
            return [...prev, { 
              questionId, 
              selectedOption: 0, 
              points: 0, 
              uploadedFiles: result.files 
            }]
          }
        })

        toast({
          title: "Success",
          description: `${result.files.length} file(s) uploaded successfully`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload files",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading files",
        variant: "destructive",
      })
    } finally {
      setUploading(prev => ({ ...prev, [questionId]: false }))
    }
  }

  const nextSection = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1)
      // Scroll to top after state update
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 50)
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      // Scroll to top after state update
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 50)
    }
  }

  const handleSubmit = async () => {
    if (!selectedClient || !selectedQuestionnaire) {
      toast({
        title: "Error",
        description: "Please select a client and questionnaire",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem("auth-token")
      
      // Calculate section scores
      const sectionScores = currentQuestionnaire?.sections.map(section => {
        const sectionAnswers = answers.filter(answer => 
          section.questions.some(q => q.id === answer.questionId)
        )
        const score = sectionAnswers.reduce((sum, answer) => sum + (answer.points || 0), 0)
        const maxScore = section.questions.length * 5 // Assuming max 5 points per question
        
        return {
          sectionId: section.id,
          score,
          maxScore
        }
      }) || []

      const totalScore = sectionScores.reduce((sum, section) => sum + section.score, 0)
      const maxTotalScore = sectionScores.reduce((sum, section) => sum + section.maxScore, 0)

      const submissionData = {
        client: selectedClient,
        questionnaire: selectedQuestionnaire,
        answers,
        sectionScores,
        totalScore,
        maxTotalScore
      }

      const response = await fetch("/api/team/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Assessment submitted successfully",
        })
        
        // Reset form
        setSelectedClient("")
        setSelectedQuestionnaire("")
        setCurrentSection(0)
        setAnswers([])
        setShowSubmitDialog(false)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to submit assessment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast({
        title: "Error",
        description: "Failed to submit assessment",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSave = async () => {
    if (!selectedClient || !selectedQuestionnaire) {
      toast({
        title: "Error",
        description: "Please select a client and questionnaire",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("auth-token")
      
      const draftData = {
        client: selectedClient,
        questionnaire: selectedQuestionnaire,
        answers,
        currentSection
      }

      const response = await fetch("/api/team/submissions/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draftData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Draft saved successfully",
        })
        setShowSaveDialog(false)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to save draft",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getMaturityData = (points: number) => {
    const levels = [
      { name: "Not Available", color: "bg-gray-100 text-gray-700 border-gray-300", icon: "⚪" },
      { name: "Ad Hoc", color: "bg-red-100 text-red-700 border-red-300", icon: "🔴" },
      { name: "Basic", color: "bg-orange-100 text-orange-700 border-orange-300", icon: "🟠" },
      { name: "Managed", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: "🟡" },
      { name: "Aligned", color: "bg-blue-100 text-blue-700 border-blue-300", icon: "🔵" },
      { name: "Optimized", color: "bg-green-100 text-green-700 border-green-300", icon: "🟢" }
    ]
    return levels[points] || levels[0]
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

  const selectedClientData = clients.find(c => c._id === selectedClient)
  const answeredQuestions = currentSectionData?.questions.filter(q => 
    answers.some(a => a.questionId === q.id && a.selectedOption !== undefined)
  ).length || 0
  const totalQuestions = currentSectionData?.questions.length || 0
  const sectionProgress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Risk Assessment</h1>
              <p className="text-gray-600 mt-2">Complete comprehensive risk assessments for your clients</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{questionnaires.length}</p>
              <p className="text-sm text-gray-500">Available Assessments</p>
            </div>
          </div>
        </div>

        {!selectedClient || !selectedQuestionnaire ? (
          <>
            {/* Selection Cards */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Client Selection */}
              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">Select Client</CardTitle>
                      <CardDescription className="text-gray-600">
                        Choose the client for this risk assessment
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Choose a client to assess..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length === 0 ? (
                        <SelectItem value="" disabled>
                          No clients available - Add clients first
                        </SelectItem>
                      ) : (
                        clients.map((client) => (
                          <SelectItem key={client._id} value={client._id}>
                            <div className="flex items-center space-x-3 py-2">
                              <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                                  {getInitials(client.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{client.name}</div>
                                {client.company && (
                                  <div className="text-xs text-gray-500">{client.company}</div>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  {selectedClient && selectedClientData && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            {getInitials(selectedClientData.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900">{selectedClientData.name}</div>
                          {selectedClientData.company && (
                            <div className="text-sm text-gray-600 flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {selectedClientData.company}
                            </div>
                          )}
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Questionnaire Selection */}
              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">Select Assessment</CardTitle>
                      <CardDescription className="text-gray-600">
                        Choose the type of risk assessment to conduct
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedQuestionnaire} onValueChange={setSelectedQuestionnaire}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Choose an assessment type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {questionnaires.length === 0 ? (
                        <SelectItem value="" disabled>
                          No assessments available
                        </SelectItem>
                      ) : (
                        questionnaires.map((questionnaire) => (
                          <SelectItem key={questionnaire._id} value={questionnaire._id}>
                            <div className="py-2">
                              <div className="font-medium">{questionnaire.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{questionnaire.description}</div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  {selectedQuestionnaire && currentQuestionnaire && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 flex items-center">
                            <Target className="h-4 w-4 mr-2 text-green-600" />
                            {currentQuestionnaire.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{currentQuestionnaire.description}</div>
                          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                            <span>{totalSections} sections</span>
                            <span>•</span>
                            <span>{currentQuestionnaire.sections.reduce((total, section) => total + section.questions.length, 0)} questions</span>
                          </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Start Assessment Button */}
            {selectedClient && selectedQuestionnaire && (
              <div className="text-center">
                <Card className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 shadow-sm inline-block">
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Begin Assessment</h3>
                        <p className="text-gray-600 max-w-md">
                          You've selected your client and assessment type. Click below to start the risk assessment process.
                        </p>
                      </div>
                      <Button 
                        size="lg" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 h-auto"
                        onClick={() => setCurrentSection(0)}
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Start Assessment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Assessment Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {getInitials(selectedClientData?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedClientData?.name}</h2>
                    <p className="text-gray-600">{currentQuestionnaire?.title}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" onClick={() => setShowSaveDialog(true)} className="h-10">
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={() => setShowSubmitDialog(true)} className="bg-blue-600 hover:bg-blue-700 h-10">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Assessment
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Assessment Progress</h3>
                    <p className="text-sm text-gray-600">Section {currentSection + 1} of {totalSections}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
                    <div className="text-sm text-gray-500">Overall Complete</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Section Progress: {Math.round(sectionProgress)}%</span>
                    <span>{answeredQuestions} of {totalQuestions} questions answered</span>
                  </div>
                </div>

                {/* Section Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={prevSection}
                    disabled={currentSection === 0}
                    className="flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous Section
                  </Button>
                  
                  <div className="text-center">
                    <Badge variant="outline" className="text-sm font-medium">
                      {currentSectionData?.title}
                    </Badge>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={nextSection}
                    disabled={currentSection === totalSections - 1}
                    className="flex items-center"
                  >
                    Next Section
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            {currentSectionData && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">{currentSectionData.title}</h2>
                    <p className="text-gray-600 mt-2">Please answer all questions in this section</p>
                  </div>
                </div>

                {currentSectionData.questions.map((question, questionIndex) => {
                  const currentAnswer = answers.find(a => a.questionId === question.id)
                  const hasAnswer = currentAnswer?.selectedOption !== undefined
                  const maturityData = getMaturityData(currentAnswer?.points || 0)
                  
                  return (
                    <Card key={question.id} className={`bg-white border-2 transition-all duration-200 ${
                      hasAnswer ? 'border-green-200 shadow-md' : 'border-gray-200 shadow-sm hover:shadow-md'
                    }`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start space-x-4">
                          <Badge 
                            variant={hasAnswer ? "default" : "outline"} 
                            className={`mt-1 ${hasAnswer ? 'bg-green-600' : ''}`}
                          >
                            Q{questionIndex + 1}
                          </Badge>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg font-semibold text-gray-900 pr-4">{question.text}</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-10 w-10 p-0 bg-blue-50 hover:bg-blue-100 text-blue-600"
                                onMouseEnter={(e) => handleTooltipEnter(question.id, e)}
                                onMouseLeave={handleTooltipLeave}
                                aria-label={`View expected evidence for question ${questionIndex + 1}`}
                              >
                                <HelpCircle className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <RadioGroup
                          value={currentAnswer?.selectedOption?.toString() || ""}
                          onValueChange={(value) => {
                            const optionIndex = parseInt(value)
                            const points = question.options[optionIndex]?.points || 0
                            handleAnswerChange(question.id, optionIndex, points)
                          }}
                          className="space-y-3"
                        >
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                              <RadioGroupItem 
                                value={optionIndex.toString()} 
                                id={`${question.id}-${optionIndex}`}
                                className="mt-0.5" 
                              />
                              <Label 
                                htmlFor={`${question.id}-${optionIndex}`} 
                                className="flex-1 cursor-pointer text-sm leading-relaxed"
                              >
                                {option.text}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {option.points} pts
                              </Badge>
                            </div>
                          ))}
                        </RadioGroup>

                        {/* Additional Details Section */}
                        {hasAnswer && (
                          <div className="bg-gray-50 rounded-xl p-6 space-y-6 border-t-4 border-green-500">
                            <div className="flex items-center space-x-2 text-green-700">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">Option selected - Please provide additional details</span>
                            </div>

                            {/* Maturity Level Display */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <Label className="text-sm font-semibold text-gray-700 block mb-3">
                                <Award className="inline h-4 w-4 mr-2" />
                                Maturity Level Assessment
                              </Label>
                              <div className="flex items-center space-x-4">
                                <Badge 
                                  className={`text-base px-4 py-2 font-semibold border-2 ${maturityData.color}`}
                                >
                                  {maturityData.icon} {maturityData.name}
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                  {currentAnswer?.points || 0} / 5 points
                                </Badge>
                              </div>
                            </div>

                            {/* Comments Section */}
                            <div className="space-y-4">
                              <Label className="text-sm font-semibold text-gray-700">
                                Comments & Observations
                              </Label>
                              <Textarea
                                placeholder="Please provide your detailed comments, observations, findings, and any additional context for this assessment..."
                                value={currentAnswer?.comments || ""}
                                onChange={(e) => handleTextChange(question.id, 'comments', e.target.value)}
                                className="min-h-[100px] resize-none"
                                rows={4}
                              />
                            </div>

                            {/* File Upload Section */}
                            <div className="space-y-4">
                              <Label className="text-sm font-semibold text-gray-700">
                                Supporting Documentation
                              </Label>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer">
                                <div className="text-center">
                                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Upload supporting documents</p>
                                    <p className="text-xs text-gray-500">PDF, DOC, XLS, Images up to 10MB each</p>
                                  </div>
                                  <input
                                    type="file"
                                    id={`file-upload-${question.id}`}
                                    multiple
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files) {
                                        handleFileUpload(question.id, e.target.files);
                                        e.target.value = '';
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => document.getElementById(`file-upload-${question.id}`)?.click()}
                                    disabled={uploading[question.id]}
                                  >
                                    {uploading[question.id] ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Choose Files
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Display uploaded files */}
                              {currentAnswer?.uploadedFiles && currentAnswer.uploadedFiles.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                                  <div className="space-y-1">
                                    {currentAnswer.uploadedFiles.map((file, index) => (
                                      <div key={index} className="flex items-center space-x-2 text-sm bg-green-50 p-2 rounded border border-green-200">
                                        <FileText className="h-4 w-4 text-green-600" />
                                        <span className="flex-1 text-green-800">{file.originalName}</span>
                                        <Badge variant="outline" className="text-xs text-green-700">
                                          {(file.size / 1024).toFixed(1)} KB
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Recommendation Section */}
                            <div className="space-y-4">
                              <Label className="text-sm font-semibold text-gray-700">
                                Recommendation
                              </Label>
                              <Textarea
                                placeholder="Provide recommendations for improvement or remediation..."
                                value={currentAnswer?.recommendation || ""}
                                onChange={(e) => handleTextChange(question.id, 'recommendation', e.target.value)}
                                className="min-h-[80px] resize-none"
                                rows={3}
                              />
                            </div>

                            {/* Agreed Action Plan Section */}
                            <div className="space-y-4">
                              <Label className="text-sm font-semibold text-gray-700">
                                Agreed Action Plan
                              </Label>
                              <Textarea
                                placeholder="Detail the specific actions agreed upon to address identified risks or gaps..."
                                value={currentAnswer?.agreedActionPlan || ""}
                                onChange={(e) => handleTextChange(question.id, 'agreedActionPlan', e.target.value)}
                                className="min-h-[80px] resize-none"
                                rows={3}
                              />
                            </div>

                            {/* Action Date Section */}
                            <div className="space-y-4">
                              <Label className="text-sm font-semibold text-gray-700">
                                Action Date
                              </Label>
                              <input
                                type="date"
                                value={currentAnswer?.actionDate || ""}
                                onChange={(e) => handleDateChange(question.id, e.target.value)}
                                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-6 border-t mt-8">
                  <Button
                    variant="outline"
                    onClick={prevSection}
                    disabled={currentSection === 0}
                    className="flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous Section
                  </Button>
                  
                  <div className="text-center">
                    <Badge variant="outline" className="text-sm font-medium">
                      {currentSectionData?.title}
                    </Badge>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={nextSection}
                    disabled={currentSection === totalSections - 1}
                    className="flex items-center"
                  >
                    Next Section
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>


            )}
          </>
        )}

        {/* Tooltip */}
        {tooltipVisible && (
          <div
            className="fixed z-[9999] w-96 p-4 bg-white border border-gray-200 rounded-lg shadow-2xl max-w-sm pointer-events-none"
            style={{
              left: tooltipPosition.x - 192, // Center the tooltip (w-96 = 384px / 2 = 192px)
              top: tooltipPosition.y - 60, // Position above the element
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Expected Evidence</h4>
              </div>
                             <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                 {currentSectionData?.questions.find(q => q.id === tooltipVisible)?.expectedEvidence ? (
                   currentSectionData.questions.find(q => q.id === tooltipVisible)?.expectedEvidence
                     .split('.')
                     .filter(sentence => sentence.trim().length > 0)
                     .map((sentence, index) => (
                       <p key={index} className="text-sm text-gray-600">
                         {sentence.trim()}.
                       </p>
                     ))
                 ) : (
                   <p className="text-sm text-gray-600">No expected evidence specified for this question.</p>
                 )}
               </div>
            </div>
          </div>
        )}

        {/* Submit Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Submit Assessment</DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you ready to submit this risk assessment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{selectedClientData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assessment:</span>
                  <span className="font-medium">{currentQuestionnaire?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium">{Math.round(progress)}% Complete</span>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Assessment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Save Draft</DialogTitle>
              <DialogDescription className="text-gray-600">
                Save your current progress as a draft to continue later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 