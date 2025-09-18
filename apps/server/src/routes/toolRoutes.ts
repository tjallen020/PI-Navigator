import { Router } from 'express';
import { getTools, getToolByKey, getPackages, getPackageByKey } from '../controllers/toolController';

const router = Router();

router.get('/tools', getTools);
router.get('/tools/:key', getToolByKey);
router.get('/packages', getPackages);
router.get('/packages/:id', getPackageByKey);

export default router;
