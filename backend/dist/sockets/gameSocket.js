"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeGameSocket = void 0;
const socket_io_1 = require("socket.io");
const Session_1 = require("../models/Session");
const Quiz_1 = require("../models/Quiz");
const logger_1 = require("../config/logger");
const validation_1 = require("../utils/validation");
const jwt_1 = require("../utils/jwt");
const gameStates = new Map();
const initializeGameSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });
    io.on('connection', (socket) => {
        logger_1.logger.info(`Socket connected: ${socket.id}`);
        // Authenticate socket connection for host
        socket.on('host:authenticate', (data) => {
            try {
                const { token } = data;
                if (!token) {
                    socket.emit('server:error', { message: 'Authentication required' });
                    return;
                }
                const decoded = (0, jwt_1.verifyAccessToken)(token);
                socket.hostId = decoded.userId;
                socket.hostEmail = decoded.email;
                socket.emit('server:authenticated');
                logger_1.logger.info(`Host authenticated: ${decoded.email}`);
            }
            catch (error) {
                logger_1.logger.error('Socket authentication error:', error);
                socket.emit('server:error', { message: 'Invalid authentication token' });
            }
        });
        // Host joins existing session
        socket.on('host:join_session', async (data) => {
            try {
                const { sessionId } = data;
                if (!socket.hostId) {
                    socket.emit('server:error', { message: 'Authentication required' });
                    return;
                }
                const session = await Session_1.Session.findById(sessionId).populate('quizId');
                if (!session) {
                    socket.emit('server:error', { message: 'Session not found' });
                    return;
                }
                // Verify host owns this session
                if (session.hostId.toString() !== socket.hostId) {
                    socket.emit('server:error', { message: 'Unauthorized' });
                    return;
                }
                // Join socket room
                socket.join(sessionId);
                // Store host info
                socket.playerInfo = {
                    id: socket.id,
                    name: 'Host',
                    sessionId: sessionId,
                    isHost: true
                };
                // Initialize game state if not exists
                if (!gameStates.has(sessionId)) {
                    gameStates.set(sessionId, {
                        sessionId: sessionId,
                        currentQuestionIndex: session.currentQuestionIndex,
                        isActive: session.isActive,
                        isLocked: session.isLocked
                    });
                }
                socket.emit('server:session_joined', {
                    session: {
                        id: session._id.toString(),
                        pin: session.pin,
                        quiz: session.quizId,
                        players: session.players,
                        currentQuestionIndex: session.currentQuestionIndex,
                        isActive: session.isActive,
                        isLocked: session.isLocked
                    }
                });
                logger_1.logger.info(`Host joined session: ${sessionId}`);
            }
            catch (error) {
                logger_1.logger.error('Host join session error:', error);
                socket.emit('server:error', { message: 'Failed to join session' });
            }
        });
        // Player joins session
        socket.on('player:join', async (data) => {
            try {
                const { pin, name } = validation_1.joinSessionSchema.parse(data);
                // Find session by PIN
                const session = await Session_1.Session.findOne({ pin, isActive: false });
                if (!session) {
                    socket.emit('server:error', { message: 'Invalid PIN or session not available' });
                    return;
                }
                // Check if player name already exists in session
                const existingPlayer = session.players.find(p => p.name === name);
                if (existingPlayer) {
                    socket.emit('server:error', { message: 'Name already taken' });
                    return;
                }
                // Add player to session
                const playerId = socket.id;
                session.players.push({
                    id: playerId,
                    name,
                    score: 0,
                    answers: []
                });
                await session.save();
                // Join socket room
                socket.join(session._id.toString());
                // Store player info
                socket.playerInfo = {
                    id: playerId,
                    name,
                    sessionId: session._id.toString(),
                    isHost: false
                };
                // Notify host about new player
                socket.to(session._id.toString()).emit('server:player_joined', {
                    playerId,
                    name,
                    playerCount: session.players.length
                });
                // Send current session state to player
                socket.emit('server:session_joined', {
                    sessionId: session._id.toString(),
                    pin: session.pin,
                    playerCount: session.players.length,
                    isActive: session.isActive
                });
                logger_1.logger.info(`Player joined: ${name} to session ${session._id}`);
            }
            catch (error) {
                logger_1.logger.error('Player join error:', error);
                socket.emit('server:error', { message: 'Failed to join session' });
            }
        });
        // Host creates session
        socket.on('host:create_session', async (data) => {
            try {
                const { quizId } = data;
                // Check if host is authenticated
                if (!socket.hostId) {
                    socket.emit('server:error', { message: 'Authentication required' });
                    return;
                }
                const hostId = socket.hostId;
                // Find quiz and verify ownership
                const quiz = await Quiz_1.Quiz.findOne({ _id: quizId, hostId });
                if (!quiz) {
                    socket.emit('server:error', { message: 'Quiz not found or unauthorized' });
                    return;
                }
                // Create session
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
                // Join socket room
                socket.join(session._id.toString());
                // Store host info
                socket.playerInfo = {
                    id: socket.id,
                    name: 'Host',
                    sessionId: session._id.toString(),
                    isHost: true
                };
                // Initialize game state
                gameStates.set(session._id.toString(), {
                    sessionId: session._id.toString(),
                    currentQuestionIndex: -1,
                    isActive: false,
                    isLocked: false
                });
                socket.emit('server:session_created', {
                    sessionId: session._id.toString(),
                    pin: session.pin,
                    quiz: quiz
                });
                logger_1.logger.info(`Host session created: ${session._id} with PIN ${pin}`);
            }
            catch (error) {
                logger_1.logger.error('Host create session error:', error);
                socket.emit('server:error', { message: 'Failed to create session' });
            }
        });
        // Host starts question
        socket.on('host:start_question', async (data) => {
            try {
                const { questionIndex } = data;
                const playerInfo = socket.playerInfo;
                if (!playerInfo?.isHost || !socket.hostId) {
                    socket.emit('server:error', { message: 'Unauthorized' });
                    return;
                }
                const session = await Session_1.Session.findById(playerInfo.sessionId);
                if (!session) {
                    socket.emit('server:error', { message: 'Session not found' });
                    return;
                }
                const quiz = await Quiz_1.Quiz.findById(session.quizId);
                if (!quiz || questionIndex >= quiz.questions.length) {
                    socket.emit('server:error', { message: 'Invalid question index' });
                    return;
                }
                // Update session
                session.currentQuestionIndex = questionIndex;
                session.isActive = true;
                session.isLocked = false;
                await session.save();
                // Update game state
                const gameState = gameStates.get(playerInfo.sessionId);
                if (gameState) {
                    gameState.currentQuestionIndex = questionIndex;
                    gameState.isActive = true;
                    gameState.isLocked = false;
                }
                const question = quiz.questions[questionIndex];
                const timerMs = question.timerSec * 1000;
                // Send question to all players
                io.to(playerInfo.sessionId).emit('server:question', {
                    questionIndex,
                    question: {
                        text: question.text,
                        options: question.options,
                        timerSec: question.timerSec
                    }
                });
                // Start timer
                const timer = setTimeout(async () => {
                    await lockAnswers(playerInfo.sessionId, io);
                }, timerMs);
                // Store timer in game state
                if (gameState) {
                    gameState.timer = timer;
                }
                // Send timer start
                io.to(playerInfo.sessionId).emit('server:timer', {
                    questionIndex,
                    duration: question.timerSec
                });
                logger_1.logger.info(`Question started: ${questionIndex} in session ${playerInfo.sessionId}`);
            }
            catch (error) {
                logger_1.logger.error('Start question error:', error);
                socket.emit('server:error', { message: 'Failed to start question' });
            }
        });
        // Player submits answer
        socket.on('player:submit_answer', async (data) => {
            try {
                const { questionIndex, answerIndex, timeTakenMs } = validation_1.playerSubmitAnswerSchema.parse(data);
                const playerInfo = socket.playerInfo;
                if (!playerInfo || playerInfo.isHost) {
                    socket.emit('server:error', { message: 'Unauthorized' });
                    return;
                }
                const session = await Session_1.Session.findById(playerInfo.sessionId);
                if (!session) {
                    socket.emit('server:error', { message: 'Session not found' });
                    return;
                }
                // Check if session is locked
                if (session.isLocked) {
                    socket.emit('server:error', { message: 'Time is up! Answers are locked' });
                    return;
                }
                // Check if this is the current question
                if (session.currentQuestionIndex !== questionIndex) {
                    socket.emit('server:error', { message: 'Invalid question' });
                    return;
                }
                const quiz = await Quiz_1.Quiz.findById(session.quizId);
                if (!quiz) {
                    socket.emit('server:error', { message: 'Quiz not found' });
                    return;
                }
                const question = quiz.questions[questionIndex];
                const isCorrect = question.correctIndex === answerIndex;
                // Calculate points
                const basePoints = 1000;
                const speedBonus = Math.max(0, 500 - timeTakenMs / 10);
                const points = isCorrect ? basePoints + speedBonus : 0;
                // Update player
                const player = session.players.find(p => p.id === playerInfo.id);
                if (player) {
                    player.score += points;
                    player.answers.push({
                        questionIndex,
                        answerIndex,
                        timeTakenMs,
                        isCorrect,
                        points
                    });
                }
                await session.save();
                // Send confirmation to player
                socket.emit('server:answer_received', {
                    questionIndex,
                    isCorrect,
                    points,
                    totalScore: player?.score || 0
                });
                logger_1.logger.info(`Answer submitted: Player ${playerInfo.name} - Q${questionIndex} - ${isCorrect ? 'Correct' : 'Wrong'}`);
            }
            catch (error) {
                logger_1.logger.error('Submit answer error:', error);
                socket.emit('server:error', { message: 'Failed to submit answer' });
            }
        });
        // Host moves to next question
        socket.on('host:next_question', async (data) => {
            try {
                const playerInfo = socket.playerInfo;
                if (!playerInfo?.isHost || !socket.hostId) {
                    socket.emit('server:error', { message: 'Unauthorized' });
                    return;
                }
                const session = await Session_1.Session.findById(playerInfo.sessionId);
                if (!session) {
                    socket.emit('server:error', { message: 'Session not found' });
                    return;
                }
                // Lock current question if not already locked
                if (!session.isLocked) {
                    await lockAnswers(playerInfo.sessionId, io);
                }
                // Send leaderboard
                const leaderboard = session.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => ({
                    rank: index + 1,
                    name: player.name,
                    score: player.score
                }));
                io.to(playerInfo.sessionId).emit('server:leaderboard', {
                    questionIndex: session.currentQuestionIndex,
                    leaderboard
                });
                logger_1.logger.info(`Next question requested in session ${playerInfo.sessionId}`);
            }
            catch (error) {
                logger_1.logger.error('Next question error:', error);
                socket.emit('server:error', { message: 'Failed to move to next question' });
            }
        });
        // Host ends game
        socket.on('host:end_game', async (data) => {
            try {
                const playerInfo = socket.playerInfo;
                if (!playerInfo?.isHost || !socket.hostId) {
                    socket.emit('server:error', { message: 'Unauthorized' });
                    return;
                }
                const session = await Session_1.Session.findById(playerInfo.sessionId);
                if (!session) {
                    socket.emit('server:error', { message: 'Session not found' });
                    return;
                }
                // End session
                session.isActive = false;
                session.endedAt = new Date();
                await session.save();
                // Clear game state
                const gameState = gameStates.get(playerInfo.sessionId);
                if (gameState?.timer) {
                    clearTimeout(gameState.timer);
                }
                gameStates.delete(playerInfo.sessionId);
                // Send final leaderboard
                const finalLeaderboard = session.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => ({
                    rank: index + 1,
                    name: player.name,
                    score: player.score
                }));
                io.to(playerInfo.sessionId).emit('server:game_over', {
                    finalLeaderboard
                });
                logger_1.logger.info(`Game ended in session ${playerInfo.sessionId}`);
            }
            catch (error) {
                logger_1.logger.error('End game error:', error);
                socket.emit('server:error', { message: 'Failed to end game' });
            }
        });
        // Handle disconnect
        socket.on('disconnect', async () => {
            try {
                const playerInfo = socket.playerInfo;
                if (playerInfo) {
                    const session = await Session_1.Session.findById(playerInfo.sessionId);
                    if (session && !playerInfo.isHost) {
                        // Remove player from session
                        session.players = session.players.filter(p => p.id !== playerInfo.id);
                        await session.save();
                        // Notify others
                        socket.to(playerInfo.sessionId).emit('server:player_left', {
                            playerId: playerInfo.id,
                            name: playerInfo.name,
                            playerCount: session.players.length
                        });
                    }
                    // Clean up game state if host disconnects
                    if (playerInfo.isHost) {
                        const gameState = gameStates.get(playerInfo.sessionId);
                        if (gameState?.timer) {
                            clearTimeout(gameState.timer);
                        }
                        gameStates.delete(playerInfo.sessionId);
                    }
                }
                logger_1.logger.info(`Socket disconnected: ${socket.id}`);
            }
            catch (error) {
                logger_1.logger.error('Disconnect error:', error);
            }
        });
    });
    return io;
};
exports.initializeGameSocket = initializeGameSocket;
// Helper function to lock answers
const lockAnswers = async (sessionId, io) => {
    try {
        const session = await Session_1.Session.findById(sessionId);
        if (!session)
            return;
        session.isLocked = true;
        await session.save();
        // Clear timer
        const gameState = gameStates.get(sessionId);
        if (gameState?.timer) {
            clearTimeout(gameState.timer);
            gameState.timer = undefined;
        }
        // Notify all players
        io.to(sessionId).emit('server:lock', {
            questionIndex: session.currentQuestionIndex
        });
        logger_1.logger.info(`Answers locked for session ${sessionId}`);
    }
    catch (error) {
        logger_1.logger.error('Lock answers error:', error);
    }
};
//# sourceMappingURL=gameSocket.js.map