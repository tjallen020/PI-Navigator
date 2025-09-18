import { Router } from 'express';
import { getNode, resolveNodeRecommendation } from '../controllers/decisionController';

const router = Router();

router.get('/nodes/:key', getNode);
router.post('/nodes/:key/resolve', resolveNodeRecommendation);

export default router;
