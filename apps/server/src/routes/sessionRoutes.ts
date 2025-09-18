import { Router } from 'express';
import { saveSession, getUsageDashboard } from '../controllers/sessionController';
import { submitFeedback } from '../controllers/feedbackController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/sessions', authenticate(), saveSession);
router.post('/feedback', authenticate(), submitFeedback);
router.get('/dashboard/usage', authenticate(['FACILITATOR', 'ADMIN']), getUsageDashboard);

export default router;
