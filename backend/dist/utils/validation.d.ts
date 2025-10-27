import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const questionSchema: z.ZodObject<{
    text: z.ZodString;
    options: z.ZodArray<z.ZodString, "many">;
    correctIndex: z.ZodNumber;
    timerSec: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    text: string;
    options: string[];
    correctIndex: number;
    timerSec: number;
}, {
    text: string;
    options: string[];
    correctIndex: number;
    timerSec: number;
}>;
export declare const createQuizSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    questions: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        options: z.ZodArray<z.ZodString, "many">;
        correctIndex: z.ZodNumber;
        timerSec: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        text: string;
        options: string[];
        correctIndex: number;
        timerSec: number;
    }, {
        text: string;
        options: string[];
        correctIndex: number;
        timerSec: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    questions: {
        text: string;
        options: string[];
        correctIndex: number;
        timerSec: number;
    }[];
    description?: string | undefined;
}, {
    title: string;
    questions: {
        text: string;
        options: string[];
        correctIndex: number;
        timerSec: number;
    }[];
    description?: string | undefined;
}>;
export declare const updateQuizSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    questions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        options: z.ZodArray<z.ZodString, "many">;
        correctIndex: z.ZodNumber;
        timerSec: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        text: string;
        options: string[];
        correctIndex: number;
        timerSec: number;
    }, {
        text: string;
        options: string[];
        correctIndex: number;
        timerSec: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
    questions?: {
        text: string;
        options: string[];
        correctIndex: number;
        timerSec: number;
    }[] | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    questions?: {
        text: string;
        options: string[];
        correctIndex: number;
        timerSec: number;
    }[] | undefined;
}>;
export declare const createSessionSchema: z.ZodObject<{
    quizId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    quizId: string;
}, {
    quizId: string;
}>;
export declare const joinSessionSchema: z.ZodObject<{
    pin: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    pin: string;
}, {
    name: string;
    pin: string;
}>;
export declare const submitAnswerSchema: z.ZodObject<{
    questionIndex: z.ZodNumber;
    answerIndex: z.ZodNumber;
    timeTakenMs: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    questionIndex: number;
    answerIndex: number;
    timeTakenMs: number;
}, {
    questionIndex: number;
    answerIndex: number;
    timeTakenMs: number;
}>;
export declare const hostCreateSessionSchema: z.ZodObject<{
    quizId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    quizId: string;
}, {
    quizId: string;
}>;
export declare const hostStartQuestionSchema: z.ZodObject<{
    questionIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    questionIndex: number;
}, {
    questionIndex: number;
}>;
export declare const playerJoinSchema: z.ZodObject<{
    pin: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    pin: string;
}, {
    name: string;
    pin: string;
}>;
export declare const playerSubmitAnswerSchema: z.ZodObject<{
    questionIndex: z.ZodNumber;
    answerIndex: z.ZodNumber;
    timeTakenMs: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    questionIndex: number;
    answerIndex: number;
    timeTakenMs: number;
}, {
    questionIndex: number;
    answerIndex: number;
    timeTakenMs: number;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type JoinSessionInput = z.infer<typeof joinSessionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
//# sourceMappingURL=validation.d.ts.map