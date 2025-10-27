import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createQuiz: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getQuizzes: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getQuiz: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateQuiz: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteQuiz: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=quizController.d.ts.map