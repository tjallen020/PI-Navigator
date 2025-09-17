import { randomUUID } from 'node:crypto';

type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};

export type Role = 'FRONTLINE' | 'MANAGER' | 'FACILITATOR' | 'ADMIN';
export type Mode = 'FAST_TRACK' | 'GUIDED' | 'FACILITATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  unit?: string | null;
  preferences?: Record<string, unknown> | null;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  answersJSON: unknown;
  selectedMode: Mode;
  recommendedToolsJSON: unknown;
  sustainmentPlanJSON: unknown;
  createdAt: Date;
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

export interface ToolPackage {
  id: string;
  key: string;
  name: string;
  toolKeys: string[];
  description: string;
  whenBest: string;
  pitfalls: string[];
  nextPackageKeys: string[];
}

export interface DecisionNode {
  id: string;
  key: string;
  question: string;
  options: Array<Record<string, unknown>>;
  nextNodeKeys: string[];
  pathTag?: string | null;
}

export interface Rationale {
  id: string;
  toolKey: string;
  pathTag: string;
  textPlain: string;
  textTech: string;
}

export interface Feedback {
  id: string;
  sessionId: string;
  effectiveness: number;
  timeValueNote: string;
  recommendYN: boolean;
  notes?: string | null;
  createdAt: Date;
}

export interface Metric {
  id: string;
  sessionId: string;
  name: string;
  type: 'process' | 'outcome' | 'balancing';
  unit: string;
  baseline: string;
  target: string;
}

export interface ControlPlan {
  id: string;
  sessionId: string;
  owner: string;
  frequency: string;
  kpis: string[];
  responsePlan: string;
}

export interface Audit {
  id: string;
  controlPlanId: string;
  date: Date;
  result: string;
  notes?: string | null;
}

interface QueryArgs<T> {
  where?: Partial<Record<keyof T, unknown>> & { key?: { in: string[] } };
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: Record<string, boolean>;
  select?: Record<string, boolean>;
}

type CreateArgs<T> = { data: Omit<T, 'id' | 'createdAt'> & Partial<Pick<T, 'id' | 'createdAt'>> };
type UpdateArgs<T> = { where: { id: string }; data: DeepPartial<T> };

type CreateManyArgs<T> = { data: Array<Omit<T, 'id' | 'createdAt'> & Partial<Pick<T, 'id' | 'createdAt'>>> };
type DeleteManyArgs<T> = { where?: Partial<T> };

type GroupByArgs<T> = { by: Array<keyof T>; _count?: { _all: true } };

type AggregateArgs<T> = { _avg?: Partial<Record<keyof T, boolean>>; _count?: { _all: true } };

type UpsertArgs<T> = { where: { [K in keyof T]?: T[K] };
  create: Omit<T, 'id' | 'createdAt'>;
  update: DeepPartial<T>;
};

class Table<T extends { id: string }> {
  constructor(private rows: T[], private readonly defaults?: () => Partial<T>) {}

  findMany(args: QueryArgs<T> = {}): T[] {
    let result = [...this.rows];
    if (args.where) {
      result = result.filter((row) => matchesWhere(row, args.where as Record<string, unknown>));
    }
    if (args.orderBy) {
      const [[field, dir]] = Object.entries(args.orderBy);
      result.sort((a, b) => {
        const av = (a as Record<string, unknown>)[field];
        const bv = (b as Record<string, unknown>)[field];
        if (av === bv) return 0;
        if (av === undefined) return 1;
        if (bv === undefined) return -1;
        if (typeof av === 'string' && typeof bv === 'string') {
          return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        const aNum = Number(av);
        const bNum = Number(bv);
        if (aNum === bNum) return 0;
        return dir === 'asc' ? (aNum > bNum ? 1 : -1) : (aNum < bNum ? 1 : -1);
      });
    }
    if (args.select) {
      return result.map((row) => pick(row, args.select!));
    }
    return result.map((row) => structuredClone(row));
  }

  findUnique(args: { where: Partial<T> }): T | null {
    const entry = this.rows.find((row) => matchesWhere(row, args.where as Record<string, unknown>));
    return entry ? structuredClone(entry) : null;
  }

  findFirst(args: { where?: Partial<T> }): T | null {
    if (!args.where) {
      return this.rows.length ? structuredClone(this.rows[0]) : null;
    }
    const entry = this.rows.find((row) => matchesWhere(row, args.where as Record<string, unknown>));
    return entry ? structuredClone(entry) : null;
  }

  create(args: CreateArgs<T>): T {
    const base = { ...(this.defaults?.() ?? {}), ...args.data } as T;
    const row: T = { ...base, id: base.id ?? randomUUID() };
    if ('createdAt' in row && !row.createdAt) {
      (row as unknown as { createdAt: Date }).createdAt = new Date();
    }
    this.rows.push(row);
    return structuredClone(row);
  }

  createMany(args: CreateManyArgs<T>): { count: number } {
    args.data.forEach((item) => {
      this.create({ data: item });
    });
    return { count: args.data.length };
  }

  update(args: UpdateArgs<T>): T {
    const index = this.rows.findIndex((row) => row.id === args.where.id);
    if (index === -1) {
      throw new Error('Record not found');
    }
    const current = this.rows[index];
    const updated = deepMerge(current, args.data);
    this.rows[index] = updated;
    return structuredClone(updated);
  }

  deleteMany(args: DeleteManyArgs<T>): { count: number } {
    const before = this.rows.length;
    if (!args.where || Object.keys(args.where).length === 0) {
      this.rows.length = 0;
      return { count: before };
    }
    this.rows = this.rows.filter((row) => !matchesWhere(row, args.where as Record<string, unknown>));
    return { count: before - this.rows.length };
  }

  upsert(args: UpsertArgs<T>): T {
    const existingIndex = this.rows.findIndex((row) => matchesWhere(row, args.where as Record<string, unknown>));
    if (existingIndex === -1) {
      return this.create({ data: args.create });
    }
    const updated = deepMerge(this.rows[existingIndex], args.update);
    this.rows[existingIndex] = updated;
    return structuredClone(updated);
  }

  groupBy(args: GroupByArgs<T>): Array<Record<string, unknown>> {
    const groups = new Map<string, { keys: Record<string, unknown>; count: number }>();
    for (const row of this.rows) {
      const keyObject: Record<string, unknown> = {};
      args.by.forEach((field) => {
        keyObject[field as string] = (row as Record<string, unknown>)[field as string];
      });
      const key = JSON.stringify(keyObject);
      const record = groups.get(key) ?? { keys: keyObject, count: 0 };
      record.count += 1;
      groups.set(key, record);
    }
    return Array.from(groups.values()).map((entry) => ({ ...entry.keys, _count: { _all: entry.count } }));
  }

  aggregate(args: AggregateArgs<T>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (args._avg) {
      const targets = Object.keys(args._avg).filter((key) => args._avg?.[key as keyof T]);
      const averages: Record<string, number | null> = {};
      for (const key of targets) {
        const values = this.rows.map((row) => (row as Record<string, unknown>)[key]).filter((v) => typeof v === 'number') as number[];
        averages[key] = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
      }
      result._avg = averages;
    }
    if (args._count?._all) {
      result._count = { _all: this.rows.length };
    }
    return result;
  }
}

const matchesWhere = (row: Record<string, unknown>, where: Record<string, unknown>): boolean => {
  return Object.entries(where).every(([key, value]) => {
    if (value && typeof value === 'object' && 'in' in (value as Record<string, unknown>)) {
      const list = (value as { in: unknown[] }).in;
      return list.includes(row[key] as unknown);
    }
    return row[key] === value;
  });
};

const deepMerge = <T>(target: T, source: DeepPartial<T>): T => {
  const result = { ...(target as Record<string, unknown>) };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge(result[key] ?? {}, value as Record<string, unknown>);
    } else {
      result[key] = value as unknown;
    }
  }
  return result as T;
};

const pick = <T>(row: T, select: Record<string, boolean>): T => {
  const result: Record<string, unknown> = {};
  for (const [key, enabled] of Object.entries(select)) {
    if (enabled) {
      result[key] = (row as Record<string, unknown>)[key];
    }
  }
  return result as T;
};

export class PrismaClient {
  private readonly data = {
    user: new Table<User>([]),
    session: new Table<Session>([], () => ({ createdAt: new Date() })),
    tool: new Table<Tool>([]),
    toolPackage: new Table<ToolPackage>([]),
    decisionNode: new Table<DecisionNode>([]),
    rationale: new Table<Rationale>([]),
    feedback: new Table<Feedback>([], () => ({ createdAt: new Date() })),
    metric: new Table<Metric>([]),
    controlPlan: new Table<ControlPlan>([]),
    audit: new Table<Audit>([]),
  } as const;

  user = {
    findUnique: (args: { where: Partial<User> }) => this.data.user.findUnique(args),
    create: (args: CreateArgs<User>) => this.data.user.create(args),
    update: (args: UpdateArgs<User>) => this.data.user.update(args),
  };

  session = {
    create: (args: CreateArgs<Session>) => this.data.session.create(args),
    update: (args: UpdateArgs<Session>) => this.data.session.update(args),
    findUnique: (args: { where: { id: string }; include?: { metrics?: boolean; controlPlans?: boolean } }) => {
      const base = this.data.session.findUnique(args) as Session | null;
      if (!base) return null;
      const result: Record<string, unknown> = { ...base };
      if (args.include?.metrics) {
        result.metrics = this.data.metric.findMany({ where: { sessionId: base.id } });
      }
      if (args.include?.controlPlans) {
        result.controlPlans = this.data.controlPlan.findMany({ where: { sessionId: base.id } });
      }
      return result;
    },
    findMany: (args?: QueryArgs<Session>) => this.data.session.findMany(args),
    groupBy: (args: GroupByArgs<Session>) => this.data.session.groupBy(args),
  };

  tool = {
    findMany: (args?: QueryArgs<Tool>) => this.data.tool.findMany(args),
    create: (args: CreateArgs<Tool>) => this.data.tool.create(args),
    deleteMany: (args?: DeleteManyArgs<Tool>) => this.data.tool.deleteMany(args ?? {}),
  };

  toolPackage = {
    findMany: (args?: QueryArgs<ToolPackage>) => this.data.toolPackage.findMany(args),
    findUnique: (args: { where: Partial<ToolPackage> }) => this.data.toolPackage.findUnique(args),
    create: (args: CreateArgs<ToolPackage>) => this.data.toolPackage.create(args),
    deleteMany: (args?: DeleteManyArgs<ToolPackage>) => this.data.toolPackage.deleteMany(args ?? {}),
  };

  decisionNode = {
    findUnique: (args: { where: Partial<DecisionNode> }) => this.data.decisionNode.findUnique(args),
    create: (args: CreateArgs<DecisionNode>) => this.data.decisionNode.create(args),
    deleteMany: (args?: DeleteManyArgs<DecisionNode>) => this.data.decisionNode.deleteMany(args ?? {}),
  };

  rationale = {
    findFirst: (args: { where?: Partial<Rationale> }) => this.data.rationale.findFirst(args),
    create: (args: CreateArgs<Rationale>) => this.data.rationale.create(args),
    deleteMany: (args?: DeleteManyArgs<Rationale>) => this.data.rationale.deleteMany(args ?? {}),
  };

  feedback = {
    upsert: (args: UpsertArgs<Feedback>) => this.data.feedback.upsert(args),
    aggregate: (args: AggregateArgs<Feedback>) => this.data.feedback.aggregate(args),
  };

  metric = {
    deleteMany: (args: DeleteManyArgs<Metric>) => this.data.metric.deleteMany(args),
    createMany: (args: CreateManyArgs<Metric>) => this.data.metric.createMany(args),
    findMany: (args?: QueryArgs<Metric>) => this.data.metric.findMany(args),
  };

  controlPlan = {
    create: (args: CreateArgs<ControlPlan>) => this.data.controlPlan.create(args),
    deleteMany: (args: DeleteManyArgs<ControlPlan>) => this.data.controlPlan.deleteMany(args),
  };

  audit = {
    create: (args: CreateArgs<Audit>) => this.data.audit.create(args),
  };

  $disconnect = async () => Promise.resolve();
}

export default PrismaClient;
