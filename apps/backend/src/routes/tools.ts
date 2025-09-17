import { Router } from 'express';

import { prisma } from '../utils/prisma.js';

export const toolsRouter = Router();

toolsRouter.get('/', async (_req, res) => {
  const tools = await prisma.tool.findMany({ orderBy: { namePlain: 'asc' } });
  res.json(tools);
});

toolsRouter.get('/:key', async (req, res) => {
  const tool = await prisma.tool.findUnique({
    where: { key: req.params.key },
    include: { rationales: true },
  });
  if (!tool) {
    return res.status(404).json({ message: 'Tool not found' });
  }
  res.json(tool);
});
