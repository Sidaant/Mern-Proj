"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerSubmitAnswerSchema = exports.playerJoinSchema = exports.hostStartQuestionSchema = exports.hostCreateSessionSchema = exports.submitAnswerSchema = exports.joinSessionSchema = exports.createSessionSchema = exports.updateQuizSchema = exports.createQuizSchema = exports.questionSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Auth schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters')
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
});
// Quiz schemas
exports.questionSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, 'Question text is required').max(500, 'Question text too long'),
    options: zod_1.z.array(zod_1.z.string().min(1, 'Option cannot be empty')).length(4, 'Must have exactly 4 options'),
    correctIndex: zod_1.z.number().int().min(0).max(3, 'Correct index must be between 0-3'),
    timerSec: zod_1.z.number().int().min(5, 'Timer must be at least 5 seconds').max(300, 'Timer cannot exceed 5 minutes')
});
exports.createQuizSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(100, 'Title too long'),
    description: zod_1.z.string().max(500, 'Description too long').optional(),
    questions: zod_1.z.array(exports.questionSchema).min(1, 'Quiz must have at least 1 question').max(50, 'Quiz cannot have more than 50 questions')
});
exports.updateQuizSchema = exports.createQuizSchema.partial();
// Session schemas
exports.createSessionSchema = zod_1.z.object({
    quizId: zod_1.z.string().min(1, 'Quiz ID is required')
});
exports.joinSessionSchema = zod_1.z.object({
    pin: zod_1.z.string().length(6, 'PIN must be 6 digits'),
    name: zod_1.z.string().min(1, 'Name is required').max(50, 'Name too long')
});
exports.submitAnswerSchema = zod_1.z.object({
    questionIndex: zod_1.z.number().int().min(0),
    answerIndex: zod_1.z.number().int().min(0).max(3),
    timeTakenMs: zod_1.z.number().int().min(0)
});
// Socket event schemas
exports.hostCreateSessionSchema = zod_1.z.object({
    quizId: zod_1.z.string()
});
exports.hostStartQuestionSchema = zod_1.z.object({
    questionIndex: zod_1.z.number().int().min(0)
});
exports.playerJoinSchema = zod_1.z.object({
    pin: zod_1.z.string().length(6),
    name: zod_1.z.string().min(1).max(50)
});
exports.playerSubmitAnswerSchema = zod_1.z.object({
    questionIndex: zod_1.z.number().int().min(0),
    answerIndex: zod_1.z.number().int().min(0).max(3),
    timeTakenMs: zod_1.z.number().int().min(0)
});
//# sourceMappingURL=validation.js.map