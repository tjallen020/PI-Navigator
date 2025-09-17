import { dataService } from './dataService';
import { DecisionNode, RecommendationResult, Tool, ToolPackage } from '../types';
import { TOOL_LABEL_MAP } from '../data/plainTechnicalMap';

type ResourceLevel = '<2h' | '>2h';

interface AdvancedFilters {
  resourceLevel: ResourceLevel;
  complexity: 'low' | 'high';
  dataAvailability: 'none' | 'some' | 'extensive';
  pathTag?: string;
  mode: 'fast' | 'guided' | 'facilitator';
  plainLanguage: boolean;
}

const SIMPLE_TOOLS = ['5Whys', 'CheckSheet', 'VisualMgmt', 'DailyHuddle', 'GoodCatch'];
const ADVANCED_TOOLS = ['PDSA', 'VSM', 'SPC', 'FMEA', 'DMAIC', 'DMADV', 'Capability', 'DOE', 'Regression'];

const BASE_SUSTAINMENT = {
  controlPlan: {
    prompt: 'Create a control plan with owner, metric, review frequency, and response steps.',
    checklist: [
      'Name the process owner',
      'Define success metric and signal limits',
      'Schedule review cadence',
      'Outline response when metrics drift'
    ]
  },
  huddle: {
    prompt: 'Discuss progress during daily/weekly huddles.',
    cadence: 'Embed into existing safety/operations huddle agenda.'
  },
  followUps: ['30-day sustainment check', '60-day performance review', '90-day spread conversation']
};

function applyPlainLanguage(tool: Tool, plain: boolean): Tool {
  if (!plain) return tool;
  const mapping = TOOL_LABEL_MAP[tool.key];
  return mapping
    ? {
        ...tool,
        nameTech: mapping.technical,
        namePlain: mapping.plain
      }
    : tool;
}

function filterByResources(tools: Tool[], level: ResourceLevel, mode: 'fast' | 'guided' | 'facilitator'): Tool[] {
  if (level === '>2h') return tools;
  const whitelist = new Set([...SIMPLE_TOOLS, ...(mode === 'facilitator' ? ADVANCED_TOOLS : [])]);
  return tools.filter((tool) => whitelist.has(tool.key) || tool.estTime === '<2h');
}

function extendForComplexity(tools: Tool[], filters: AdvancedFilters): Tool[] {
  const { complexity, mode } = filters;
  const additions = new Set<string>();
  if (complexity === 'high') {
    additions.add('DMAIC');
    additions.add('ProjectCharter');
    additions.add('StakeholderAnalysis');
    additions.add('ChangePlan');
    if (mode === 'facilitator') {
      additions.add('DMADV');
    }
  }
  if (filters.dataAvailability === 'extensive') {
    additions.add('Capability');
    additions.add('DOE');
    additions.add('Regression');
    additions.add('ControlChart');
  } else if (filters.dataAvailability === 'some') {
    additions.add('RunChart');
  } else if (filters.dataAvailability === 'none') {
    additions.add('GembaObservation');
    additions.add('CheckSheet');
  }
  const dataTools = additions
    .map((key) => dataService.getToolByKey(key))
    .filter((tool): tool is Tool => Boolean(tool));
  return [...tools, ...dataTools];
}

function getRationaleTexts(toolKeys: string[], pathTag: string | undefined, plainLanguage: boolean) {
  return toolKeys
    .map((toolKey) => {
      const matches = dataService.getRationales(toolKey, pathTag);
      if (matches.length === 0) return undefined;
      return matches.map((match) => ({
        toolKey,
        pathTag: match.pathTag,
        text: plainLanguage ? match.textPlain : match.textTech
      }));
    })
    .flat()
    .filter((value): value is { toolKey: string; pathTag: string; text: string } => Boolean(value));
}

export function buildRecommendationFromNode(node: DecisionNode, optionValue: string, filters: AdvancedFilters): RecommendationResult {
  const option = node.options.find((opt) => opt.value === optionValue);
  if (!option || !option.recommend) {
    throw new Error('No recommendation found for selection');
  }

  const recommendedTools: Tool[] = [];
  let recommendedPackage: ToolPackage | undefined;
  if (option.recommend.package) {
    recommendedPackage = dataService.getPackageByKey(option.recommend.package);
    if (recommendedPackage) {
      for (const key of recommendedPackage.toolKeys) {
        const tool = dataService.getToolByKey(key);
        if (tool) {
          recommendedTools.push(tool);
        }
      }
    }
  }
  if (option.recommend.tools) {
    option.recommend.tools.forEach((key) => {
      const tool = dataService.getToolByKey(key);
      if (tool) {
        recommendedTools.push(tool);
      }
    });
  }

  const uniqueToolsMap = new Map<string, Tool>();
  recommendedTools.forEach((tool) => {
    const labelAdjusted = applyPlainLanguage(tool, filters.plainLanguage);
    uniqueToolsMap.set(tool.key, labelAdjusted);
  });

  let finalTools = filterByResources(Array.from(uniqueToolsMap.values()), filters.resourceLevel, filters.mode);
  finalTools = extendForComplexity(finalTools, filters);

  const rationales = getRationaleTexts(
    finalTools.map((tool) => tool.key),
    option.recommend.package ? node.pathTag : filters.pathTag,
    filters.plainLanguage
  );

  return {
    tools: finalTools,
    package: recommendedPackage,
    extras: option.recommend.extras,
    rationales,
    sustainment: BASE_SUSTAINMENT
  };
}
