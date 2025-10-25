import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// Quiz schemas
export const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required').max(500, 'Question text too long'),
  options: z.array(z.string().min(1, 'Option cannot be empty')).length(4, 'Must have exactly 4 options'),
  correctIndex: z.number().int().min(0).max(3, 'Correct index must be between 0-3'),
  timerSec: z.number().int().min(5, 'Timer must be at least 5 seconds').max(300, 'Timer cannot exceed 5 minutes')
});

export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  questions: z.array(questionSchema).min(1, 'Quiz must have at least 1 question').max(50, 'Quiz cannot have more than 50 questions')
});

export const updateQuizSchema = createQuizSchema.partial();

// Session schemas
export const createSessionSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required')
});

export const joinSessionSchema = z.object({
  pin: z.string().length(6, 'PIN must be 6 digits'),
  name: z.string().min(1, 'Name is required').max(50, 'Name too long')
});

export const submitAnswerSchema = z.object({
  questionIndex: z.number().int().min(0),
  answerIndex: z.number().int().min(0).max(3),
  timeTakenMs: z.number().int().min(0)
});

// Socket event schemas
export const hostCreateSessionSchema = z.object({
  quizId: z.string()
});

export const hostStartQuestionSchema = z.object({
  questionIndex: z.number().int().min(0)
});

export const playerJoinSchema = z.object({
  pin: z.string().length(6),
  name: z.string().min(1).max(50)
});

export const playerSubmitAnswerSchema = z.object({
  questionIndex: z.number().int().min(0),
  answerIndex: z.number().int().min(0).max(3),
  timeTakenMs: z.number().int().min(0)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type JoinSessionInput = z.infer<typeof joinSessionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
