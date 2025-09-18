import { Request, Response } from 'express';
import { z } from 'zod';

import { inMemoryStore } from '../services/inMemoryStore';

const sustainmentSchema = z.object({
  controlPlan: z.object({
    prompt: z.string(),
    checklist: z.array(z.string())
  }),
  huddle: z.object({
    prompt: z.string(),
    cadence: z.string()
  }),
  followUps: z.array(z.string())
});

const recommendationSchema = z.object({
  tools: z.array(
    z.object({
      key: z.string(),
      namePlain: z.string(),
      nameTech: z.string()
    })
  ),
  package: z
    .object({
      key: z.string(),
      name: z.string(),
      description: z.string().optional()
    })
    .optional(),
  extras: z.array(z.string()).optional(),
  rationales: z.array(
    z.object({
      toolKey: z.string(),
      pathTag: z.string(),
      text: z.string()
    })
  ),
  sustainment: sustainmentSchema
});

const sessionSchema = z.object({
  answersJSON: z.record(z.any()),
  selectedMode: z.string(),
  recommendedToolsJSON: recommendationSchema,
  sustainmentPlanJSON: sustainmentSchema,
  metrics: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        unit: z.string(),
        baseline: z.string().optional(),
        target: z.string().optional()
      })
    )
    .optional(),
  controlPlan: z
    .object({
      owner: z.string(),
      frequency: z.string(),
      kpis: z.array(z.string()),
      responsePlan: z.string()
    })
    .optional()
});

export const saveSession = (req: Request, res: Response) => {
  const parsed = sessionSchema.parse(req.body);
  const session = inMemoryStore.saveSession({
    ...parsed,
    userId: (req as Request & { user?: { id: string } }).user?.id
  });
  res.status(201).json(session);
};

export const getUsageDashboard = (req: Request, res: Response) => {
  res.json(inMemoryStore.getUsageMetrics());
};
