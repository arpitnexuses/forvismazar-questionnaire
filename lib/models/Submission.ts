import mongoose from "mongoose"

export interface IUploadedFile {
  originalName: string
  fileName: string
  size: number
  type: string
  url: string
}

export interface IAnswer {
  questionId: string
  selectedOption: number
  points: number
  testResult?: string
  comments?: string
  uploadedFiles?: IUploadedFile[]
  recommendation?: string
  agreedActionPlan?: string
  actionDate?: Date
}

export interface ISubmission extends mongoose.Document {
  client: mongoose.Types.ObjectId
  questionnaire: mongoose.Types.ObjectId
  submittedBy: mongoose.Types.ObjectId
  answers: IAnswer[]
  sectionScores: {
    sectionId: string
    score: number
    maxScore: number
  }[]
  totalScore: number
  maxTotalScore: number
  submittedAt: Date
}

const SubmissionSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    questionnaire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Questionnaire",
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionId: String,
        selectedOption: Number,
        points: Number,
        testResult: String,
        comments: String,
        uploadedFiles: [
          {
            originalName: String,
            fileName: String,
            size: Number,
            type: String,
            url: String,
          },
        ],
        recommendation: String,
        agreedActionPlan: String,
        actionDate: Date,
      },
    ],
    sectionScores: [
      {
        sectionId: String,
        score: Number,
        maxScore: Number,
      },
    ],
    totalScore: {
      type: Number,
      required: true,
    },
    maxTotalScore: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Submission || mongoose.model<ISubmission>("Submission", SubmissionSchema)
