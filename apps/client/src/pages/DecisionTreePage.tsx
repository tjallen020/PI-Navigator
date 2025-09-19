import { useMemo, useState } from 'react';
import clsx from 'clsx';

import { ModeSummary } from '../components/ModeSummary';
import {
  A3Box,
  a3Boxes,
  decisionTree,
  NodeOption,
  NodeTag,
  projectTypeSummary,
  TreeNode
} from '../data/qiDecisionTree';

type HistoryEntry = {
  nodeId: string;
  title: string;
  choice?: string;
};

const tagStyles: Record<NodeTag, string> = {
  green: 'border-green-200 bg-green-50 text-green-700',
  purple: 'border-purple-200 bg-purple-50 text-purple-700',
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
  blue: 'border-sky-200 bg-sky-50 text-sky-700',
  red: 'border-rose-200 bg-rose-50 text-rose-700'
};

const optionStyles: Record<NodeTag, string> = {
  green: 'border-green-200 hover:border-green-400 text-green-700 hover:text-green-800',
  purple: 'border-purple-200 hover:border-purple-400 text-purple-700 hover:text-purple-800',
  orange: 'border-orange-200 hover:border-orange-400 text-orange-700 hover:text-orange-800',
  blue: 'border-sky-200 hover:border-sky-400 text-sky-700 hover:text-sky-800',
  red: 'border-rose-200 hover:border-rose-400 text-rose-700 hover:text-rose-800'
};

const getNodeTagClass = (tag?: NodeTag) => (tag ? tagStyles[tag] : 'border-slate-200 bg-slate-50 text-slate-600');

const shouldRenderDecision = (box: A3Box, decisionId: string, selections: Record<string, string>) => {
  const decision = box.decisions?.find((item) => item.id === decisionId);
  if (!decision?.dependsOn) {
    return true;
  }
  const parentSelection = selections[`${box.id}:${decision.dependsOn}`];
  const parentDecision = box.decisions?.find((item) => item.id === decision.dependsOn);
  const parentOption = parentDecision?.options.find((option) => option.label === parentSelection);
  return parentOption?.nextId === decisionId;
};

export const DecisionTreePage = () => {
  const [trail, setTrail] = useState<string[]>(['start']);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string>(a3Boxes[0].id);
  const [boxSelections, setBoxSelections] = useState<Record<string, string>>({});

  const currentNode = decisionTree[trail[trail.length - 1]] as TreeNode;

  const breadcrumb = useMemo(() => history.map((entry) => entry.title), [history]);

  const handleReset = () => {
    setTrail(['start']);
    setHistory([]);
    setSelectedBoxId(a3Boxes[0].id);
    setBoxSelections({});
  };

  const pushNode = (nextId: string, choice?: string) => {
    setHistory((prev) => [...prev, { nodeId: currentNode.id, title: currentNode.title, choice }]);
    setTrail((prev) => [...prev, nextId]);
  };

  const handleBack = () => {
    if (trail.length <= 1) return;
    setTrail((prev) => prev.slice(0, -1));
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleContinue = () => {
    if (!currentNode.next) return;
    pushNode(currentNode.next);
  };

  const handleOption = (option: NodeOption) => {
    pushNode(option.next, option.label);
  };

  const handleJumpToRisk = (context: string) => {
    pushNode('safety-screen', context);
  };

  const handleJumpToExit = () => {
    pushNode('close-document', 'Document & close');
  };

  const selectedBox = useMemo(() => a3Boxes.find((box) => box.id === selectedBoxId) ?? a3Boxes[0], [selectedBoxId]);

  const renderNodeBody = (node: TreeNode) => {
    switch (node.type) {
      case 'decision':
        return (
          <div className="space-y-3">
            {node.options?.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOption(option)}
                className={clsx(
                  'flex w-full flex-col rounded border px-4 py-3 text-left text-sm transition',
                  option.tag ? optionStyles[option.tag] : 'border-slate-300 hover:border-primary text-slate-700 hover:text-primary'
                )}
              >
                <span className="font-semibold text-slate-900">{option.label}</span>
                {option.description && <span className="mt-1 text-xs text-slate-600">{option.description}</span>}
              </button>
            ))}
          </div>
        );
      case 'terminator':
        return (
          <div className="space-y-4 text-sm text-slate-700">
            {node.description && <p>{node.description}</p>}
            {node.endState && (
              <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-xs uppercase tracking-wide text-slate-500">
                {node.endState}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Start new intake
              </button>
              {node.id !== 'close-document' && (
                <button
                  type="button"
                  onClick={handleJumpToExit}
                  className="rounded border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
                >
                  Close with documentation
                </button>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4 text-sm text-slate-700">
            {node.description && <p>{node.description}</p>}
            {node.notes && node.notes.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-slate-600">
                {node.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
            {node.artifacts && node.artifacts.length > 0 && (
              <div className="rounded border border-dashed border-slate-200 bg-slate-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Outputs & artifacts</h4>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600">
                  {node.artifacts.map((artifact) => (
                    <li key={artifact}>{artifact}</li>
                  ))}
                </ul>
              </div>
            )}
            {node.type !== 'info' && node.next && (
              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Continue
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <ModeSummary
        title="QI Pathfinding"
        description="Follow a guided decision tree from intake through safety screening, triage, and the A3 improvement flow."
        highlights={[
          'Single intake captures safety, risk, and improvement options',
          'Color-tagged pathways (JDI, Kaizen, 100-Day, RPIW, RCA/FMEA)',
          'Interactive A3 tool picker with escalation cues'
        ]}
      />
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Step {trail.length}</p>
                <h2 className="text-xl font-semibold text-slate-900">{currentNode.title}</h2>
              </div>
              {currentNode.tag && (
                <span className={clsx('rounded-full border px-3 py-1 text-xs font-semibold', getNodeTagClass(currentNode.tag))}>
                  {currentNode.tag === 'green' && 'Just-Do-It'}
                  {currentNode.tag === 'purple' && 'Kaizen / PDSA'}
                  {currentNode.tag === 'orange' && '100-Day'}
                  {currentNode.tag === 'blue' && 'RPIW'}
                  {currentNode.tag === 'red' && 'Risk / Safety'}
                </span>
              )}
            </div>
            <div className="mt-4 space-y-4">
              {breadcrumb.length > 0 && (
                <ol className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {breadcrumb.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex items-center gap-1">
                      {index > 0 && <span>›</span>}
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              )}
              {renderNodeBody(currentNode)}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={trail.length <= 1}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
              >
                Reset
              </button>
            </div>
          </div>
          {currentNode.type === 'info' && currentNode.id === 'a3-entry' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">A3 tool picker</h3>
                  <button
                    type="button"
                    onClick={() => pushNode('end-sustain', 'Advance to sustainment')}
                    className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white"
                  >
                    Continue to sustainment
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Choose a box to see recommended tools, use cases, and micro-decisions. Escalate to Risk Management if new
                  harm, sentinel elements, or regulatory issues surface.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {a3Boxes.map((box) => (
                    <button
                      key={box.id}
                      type="button"
                      onClick={() => setSelectedBoxId(box.id)}
                      className={clsx(
                        'rounded border px-3 py-2 text-left text-sm transition',
                        selectedBoxId === box.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/60 hover:text-primary'
                      )}
                    >
                      {box.title}
                    </button>
                  ))}
                </div>
                <div className="mt-6 rounded border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-base font-semibold text-slate-900">{selectedBox.title}</h4>
                  <p className="mt-2 text-sm text-slate-700">{selectedBox.description}</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Use 1–3 of these tools</h5>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
                        {selectedBox.tools.map((tool) => (
                          <li key={tool}>{tool}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Use when</h5>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
                        {selectedBox.useWhen.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Outputs</h5>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
                      {selectedBox.outputs.map((output) => (
                        <li key={output}>{output}</li>
                      ))}
                    </ul>
                  </div>
                  {selectedBox.notes && selectedBox.notes.length > 0 && (
                    <div className="mt-4 rounded border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                      <ul className="list-disc space-y-1 pl-4">
                        {selectedBox.notes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedBox.decisions && selectedBox.decisions.length > 0 && (
                    <div className="mt-6 space-y-6">
                      {selectedBox.decisions.map((decision) => {
                        if (!shouldRenderDecision(selectedBox, decision.id, boxSelections)) {
                          return null;
                        }
                        const selectionKey = `${selectedBox.id}:${decision.id}`;
                        const selectedLabel = boxSelections[selectionKey];
                        const selectedOption = decision.options.find((option) => option.label === selectedLabel);
                        return (
                          <div key={decision.id} className="rounded border border-slate-200 bg-white p-4">
                            <p className="text-sm font-semibold text-slate-800">{decision.prompt}</p>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              {decision.options.map((option) => (
                                <button
                                  key={option.label}
                                  type="button"
                                  onClick={() => {
                                    setBoxSelections((prev) => ({ ...prev, [selectionKey]: option.label }));
                                    if (option.action === 'risk') {
                                      handleJumpToRisk(`Escalated from ${selectedBox.title}`);
                                    }
                                  }}
                                  className={clsx(
                                    'rounded border px-3 py-2 text-left text-sm transition',
                                    selectedLabel === option.label
                                      ? 'border-primary bg-primary/10 text-primary'
                                      : 'border-slate-300 text-slate-700 hover:border-primary hover:text-primary'
                                  )}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                            {selectedOption && (
                              <p className="mt-3 text-sm text-slate-600">{selectedOption.result}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleJumpToRisk(`Escalated from ${selectedBox.title}`)}
                      className="rounded border border-rose-200 bg-rose-50 px-3 py-2 font-semibold text-rose-700 hover:border-rose-300"
                    >
                      Escalate to Risk Management
                    </button>
                    <button
                      type="button"
                      onClick={handleJumpToExit}
                      className="rounded border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-600 hover:border-slate-300"
                    >
                      Document & close opportunity
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Project type cheatsheet</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {projectTypeSummary.map((item) => (
                <li key={item.label} className="rounded border px-3 py-3 text-sm">
                  <div
                    className={clsx(
                      'mb-2 inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold',
                      getNodeTagClass(item.tag)
                    )}
                  >
                    {item.label}
                  </div>
                  <p className="text-slate-600">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-700">
            <h3 className="text-base font-semibold text-slate-900">Quick actions</h3>
            <p className="mt-2 text-slate-600">Need to pivot quickly?</p>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded border border-slate-300 px-4 py-2 text-left font-semibold text-slate-700"
              >
                Start over from intake
              </button>
              <button
                type="button"
                onClick={() => handleJumpToRisk('Manual escalation to Risk Management')}
                className="rounded border border-rose-200 bg-rose-50 px-4 py-2 text-left font-semibold text-rose-700 hover:border-rose-300"
              >
                Escalate to Risk Management
              </button>
              <button
                type="button"
                onClick={handleJumpToExit}
                className="rounded border border-slate-200 px-4 py-2 text-left font-semibold text-slate-600 hover:border-slate-300"
              >
                Close with documentation
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

