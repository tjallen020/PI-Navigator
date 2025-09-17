import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { api } from '../utils/api';
import type { DecisionNode, Mode } from '../types/api';

interface GuidedModeProps {
  filters: { resourceLevel: '<2h' | '>2h'; complexity: 'low' | 'high'; dataAvailability: 'none' | 'some' | 'extensive' };
  onFiltersChange: (filters: GuidedModeProps['filters']) => void;
  onSubmit: (payload: {
    mode: Mode;
    answers: { goal: 'A' | 'B' | 'C' | 'D' | 'E'; incidentType?: 'sentinel' | 'nearmiss' | 'recurring' | 'system'; pathTag?: string };
    filters: GuidedModeProps['filters'];
  }) => Promise<void>;
  loading: boolean;
  facilitator?: boolean;
}

type NodeHistory = {
  node: DecisionNode;
  option: DecisionNode['options'][number];
};

const fetchNode = async (key: string) => {
  const { data } = await api.client.get<DecisionNode>(`/nodes/${key}`);
  return data;
};

export const GuidedMode = ({ filters, onFiltersChange, onSubmit, loading, facilitator = false }: GuidedModeProps) => {
  const [currentKey, setCurrentKey] = useState('entry.goal');
  const [history, setHistory] = useState<NodeHistory[]>([]);

  useEffect(() => {
    setCurrentKey('entry.goal');
    setHistory([]);
  }, [facilitator]);

  const { data: node, isLoading } = useQuery(['node', currentKey], () => fetchNode(currentKey));

  const breadcrumbs = history.map((item) => ({ label: item.node.question, answer: item.option.label }));

  const handleSelect = async (option: DecisionNode['options'][number]) => {
    if (!node) return;
    const nextHistory = [...history, { node, option }];
    setHistory(nextHistory);

    if (option.next) {
      setCurrentKey(option.next);
      return;
    }

    const rootGoal = (history[0]?.option.value ?? option.value) as 'A' | 'B' | 'C' | 'D' | 'E';
    const incidentValue =
      rootGoal === 'E'
        ? ((option.value as unknown) as 'sentinel' | 'nearmiss' | 'recurring' | 'system')
        : undefined;
    const payload = {
      mode: facilitator ? 'FACILITATOR' : 'GUIDED',
      answers: {
        goal: rootGoal,
        incidentType: incidentValue,
        pathTag: option.pathTag ?? node.pathTag ?? undefined,
      },
      filters,
    };
    await onSubmit(payload);
  };

  const handleBack = () => {
    if (!history.length) return;
    const next = history.slice(0, -1);
    setHistory(next);
    const last = next[next.length - 1];
    setCurrentKey(last ? last.node.key : 'entry.goal');
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="Guided Path">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-navy">Guided Path</h2>
          <p className="text-sm text-slate-600">Answer up to five questions to get the best-fit tool pathway.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500" aria-live="polite">
          {history.length + 1} / 5 questions
        </div>
      </header>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.label} className="rounded-full bg-slate-100 px-3 py-1">
            <span className="font-medium text-slate-600">{idx + 1}.</span> {crumb.answer}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="text-sm font-semibold text-slate-700">Resource filter</legend>
          <div className="mt-2 flex gap-3 text-sm">
            {(['<2h', '>2h'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onFiltersChange({ ...filters, resourceLevel: option })}
                className={clsx(
                  'rounded-full px-4 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
                  filters.resourceLevel === option ? 'bg-navy text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                )}
              >
                {option === '<2h' ? '<2 hrs/wk' : '>2 hrs/wk'}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="text-sm font-semibold text-slate-700">Data available</legend>
          <div className="mt-2 flex gap-2 text-sm">
            {(['none', 'some', 'extensive'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onFiltersChange({ ...filters, dataAvailability: option })}
                className={clsx(
                  'rounded-full px-3 py-2 capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
                  filters.dataAvailability === option
                    ? 'bg-navy text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="text-sm font-semibold text-slate-700">Complexity</legend>
          <div className="mt-2 flex gap-2 text-sm">
            {(['low', 'high'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onFiltersChange({ ...filters, complexity: option })}
                className={clsx(
                  'rounded-full px-3 py-2 capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
                  filters.complexity === option ? 'bg-navy text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading question…</p>
        ) : node ? (
          <div>
            <h3 className="text-lg font-semibold text-navy">{node.question}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {node.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                >
                  <span className="text-sm font-medium text-navy">{option.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleBack}
                disabled={!history.length}
                className="rounded px-3 py-2 text-sm text-slate-500 transition hover:text-navy disabled:opacity-50"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-600">Unable to load node.</p>
        )}
      </div>
      {loading && <p className="mt-4 text-sm text-teal">Calculating recommendation…</p>}
    </section>
  );
};
