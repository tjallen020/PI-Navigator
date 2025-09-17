import { Request, Response } from 'express';
import { dataService } from '../services/dataService';
import { buildRecommendationFromNode } from '../services/recommendationService';
import { z } from 'zod';

const selectionSchema = z.object({
  option: z.string(),
  resourceLevel: z.enum(['<2h', '>2h']).default('<2h'),
  complexity: z.enum(['low', 'high']).default('low'),
  dataAvailability: z.enum(['none', 'some', 'extensive']).default('none'),
  mode: z.enum(['fast', 'guided', 'facilitator']).default('fast'),
  plainLanguage: z.boolean().default(true)
});

export const getNode = (req: Request, res: Response) => {
  const node = dataService.getDecisionNodeByKey(req.params.key);
  if (!node) {
    return res.status(404).json({ message: 'Node not found' });
  }
  res.json(node);
};

export const resolveNodeRecommendation = (req: Request, res: Response) => {
  const node = dataService.getDecisionNodeByKey(req.params.key);
  if (!node) {
    return res.status(404).json({ message: 'Node not found' });
  }
  const parsed = selectionSchema.parse(req.body);
  const result = buildRecommendationFromNode(node, parsed.option, {
    resourceLevel: parsed.resourceLevel,
    complexity: parsed.complexity,
    dataAvailability: parsed.dataAvailability,
    pathTag: node.pathTag,
    mode: parsed.mode,
    plainLanguage: parsed.plainLanguage
  });
  res.json(result);
};
