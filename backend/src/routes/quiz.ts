import { Router } from 'express';
import { createQuiz, getQuizzes, getQuiz, updateQuiz, deleteQuiz } from '../controllers/quizController';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { createQuizSchema, updateQuizSchema } from '../utils/validation';

const router = Router();

// All quiz routes require authentication
router.use(authenticateToken);

router.post('/', validate(createQuizSchema), createQuiz);
router.get('/', getQuizzes);
router.get('/:quizId', getQuiz);
router.put('/:quizId', validate(updateQuizSchema), updateQuiz);
router.delete('/:quizId', deleteQuiz);

export default router;
