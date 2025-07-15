"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Search, FileText, Eye, Copy, BarChart3, X, Save, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { riskManagementTemplate } from "@/lib/risk-management-template"

interface Question {
  id: string
  subtitle?: string
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
  isActive: boolean
  createdBy: {
    _id: string
    name: string
  }
  createdAt: string
  submissionCount?: number
}

interface CreateQuestionnaireData {
  title: string
  description: string
  sections: Section[]
  isActive: boolean
}




export default function EnhancedManageQuestionnaires() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null)
  const [createQuestionnaireData, setCreateQuestionnaireData] = useState<CreateQuestionnaireData>({
    title: "",
    description: "",
    sections: [],
    isActive: true,
  })
  const [editQuestionnaireData, setEditQuestionnaireData] = useState<CreateQuestionnaireData>({
    title: "",
    description: "",
    sections: [],
    isActive: true,
  })

  useEffect(() => {
    fetchQuestionnaires()
  }, [])

  const fetchQuestionnaires = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/admin/questionnaires", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setQuestionnaires(data.questionnaires)
      } else {
        toast.error("Failed to fetch questionnaires")
      }
    } catch (error) {
      console.error("Error fetching questionnaires:", error)
      toast.error("Error fetching questionnaires")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuestionnaire = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/admin/questionnaires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createQuestionnaireData),
      })

      if (response.ok) {
        toast.success("Questionnaire created successfully")
        setIsCreateDialogOpen(false)
        setCreateQuestionnaireData({ title: "", description: "", sections: [], isActive: true })
        fetchQuestionnaires()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create questionnaire")
      }
    } catch (error) {
      console.error("Error creating questionnaire:", error)
      toast.error("Error creating questionnaire")
    }
  }

  const handleEditQuestionnaire = async () => {
    if (!selectedQuestionnaire) return

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/admin/questionnaires/${selectedQuestionnaire._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editQuestionnaireData),
      })

      if (response.ok) {
        toast.success("Questionnaire updated successfully")
        setIsEditDialogOpen(false)
        setSelectedQuestionnaire(null)
        setEditQuestionnaireData({ title: "", description: "", sections: [], isActive: true })
        fetchQuestionnaires()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update questionnaire")
      }
    } catch (error) {
      console.error("Error updating questionnaire:", error)
      toast.error("Error updating questionnaire")
    }
  }

  const handleDeleteQuestionnaire = async (questionnaireId: string) => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/admin/questionnaires/${questionnaireId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Questionnaire deleted successfully")
        fetchQuestionnaires()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to delete questionnaire")
      }
    } catch (error) {
      console.error("Error deleting questionnaire:", error)
      toast.error("Error deleting questionnaire")
    }
  }

  const handleToggleActive = async (questionnaireId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/admin/questionnaires/${questionnaireId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast.success(`Questionnaire ${isActive ? "activated" : "deactivated"} successfully`)
        fetchQuestionnaires()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update questionnaire status")
      }
    } catch (error) {
      console.error("Error updating questionnaire status:", error)
      toast.error("Error updating questionnaire status")
    }
  }

  const openEditDialog = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire)
    setEditQuestionnaireData({
      title: questionnaire.title,
      description: questionnaire.description,
      sections: questionnaire.sections,
      isActive: questionnaire.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const addSection = (questionnaireData: CreateQuestionnaireData, setData: (data: CreateQuestionnaireData) => void) => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: "",
      questions: []
    }
    setData({
      ...questionnaireData,
      sections: [...questionnaireData.sections, newSection]
    })
  }

  const removeSection = (questionnaireData: CreateQuestionnaireData, setData: (data: CreateQuestionnaireData) => void, sectionIndex: number) => {
    const newSections = questionnaireData.sections.filter((_, index) => index !== sectionIndex)
    setData({
      ...questionnaireData,
      sections: newSections
    })
  }

  const updateSectionTitle = (questionnaireData: CreateQuestionnaireData, setData: (data: CreateQuestionnaireData) => void, sectionIndex: number, title: string) => {
    const newSections = [...questionnaireData.sections]
    newSections[sectionIndex] = { ...newSections[sectionIndex], title }
    setData({
      ...questionnaireData,
      sections: newSections
    })
  }

  const addQuestion = (questionnaireData: CreateQuestionnaireData, setData: (data: CreateQuestionnaireData) => void, sectionIndex: number) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      subtitle: "",
      text: "",
      expectedEvidence: "",
      options: [
        { text: "Not available", points: 0 },
        { text: "", points: 1 },
        { text: "", points: 2 },
        { text: "", points: 3 },
        { text: "", points: 4 },
        { text: "", points: 5 }
      ]
    }
    const newSections = [...questionnaireData.sections]
    newSections[sectionIndex].questions.push(newQuestion)
    setData({
      ...questionnaireData,
      sections: newSections
    })
  }

  const removeQuestion = (questionnaireData: CreateQuestionnaireData, setData: (data: CreateQuestionnaireData) => void, sectionIndex: number, questionIndex: number) => {
    const newSections = [...questionnaireData.sections]
    newSections[sectionIndex].questions = newSections[sectionIndex].questions.filter((_, index) => index !== questionIndex)
    setData({
      ...questionnaireData,
      sections: newSections
    })
  }

  const updateQuestionText = (questionnaireData: CreateQuestionnaireData, setData: (data: CreateQuestionnaireData) => void, sectionIndex: number, questionIndex: number, text: string) => {
    const newSections = [...questionnaireData.sections]
    newSections[sectionIndex].questions[questionIndex].text = text
    setData({
      ...questionnaireData,
      sections: newSections
    })
  }

  const updateQuestionSubtitle = (questionnaireData: CreateQuestionnaireData, setData: (data: CreateQuestionnaireData) => void, sectionIndex: number, questionIndex: number, subtitle: string) => {
    const newSections = [...questionnaireData.sections]
    newSections[sectionIndex].questions[questionIndex].subtitle = subtitle
    setData({
      ...questionnaireData,
      sections: newSections
    })
  }

  const updateQuestionExpectedEvidence = (questionnaireData: CreateQuestionnaireData, setData: (data: CreateQuestionnaireData) => void, sectionIndex: number, questionIndex: number, expectedEvidence: string) => {
    const newSections = [...questionnaireData.sections]
    newSections[sectionIndex].questions[questionIndex].expectedEvidence = expectedEvidence
    setData({
      ...questionnaireData,
      sections: newSections
    })
  }

  const updateOptionText = (questionnaireData: CreateQuestionnaireData, setData: (data: CreateQuestionnaireData) => void, sectionIndex: number, questionIndex: number, optionIndex: number, text: string) => {
    const newSections = [...questionnaireData.sections]
    newSections[sectionIndex].questions[questionIndex].options[optionIndex].text = text
    setData({
      ...questionnaireData,
      sections: newSections
    })
  }

  const updateOptionPoints = (questionnaireData: CreateQuestionnaireData, setData: (data: CreateQuestionnaireData) => void, sectionIndex: number, questionIndex: number, optionIndex: number, points: number) => {
    const newSections = [...questionnaireData.sections]
    newSections[sectionIndex].questions[questionIndex].options[optionIndex].points = points
    setData({
      ...questionnaireData,
      sections: newSections
    })
  }

  const loadRiskManagementTemplate = () => {
    // Convert the template structure to the format expected by the questionnaire builder
    const convertedSections = riskManagementTemplate.sections.map((section: any) => ({
      id: section.id,
      title: section.title,
      questions: section.questions.map((question: any) => ({
        id: question.id,
        text: question.text,
        expectedEvidence: question.expectedEvidence || "",
        options: question.options
      }))
    }))
    
    // Debug: Log the number of questions in each section
    console.log("Template loading - Sections:", convertedSections.length)
    const totalQuestions = convertedSections.reduce((total: number, section: any) => total + section.questions.length, 0)
    console.log("Total questions loaded:", totalQuestions)
    convertedSections.forEach((section: any, index: number) => {
      console.log(`Section ${index + 1} (${section.title}): ${section.questions.length} questions`)
    })
    
    setCreateQuestionnaireData({
      title: "Risk Management Assessment",
      description: "Comprehensive risk assessment questionnaire for organizations",
      sections: convertedSections,
      isActive: true,
    })
  }

  const filteredQuestionnaires = questionnaires.filter(
    (questionnaire) =>
      questionnaire.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      questionnaire.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <h1 className="text-3xl font-bold text-gray-900">Manage Questionnaires</h1>
              <p className="text-gray-600 mt-2">Create, edit, and manage assessment questionnaires</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Questionnaire
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Create New Questionnaire</DialogTitle>
                  <DialogDescription>Design a new assessment questionnaire with sections and questions</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
                    <Input
                      id="title"
                      value={createQuestionnaireData.title}
                      onChange={(e) => setCreateQuestionnaireData({ ...createQuestionnaireData, title: e.target.value })}
                      placeholder="Enter questionnaire title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      id="description"
                      value={createQuestionnaireData.description}
                      onChange={(e) => setCreateQuestionnaireData({ ...createQuestionnaireData, description: e.target.value })}
                      placeholder="Enter questionnaire description"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={createQuestionnaireData.isActive}
                      onCheckedChange={(checked) => setCreateQuestionnaireData({ ...createQuestionnaireData, isActive: checked })}
                    />
                    <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</Label>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-gray-900">Questionnaire Builder</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={loadRiskManagementTemplate} className="border-gray-300 hover:bg-gray-50">
                        Load Risk Management Template
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {createQuestionnaireData.sections.length > 0 && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        Total Questions: {createQuestionnaireData.sections.reduce((total, section) => total + section.questions.length, 0)}
                      </div>
                    )}
                    {createQuestionnaireData.sections.map((section, sectionIndex) => (
                      <Card key={section.id} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Input
                              value={section.title}
                              onChange={(e) => updateSectionTitle(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, e.target.value)}
                              placeholder="Section title"
                              className="text-lg font-semibold border-0 p-0 focus:ring-0"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSection(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {section.questions.map((question, questionIndex) => (
                            <div key={question.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Question {questionIndex + 1}</Label>
                                  {question.subtitle && (
                                    <p className="text-xs text-gray-500 mt-1">{question.subtitle}</p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuestion(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex)}
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-xs font-medium text-gray-700">Subtitle (optional)</Label>
                                  <Input
                                    value={question.subtitle || ""}
                                    onChange={(e) => updateQuestionSubtitle(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                                    placeholder="Enter question subtitle"
                                    className="text-sm mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-gray-700">Question Text</Label>
                                  <Textarea
                                    value={question.text}
                                    onChange={(e) => updateQuestionText(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                                    placeholder="Enter question text"
                                    rows={2}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-gray-700">Expected Evidence</Label>
                                  <Textarea
                                    value={question.expectedEvidence}
                                    onChange={(e) => updateQuestionExpectedEvidence(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                                    placeholder="Enter expected evidence (e.g., • Document type 1\n• Document type 2)"
                                    rows={3}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700">Options</Label>
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2 p-3 bg-white rounded border">
                                    <div className="flex-1">
                                      <Input
                                        value={option.text}
                                        onChange={(e) => updateOptionText(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex, optionIndex, e.target.value)}
                                        placeholder={`Option ${optionIndex + 1}`}
                                        className="text-sm"
                                      />
                                    </div>
                                    <div className="w-20">
                                      <Input
                                        type="number"
                                        value={option.points}
                                        onChange={(e) => updateOptionPoints(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex, optionIndex, parseInt(e.target.value) || 0)}
                                        placeholder="Points"
                                        className="text-sm"
                                      />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newOptions = question.options.filter((_, index) => index !== optionIndex)
                                        const newSections = [...createQuestionnaireData.sections]
                                        newSections[sectionIndex] = {
                                          ...newSections[sectionIndex],
                                          questions: newSections[sectionIndex].questions.map((q, qIndex) =>
                                            qIndex === questionIndex ? { ...q, options: newOptions } : q
                                          )
                                        }
                                        setCreateQuestionnaireData({
                                          ...createQuestionnaireData,
                                          sections: newSections
                                        })
                                      }}
                                      className="h-8 w-8 p-0 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newOptions = [...question.options, { text: "", points: 0 }]
                                    const newSections = [...createQuestionnaireData.sections]
                                    newSections[sectionIndex] = {
                                      ...newSections[sectionIndex],
                                      questions: newSections[sectionIndex].questions.map((q, qIndex) =>
                                        qIndex === questionIndex ? { ...q, options: newOptions } : q
                                      )
                                    }
                                    setCreateQuestionnaireData({
                                      ...createQuestionnaireData,
                                      sections: newSections
                                    })
                                  }}
                                  className="w-full border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => addQuestion(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex)}
                            className="w-full border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addSection(createQuestionnaireData, setCreateQuestionnaireData)}
                      className="w-full border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateQuestionnaire} className="bg-blue-600 hover:bg-blue-700">
                    Create Questionnaire
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Questionnaires</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{questionnaires.length}</p>
                  <p className="text-xs text-gray-500 mt-1">All questionnaires</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Questionnaires</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{questionnaires.filter(q => q.isActive).length}</p>
                  <p className="text-xs text-gray-500 mt-1">Currently active</p>
                </div>
                <div className="p-3 rounded-full bg-green-50 text-green-600">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{questionnaires.reduce((total, q) => total + (q.submissionCount || 0), 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">All submissions</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                  <Eye className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Questions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {questionnaires.length > 0 
                      ? Math.round(questionnaires.reduce((total, q) => total + q.sections.reduce((sTotal, s) => sTotal + s.questions.length, 0), 0) / questionnaires.length)
                      : 0
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Per questionnaire</p>
                </div>
                <div className="p-3 rounded-full bg-orange-50 text-orange-600">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questionnaires Table */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">All Questionnaires</CardTitle>
                <CardDescription className="text-gray-600">Manage assessment templates and their status</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questionnaires..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium text-gray-700">Title</TableHead>
                    <TableHead className="font-medium text-gray-700">Description</TableHead>
                    <TableHead className="font-medium text-gray-700">Status</TableHead>
                    <TableHead className="font-medium text-gray-700">Questions</TableHead>
                    <TableHead className="font-medium text-gray-700">Submissions</TableHead>
                    <TableHead className="font-medium text-gray-700">Created</TableHead>
                    <TableHead className="font-medium text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestionnaires.map((questionnaire) => (
                    <TableRow key={questionnaire._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{questionnaire.title}</TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate">{questionnaire.description}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={questionnaire.isActive ? "default" : "secondary"}
                          className={questionnaire.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                        >
                          {questionnaire.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {questionnaire.sections.reduce((total, section) => total + section.questions.length, 0)}
                      </TableCell>
                      <TableCell className="text-gray-600">{questionnaire.submissionCount || 0}</TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(questionnaire.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(questionnaire)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(questionnaire._id, !questionnaire.isActive)}
                            className="h-8 w-8 p-0 hover:bg-green-50"
                          >
                            {questionnaire.isActive ? (
                              <X className="h-4 w-4 text-red-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <AlertDialog>
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
                                <AlertDialogTitle>Delete Questionnaire</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{questionnaire.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteQuestionnaire(questionnaire._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Questionnaire Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit Questionnaire</DialogTitle>
              <DialogDescription>Update questionnaire information and structure</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700">Title</Label>
                <Input
                  id="edit-title"
                  value={editQuestionnaireData.title}
                  onChange={(e) => setEditQuestionnaireData({ ...editQuestionnaireData, title: e.target.value })}
                  placeholder="Enter questionnaire title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editQuestionnaireData.description}
                  onChange={(e) => setEditQuestionnaireData({ ...editQuestionnaireData, description: e.target.value })}
                  placeholder="Enter questionnaire description"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={editQuestionnaireData.isActive}
                  onCheckedChange={(checked) => setEditQuestionnaireData({ ...editQuestionnaireData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive" className="text-sm font-medium text-gray-700">Active</Label>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-900">Questionnaire Structure</Label>
                {editQuestionnaireData.sections.length > 0 && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    Total Questions: {editQuestionnaireData.sections.reduce((total, section) => total + section.questions.length, 0)}
                  </div>
                )}
                {editQuestionnaireData.sections.map((section, sectionIndex) => (
                  <Card key={section.id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Input
                          value={section.title}
                          onChange={(e) => updateSectionTitle(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, e.target.value)}
                          placeholder="Section title"
                          className="text-lg font-semibold border-0 p-0 focus:ring-0"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSection(editQuestionnaireData, setEditQuestionnaireData, sectionIndex)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {section.questions.map((question, questionIndex) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Question {questionIndex + 1}</Label>
                              {question.subtitle && (
                                <p className="text-xs text-gray-500 mt-1">{question.subtitle}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs font-medium text-gray-700">Subtitle (optional)</Label>
                              <Input
                                value={question.subtitle || ""}
                                onChange={(e) => updateQuestionSubtitle(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                                placeholder="Enter question subtitle"
                                className="text-sm mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-700">Question Text</Label>
                              <Textarea
                                value={question.text}
                                onChange={(e) => updateQuestionText(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                                placeholder="Enter question text"
                                rows={2}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-700">Expected Evidence</Label>
                              <Textarea
                                value={question.expectedEvidence}
                                onChange={(e) => updateQuestionExpectedEvidence(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                                placeholder="Enter expected evidence (e.g., • Document type 1\n• Document type 2)"
                                rows={3}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">Options</Label>
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2 p-3 bg-white rounded border">
                                <div className="flex-1">
                                  <Input
                                    value={option.text}
                                    onChange={(e) => updateOptionText(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="w-20">
                                  <Input
                                    type="number"
                                    value={option.points}
                                    onChange={(e) => updateOptionPoints(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex, optionIndex, parseInt(e.target.value) || 0)}
                                    placeholder="Points"
                                    className="text-sm"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newOptions = question.options.filter((_, index) => index !== optionIndex)
                                    const newSections = [...editQuestionnaireData.sections]
                                    newSections[sectionIndex] = {
                                      ...newSections[sectionIndex],
                                      questions: newSections[sectionIndex].questions.map((q, qIndex) =>
                                        qIndex === questionIndex ? { ...q, options: newOptions } : q
                                      )
                                    }
                                    setEditQuestionnaireData({
                                      ...editQuestionnaireData,
                                      sections: newSections
                                    })
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOptions = [...question.options, { text: "", points: 0 }]
                                const newSections = [...editQuestionnaireData.sections]
                                newSections[sectionIndex] = {
                                  ...newSections[sectionIndex],
                                  questions: newSections[sectionIndex].questions.map((q, qIndex) =>
                                    qIndex === questionIndex ? { ...q, options: newOptions } : q
                                  )
                                }
                                setEditQuestionnaireData({
                                  ...editQuestionnaireData,
                                  sections: newSections
                                })
                              }}
                              className="w-full border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => addQuestion(editQuestionnaireData, setEditQuestionnaireData, sectionIndex)}
                        className="w-full border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addSection(editQuestionnaireData, setEditQuestionnaireData)}
                  className="w-full border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditQuestionnaire} className="bg-blue-600 hover:bg-blue-700">
                Update Questionnaire
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 