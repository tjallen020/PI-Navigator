export type ToolLabelMode = 'plain' | 'technical';

export const TOOL_LABEL_MAP: Record<string, { plain: string; technical: string }> = {
  DMAIC: {
    plain: 'Structured Problem-Solving Roadmap',
    technical: 'DMAIC'
  },
  DMADV: {
    plain: 'Design for Six Sigma Roadmap',
    technical: 'DMADV'
  },
  DOE: {
    plain: 'Test Multiple Changes at Once',
    technical: 'Design of Experiments'
  },
  SPC: {
    plain: 'Variation Tracking Chart',
    technical: 'Statistical Process Control'
  },
  FMEA: {
    plain: 'Failure Prevention Worksheet',
    technical: 'FMEA'
  },
  CpCpk: {
    plain: 'Process Capability Check',
    technical: 'Cp/Cpk'
  }
};
