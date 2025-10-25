import { Response } from 'express';
import { Quiz } from '../models/Quiz';
import { logger } from '../config/logger';
import { AuthRequest } from '../middleware/auth';

export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, questions } = req.body;
    const hostId = req.user!.id;

    const quiz = new Quiz({
      title,
      description,
      questions,
      hostId
    });

    await quiz.save();

    logger.info(`Quiz created: ${quiz._id} by ${req.user!.email}`);

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
  } catch (error) {
    logger.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

export const getQuizzes = async (req: AuthRequest, res: Response) => {
  try {
    const hostId = req.user!.id;
    const quizzes = await Quiz.find({ hostId })
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
  } catch (error) {
    logger.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

export const getQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const hostId = req.user!.id;

    const quiz = await Quiz.findOne({ _id: quizId, hostId });
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
  } catch (error) {
    logger.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

export const updateQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const hostId = req.user!.id;
    const updates = req.body;

    const quiz = await Quiz.findOneAndUpdate(
      { _id: quizId, hostId },
      updates,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    logger.info(`Quiz updated: ${quizId} by ${req.user!.email}`);

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
  } catch (error) {
    logger.error('Update quiz error:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
};

export const deleteQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const hostId = req.user!.id;

    const quiz = await Quiz.findOneAndDelete({ _id: quizId, hostId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    logger.info(`Quiz deleted: ${quizId} by ${req.user!.email}`);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    logger.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};
