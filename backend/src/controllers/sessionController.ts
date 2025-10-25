import { Response } from 'express';
import { Session } from '../models/Session';
import { Quiz } from '../models/Quiz';
import { logger } from '../config/logger';
import { AuthRequest } from '../middleware/auth';

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.body;
    const hostId = req.user!.id;

    // Verify quiz exists and belongs to host
    const quiz = await Quiz.findOne({ _id: quizId, hostId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Generate unique 6-digit PIN
    let pin: string;
    let isUnique = false;
    do {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
      const existingSession = await Session.findOne({ pin });
      isUnique = !existingSession;
    } while (!isUnique);

    const session = new Session({
      quizId,
      hostId,
      pin,
      players: [],
      currentQuestionIndex: -1,
      isActive: false,
      isLocked: false
    });

    await session.save();

    logger.info(`Session created: ${session._id} with PIN ${pin} by ${req.user!.email}`);

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
  } catch (error) {
    logger.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

export const getSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const hostId = req.user!.id;

    const session = await Session.findOne({ _id: sessionId, hostId })
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
  } catch (error) {
    logger.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const hostId = req.user!.id;
    const sessions = await Session.find({ hostId })
      .populate('quizId', 'title')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json({
      sessions: sessions.map(session => ({
        id: session._id,
        pin: session.pin,
        quizTitle: (session.quizId as any).title,
        playerCount: session.players.length,
        isActive: session.isActive,
        createdAt: session.createdAt
      }))
    });
  } catch (error) {
    logger.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};
