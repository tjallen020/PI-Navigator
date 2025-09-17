import { Router } from 'express';
import PptxGenJS from 'pptxgenjs';
import { z } from 'zod';

import type { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const exportRouter = Router();

const exportSchema = z.object({
  sessionId: z.string(),
  narrative: z
    .object({
      background: z.string().optional(),
      problemStatement: z.string().optional(),
      currentState: z.string().optional(),
      rootCause: z.string().optional(),
      targetState: z.string().optional(),
      countermeasures: z.string().optional(),
      testResults: z.string().optional(),
      sustainmentPlan: z.string().optional(),
      nextSteps: z.string().optional(),
    })
    .optional(),
  meta: z
    .object({
      owner: z.string().optional(),
      unit: z.string().optional(),
      date: z.string().optional(),
      problemTitle: z.string().optional(),
    })
    .optional(),
  charts: z
    .array(
      z.object({
        slot: z.enum(['current', 'results']),
        imageData: z.string(),
      })
    )
    .optional(),
});

const boxTitles = [
  '1. Background',
  '2. Problem Statement',
  '3. Current State',
  '4. Root Cause',
  '5. Target State',
  '6. Countermeasures',
  '7. Test Results',
  '8. Sustainment Plan',
  '9. Next Steps / Spread',
];

const defaultNarrative = {
  background: 'Summarize why this improvement is needed.',
  problemStatement: 'Draft a crisp problem statement with scope.',
  currentState: 'Describe current performance and process view.',
  rootCause: 'Summarize key drivers (5 Whys, fishbone).',
  targetState: 'Define SMART target aligned to organizational aims.',
  countermeasures: 'List selected tool package and experiments.',
  testResults: 'Describe learnings from PDSA, run/control charts.',
  sustainmentPlan: 'Outline control plan, huddles, 30/60/90 reviews.',
  nextSteps: 'State spread/adoption approach and owners.',
};

exportRouter.post('/a3ppt', async (req: AuthenticatedRequest, res) => {
  const payload = exportSchema.parse(req.body);
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId, userId: req.user!.id },
    include: {
      metrics: true,
      controlPlans: true,
    },
  });
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  const ppt = new PptxGenJS();
  ppt.layout = 'LAYOUT_16x9';

  const meta = payload.meta ?? {};
  const recommendation = session.recommendedToolsJSON as unknown as {
    package?: { name: string } | null;
    tools?: Array<{ key: string }>;
  };

  const slide = ppt.addSlide();
  const titleText = `A3 Report – ${meta.unit ?? 'Unit'} – ${meta.problemTitle ?? 'Improvement Focus'} – ${
    meta.date ?? new Date().toLocaleDateString()
  }`;
  slide.addText(titleText, {
    x: 0.3,
    y: 0.1,
    w: 12.5,
    h: 0.6,
    bold: true,
    fontSize: 20,
  });

  slide.addText(`Owner: ${meta.owner ?? 'TBD'}`, { x: 0.3, y: 0.8, w: 4, h: 0.4, fontSize: 12 });
  slide.addText('Org Logo', {
    x: 10.5,
    y: 0.6,
    w: 2,
    h: 0.8,
    align: 'center',
    fontSize: 14,
    bold: true,
    fill: { color: 'F2F2F2' },
  });

  const narrative = { ...defaultNarrative, ...payload.narrative };

  const gridPositions = [
    { x: 0.3, y: 1.5 },
    { x: 4.5, y: 1.5 },
    { x: 8.7, y: 1.5 },
    { x: 0.3, y: 4.0 },
    { x: 4.5, y: 4.0 },
    { x: 8.7, y: 4.0 },
    { x: 0.3, y: 6.5 },
    { x: 4.5, y: 6.5 },
    { x: 8.7, y: 6.5 },
  ];

  const boxContent = [
    narrative.background,
    narrative.problemStatement,
    narrative.currentState,
    narrative.rootCause,
    narrative.targetState,
    `${narrative.countermeasures}\n\nSelected Package: ${recommendation.package?.name ?? 'N/A'}`,
    narrative.testResults,
    narrative.sustainmentPlan,
    narrative.nextSteps,
  ];

  gridPositions.forEach((pos, idx) => {
    slide.addShape(ppt.ShapeType.rect, {
      x: pos.x,
      y: pos.y,
      w: 4,
      h: 2.2,
      line: { color: '24527A', width: 1.2 },
    });
    slide.addText(boxTitles[idx], {
      x: pos.x + 0.2,
      y: pos.y + 0.1,
      w: 3.6,
      h: 0.4,
      bold: true,
      fontSize: 13,
    });
    slide.addText(boxContent[idx], {
      x: pos.x + 0.2,
      y: pos.y + 0.6,
      w: 3.6,
      h: 1.4,
      fontSize: 12,
      color: '1F2933',
      valign: 'top',
      wrap: true,
    });
  });

  payload.charts?.forEach((chart) => {
    const targetIndex = chart.slot === 'current' ? 2 : 6;
    const targetPos = gridPositions[targetIndex];
    slide.addImage({
      data: chart.imageData,
      x: targetPos.x + 2.2,
      y: targetPos.y + 0.8,
      w: 1.6,
      h: 1,
    });
  });

  const buffer = await ppt.write('nodebuffer');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  res.setHeader('Content-Disposition', 'attachment; filename="QI-Tool-Selector-A3.pptx"');
  res.send(buffer);
});
