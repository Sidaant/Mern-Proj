import mongoose, { Document } from 'mongoose';
export interface IQuestion {
    text: string;
    options: [string, string, string, string];
    correctIndex: number;
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
export declare const Quiz: mongoose.Model<IQuiz, {}, {}, {}, mongoose.Document<unknown, {}, IQuiz, {}, {}> & IQuiz & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Quiz.d.ts.map