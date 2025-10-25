import { Router } from 'express';
import { createSession, getSession, getSessions } from '../controllers/sessionController';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { createSessionSchema } from '../utils/validation';

const router = Router();

// All session routes require authentication
router.use(authenticateToken);

router.post('/', validate(createSessionSchema), createSession);
router.get('/', getSessions);
router.get('/:sessionId', getSession);

export default router;
