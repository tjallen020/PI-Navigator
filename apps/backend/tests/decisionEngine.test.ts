import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { buildRecommendation } from '../src/services/decisionEngine.js';
import { prisma } from '../src/utils/prisma.js';

const mockTool = (key: string) => ({
  id: key,
  key,
  namePlain: key,
  nameTech: key,
  description: '',
  category: 'Test',
  difficulty: 'Easy',
  estTime: '<1h',
  pitfalls: [],
  nextToolKeys: [],
  templates: [],
});

describe('decision engine', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('honors fast-track incident path', async () => {
    vi.spyOn(prisma.toolPackage, 'findUnique').mockResolvedValue({
      id: 'pkg1',
      key: 'Safety',
      name: 'Safety Assurance Package',
      toolKeys: ['FMEA', 'DailyHuddle'],
      description: '',
      whenBest: '',
      pitfalls: [],
      nextPackageKeys: [],
    });
    vi.spyOn(prisma.tool, 'findMany').mockImplementation(async (args) => {
      const keys = args?.where?.key?.in ?? [];
      return keys.map((key: string) => mockTool(key));
    });
    vi.spyOn(prisma.rationale, 'findFirst').mockResolvedValue({
      id: 'rat',
      toolKey: 'FMEA',
      pathTag: 'FMEA@Incident:Sentinel',
      textPlain: 'plain',
      textTech: 'tech',
    });

    const result = await buildRecommendation({
      answers: { goal: 'E', incidentType: 'sentinel' },
      filters: { resourceLevel: '<2h', complexity: 'low', dataAvailability: 'some' },
      mode: 'FAST_TRACK',
    });

    expect(result.package?.key).toBe('Safety');
    expect(result.tools).toHaveLength(2);
    expect(result.contextTag).toBe('Incident:Sentinel');
  });

  it('applies resource filter for simple tools', async () => {
    vi.spyOn(prisma.toolPackage, 'findUnique').mockResolvedValue({
      id: 'pkg',
      key: 'QuickWin',
      name: 'Quick',
      toolKeys: ['5Whys', 'PDSA', 'VisualMgmt'],
      description: '',
      whenBest: '',
      pitfalls: [],
      nextPackageKeys: [],
    });
    vi.spyOn(prisma.tool, 'findMany').mockImplementation(async (args) => {
      const keys = args?.where?.key?.in ?? [];
      return keys.map((key: string) => mockTool(key));
    });
    vi.spyOn(prisma.rationale, 'findFirst').mockResolvedValue(null);

    const result = await buildRecommendation({
      answers: { goal: 'A' },
      filters: { resourceLevel: '<2h', complexity: 'low', dataAvailability: 'some' },
      mode: 'FAST_TRACK',
    });

    expect(result.tools.map((t) => t.tool.key)).toEqual(['5Whys', 'VisualMgmt']);
  });
});
