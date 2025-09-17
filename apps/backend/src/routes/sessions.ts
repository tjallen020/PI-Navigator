import { Router } from 'express';
import { z } from 'zod';

import type { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { buildRecommendation } from '../services/decisionEngine.js';
import { HttpError } from '../middleware/errorHandler.js';

export const sessionsRouter = Router();

const metricSchema = z.object({
  name: z.string(),
  type: z.enum(['process', 'outcome', 'balancing']),
  unit: z.string(),
  baseline: z.string(),
  target: z.string(),
});

const sustainmentSchema = z.object({
  owner: z.string(),
  frequency: z.string(),
  kpis: z.array(z.string()),
  responsePlan: z.string(),
});

const sessionSchema = z.object({
  sessionId: z.string().optional(),
  mode: z.enum(['FAST_TRACK', 'GUIDED', 'FACILITATOR']),
  answers: z
    .object({
      goal: z.enum(['A', 'B', 'C', 'D', 'E']),
      incidentType: z.enum(['sentinel', 'nearmiss', 'recurring', 'system']).optional(),
      pathTag: z.string().optional(),
    })
    .passthrough(),
  filters: z.object({
    resourceLevel: z.enum(['<2h', '>2h']),
    complexity: z.enum(['low', 'high']).default('low'),
    dataAvailability: z.enum(['none', 'some', 'extensive']).default('some'),
  }),
  metrics: z.array(metricSchema).optional(),
  sustainmentPlan: sustainmentSchema.optional(),
  plainLanguage: z.boolean().optional(),
});

sessionsRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const payload = sessionSchema.parse(req.body);
  const recommendation = await buildRecommendation({
    answers: payload.answers,
    filters: payload.filters,
    mode: payload.mode,
  });

  const recommendationData = {
    package: recommendation.package
      ? {
          key: recommendation.package.key,
          name: recommendation.package.name,
          tools: recommendation.package.tools.map((tool) => tool.key),
        }
      : null,
    tools: recommendation.tools.map((item) => ({
      key: item.tool.key,
      rationale: item.rationale,
    })),
    frameworks: recommendation.frameworks,
    extras: recommendation.extras,
    contextTag: recommendation.contextTag,
  };

  const sustainmentPlanJSON = payload.sustainmentPlan
    ? payload.sustainmentPlan
    : {
        prompts: recommendation.sustainmentPrompts,
        owner: '',
        frequency: '',
        kpis: [],
        responsePlan: '',
      };

  const sessionData = {
    userId: req.user!.id,
    answersJSON: payload.answers,
    selectedMode: payload.mode,
    recommendedToolsJSON: recommendationData,
    sustainmentPlanJSON,
  };

  let session;
  if (payload.sessionId) {
    const existing = await prisma.session.findUnique({ where: { id: payload.sessionId } });
    if (!existing || existing.userId !== req.user!.id) {
      throw new HttpError(404, 'Session not found');
    }
    session = await prisma.session.update({
      where: { id: payload.sessionId },
      data: sessionData,
    });
  } else {
    session = await prisma.session.create({ data: sessionData });
  }

  if (payload.metrics) {
    await prisma.metric.deleteMany({ where: { sessionId: session.id } });
    await prisma.metric.createMany({
      data: payload.metrics.map((metric) => ({
        sessionId: session.id,
        ...metric,
      })),
    });
  }

  if (payload.sustainmentPlan) {
    await prisma.controlPlan.deleteMany({ where: { sessionId: session.id } });
    await prisma.controlPlan.create({
      data: {
        sessionId: session.id,
        owner: payload.sustainmentPlan.owner,
        frequency: payload.sustainmentPlan.frequency,
        kpis: payload.sustainmentPlan.kpis,
        responsePlan: payload.sustainmentPlan.responsePlan,
      },
    });
  }

  const completeSession = await prisma.session.findUnique({
    where: { id: session.id },
    include: {
      metrics: true,
      controlPlans: true,
    },
  });

  res.status(payload.sessionId ? 200 : 201).json({
    session: completeSession,
    recommendation,
    prompts: recommendation.sustainmentPrompts,
  });
});
