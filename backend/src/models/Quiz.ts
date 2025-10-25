import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  text: string;
  options: [string, string, string, string];
  correctIndex: number; // 0-3
  timerSec: number;
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  questions: IQuestion[];
  hostId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (options: string[]) => options.length === 4,
      message: 'Question must have exactly 4 options'
    }
  },
  correctIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  timerSec: {
    type: Number,
    required: true,
    min: 5,
    max: 300
  }
});

const QuizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  questions: [QuestionSchema],
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);
