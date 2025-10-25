import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer {
  id: string;
  name: string;
  score: number;
  answers: Array<{
    questionIndex: number;
    answerIndex: number;
    timeTakenMs: number;
    isCorrect: boolean;
    points: number;
  }>;
}

export interface ISession extends Document {
  quizId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  pin: string;
  players: IPlayer[];
  currentQuestionIndex: number;
  isActive: boolean;
  isLocked: boolean;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  score: {
    type: Number,
    default: 0
  },
  answers: [{
    questionIndex: Number,
    answerIndex: Number,
    timeTakenMs: Number,
    isCorrect: Boolean,
    points: Number
  }]
});

const SessionSchema = new Schema<ISession>({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pin: {
    type: String,
    required: true,
    unique: true,
    length: 6
  },
  players: [PlayerSchema],
  currentQuestionIndex: {
    type: Number,
    default: -1
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  startedAt: Date,
  endedAt: Date
}, {
  timestamps: true
});

export const Session = mongoose.model<ISession>('Session', SessionSchema);
