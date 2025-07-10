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

interface Question {
  id: string
  text: string
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

// Predefined risk management maturity assessment data
const RISK_MANAGEMENT_SECTIONS = [
  {
    id: "1",
    title: "RISK GOVERNANCE",
    questions: [
      {
        id: "1.1.1",
        text: "Is there a formally approved Risk Management Policy or Framework?",
        options: [
          { text: "1: No policy/framework", points: 1 },
          { text: "2: Draft exists, not approved", points: 2 },
          { text: "3: Approved but not widely circulated", points: 3 },
          { text: "4: Approved and distributed", points: 4 },
          { text: "5: Regularly reviewed and updated", points: 5 }
        ]
      },
      {
        id: "1.1.2",
        text: "Does the Risk function report independently (not via Finance or Operations)?",
        options: [
          { text: "1: Reports under operations/finance", points: 1 },
          { text: "2: Dual reporting, no autonomy", points: 2 },
          { text: "3: Reports to C-level but no direct board access", points: 3 },
          { text: "4: Dual reporting (CEO + Board/Audit)", points: 4 },
          { text: "5: Reports directly to CEO and/or Board committee", points: 5 }
        ]
      },
      {
        id: "1.1.3",
        text: "Is there a committee (Audit or Risk) that reviews risk topics regularly?",
        options: [
          { text: "1: No risk-related committee", points: 1 },
          { text: "2: Risk mentioned informally", points: 2 },
          { text: "3: Risk discussed semi-annually", points: 3 },
          { text: "4: Dedicated risk sessions quarterly", points: 4 },
          { text: "5: Risk is a standing item in each meeting", points: 5 }
        ]
      },
      {
        id: "1.1.4",
        text: "Is there a clearly defined escalation process for high-risk exposures?",
        options: [
          { text: "1: No escalation path", points: 1 },
          { text: "2: Escalation depends on management discretion", points: 2 },
          { text: "3: Escalation criteria defined but not followed", points: 3 },
          { text: "4: Escalation criteria consistently applied", points: 4 },
          { text: "5: Triggers automated in systems; escalations logged and tracked", points: 5 }
        ]
      },
      {
        id: "1.1.5",
        text: "Is risk formally integrated into corporate governance processes (e.g., strategic reviews, investment approvals)?",
        options: [
          { text: "1: Not considered", points: 1 },
          { text: "2: Ad hoc inclusion", points: 2 },
          { text: "3: Mentioned in major decisions only", points: 3 },
          { text: "4: Integrated into all major processes", points: 4 },
          { text: "5: Required in all governance workflows", points: 5 }
        ]
      }
    ]
  },
  {
    id: "2",
    title: "RISK APPETITE & STRATEGY",
    questions: [
      {
        id: "2.1.1",
        text: "Is there a formally documented Risk Appetite Statement (RAS) approved by the Board or EXCOM?",
        options: [
          { text: "1: No RAS", points: 1 },
          { text: "2: Draft only", points: 2 },
          { text: "3: Approved, not communicated", points: 3 },
          { text: "4: Distributed", points: 4 },
          { text: "5: Reviewed annually", points: 5 }
        ]
      },
      {
        id: "2.1.2",
        text: "Is the RAS structured by risk category (e.g., investment, operational, market, compliance, ESG)?",
        options: [
          { text: "1: No categories", points: 1 },
          { text: "2: 1–2 types only", points: 2 },
          { text: "3: Most types", points: 3 },
          { text: "4: Fully categorized", points: 4 },
          { text: "5: Linked to risk taxonomy", points: 5 }
        ]
      },
      {
        id: "2.1.3",
        text: "Are risk appetite thresholds or limits embedded in policies and procedures (e.g., investment criteria, approval matrices)?",
        options: [
          { text: "1: No links", points: 1 },
          { text: "2: Vague mentions", points: 2 },
          { text: "3: Some policies", points: 3 },
          { text: "4: Widely embedded", points: 4 },
          { text: "5: Enforced via systems", points: 5 }
        ]
      }
    ]
  },
  {
    id: "3",
    title: "RISK IDENTIFICATION & ASSESSMENT",
    questions: [
      {
        id: "3.1.1",
        text: "Is there a structured, repeatable process for risk identification across the organization?",
        options: [
          { text: "1: No process", points: 1 },
          { text: "2: Informal in some areas", points: 2 },
          { text: "3: Defined in Risk Dept only", points: 3 },
          { text: "4: Standardized across departments", points: 4 },
          { text: "5: Embedded in enterprise-wide planning cycles", points: 5 }
        ]
      },
      {
        id: "3.1.2",
        text: "Are risk identification exercises conducted at both strategic and operational levels (e.g., top-down & bottom-up)?",
        options: [
          { text: "1: Not conducted", points: 1 },
          { text: "2: Limited to one level", points: 2 },
          { text: "3: Both levels but ad hoc", points: 3 },
          { text: "4: Structured sessions across all levels", points: 4 },
          { text: "5: Integrated with strategy reviews and planning", points: 5 }
        ]
      },
      {
        id: "3.1.3",
        text: "Are risks identified across all relevant categories: strategic, financial, operational, legal/compliance, reputational, ESG?",
        options: [
          { text: "1: Financial/operational only", points: 1 },
          { text: "2: Some categories included", points: 2 },
          { text: "3: Categories exist but not used consistently", points: 3 },
          { text: "4: Broad categories used in registers", points: 4 },
          { text: "5: Full coverage with mapped controls", points: 5 }
        ]
      }
    ]
  },
  {
    id: "4",
    title: "RISK TREATMENT & RESPONSE",
    questions: [
      {
        id: "4.1.1",
        text: "Are mitigation actions defined for all key risks in the corporate and subsidiary-level risk registers?",
        options: [
          { text: "1: Not defined", points: 1 },
          { text: "2: Only for some risks", points: 2 },
          { text: "3: Inconsistent detail/coverage", points: 3 },
          { text: "4: Defined for all high/critical risks", points: 4 },
          { text: "5: Defined across all risk categories with clear linkage to risk ratings", points: 5 }
        ]
      },
      {
        id: "4.1.2",
        text: "Are mitigation actions specific, measurable, and time-bound (SMART)?",
        options: [
          { text: "1: Generic mitigation ('will manage')", points: 1 },
          { text: "2: High-level ideas only", points: 2 },
          { text: "3: Some SMART measures", points: 3 },
          { text: "4: Most mitigation plans SMART", points: 4 },
          { text: "5: All plans SMART with review metrics", points: 5 }
        ]
      },
      {
        id: "4.1.3",
        text: "Are mitigation responsibilities clearly assigned to accountable individuals or departments?",
        options: [
          { text: "1: No owner", points: 1 },
          { text: "2: Named team or committee", points: 2 },
          { text: "3: Owner named but accountability unclear", points: 3 },
          { text: "4: Individual owners assigned and confirmed", points: 4 },
          { text: "5: Owners track progress in real time", points: 5 }
        ]
      }
    ]
  },
  {
    id: "5",
    title: "MONITORING, REPORTING & KRIs",
    questions: [
      {
        id: "5.1.1",
        text: "Is there a formal risk reporting framework in place that defines frequency, format, and audience of risk reports?",
        options: [
          { text: "1: No structure", points: 1 },
          { text: "2: Ad hoc reporting only", points: 2 },
          { text: "3: Defined for EXCOM only", points: 3 },
          { text: "4: Group-wide, all levels", points: 4 },
          { text: "5: Aligned with governance cycles (Board, BU, audit)", points: 5 }
        ]
      },
      {
        id: "5.1.2",
        text: "Are risk reports submitted periodically to senior management and/or the Board (e.g. Risk Committee, Audit Committee)?",
        options: [
          { text: "1: Not submitted", points: 1 },
          { text: "2: Occasionally or informally", points: 2 },
          { text: "3: Annual summary", points: 3 },
          { text: "4: Quarterly with risk updates", points: 4 },
          { text: "5: Part of monthly leadership dashboards", points: 5 }
        ]
      },
      {
        id: "5.1.3",
        text: "Are reports tailored to the audience (e.g. summary for board, detailed for management, visuals for ops)?",
        options: [
          { text: "1: One format for all", points: 1 },
          { text: "2: Slightly adjusted", points: 2 },
          { text: "3: Board vs. ops version exists", points: 3 },
          { text: "4: Fully customized formats", points: 4 },
          { text: "5: Automated report tailoring by audience", points: 5 }
        ]
      }
    ]
  },
  {
    id: "6",
    title: "INTEGRATION & CULTURE",
    questions: [
      {
        id: "6.1.1",
        text: "Does the organization use a centralized system or software for risk management (e.g. ERM platform, GRC tool)?",
        options: [
          { text: "1: No system in use", points: 1 },
          { text: "2: Excel or email-based", points: 2 },
          { text: "3: Departmental tools only", points: 3 },
          { text: "4: Central system used by multiple departments", points: 4 },
          { text: "5: Enterprise-wide GRC system with integration capabilities", points: 5 }
        ]
      },
      {
        id: "6.1.2",
        text: "Does the system cover key processes (risk identification, assessment, treatment, monitoring, reporting)?",
        options: [
          { text: "1: Not applicable", points: 1 },
          { text: "2: Covers limited workflows", points: 2 },
          { text: "3: Covers 2–3 core steps", points: 3 },
          { text: "4: End-to-end functionality with structured modules", points: 4 },
          { text: "5: Fully integrated across lifecycle and departments", points: 5 }
        ]
      },
      {
        id: "6.1.3",
        text: "Is the risk system integrated with other enterprise systems (e.g. finance, audit, compliance, HR)?",
        options: [
          { text: "1: No integration", points: 1 },
          { text: "2: Manual data imports", points: 2 },
          { text: "3: One-way feed (e.g. risk → finance)", points: 3 },
          { text: "4: Bidirectional sync with selected systems", points: 4 },
          { text: "5: Real-time, multi-system integration", points: 5 }
        ]
      }
    ]
  }
]

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
      text: "",
      options: [
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
    setCreateQuestionnaireData({
      title: "Risk Management Maturity Assessment",
      description: "Comprehensive assessment of risk management practices and maturity levels across the organization",
      sections: RISK_MANAGEMENT_SECTIONS,
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
                <Button variant="outline" onClick={loadRiskManagementTemplate}>
                  Load Risk Management Template
                </Button>
              </div>

              <div className="space-y-4">
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
                            <Label className="text-sm font-medium">Question {questionIndex + 1}</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeQuestion(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={question.text}
                            onChange={(e) => updateQuestionText(createQuestionnaireData, setCreateQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                            placeholder="Enter question text"
                            rows={2}
                          />
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
                          <Label className="text-sm font-medium">Question {questionIndex + 1}</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={question.text}
                          onChange={(e) => updateQuestionText(editQuestionnaireData, setEditQuestionnaireData, sectionIndex, questionIndex, e.target.value)}
                          placeholder="Enter question text"
                          rows={2}
                        />
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