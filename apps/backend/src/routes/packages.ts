import { Router } from 'express';

import { prisma } from '../utils/prisma.js';

export const packagesRouter = Router();

packagesRouter.get('/', async (_req, res) => {
  const packages = await prisma.toolPackage.findMany({ orderBy: { name: 'asc' } });
  res.json(packages);
});

packagesRouter.get('/:key', async (req, res) => {
  const toolPackage = await prisma.toolPackage.findUnique({ where: { key: req.params.key } });
  if (!toolPackage) {
    return res.status(404).json({ message: 'Tool package not found' });
  }
  res.json(toolPackage);
});
