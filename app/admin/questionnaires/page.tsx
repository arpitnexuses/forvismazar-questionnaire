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
import { Plus, Edit, Trash2, Search, FileText, Eye, Copy, BarChart3, X, Save } from "lucide-react"
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Questionnaires</h2>
          <p className="text-muted-foreground">Create, edit, and manage assessment questionnaires</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Questionnaire
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Questionnaire</DialogTitle>
              <DialogDescription>Design a new assessment questionnaire with sections and questions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={createQuestionnaireData.title}
                  onChange={(e) => setCreateQuestionnaireData({ ...createQuestionnaireData, title: e.target.value })}
                  placeholder="Enter questionnaire title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createQuestionnaireData.description}
                  onChange={(e) => setCreateQuestionnaireData({ ...createQuestionnaireData, description: e.target.value })}
                  placeholder="Enter questionnaire description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={createQuestionnaireData.isActive}
                  onCheckedChange={(checked) => setCreateQuestionnaireData({ ...createQuestionnaireData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Questionnaire Builder</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={loadRiskManagementTemplate}>
                    Load Risk Management Template
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      console.log("=== TEMPLATE DEBUG ===")
                      console.log("Template sections:", riskManagementTemplate.sections.length)
                      let totalQuestions = 0
                      riskManagementTemplate.sections.forEach((section: any, index: number) => {
                        const questionCount = section.questions.length
                        totalQuestions += questionCount
                        console.log(`Section ${index + 1} (${section.title}): ${questionCount} questions`)
                      })
                      console.log("Total questions in template:", totalQuestions)
                      
                      // Test the conversion
                      const convertedSections = riskManagementTemplate.sections.map((section: any) => ({
                        id: section.id,
                        title: section.title,
                        questions: section.questions.map((question: any) => ({
                          id: question.id,
                          text: question.text,
                          options: question.options
                        }))
                      }))
                      
                      const convertedTotal = convertedSections.reduce((total: number, section: any) => total + section.questions.length, 0)
                      console.log("Total questions after conversion:", convertedTotal)
                      
                      // Check for any questions with missing data
                      convertedSections.forEach((section: any, sectionIndex: number) => {
                        section.questions.forEach((question: any, questionIndex: number) => {
                          if (!question.text || question.text.trim() === '') {
                            console.error(`Missing text in Section ${sectionIndex + 1}, Question ${questionIndex + 1}`)
                          }
                          if (!question.options || question.options.length === 0) {
                            console.error(`Missing options in Section ${sectionIndex + 1}, Question ${questionIndex + 1}`)
                          }
                        })
                      })
                      
                      console.log("=== END DEBUG ===")
                    }}
                  >
                    Debug Template
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {createQuestionnaireData.sections.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Total Questions: {createQuestionnaireData.sections.reduce((total, section) => total + section.questions.length, 0)}
                  </div>
                )}
                {createQuestionnaireData.sections.map((section, sectionIndex) => (
                  <Card key={section.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Input
                          value={section.title}
                          onChange={(e) => updateSectionTitle(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, e.target.value)}
                          placeholder="Section title"
                          className="text-lg font-semibold"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSection(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {section.questions.map((question, questionIndex) => (
                        <div key={question.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">Question {questionIndex + 1}</Label>
                              {question.subtitle && (
                                <p className="text-xs text-muted-foreground mt-1">{question.subtitle}</p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeQuestion(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs">Subtitle (optional)</Label>
                              <Input
                                value={question.subtitle || ""}
                                onChange={(e) => updateQuestionSubtitle(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                                placeholder="Enter question subtitle"
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Question Text</Label>
                              <Textarea
                                value={question.text}
                                onChange={(e) => updateQuestionText(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                                placeholder="Enter question text"
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Expected Evidence</Label>
                              <Textarea
                                value={question.expectedEvidence}
                                onChange={(e) => updateQuestionExpectedEvidence(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                                placeholder="Enter expected evidence (e.g., • Document type 1\n• Document type 2)"
                                rows={3}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Options</Label>
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <Input
                                  value={option.text}
                                  onChange={(e) => updateOptionText(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  className="flex-1"
                                />
                                <Select
                                  value={option.points.toString()}
                                  onValueChange={(value) => updateOptionPoints(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex, optionIndex, parseInt(value))}
                                >
                                  <SelectTrigger className="w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map((point) => (
                                      <SelectItem key={point} value={point.toString()}>
                                        {point}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => addQuestion(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex)}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => addSection(createQuestionnaireData, setCreateQuestionnaireData)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateQuestionnaire}>Create Questionnaire</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questionnaire Statistics</CardTitle>
          <CardDescription>Overview of questionnaire activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Questionnaires</p>
                <p className="text-2xl font-bold">{questionnaires.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{questionnaires.filter(q => q.isActive).length}</Badge>
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-2xl font-bold">{questionnaires.filter(q => q.isActive).length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{questionnaires.filter(q => !q.isActive).length}</Badge>
              <div>
                <p className="text-sm font-medium">Inactive</p>
                <p className="text-2xl font-bold">{questionnaires.filter(q => !q.isActive).length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Submissions</p>
                <p className="text-2xl font-bold">
                  {questionnaires.reduce((sum, q) => sum + (q.submissionCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questionnaires</CardTitle>
          <CardDescription>Manage all questionnaires in the system</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questionnaires..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestionnaires.map((questionnaire) => (
                <TableRow key={questionnaire._id}>
                  <TableCell className="font-medium">{questionnaire.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{questionnaire.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={questionnaire.isActive}
                        onCheckedChange={(checked) => handleToggleActive(questionnaire._id, checked)}
                      />
                      <Badge variant={questionnaire.isActive ? "default" : "secondary"}>
                        {questionnaire.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{questionnaire.sections.length}</TableCell>
                  <TableCell>{questionnaire.submissionCount || 0}</TableCell>
                  <TableCell>{questionnaire.createdBy.name}</TableCell>
                  <TableCell>{new Date(questionnaire.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(questionnaire)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
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
                            <AlertDialogAction onClick={() => handleDeleteQuestionnaire(questionnaire._id)}>
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
        </CardContent>
      </Card>

      {/* Edit Questionnaire Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Questionnaire</DialogTitle>
            <DialogDescription>Update questionnaire information and structure</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editQuestionnaireData.title}
                onChange={(e) => setEditQuestionnaireData({ ...editQuestionnaireData, title: e.target.value })}
                placeholder="Enter questionnaire title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editQuestionnaireData.description}
                onChange={(e) => setEditQuestionnaireData({ ...editQuestionnaireData, description: e.target.value })}
                placeholder="Enter questionnaire description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={editQuestionnaireData.isActive}
                onCheckedChange={(checked) => setEditQuestionnaireData({ ...editQuestionnaireData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Questionnaire Structure</Label>
              {editQuestionnaireData.sections.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Total Questions: {editQuestionnaireData.sections.reduce((total, section) => total + section.questions.length, 0)}
                </div>
              )}
              {editQuestionnaireData.sections.map((section, sectionIndex) => (
                <Card key={section.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Input
                        value={section.title}
                        onChange={(e) => updateSectionTitle(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, e.target.value)}
                        placeholder="Section title"
                        className="text-lg font-semibold"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSection(editQuestionnaireData, setEditQuestionnaireData, sectionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.questions.map((question, questionIndex) => (
                      <div key={question.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Question {questionIndex + 1}</Label>
                            {question.subtitle && (
                              <p className="text-xs text-muted-foreground mt-1">{question.subtitle}</p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs">Subtitle (optional)</Label>
                            <Input
                              value={question.subtitle || ""}
                              onChange={(e) => updateQuestionSubtitle(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                              placeholder="Enter question subtitle"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Question Text</Label>
                            <Textarea
                              value={question.text}
                              onChange={(e) => updateQuestionText(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                              placeholder="Enter question text"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Expected Evidence</Label>
                            <Textarea
                              value={question.expectedEvidence}
                              onChange={(e) => updateQuestionExpectedEvidence(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                              placeholder="Enter expected evidence (e.g., • Document type 1\n• Document type 2)"
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Options</Label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <Input
                                value={option.text}
                                onChange={(e) => updateOptionText(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1"
                              />
                              <Select
                                value={option.points.toString()}
                                onValueChange={(value) => updateOptionPoints(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex, optionIndex, parseInt(value))}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((point) => (
                                    <SelectItem key={point} value={point.toString()}>
                                      {point}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addQuestion(editQuestionnaireData, setEditQuestionnaireData, sectionIndex)}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                variant="outline"
                onClick={() => addSection(editQuestionnaireData, setEditQuestionnaireData)}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditQuestionnaire}>Update Questionnaire</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 