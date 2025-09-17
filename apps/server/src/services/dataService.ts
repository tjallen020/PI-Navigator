import tools from '../data/tools.json';
import packages from '../data/toolPackages.json';
import nodes from '../data/decisionNodes.json';
import rationales from '../data/rationales.json';
import { Tool, ToolPackage, DecisionNode, RationaleText } from '../types';

export class DataService {
  private static instance: DataService;

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private tools: Tool[] = tools;
  private packages: ToolPackage[] = packages as ToolPackage[];
  private nodes: DecisionNode[] = nodes as DecisionNode[];
  private rationales: RationaleText[] = rationales as RationaleText[];

  getTools(): Tool[] {
    return this.tools;
  }

  getToolByKey(key: string): Tool | undefined {
    return this.tools.find((tool) => tool.key === key);
  }

  getPackages(): ToolPackage[] {
    return this.packages;
  }

  getPackageByKey(key: string): ToolPackage | undefined {
    return this.packages.find((pkg) => pkg.key === key);
  }

  getDecisionNodeByKey(key: string): DecisionNode | undefined {
    return this.nodes.find((node) => node.key === key);
  }

  getRationales(toolKey: string, pathTag?: string): RationaleText[] {
    return this.rationales.filter((r) => r.toolKey === toolKey && (!pathTag || r.pathTag === pathTag));
  }

  getAllRationales(): RationaleText[] {
    return this.rationales;
  }
}

export const dataService = DataService.getInstance();
