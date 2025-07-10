import mongoose from "mongoose"

export interface IQuestion {
  id: string
  text: string
  options: {
    text: string
    points: number
  }[]
}

export interface ISection {
  id: string
  title: string
  questions: IQuestion[]
}

export interface IQuestionnaire extends mongoose.Document {
  title: string
  description: string
  sections: ISection[]
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const QuestionnaireSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sections: [
      {
        id: String,
        title: String,
        questions: [
          {
            id: String,
            text: String,
            options: [
              {
                text: String,
                points: Number,
              },
            ],
          },
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Questionnaire || mongoose.model<IQuestionnaire>("Questionnaire", QuestionnaireSchema)
