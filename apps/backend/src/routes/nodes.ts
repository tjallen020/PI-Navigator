import { Router } from 'express';

import { prisma } from '../utils/prisma.js';

export const decisionRouter = Router();

decisionRouter.get('/:key', async (req, res) => {
  const node = await prisma.decisionNode.findUnique({ where: { key: req.params.key } });
  if (!node) {
    return res.status(404).json({ message: 'Decision node not found' });
  }
  res.json(node);
});
