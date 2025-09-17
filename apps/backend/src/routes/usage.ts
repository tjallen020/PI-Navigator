import { Router } from 'express';

import { prisma } from '../utils/prisma.js';

export const dashboardRouter = Router();

dashboardRouter.get('/usage', async (_req, res) => {
  const [sessionsByMode, toolFrequency, feedbackSummary] = await Promise.all([
    prisma.session.groupBy({
      by: ['selectedMode'],
      _count: { _all: true },
    }),
    prisma.session.findMany({
      select: {
        recommendedToolsJSON: true,
      },
    }),
    prisma.feedback.aggregate({
      _avg: { effectiveness: true },
      _count: { _all: true },
    }),
  ]);

  const toolCounts = new Map<string, number>();
  toolFrequency.forEach((session) => {
    const payload = session.recommendedToolsJSON as unknown as {
      tools?: Array<{ key: string }>;
      package?: { key: string } | null;
    };
    payload.tools?.forEach((tool) => {
      toolCounts.set(tool.key, (toolCounts.get(tool.key) ?? 0) + 1);
    });
    if (payload.package?.key) {
      toolCounts.set(payload.package.key, (toolCounts.get(payload.package.key) ?? 0) + 1);
    }
  });

  res.json({
    sessionsByMode,
    toolCounts: Array.from(toolCounts.entries()).map(([key, count]) => ({ key, count })),
    feedback: feedbackSummary,
  });
});
