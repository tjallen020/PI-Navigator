export type NodeTag = 'green' | 'purple' | 'orange' | 'blue' | 'red';

export interface NodeOption {
  label: string;
  description?: string;
  next: string;
  tag?: NodeTag;
}

export type NodeType = 'start' | 'process' | 'decision' | 'data' | 'terminator' | 'info';

export interface TreeNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  notes?: string[];
  tag?: NodeTag;
  options?: NodeOption[];
  next?: string;
  artifacts?: string[];
  endState?: string;
}

export interface A3DecisionOption {
  label: string;
  result: string;
  nextId?: string;
  action?: 'risk';
}

export interface A3Decision {
  id: string;
  prompt: string;
  options: A3DecisionOption[];
  dependsOn?: string;
}

export interface A3Box {
  id: string;
  title: string;
  description: string;
  tools: string[];
  useWhen: string[];
  outputs: string[];
  notes?: string[];
  decisions?: A3Decision[];
}

export const decisionTree: Record<string, TreeNode> = {
  start: {
    id: 'start',
    type: 'start',
    title: 'Pain point or improvement opportunity identified by frontline staff',
    description:
      'Someone on the team notices a defect, frustration, or opportunity to improve. Capture it before the details fade.',
    notes: ['Use quick notes, a huddle board, or your intake form to gather the basics while context is fresh.'],
    next: 'capture-intake'
  },
  'capture-intake': {
    id: 'capture-intake',
    type: 'process',
    title: 'Capture a brief description and where/when it was observed',
    description:
      'Clarify who raised the issue, what was observed, when it happened, and any suspected impact. Photos or screenshots help anchor the conversation.',
    next: 'intake-card'
  },
  'intake-card': {
    id: 'intake-card',
    type: 'data',
    title: 'Quick Intake Card',
    description: 'Log the intake details so you can reference them as you triage.',
    artifacts: ['Who/what/where/when summary', 'Suspected impact', 'Supporting photos or screenshots'],
    next: 'safety-screen'
  },
  'safety-screen': {
    id: 'safety-screen',
    type: 'decision',
    title: 'Is there an immediate patient safety or regulatory/compliance risk?',
    notes: [
      'If there is any doubt about harm or regulatory exposure, treat it as a safety concern first. Quality improvement can resume after containment.'
    ],
    options: [
      {
        label: 'Yes – we must make the situation safe now',
        description: 'Trigger emergency containment and involve the supervisor immediately.',
        next: 'immediate-containment',
        tag: 'red'
      },
      {
        label: 'No immediate risk, but there might be a hazard or near miss',
        description: 'Nothing unsafe right now, yet something could go wrong if unaddressed.',
        next: 'hazard-check',
        tag: 'red'
      },
      {
        label: 'No – safety is contained',
        description: 'It is safe to continue with quality improvement triage.',
        next: 'proceed-qi-triage'
      }
    ]
  },
  'immediate-containment': {
    id: 'immediate-containment',
    type: 'process',
    title: 'Apply immediate containment and notify the supervisor',
    description:
      'Stabilize the situation, remove unsafe equipment or products, and ensure patients and staff are protected before proceeding.',
    tag: 'red',
    next: 'sentinel-check'
  },
  'sentinel-check': {
    id: 'sentinel-check',
    type: 'decision',
    title:
      'Was there actual harm, a sentinel event, or a serious safety event such as wrong-site surgery, retained objects, or severe medication error?',
    tag: 'red',
    options: [
      {
        label: 'Yes – this meets sentinel / serious safety criteria',
        description: 'Pause improvement work and follow the organization’s sentinel event policy.',
        next: 'stop-qi-path',
        tag: 'red'
      },
      {
        label: 'No harm, but a hazard or near miss was discovered',
        description: 'Route to proactive risk assessment so the hazard can be mitigated.',
        next: 'hazard-routing',
        tag: 'red'
      },
      {
        label: 'No – the risk is contained',
        description: 'Proceed to quality improvement triage.',
        next: 'proceed-qi-triage'
      }
    ]
  },
  'stop-qi-path': {
    id: 'stop-qi-path',
    type: 'process',
    title: 'Stop the QI path and notify Risk Management & Patient Safety',
    description:
      'Preserve evidence, log the event in the safety system, and align with the Risk Management team.',
    tag: 'red',
    next: 'launch-rca'
  },
  'launch-rca': {
    id: 'launch-rca',
    type: 'process',
    title: 'Launch RCA² within the required timeframe',
    description: 'Coordinate with the safety office to scope the review, assign roles, and schedule learning team work.',
    tag: 'red',
    next: 'rca-artifact'
  },
  'rca-artifact': {
    id: 'rca-artifact',
    type: 'data',
    title: 'RCA Charter and Team Roster',
    artifacts: ['RCA charter', 'Timeline & deliverables', 'Assigned facilitator and team members'],
    tag: 'red',
    next: 'end-rca'
  },
  'end-rca': {
    id: 'end-rca',
    type: 'terminator',
    title: 'Handled via Risk Management / RCA',
    description: 'Risk Management owns the investigation. Quality improvement can support countermeasures after root causes are confirmed.',
    endState: 'RCA² pathway engaged'
  },
  'hazard-check': {
    id: 'hazard-check',
    type: 'decision',
    title: 'Is this a hazard, near miss, or emerging process risk without harm?',
    tag: 'red',
    options: [
      {
        label: 'Yes – we need proactive risk assessment',
        description: 'Engage Risk / Patient Safety for FMEA or hFMEA support.',
        next: 'hazard-routing',
        tag: 'red'
      },
      {
        label: 'No – proceed with quality improvement triage',
        next: 'proceed-qi-triage'
      }
    ]
  },
  'hazard-routing': {
    id: 'hazard-routing',
    type: 'process',
    title: 'Route to proactive risk assessment with Risk / Patient Safety',
    description: 'Plan an FMEA or hFMEA to address the hazard. Quality improvement can support implementing actions later.',
    tag: 'red',
    next: 'fmea-artifact'
  },
  'fmea-artifact': {
    id: 'fmea-artifact',
    type: 'data',
    title: 'FMEA Worksheet',
    artifacts: ['Failure modes, effects, and controls', 'Risk priority scoring', 'Mitigation ownership'],
    tag: 'red',
    next: 'end-fmea'
  },
  'end-fmea': {
    id: 'end-fmea',
    type: 'terminator',
    title: 'Handled via proactive risk assessment',
    description: 'Risk and Patient Safety lead the risk analysis. Quality teams can partner on action implementation once hazards are prioritized.',
    endState: 'FMEA / hFMEA in progress'
  },
  'proceed-qi-triage': {
    id: 'proceed-qi-triage',
    type: 'process',
    title: 'Proceed to quality improvement triage',
    description: 'Safety is contained. Determine the right level of improvement effort.',
    next: 'solution-known'
  },
  'solution-known': {
    id: 'solution-known',
    type: 'decision',
    title: 'Is the solution known, low risk, within current standard work, and executable by 1–2 people in ≤2 days?',
    options: [
      {
        label: 'Yes – this is a Just-Do-It',
        description: 'Fast change with clear ownership and minimal risk.',
        next: 'jdi-activate',
        tag: 'green'
      },
      {
        label: 'No – more discovery is needed',
        description: 'Move to structured project triage.',
        next: 'hundred-day-check'
      }
    ]
  },
  'jdi-activate': {
    id: 'jdi-activate',
    type: 'process',
    title: 'Run a Just-Do-It with local leader approval',
    description: 'Confirm scope, secure approval, and make the quick change.',
    tag: 'green',
    next: 'jdi-artifact'
  },
  'jdi-artifact': {
    id: 'jdi-artifact',
    type: 'data',
    title: 'JDI Ticket',
    description: 'Document what changed, who owns it, and the effective date.',
    tag: 'green',
    artifacts: ['Change description', 'Owner & effective date', 'Before/after notes'],
    next: 'jdi-validation'
  },
  'jdi-validation': {
    id: 'jdi-validation',
    type: 'process',
    title: 'Run PDSA-Lite validation for 1–2 weeks',
    description: 'Define a before/after measure, capture counts, and confirm the change is working.',
    tag: 'green',
    notes: ['Set a simple data collection sheet or run chart to track two consecutive checks.'],
    next: 'metric-improved'
  },
  'metric-improved': {
    id: 'metric-improved',
    type: 'decision',
    title: 'Did the metric improve and stay stable for two checks?',
    tag: 'green',
    options: [
      {
        label: 'Yes – sustain the change',
        description: 'Lock the improvement into daily management.',
        next: 'standard-work-update',
        tag: 'green'
      },
      {
        label: 'No – escalate to a Kaizen/PDSA project',
        description: 'A quick fix was not enough. Organize a small project.',
        next: 'kaizen-launch',
        tag: 'purple'
      }
    ]
  },
  'standard-work-update': {
    id: 'standard-work-update',
    type: 'process',
    title: 'Update standard work and visual controls',
    description: 'Train the team, refresh visual cues, and log the change in the share-of-practice repository.',
    tag: 'green',
    next: 'standard-work-artifact'
  },
  'standard-work-artifact': {
    id: 'standard-work-artifact',
    type: 'data',
    title: 'Standard Work Revision & Control Plan',
    artifacts: ['Updated standard work', 'Quick control plan', 'Training records'],
    tag: 'green',
    next: 'end-sustain'
  },
  'hundred-day-check': {
    id: 'hundred-day-check',
    type: 'decision',
    title: 'Is this contained to a single area with moderate change, doable in ≤100 days?',
    options: [
      {
        label: 'Yes – run a 100-Day Project',
        description: 'Form a focused team with a time-boxed plan.',
        next: 'hundred-day-structure',
        tag: 'orange'
      },
      {
        label: 'No – does it require cross-functional redesign or facilitation?',
        description: 'Assess whether a larger event is needed.',
        next: 'cross-functional-check'
      }
    ]
  },
  'hundred-day-structure': {
    id: 'hundred-day-structure',
    type: 'process',
    title: 'Stand up the 100-Day Project structure',
    description: 'Form the team, confirm sponsor support, and align on scope and cadence.',
    tag: 'orange',
    next: 'full-charter'
  },
  'cross-functional-check': {
    id: 'cross-functional-check',
    type: 'decision',
    title: 'Is substantial cross-functional redesign or facilitation required?',
    options: [
      {
        label: 'Yes – plan an RPIW / Kaizen Event',
        description: 'Use a facilitated 3–5 day event with pre/post work.',
        next: 'rpiw-event',
        tag: 'blue'
      },
      {
        label: 'No – organize a Kaizen/PDSA series',
        description: 'Iterative experiments can address the opportunity.',
        next: 'kaizen-launch',
        tag: 'purple'
      }
    ]
  },
  'rpiw-event': {
    id: 'rpiw-event',
    type: 'process',
    title: 'Prepare for an RPIW / Kaizen Event',
    description: 'Engage facilitators, sponsors, and stakeholders for the redesign effort.',
    tag: 'blue',
    next: 'full-charter'
  },
  'kaizen-launch': {
    id: 'kaizen-launch',
    type: 'process',
    title: 'Stand up a Kaizen/PDSA team',
    description: 'Confirm sponsor, recruit 3–5 members, and align on aim and cadence.',
    tag: 'purple',
    next: 'mini-charter'
  },
  'mini-charter': {
    id: 'mini-charter',
    type: 'data',
    title: 'Mini Charter',
    description: 'Document the aim, scope, measures, and roles for the Kaizen/PDSA effort.',
    tag: 'purple',
    artifacts: ['Aim statement', 'Scope boundaries', 'Measures & roles'],
    next: 'a3-entry'
  },
  'full-charter': {
    id: 'full-charter',
    type: 'data',
    title: 'Full Charter',
    description: 'Establish the problem, scope, metrics, timeline, and roles for 100-Day and RPIW work.',
    tag: 'orange',
    artifacts: ['Problem statement', 'Scope & metrics', 'Timeline & roles'],
    next: 'prework-plan'
  },
  'prework-plan': {
    id: 'prework-plan',
    type: 'process',
    title: 'Plan pre-work: baseline data, observations, and voice of customer',
    description: 'Gather the inputs that will power the improvement event or project.',
    notes: ['Confirm observation windows', 'Capture voice of customer themes', 'Organize baseline metrics'],
    next: 'a3-entry'
  },
  'a3-entry': {
    id: 'a3-entry',
    type: 'info',
    title: 'A3 (9-Box) flow with tool guidance',
    description:
      'Use the nine boxes to move from background to sustainment. Pick 1–3 tools per box based on the situation. Loop back to the safety screen if new harm or regulatory risk is uncovered.',
    notes: ['Attach artifacts like the A3 one-pager and share-of-practice deck as you progress.'],
    next: 'end-sustain'
  },
  'end-sustain': {
    id: 'end-sustain',
    type: 'terminator',
    title: 'Sustained improvement with controls in place',
    description: 'Standard work, control plans, and knowledge share are complete. Continue daily management to monitor the gain.',
    endState: 'Improvement sustained and shared'
  },
  'close-document': {
    id: 'close-document',
    type: 'terminator',
    title: 'Close with documentation and lessons learned',
    description:
      'If no viable impact or alignment exists, document the rationale, capture lessons, and park the idea for future review.',
    endState: 'Opportunity documented for future'
  }
};

export const a3Boxes: A3Box[] = [
  {
    id: 'background',
    title: 'Box 1 – Background / Business Need',
    description:
      'Ground the team in why this work matters now. Describe the context, urgency, and connection to strategic goals.',
    tools: ['SIPOC', 'Stakeholder Map', 'Voice of Customer scan'],
    useWhen: ['Scope feels unclear', 'Many actors are involved', 'You need a shared big-picture view'],
    outputs: ['Context paragraph', 'Link to organizational goals', 'Why-now statement']
  },
  {
    id: 'problem',
    title: 'Box 2 – Problem Statement (SMART)',
    description:
      'Convert fuzzy aims into a crisp, time-bound, measurable problem statement. Clarify the gap from baseline to target.',
    tools: ['Problem statement template', 'Measure triad (Outcome/Process/Balancing)'],
    useWhen: ['Aim feels vague', 'Teams are misaligned on the gap', 'Leadership needs clarity on success'],
    outputs: ['One-sentence SMART problem', 'Baseline metric', 'Target metric with due date']
  },
  {
    id: 'current',
    title: 'Box 3 – Current Condition',
    description:
      'See the work as it really happens. Map the flow, quantify defects, and highlight pain points.',
    tools: ['Process map (swimlane)', 'Gemba walk / observation', 'Check sheet'],
    useWhen: ['Flow is unknown', 'You need evidence of frequency or defects', 'Stakeholders debate what really happens'],
    outputs: ['As-is map', 'Baseline data / run chart', 'List of key pain points']
  },
  {
    id: 'target',
    title: 'Box 4 – Goal / Target Condition',
    description:
      'Translate the voice of the customer and business need into specific targets and drivers.',
    tools: ['CTQ tree', 'Target diagram', 'Driver diagram'],
    useWhen: ['You need traceability from need to measure', 'Drivers and sub-drivers must be explicit'],
    outputs: ['Target metric(s)', 'Primary & secondary drivers', 'Specifications linked to VOC']
  },
  {
    id: 'root-cause',
    title: 'Box 5 – Root Cause Analysis',
    description:
      'Match the analysis method to the complexity of the issue. Always confirm evidence before acting.',
    tools: ['5 Whys', 'Is/Is Not', 'Ishikawa / Fishbone', 'Stratification / Pareto', 'Run chart'],
    useWhen: ['Root causes are unclear', 'Multiple factors may contribute', 'You need to distinguish common vs special cause'],
    outputs: ['Validated root causes', 'Evidence linked to each cause'],
    notes: ['If harm or serious risk is detected, pause and return to the safety screen to engage Risk Management.'],
    decisions: [
      {
        id: 'simple-vs-complex',
        prompt: 'Do we have a single, simple issue with clear facts?',
        options: [
          {
            label: 'Yes – use a fast, linear analysis',
            result: 'Run 5 Whys and/or an Is/Is Not to clarify boundaries quickly.'
          },
          {
            label: 'No – explore multiple cause categories',
            result: 'Use an Ishikawa (Fishbone) diagram and stratify data with a Pareto chart to focus on the biggest contributors.',
            nextId: 'multi-cause'
          },
          {
            label: 'Harm or sentinel elements surfaced',
            result: 'Escalate to Risk Management and launch RCA².',
            action: 'risk'
          }
        ]
      },
      {
        id: 'multi-cause',
        dependsOn: 'simple-vs-complex',
        prompt: 'Are multiple categories of causes plausible (People, Process, Place, Equipment, Policy, Environment)?',
        options: [
          {
            label: 'Yes – map causes by category',
            result: 'Ishikawa + Pareto: brainstorm broadly, then use data to prioritize the tall bars.'
          },
          {
            label: 'No – focus on confirming the suspected pathway',
            result: 'Pair 5 Whys with an evidence board to tie each why to observation or data.'
          }
        ]
      }
    ]
  },
  {
    id: 'countermeasures',
    title: 'Box 6 – Countermeasures (Match to Cause)',
    description:
      'Select countermeasures that directly address the validated root causes. Distinguish between local and systemic changes.',
    tools: ['Standard work', 'Visual controls', 'Job aids', 'Error proofing (Poka-Yoke)', 'Workflow redesign', 'EHR build request'],
    useWhen: ['You are ready to design solutions', 'Ownership and scope need clarity'],
    outputs: ['Countermeasure list tied to causes', 'Implementation approach (local vs systemic)'],
    notes: [
      'Match the tool to the type of variation or defect uncovered.',
      'Variation → standard work + training + visuals',
      'Complex steps → simplify/remove steps, layout change, checklists',
      'Handoff defects → standardize handoff + checklist + read-back',
      'Workload/queuing → apply Little’s Law, load-leveling, scheduling templates'
    ],
    decisions: [
      {
        id: 'local-vs-systemic',
        prompt: 'Do countermeasures require policy/IT/space changes or are they local?',
        options: [
          {
            label: 'Local – owned by the immediate team',
            result: 'Use standard work, visual controls, job aids, or error proofing.'
          },
          {
            label: 'Systemic – needs policy/IT/space changes',
            result: 'Plan RPIW/RIE work, workflow redesign, or EHR build requests to address system barriers.'
          }
        ]
      }
    ]
  },
  {
    id: 'plan',
    title: 'Box 7 – Plan (PDSA / Implementation)',
    description:
      'Translate countermeasures into an executable plan. Size the effort and define how learning will occur.',
    tools: ['PDSA cycles', 'Gantt / 100-Day plan', 'RAPID / RACI', 'Communication plan'],
    useWhen: ['You have countermeasures ready to test', 'Coordination and communication need visibility'],
    outputs: ['Action table with owners and due dates', 'Test scope and data collection plan'],
    decisions: [
      {
        id: 'pdsalight-vs-full',
        prompt: 'How much time and resource is required for the next test?',
        options: [
          {
            label: '< 2 hours – quick check',
            result: 'Run a PDSA-Lite with a small sample (1–2 shifts) and fast feedback.'
          },
          {
            label: '> 2 hours – deeper learning',
            result: 'Run a full PDSA with a data plan, or align to the 100-Day / RPIW cadence.'
          }
        ]
      }
    ]
  },
  {
    id: 'results',
    title: 'Box 8 – Results / Validation',
    description:
      'Check impact and stability. Use statistical rules to confirm the change is delivering sustained benefit.',
    tools: ['Run chart', 'Control chart', 'Before/after Pareto', 'Effect size calculations', 'Cost/time impact estimate'],
    useWhen: ['You need to confirm the change worked', 'Leadership needs evidence of improvement'],
    outputs: ['Updated charts', 'Effect size summary', 'Decision on sustain vs adjust'],
    notes: ['Target met and stable → advance to sustainment. Otherwise, learn and loop back to Box 5 or 6.'],
    decisions: [
      {
        id: 'target-met',
        prompt: 'Did the metric meet the target and stay stable (SPC rules met)?',
        options: [
          {
            label: 'Yes – move to sustainment',
            result: 'Advance to Box 9 to lock in controls.'
          },
          {
            label: 'No – adjust and iterate',
            result: 'Loop back to Box 5 (root cause) or Box 6 (countermeasures) to refine.'
          }
        ]
      }
    ]
  },
  {
    id: 'sustain',
    title: 'Box 9 – Follow-up / Sustain',
    description:
      'Ensure the gains stick. Embed control plans, leader standard work, and knowledge sharing.',
    tools: [
      'Control plan',
      'Leader standard work',
      'Huddle checklists',
      'Audit checklists',
      'Training/onboarding updates',
      'Visual metrics board'
    ],
    useWhen: ['Controls are needed to maintain the gain', 'You are ready to hand off to daily management'],
    outputs: ['Control plan with who/what/when', 'Share-of-practice assets (A3 one-pager, short deck)'],
    notes: ['If controls slip during 30–90 day checks, escalate and refresh Boxes 5–7.'],
    decisions: [
      {
        id: 'controls-working',
        prompt: 'Are controls working for 30–90 days?',
        options: [
          {
            label: 'Yes – lock it in',
            result: 'Update policy, competencies, and EHR guardrails as needed.'
          },
          {
            label: 'No – escalate and refresh',
            result: 'Loop back to Boxes 5–7 with leadership support.'
          }
        ]
      }
    ]
  }
];

export const projectTypeSummary = [
  {
    label: 'Just-Do-It (Green)',
    description: 'Known solution, low risk, ≤2 days, 1–2 people. Includes mandatory validation and sustainment check.',
    tag: 'green' as const
  },
  {
    label: 'Kaizen / PDSA (Purple)',
    description: 'Unknown solution, local scope, minimal cross-team coordination. Works through iterative tests.',
    tag: 'purple' as const
  },
  {
    label: '100-Day Project (Orange)',
    description: 'Single area, moderate change, broader stakeholder group. Time-boxed to roughly 100 days.',
    tag: 'orange' as const
  },
  {
    label: 'RPIW / Kaizen Event (Blue)',
    description: 'Multi-department redesign with facilitation, pre/post work, and an intensive event.',
    tag: 'blue' as const
  },
  {
    label: 'RCA² (Red)',
    description: 'Activated when harm or a serious safety event occurs. Led by Risk Management.',
    tag: 'red' as const
  },
  {
    label: 'FMEA / hFMEA (Red)',
    description: 'Proactive risk analysis for new or high-risk processes. Often transitions to QI for implementation.',
    tag: 'red' as const
  }
];
