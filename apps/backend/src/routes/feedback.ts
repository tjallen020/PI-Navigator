import { Router } from 'express';
import { z } from 'zod';

import type { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const feedbackRouter = Router();

const feedbackSchema = z.object({
  sessionId: z.string(),
  effectiveness: z.number().min(1).max(5),
  timeValueNote: z.string(),
  recommendYN: z.boolean(),
  notes: z.string().optional(),
});

feedbackRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const payload = feedbackSchema.parse(req.body);
  const session = await prisma.session.findUnique({ where: { id: payload.sessionId, userId: req.user!.id } });
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  const feedback = await prisma.feedback.upsert({
    where: { sessionId: payload.sessionId },
    update: {
      effectiveness: payload.effectiveness,
      timeValueNote: payload.timeValueNote,
      recommendYN: payload.recommendYN,
      notes: payload.notes,
    },
    create: {
      sessionId: payload.sessionId,
      effectiveness: payload.effectiveness,
      timeValueNote: payload.timeValueNote,
      recommendYN: payload.recommendYN,
      notes: payload.notes,
    },
  });

  res.status(201).json(feedback);
});
