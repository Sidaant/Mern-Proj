"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessions = exports.getSession = exports.createSession = void 0;
const Session_1 = require("../models/Session");
const Quiz_1 = require("../models/Quiz");
const logger_1 = require("../config/logger");
const createSession = async (req, res) => {
    try {
        const { quizId } = req.body;
        const hostId = req.user.id;
        // Verify quiz exists and belongs to host
        const quiz = await Quiz_1.Quiz.findOne({ _id: quizId, hostId });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        // Generate unique 6-digit PIN
        let pin;
        let isUnique = false;
        do {
            pin = Math.floor(100000 + Math.random() * 900000).toString();
            const existingSession = await Session_1.Session.findOne({ pin });
            isUnique = !existingSession;
        } while (!isUnique);
        const session = new Session_1.Session({
            quizId,
            hostId,
            pin,
            players: [],
            currentQuestionIndex: -1,
            isActive: false,
            isLocked: false
        });
        await session.save();
        logger_1.logger.info(`Session created: ${session._id} with PIN ${pin} by ${req.user.email}`);
        res.status(201).json({
            message: 'Session created successfully',
            session: {
                id: session._id,
                pin: session.pin,
                quizId: session.quizId,
                playerCount: session.players.length,
                isActive: session.isActive
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Create session error:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
};
exports.createSession = createSession;
const getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const hostId = req.user.id;
        const session = await Session_1.Session.findOne({ _id: sessionId, hostId })
            .populate('quizId', 'title description questions');
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({
            session: {
                id: session._id,
                pin: session.pin,
                quiz: session.quizId,
                players: session.players,
                currentQuestionIndex: session.currentQuestionIndex,
                isActive: session.isActive,
                isLocked: session.isLocked,
                startedAt: session.startedAt,
                createdAt: session.createdAt
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get session error:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
};
exports.getSession = getSession;
const getSessions = async (req, res) => {
    try {
        const hostId = req.user.id;
        const sessions = await Session_1.Session.find({ hostId })
            .populate('quizId', 'title')
            .select('-__v')
            .sort({ createdAt: -1 });
        res.json({
            sessions: sessions.map(session => ({
                id: session._id,
                pin: session.pin,
                quizTitle: session.quizId.title,
                playerCount: session.players.length,
                isActive: session.isActive,
                createdAt: session.createdAt
            }))
        });
    }
    catch (error) {
        logger_1.logger.error('Get sessions error:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};
exports.getSessions = getSessions;
//# sourceMappingURL=sessionController.js.map