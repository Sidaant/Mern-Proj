import mongoose, { Document } from 'mongoose';
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
export declare const Session: mongoose.Model<ISession, {}, {}, {}, mongoose.Document<unknown, {}, ISession, {}, {}> & ISession & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Session.d.ts.map