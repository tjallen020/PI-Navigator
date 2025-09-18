import { Router } from 'express';
import { exportA3 } from '../controllers/exportController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/export/a3ppt', authenticate(), exportA3);

export default router;
