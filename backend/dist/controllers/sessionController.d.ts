import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createSession: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSession: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSessions: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=sessionController.d.ts.map