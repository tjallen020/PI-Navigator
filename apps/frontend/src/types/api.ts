export type Role = 'FRONTLINE' | 'MANAGER' | 'FACILITATOR' | 'ADMIN';

export type Mode = 'FAST_TRACK' | 'GUIDED' | 'FACILITATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  unit?: string | null;
  preferences?: {
    plainLanguage?: boolean;
  };
}

export interface Tool {
  id: string;
  key: string;
  namePlain: string;
  nameTech: string;
  description: string;
  category: string;
  difficulty: string;
  estTime: string;
  pitfalls: string[];
  nextToolKeys: string[];
  templates: string[];
}

export interface RecommendationTool {
  tool: Tool;
  rationale: {
    plain: string;
    technical: string;
  };
}

export interface RecommendationPackage {
  key: string;
  name: string;
  description: string;
  whenBest: string;
  pitfalls: string[];
  tools: Tool[];
}

export interface RecommendationResponse {
  package?: RecommendationPackage;
  tools: RecommendationTool[];
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

export interface SessionResponse {
  session: {
    id: string;
    selectedMode: Mode;
    sustainmentPlanJSON: unknown;
    answersJSON: unknown;
  };
  recommendation: RecommendationResponse;
  prompts: RecommendationResponse['sustainmentPrompts'];
}

export interface DecisionNode {
  key: string;
  question: string;
  options: Array<{
    label: string;
    value: string;
    next?: string;
    recommend?: unknown;
    pathTag?: string;
  }>;
  pathTag?: string | null;
}

export interface MetricPayload {
  name: string;
  type: 'process' | 'outcome' | 'balancing';
  unit: string;
  baseline: string;
  target: string;
}

export interface SustainmentPlanPayload {
  owner: string;
  frequency: string;
  kpis: string[];
  responsePlan: string;
}
