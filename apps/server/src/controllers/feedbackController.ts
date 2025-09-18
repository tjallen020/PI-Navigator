import { Request, Response } from 'express';
import { z } from 'zod';

import { inMemoryStore } from '../services/inMemoryStore';

const feedbackSchema = z.object({
  sessionId: z.string(),
  effectiveness1to5: z.number().min(1).max(5),
  timeValueNote: z.string().optional(),
  recommendYN: z.boolean(),
  notes: z.string().optional()
});

export const submitFeedback = (req: Request, res: Response) => {
  const parsed = feedbackSchema.parse(req.body);
  const saved = inMemoryStore.saveFeedback(parsed);
  res.status(201).json(saved);
};
