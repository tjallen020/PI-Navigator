export type Role = 'FRONTLINE' | 'MANAGER' | 'FACILITATOR' | 'ADMIN';

export interface Tool {
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

export interface ToolPackage {
  key: string;
  name: string;
  description: string;
  whenBest: string;
  pitfalls: string[];
  toolKeys: string[];
  nextPackageIds: string[];
  extras?: Record<string, unknown>;
}

export interface DecisionOption {
  label: string;
  value: string;
  next?: string;
  recommend?: {
    package?: string;
    tools?: string[];
    extras?: string[];
  };
}

export interface DecisionNode {
  key: string;
  question: string;
  pathTag: string;
  options: DecisionOption[];
}

export interface RationaleText {
  toolKey: string;
  pathTag: string;
  textPlain: string;
  textTech: string;
}

export interface SustainmentNudge {
  controlPlan: {
    prompt: string;
    checklist: string[];
  };
  huddle: {
    prompt: string;
    cadence: string;
  };
  followUps: string[];
}

export interface RecommendationResult {
  tools: Tool[];
  package?: ToolPackage;
  extras?: string[];
  rationales: Array<{ toolKey: string; pathTag: string; text: string }>;
  sustainment: SustainmentNudge;
}

export interface SessionPayload {
  answersJSON: Record<string, unknown>;
  selectedMode: string;
  recommendedToolsJSON: RecommendationResult;
  sustainmentPlanJSON: SustainmentNudge;
  metrics?: Array<{ name: string; type: string; unit: string; baseline?: string; target?: string }>;
  controlPlan?: {
    owner: string;
    frequency: string;
    kpis: string[];
    responsePlan: string;
  };
}

export interface FeedbackPayload {
  sessionId: string;
  effectiveness1to5: number;
  timeValueNote?: string;
  recommendYN: boolean;
  notes?: string;
}

export interface ModeConfig {
  key: 'fast' | 'guided' | 'facilitator';
  label: string;
  description: string;
  maxInteractions?: number;
}
