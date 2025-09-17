import type { Mode, Tool } from '@prisma/client';

import { prisma } from '../utils/prisma.js';

const SIMPLE_TOOLS = new Set(['5Whys', 'CheckSheet', 'VisualMgmt', 'DailyHuddle', 'GoodCatch']);

export type DecisionFilters = {
  resourceLevel: '<2h' | '>2h';
  complexity?: 'low' | 'high';
  dataAvailability?: 'none' | 'some' | 'extensive';
};

export type DecisionAnswers = Record<string, unknown> & {
  goal: 'A' | 'B' | 'C' | 'D' | 'E';
  incidentType?: 'sentinel' | 'nearmiss' | 'recurring' | 'system';
  pathTag?: string;
};

export interface DecisionRequest {
  mode: Mode;
  answers: DecisionAnswers;
  filters: DecisionFilters;
}

export interface RecommendationResult {
  package?: {
    key: string;
    name: string;
    description: string;
    whenBest: string;
    pitfalls: string[];
    tools: Tool[];
  };
  tools: Array<{
    tool: Tool;
    rationale: {
      plain: string;
      technical: string;
    };
  }>;
  frameworks: string[];
  sustainmentPrompts: {
    controlPlan: {
      ownerHint: string;
      metricHint: string;
      frequencyHint: string;
      responseHint: string;
    };
    huddles: string;
    followUps: string;
  };
  extras: string[];
  contextTag: string;
}

const contextByGoal: Record<DecisionAnswers['goal'], string> = {
  A: 'ProblemSolving',
  B: 'ProcessImprovement',
  C: 'Measurement',
  D: 'Prevention',
  E: 'Incident',
};

const incidentMap = {
  sentinel: {
    packageKey: 'Safety',
    extras: ['RCA2'],
    contextTag: 'Incident:Sentinel',
  },
  nearmiss: {
    packageKey: 'Safety',
    extras: ['GoodCatch', '5Whys'],
    contextTag: 'Incident:NearMiss',
  },
  recurring: {
    packageKey: 'QuickWin',
    extras: ['ApparentCauseAnalysis', 'PDSA'],
    contextTag: 'Incident:Recurring',
  },
  system: {
    packageKey: 'Safety',
    extras: ['FailureModeAnalysis', 'RecoveryProtocol'],
    contextTag: 'Incident:SystemFailure',
  },
} as const;

const defaultPackageByGoal: Record<Exclude<DecisionAnswers['goal'], 'E'>, string> = {
  A: 'QuickWin',
  B: 'ProcessRedesign',
  C: 'DataDriven',
  D: 'Safety',
};

const advancedFrameworks = ['DMAIC', 'DMADV', 'ProjectCharter', 'StakeholderAnalysis', 'ChangePlan'];

const advancedDataTools = ['Histogram', 'ControlChart', 'Capability', 'Regression', 'DOE'];

const observationFirstTools = ['GembaObservation', 'CheckSheet'];

const simpleTools = ['5Whys', 'CheckSheet', 'VisualMgmt', 'DailyHuddle'];

const deepTools = ['PDSA', 'VSM', 'ControlChart', 'FMEA', 'A3'];

const ensureToolAccess = (toolKeys: string[], filters: DecisionFilters) => {
  if (filters.resourceLevel === '<2h') {
    return toolKeys.filter((key) => SIMPLE_TOOLS.has(key) || simpleTools.includes(key));
  }
  return toolKeys;
};

const enrichWithDataAvailability = (toolKeys: string[], filters: DecisionFilters) => {
  if (filters.dataAvailability === 'none') {
    return [...new Set([...observationFirstTools, ...toolKeys])];
  }
  if (filters.dataAvailability === 'extensive') {
    return [...new Set([...toolKeys, ...advancedDataTools])];
  }
  return toolKeys;
};

const addComplexityFrameworks = (frameworks: string[], filters: DecisionFilters, mode: Mode) => {
  if (filters.complexity === 'high' || mode === 'FACILITATOR') {
    return [...new Set([...frameworks, ...advancedFrameworks])];
  }
  return frameworks;
};

const fetchTools = async (keys: string[]) => {
  const tools = await prisma.tool.findMany({ where: { key: { in: keys } } });
  const order = new Map(keys.map((key, index) => [key, index]));
  return tools.sort((a, b) => (order.get(a.key)! - order.get(b.key)!));
};

const fetchPackageWithTools = async (key: string) => {
  const pkg = await prisma.toolPackage.findUnique({ where: { key } });
  if (!pkg) {
    return undefined;
  }
  const tools = await fetchTools(pkg.toolKeys);
  return { pkg, tools } as const;
};

const fetchRationale = async (toolKey: string, contextTag: string) => {
  const explicit = await prisma.rationale.findFirst({
    where: { toolKey, pathTag: `${toolKey}@${contextTag}` },
  });
  if (explicit) {
    return explicit;
  }
  const generic = await prisma.rationale.findFirst({ where: { toolKey, pathTag: contextTag } });
  if (generic) {
    return generic;
  }
  const fallback = await prisma.rationale.findFirst({ where: { toolKey } });
  return fallback;
};

export const buildRecommendation = async ({ answers, filters, mode }: DecisionRequest): Promise<RecommendationResult> => {
  let packageKey: string | undefined;
  let contextTag = answers.pathTag ?? contextByGoal[answers.goal];
  let extras: string[] = [];

  if (answers.goal === 'E') {
    const incident = answers.incidentType ?? 'sentinel';
    const mapEntry = incidentMap[incident];
    packageKey = mapEntry.packageKey;
    extras = mapEntry.extras.slice();
    contextTag = mapEntry.contextTag;
  } else {
    packageKey = defaultPackageByGoal[answers.goal];
  }

  const pkgResult = packageKey ? await fetchPackageWithTools(packageKey) : undefined;
  let toolKeys = pkgResult ? pkgResult.pkg.toolKeys.slice() : [];

  toolKeys = enrichWithDataAvailability(toolKeys, filters);
  toolKeys = ensureToolAccess(toolKeys, filters);

  if (filters.resourceLevel === '>2h' && pkgResult) {
    toolKeys = [...new Set([...toolKeys, ...pkgResult.pkg.toolKeys.filter((key) => deepTools.includes(key))])];
  }

  if (extras.length) {
    toolKeys = [...new Set([...toolKeys, ...extras])];
  }

  const tools = await fetchTools(toolKeys.length ? toolKeys : extras);

  const frameworks = addComplexityFrameworks([], filters, mode);

  const toolDetails = await Promise.all(
    tools.map(async (tool) => {
      const rationale = await fetchRationale(tool.key, contextTag);
      return {
        tool,
        rationale: {
          plain: rationale?.textPlain ?? 'Apply this tool to progress the improvement effort.',
          technical: rationale?.textTech ?? 'Supports the defined improvement pathway.',
        },
      };
    })
  );

  const sustainmentPrompts = {
    controlPlan: {
      ownerHint: 'Assign an accountable owner with authority to act on signals.',
      metricHint: 'Pair leading and lagging indicators tied to the recommendation.',
      frequencyHint: 'Define check cadence (daily/weekly) aligned with process velocity.',
      responseHint: 'Document response playbook for out-of-control signals.',
    },
    huddles: 'Add the topic to your daily huddle with a 2-minute review of metric status.',
    followUps: 'Schedule 30/60/90-day check-ins to validate sustainment and spread.',
  };

  const packagePayload = pkgResult
    ? {
        key: pkgResult.pkg.key,
        name: pkgResult.pkg.name,
        description: pkgResult.pkg.description,
        whenBest: pkgResult.pkg.whenBest,
        pitfalls: pkgResult.pkg.pitfalls,
        tools: await fetchTools(pkgResult.pkg.toolKeys),
      }
    : undefined;

  return {
    package: packagePayload,
    tools: toolDetails,
    frameworks,
    sustainmentPrompts,
    extras,
    contextTag,
  };
};
