"use client"

/**
 * Export Modal Component
 * 
 * Provides export functionality for assessment reports in PDF and Word formats
 * - PDF Export (English)
 * - Word Export (English)
 */

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from "docx"
import { saveAs } from "file-saver"
import html2canvas from "html2canvas"

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

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  submission: Submission | null
  onExportComplete?: () => void
}

export default function ExportModal({ isOpen, onClose, submission, onExportComplete }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)
  const [detailedSubmission, setDetailedSubmission] = useState<Submission | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Pre-fetch detailed data when modal opens
  useEffect(() => {
    if (isOpen && submission && !detailedSubmission) {
      fetchDetailedSubmission(submission._id)
    }
  }, [isOpen, submission, detailedSubmission])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDetailedSubmission(null)
      setLoadingDetails(false)
      setIsExporting(false)
      setExportType(null)
    }
  }, [isOpen])

  if (!submission) return null

  const fetchDetailedSubmission = async (submissionId: string) => {
    try {
      setLoadingDetails(true)
      const token = localStorage.getItem("auth-token")
      
      const response = await fetch(`/api/team/submissions/${submissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const detailedData = await response.json()
        setDetailedSubmission(detailedData)
        return detailedData
      } else {
        const errorData = await response.json().catch(() => ({}))
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

  const getScorePercentage = (score: number, maxScore: number) => {
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  }

  const formatDate = (dateString: string | Date | undefined) => {
    try {
      if (!dateString) return "No Date Available"
      
      let date: Date
      if (typeof dateString === 'string') {
        date = new Date(dateString)
      } else if (dateString instanceof Date) {
        date = dateString
      } else {
        date = new Date(dateString)
      }
      
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      } else {
        return "Invalid Date"
      }
    } catch (error) {
      return "Invalid Date"
    }
  }

  // Helper function to safely add text to PDF with proper Arabic handling using Amiri font
  const addTextToPDF = (pdf: any, text: string, x: number, y: number, options?: any) => {
    try {
    // Check if text contains Arabic characters
    const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)
    
      if (hasArabic) {
        // For Arabic text, try to use Amiri font
        try {
          // Try to set Amiri font for Arabic text
          // Note: This assumes Amiri font has been loaded into jsPDF
          // If Amiri is not available, fallback to helvetica
          try {
            pdf.setFont("amiri", "normal")
          } catch (amiriError) {
            console.warn("Amiri font not available, using helvetica:", amiriError)
            pdf.setFont("helvetica", "normal")
          }
          
          // Split text into lines and add each line
          const lines = pdf.splitTextToSize(text, options?.maxWidth || 170)
          lines.forEach((line: string, index: number) => {
            pdf.text(line, x, y + (index * 5))
          })
        } catch (arabicError) {
          console.warn("Arabic text rendering failed, using fallback:", arabicError)
          // Fallback: replace Arabic characters with placeholders
          const fallbackText = text.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '?')
          pdf.text(fallbackText, x, y, options)
        }
      } else {
        // For non-Arabic text, use normal rendering with helvetica
        pdf.setFont("helvetica", "normal")
        pdf.text(text, x, y, options)
      }
    } catch (error) {
      console.warn("Error adding text to PDF:", error)
      // Fallback: add a placeholder
      pdf.text("[Text Content]", x, y, options)
    }
  }


  const generateFileName = (format: string) => {
    const clientName = submission.client?.name || "Unknown Client"
    const dateToUse = submission.createdAt || submission.submittedAt
    let dateStr = new Date().toISOString().split('T')[0]
    
    if (dateToUse) {
      try {
        const submissionDate = new Date(dateToUse)
        if (!isNaN(submissionDate.getTime())) {
          dateStr = submissionDate.toISOString().split('T')[0]
        }
      } catch (error) {
        console.warn("Date parsing error:", error)
      }
    }
    
    return `assessment-${clientName.replace(/\s+/g, '-')}-${dateStr}.${format}`
  }



  const exportAsPDF = async () => {
    try {
      setIsExporting(true)
      setExportType('pdf')
      
      // Fetch detailed submission data if not already available
      let detailedData = detailedSubmission
      if (!detailedData || detailedData._id !== submission._id) {
        console.log("Fetching detailed data for PDF export")
        detailedData = await fetchDetailedSubmission(submission._id)
        if (!detailedData) {
          console.error("Failed to fetch detailed data for PDF export")
          toast({
            title: "Error",
            description: "Failed to fetch detailed submission data for export",
            variant: "destructive",
          })
          return
        }
      }
      
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
      
      console.log("Starting PDF generation with html2canvas...")
      
      // Create HTML content for PDF
      const clientName = submission.client?.name || "Unknown Client"
      const questionnaireTitle = submission.questionnaire?.title || "Risk Management Assessment"
      const submissionDate = formatDate(submission.createdAt || submission.submittedAt)
      const scorePercentage = getScorePercentage(submission.totalScore, submission.maxTotalScore)

      // Create a temporary container for the PDF content
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '-9999px'
      tempContainer.style.width = '800px'
      tempContainer.style.backgroundColor = 'white'
      tempContainer.style.padding = '20px'
      tempContainer.style.fontFamily = 'Arial, sans-serif'
      tempContainer.style.direction = 'rtl'
      tempContainer.style.textAlign = 'right'
      
      // Build HTML content for first page (client details)
      let firstPageContent = `
        <div style="font-family: Arial, sans-serif; direction: ltr; text-align: left; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
            <img src="https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/Mazars-SA/Group%203.png" alt="Forvis Mazars" style="height: 60px; margin-bottom: 20px;" />
            <h1 style="font-size: 24px; font-weight: bold; color: #1e40af; margin: 0;">تقرير تقييم إدارة المخاطر</h1>
            <h2 style="font-size: 18px; color: #374151; margin: 10px 0 0 0;">Risk Management Assessment Report</h2>
          </div>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">معلومات العميل / Client Information</h3>
            <p style="margin: 5px 0;"><strong>العميل / Client:</strong> ${clientName}</p>
            ${submission.client?.company ? `<p style="margin: 5px 0;"><strong>الشركة / Company:</strong> ${submission.client.company}</p>` : ''}
            <p style="margin: 5px 0;"><strong>معرف التقديم / Submission ID:</strong> ${submission._id}</p>
            <p style="margin: 5px 0;"><strong>التقييم / Assessment:</strong> ${questionnaireTitle}</p>
            <p style="margin: 5px 0;"><strong>التاريخ / Date:</strong> ${submissionDate}</p>
            <p style="margin: 5px 0;"><strong>النتيجة / Score:</strong> ${submission.totalScore}/${submission.maxTotalScore} (${scorePercentage}%)</p>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">نتائج الأقسام / Section Scores</h3>
      `
      
      // Add section scores
      submission.sectionScores.forEach((section, index) => {
        const sectionPercentage = getScorePercentage(section.score, section.maxScore)
        firstPageContent += `<p style="margin: 5px 0;">القسم ${index + 1} / Section ${index + 1}: ${section.score}/${section.maxScore} (${sectionPercentage}%)</p>`
      })
      
      firstPageContent += `</div></div>`
      
      // Build HTML content for detailed answers (second page onwards)
      let detailedAnswersContent = `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
            <img src="https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/Mazars-SA/Group%203.png" alt="Forvis Mazars" style="height: 60px; margin-bottom: 20px;" />
            <h1 style="font-size: 24px; font-weight: bold; color: #1e40af; margin: 0;">التقييم التفصيلي حسب الأقسام</h1>
            <h2 style="font-size: 18px; color: #374151; margin: 10px 0 0 0;">Detailed Assessment by Sections</h2>
          </div>
      `
      
      // Create PDF with chunked content to avoid canvas size limits
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgWidth = 210
      const pageHeight = 295
      const maxImgHeight = 280 // Leave some margin
      
      // Add first page
      const firstPageContainer = document.createElement('div')
      firstPageContainer.style.position = 'absolute'
      firstPageContainer.style.left = '-9999px'
      firstPageContainer.style.top = '-9999px'
      firstPageContainer.style.width = '800px'
      firstPageContainer.style.backgroundColor = 'white'
      firstPageContainer.style.padding = '20px'
      firstPageContainer.style.fontFamily = 'Arial, sans-serif'
      firstPageContainer.style.direction = 'ltr'
      firstPageContainer.style.textAlign = 'left'
      firstPageContainer.innerHTML = firstPageContent
      
      document.body.appendChild(firstPageContainer)
      
      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Convert first page to canvas
      const firstPageCanvas = await html2canvas(firstPageContainer, {
        scale: 1.5, // Reduced scale to avoid canvas size issues
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: firstPageContainer.scrollHeight
      })
      
      // Add first page to PDF
      const firstPageImgData = firstPageCanvas.toDataURL('image/png')
      const firstPageImgHeight = Math.min((firstPageCanvas.height * imgWidth) / firstPageCanvas.width, maxImgHeight)
      pdf.addImage(firstPageImgData, 'PNG', 0, 0, imgWidth, firstPageImgHeight)
      
      // Clean up first page container
      document.body.removeChild(firstPageContainer)
      
      // Process detailed answers in chunks to avoid canvas size limits
      if (detailedData.questionnaire?.sections) {
        const questionsPerChunk = 1 // Process 1 question at a time to ensure no content breaks
        
        interface QuestionItem {
          section: any
          sectionIndex: number
          question: any
          questionIndex: number
          answer: any
        }
        
        let allQuestions: QuestionItem[] = []
        
        // Collect all questions first
        detailedData.questionnaire.sections.forEach((section: any, sectionIndex: number) => {
          section.questions.forEach((question: any, questionIndex: number) => {
            const answer = submission.answers.find((a: any) => a.questionId === question.id)
            if (answer) {
              allQuestions.push({
                section,
                sectionIndex,
                question,
                questionIndex,
                answer
              })
            }
          })
        })
        
        // Process questions in chunks
        for (let chunkStart = 0; chunkStart < allQuestions.length; chunkStart += questionsPerChunk) {
          const chunk = allQuestions.slice(chunkStart, chunkStart + questionsPerChunk)
          
          // Create chunk content
          let chunkContent = `
            <div style="font-family: Arial, sans-serif; direction: ltr; text-align: left; line-height: 1.6;">
              <h2 style="color: #1e40af; margin: 20px 0; font-size: 20px;">التقييم التفصيلي حسب الأقسام / Detailed Assessment by Sections</h2>
          `
          
          // Group questions by section
          const questionsBySection: { [key: string]: { section: any; questions: any[] } } = {}
          chunk.forEach((item: QuestionItem) => {
            if (!questionsBySection[item.sectionIndex]) {
              questionsBySection[item.sectionIndex] = {
                section: item.section,
                questions: []
              }
            }
            questionsBySection[item.sectionIndex].questions.push({
              question: item.question,
              questionIndex: item.questionIndex,
              answer: item.answer
            })
          })
          
          // Add section headers and questions
          Object.keys(questionsBySection).forEach((sectionIndex: string) => {
            const sectionData = questionsBySection[sectionIndex]
            chunkContent += `
              <div style="background-color: #dbeafe; color: #1e40af; padding: 10px 15px; border-radius: 6px; font-weight: bold; margin: 20px 0 15px 0;">
                القسم ${parseInt(sectionIndex) + 1}: ${sectionData.section.title}
              </div>
            `
            
            sectionData.questions.forEach(({ question, questionIndex, answer }: { question: any; questionIndex: number; answer: any }) => {
              chunkContent += `
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; margin: 15px 0; padding: 15px; background-color: #f9fafb;">
                  <div style="font-weight: bold; color: #374151; margin-bottom: 10px;">السؤال ${questionIndex + 1} / Question ${questionIndex + 1}</div>
                  
                  <div style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin: 8px 0;">
                    <strong>السؤال / Question:</strong><br>
                    ${question.text}
                  </div>
                  
                  <div style="background-color: #fef3c7; padding: 10px; border-radius: 4px; margin: 8px 0; font-style: italic;">
                    <strong>الدليل المتوقع / Expected Evidence:</strong><br>
                    ${question.expectedEvidence}
                  </div>
                  
                  <div style="margin: 10px 0;">
                    <strong>الخيارات المتاحة / Available Options:</strong><br>
              `
              
              question.options.forEach((option: any, optionIndex: number) => {
                const isSelected = optionIndex === answer.selectedOption
                const selectedStyle = isSelected 
                  ? 'background-color: #dcfce7; border: 2px solid #16a34a; color: #166534;' 
                  : 'background-color: #f3f4f6;'
                const selectedText = isSelected ? ' ✓ Selected' : ''
                
                chunkContent += `
                  <div style="padding: 8px; margin: 4px 0; border-radius: 4px; ${selectedStyle}">
                    الخيار ${optionIndex + 1} / Option ${optionIndex + 1}: ${option.text} (${option.points} نقاط / points)${selectedText}
                  </div>
                `
              })
              
              chunkContent += `</div>`
              chunkContent += `<div style="font-weight: bold; color: #059669; margin-top: 10px; padding-top: 10px; border-top: 1px solid #d1d5db;">النقاط المحصلة / Points Scored: ${answer.points}</div>`
              
              if (answer.comments) {
                chunkContent += `<div style="margin: 10px 0; padding: 10px; border-radius: 4px; background-color: #dbeafe;"><strong>التعليقات / Comments:</strong><br>${answer.comments}</div>`
              }
              
              if (answer.recommendation) {
                chunkContent += `<div style="margin: 10px 0; padding: 10px; border-radius: 4px; background-color: #fef3c7;"><strong>التوصية / Recommendation:</strong><br>${answer.recommendation}</div>`
              }
              
              if (answer.agreedActionPlan) {
                chunkContent += `<div style="margin: 10px 0; padding: 10px; border-radius: 4px; background-color: #dcfce7;"><strong>خطة العمل / Action Plan:</strong><br>${answer.agreedActionPlan}</div>`
              }
              
              if (answer.actionDate) {
                const actionDateStr = new Date(answer.actionDate).toLocaleDateString()
                chunkContent += `<div style="margin: 10px 0;"><strong>التاريخ المستهدف / Target Date:</strong> ${actionDateStr}</div>`
              }
              
              chunkContent += `</div>`
            })
          })
          
          chunkContent += `</div>`
          
          // Create container for this chunk
          const chunkContainer = document.createElement('div')
          chunkContainer.style.position = 'absolute'
          chunkContainer.style.left = '-9999px'
          chunkContainer.style.top = '-9999px'
          chunkContainer.style.width = '800px'
          chunkContainer.style.backgroundColor = 'white'
          chunkContainer.style.padding = '20px'
          chunkContainer.style.fontFamily = 'Arial, sans-serif'
          chunkContainer.style.direction = 'ltr'
          chunkContainer.style.textAlign = 'left'
          chunkContainer.innerHTML = chunkContent
          
          document.body.appendChild(chunkContainer)
          
          // Wait a bit for rendering
          await new Promise(resolve => setTimeout(resolve, 500))
          
          try {
            // Convert chunk to canvas
            const chunkCanvas = await html2canvas(chunkContainer, {
              scale: 1.2, // Further reduced scale for better fit
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              width: 800,
              height: chunkContainer.scrollHeight
            })
            
            const chunkImgData = chunkCanvas.toDataURL('image/png')
            const chunkImgHeight = (chunkCanvas.height * imgWidth) / chunkCanvas.width
            
            // Always add a new page for each question to ensure no content breaks
            pdf.addPage()
            
            // Check if the question fits on one page
            if (chunkImgHeight <= maxImgHeight) {
              // Question fits on one page - add it normally
              pdf.addImage(chunkImgData, 'PNG', 0, 0, imgWidth, chunkImgHeight)
                } else {
              // Question is too large - split it across multiple pages
              const pagesNeeded = Math.ceil(chunkImgHeight / maxImgHeight)
              
              for (let pageIndex = 0; pageIndex < pagesNeeded; pageIndex++) {
                if (pageIndex > 0) {
                  pdf.addPage()
                }
                
                const yOffset = -pageIndex * maxImgHeight
                pdf.addImage(chunkImgData, 'PNG', 0, yOffset, imgWidth, chunkImgHeight)
              }
            }
            
          } catch (chunkError) {
            console.warn(`Error processing chunk ${chunkStart}-${chunkStart + questionsPerChunk}:`, chunkError)
            // Continue with next chunk
          }
          
          // Clean up chunk container
          document.body.removeChild(chunkContainer)
        }
      }
      
      // Save the PDF
      const fileName = generateFileName('pdf')
      pdf.save(fileName)
      
      console.log("PDF generation completed successfully")
      
      toast({
        title: "Success",
        description: "Report exported as PDF successfully",
        duration: 3000,
      })
      
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const exportAsWord = async () => {
    try {
      setIsExporting(true)
      setExportType('word')
      
      // Fetch detailed submission data if not already available
      let detailedData = detailedSubmission
      if (!detailedData || detailedData._id !== submission._id) {
        console.log("Fetching detailed data for Word export")
        detailedData = await fetchDetailedSubmission(submission._id)
        if (!detailedData) {
          console.error("Failed to fetch detailed data for Word export")
          toast({
            title: "Error",
            description: "Failed to fetch detailed submission data for export",
            variant: "destructive",
          })
          return
        }
      }
      
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
      
      const clientName = submission.client?.name || "Unknown Client"
      const questionnaireTitle = submission.questionnaire?.title || "Risk Management Assessment"
      const submissionDate = formatDate(submission.createdAt || submission.submittedAt)
      const scorePercentage = getScorePercentage(submission.totalScore, submission.maxTotalScore)
      
      // Create document content
      const docContent = []
      
      // Add logo
      try {
        const logoResponse = await fetch("https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/Mazars-SA/Group%203.png")
        const logoBuffer = await logoResponse.arrayBuffer()
        
        docContent.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: logoBuffer,
                type: "png",
                transformation: {
                  width: 200,
                  height: 60,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          })
        )
      } catch (logoError) {
        console.warn("Could not load logo for Word export:", logoError)
      }
      
      // Title
        docContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Risk Management Assessment Report",
                font: "Roboto",
                size: 32,
                bold: true,
              }),
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 600,
            },
          })
        )
      
      // Client information
        docContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Client Information",
                font: "Roboto",
                size: 24,
                bold: true,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: {
              before: 200,
              after: 300,
            },
          }),
          new Paragraph({
            children: [
            new TextRun({ text: `Client: ${clientName}`, font: "Roboto", bold: true }),
            ],
            spacing: {
              after: 200,
            },
          }),
        ...(submission.client?.company ? [
            new Paragraph({
              children: [
              new TextRun({ text: `Company: ${submission.client.company}`, font: "Roboto", bold: true }),
              ],
              spacing: {
                after: 200,
              },
            })
          ] : []),
          new Paragraph({
            children: [
              new TextRun({ text: `Submission ID: ${submission._id}`, font: "Roboto" }),
            ],
            spacing: {
              after: 200,
            },
          }),
          new Paragraph({
            children: [
            new TextRun({ text: `Assessment: ${questionnaireTitle}`, font: "Roboto" }),
            ],
            spacing: {
              after: 200,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Date: ${submissionDate}`, font: "Roboto" }),
            ],
            spacing: {
              after: 200,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Score: ${submission.totalScore}/${submission.maxTotalScore} (${scorePercentage}%)`, font: "Roboto" }),
            ],
            spacing: {
              after: 400,
            },
          })
        )
      
      // Section scores
        docContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Section Scores",
                font: "Roboto",
                size: 24,
                bold: true,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: {
              before: 200,
              after: 300,
            },
          })
        )
      
      submission.sectionScores.forEach((section, index) => {
        const sectionPercentage = getScorePercentage(section.score, section.maxScore)
          docContent.push(
            new Paragraph({
              children: [
                new TextRun({ text: `Section ${index + 1}: ${section.score}/${section.maxScore} (${sectionPercentage}%)`, font: "Roboto" }),
              ],
              spacing: {
                after: 200,
              },
            })
          )
        })
      
      // Add detailed answers organized by sections
        docContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Detailed Assessment by Sections",
                font: "Roboto",
                size: 24,
                bold: true,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: {
              before: 400,
              after: 400,
            },
          })
        )
      
      console.log("Starting to process sections for Word export")
      try {
        detailedData.questionnaire.sections.forEach((section, sectionIndex) => {
          console.log(`Processing section ${sectionIndex + 1}:`, section.title)
          
          // Add section header
            docContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Section ${sectionIndex + 1}: ${section.title}`,
                    font: "Roboto",
                    size: 20,
                    bold: true,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: {
                  before: 400,
                  after: 300,
                },
              })
            )
          
          // Add section score
          const sectionScore = submission.sectionScores.find(s => s.sectionId === section.id)
          if (sectionScore) {
            const sectionPercentage = getScorePercentage(sectionScore.score, sectionScore.maxScore)
              docContent.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `Section Score: ${sectionScore.score}/${sectionScore.maxScore} (${sectionPercentage}%)`, font: "Roboto", bold: true }),
                  ],
                  spacing: {
                    after: 300,
                  },
                })
              )
          }
          
          // Process questions in this section
          let questionNumber = 1
          section.questions.forEach((question, index) => {
            const answer = submission.answers.find(a => a.questionId === question.id)
            if (answer) {
              console.log(`Processing question ${questionNumber}:`, question.text.substring(0, 50) + "...")
              
              // Add question header
                docContent.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Question ${questionNumber}`,
                        font: "Roboto",
                        size: 18,
                        bold: true,
                      }),
                    ],
                    heading: HeadingLevel.HEADING_3,
                    spacing: {
                      before: 300,
                      after: 200,
                    },
                  })
                )
              
              // Add question text
              docContent.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: question.text, font: "Roboto", bold: true }),
                  ],
                  spacing: {
                    after: 200,
                  },
                })
              )
              
              // Add expected evidence
                docContent.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Expected Evidence: ", font: "Roboto", bold: true }),
                    new TextRun({ text: question.expectedEvidence, font: "Roboto" }),
                    ],
                    spacing: {
                      after: 200,
                    },
                  })
                )
              
              // Add selected option
              const selectedOption = question.options[answer.selectedOption]
              if (selectedOption) {
                  docContent.push(
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Selected Option: ", font: "Roboto", bold: true }),
                      new TextRun({ text: `${selectedOption.text} (${selectedOption.points} points)`, font: "Roboto", color: "008000" }),
                      ],
                      spacing: {
                        after: 200,
                      },
                    })
                  )
              }
              
              // Add comments if available
              if (answer.comments) {
                  docContent.push(
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Comments: ", font: "Roboto", bold: true }),
                      new TextRun({ text: answer.comments, font: "Roboto" }),
                      ],
                      spacing: {
                        after: 200,
                      },
                    })
                  )
              }
              
              // Add recommendation if available
              if (answer.recommendation) {
                  docContent.push(
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Recommendation: ", font: "Roboto", bold: true }),
                      new TextRun({ text: answer.recommendation, font: "Roboto", color: "8B4513" }),
                      ],
                      spacing: {
                        after: 200,
                      },
                    })
                  )
              }
              
              // Add action plan if available
              if (answer.agreedActionPlan) {
                  docContent.push(
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Action Plan: ", font: "Roboto", bold: true }),
                      new TextRun({ text: answer.agreedActionPlan, font: "Roboto", color: "008000" }),
                      ],
                      spacing: {
                        after: 200,
                      },
                    })
                  )
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
                  docContent.push(
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Target Date: ", font: "Roboto", bold: true }),
                        new TextRun({ text: actionDateStr, font: "Roboto" }),
                      ],
                      spacing: {
                        after: 300,
                      },
                    })
                  )
              }
              
              // Add spacing between questions
              docContent.push(new Paragraph({ text: "" }))
              questionNumber++
            }
          })
          
          // Add spacing between sections
          docContent.push(new Paragraph({ text: "" }))
        })
      } catch (sectionError) {
        console.error("Error processing sections for Word export:", sectionError)
      }
      
      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: docContent,
        }],
      })
      
      // Generate and save
      const buffer = await Packer.toBuffer(doc)
      const fileName = generateFileName('docx')
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
      saveAs(blob, fileName)
      
      toast({
        title: "Success",
        description: "Report exported as Word successfully",
        duration: 3000,
      })
      
    } catch (error) {
      console.error("Error exporting Word:", error)
      toast({
        title: "Error",
        description: "Failed to export Word document",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const handleExport = async (format: 'pdf' | 'word') => {
    if (format === 'pdf') {
      await exportAsPDF()
    } else {
      await exportAsWord()
    }
    
    if (onExportComplete) {
      onExportComplete()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Report
          </DialogTitle>
          <DialogDescription>
            Choose your preferred export format for the assessment report
            {loadingDetails && (
              <div className="mt-2 text-sm text-blue-600">
                Loading detailed report data...
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* PDF Export */}
              <Button
            onClick={() => handleExport('pdf')}
                disabled={isExporting}
            className="w-full justify-start h-12"
                variant="outline"
              >
            <FileText className="h-5 w-5 mr-3 text-red-600" />
            {isExporting && exportType === 'pdf' ? 'Exporting...' : 'Export as PDF'}
              </Button>
              
          {/* Word Export */}
              <Button
            onClick={() => handleExport('word')}
                disabled={isExporting}
            className="w-full justify-start h-12"
                variant="outline"
              >
            <FileText className="h-5 w-5 mr-3 text-blue-600" />
            {isExporting && exportType === 'word' ? 'Exporting...' : 'Export as Word'}
              </Button>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

