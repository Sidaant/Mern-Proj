"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuiz = exports.updateQuiz = exports.getQuiz = exports.getQuizzes = exports.createQuiz = void 0;
const Quiz_1 = require("../models/Quiz");
const logger_1 = require("../config/logger");
const createQuiz = async (req, res) => {
    try {
        const { title, description, questions } = req.body;
        const hostId = req.user.id;
        const quiz = new Quiz_1.Quiz({
            title,
            description,
            questions,
            hostId
        });
        await quiz.save();
        logger_1.logger.info(`Quiz created: ${quiz._id} by ${req.user.email}`);
        res.status(201).json({
            message: 'Quiz created successfully',
            quiz: {
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                questions: quiz.questions,
                createdAt: quiz.createdAt
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Create quiz error:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
};
exports.createQuiz = createQuiz;
const getQuizzes = async (req, res) => {
    try {
        const hostId = req.user.id;
        const quizzes = await Quiz_1.Quiz.find({ hostId })
            .select('-__v')
            .sort({ createdAt: -1 });
        res.json({
            quizzes: quizzes.map(quiz => ({
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                questionCount: quiz.questions.length,
                createdAt: quiz.createdAt,
                updatedAt: quiz.updatedAt
            }))
        });
    }
    catch (error) {
        logger_1.logger.error('Get quizzes error:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
};
exports.getQuizzes = getQuizzes;
const getQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const hostId = req.user.id;
        const quiz = await Quiz_1.Quiz.findOne({ _id: quizId, hostId });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        res.json({
            quiz: {
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                questions: quiz.questions,
                createdAt: quiz.createdAt,
                updatedAt: quiz.updatedAt
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get quiz error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
};
exports.getQuiz = getQuiz;
const updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const hostId = req.user.id;
        const updates = req.body;
        const quiz = await Quiz_1.Quiz.findOneAndUpdate({ _id: quizId, hostId }, updates, { new: true, runValidators: true });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        logger_1.logger.info(`Quiz updated: ${quizId} by ${req.user.email}`);
        res.json({
            message: 'Quiz updated successfully',
            quiz: {
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                questions: quiz.questions,
                updatedAt: quiz.updatedAt
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Update quiz error:', error);
        res.status(500).json({ error: 'Failed to update quiz' });
    }
};
exports.updateQuiz = updateQuiz;
const deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const hostId = req.user.id;
        const quiz = await Quiz_1.Quiz.findOneAndDelete({ _id: quizId, hostId });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        logger_1.logger.info(`Quiz deleted: ${quizId} by ${req.user.email}`);
        res.json({ message: 'Quiz deleted successfully' });
    }
    catch (error) {
        logger_1.logger.error('Delete quiz error:', error);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
};
exports.deleteQuiz = deleteQuiz;
//# sourceMappingURL=quizController.js.map