import clsx from 'clsx';
import { useState } from 'react';

import type { Mode } from '../types/api';

const goals: Array<{ key: 'A' | 'B' | 'C' | 'D' | 'E'; title: string; subtitle: string }> = [
  { key: 'A', title: 'Fix a Problem', subtitle: 'Contain an immediate issue or defect' },
  { key: 'B', title: 'Improve a Process', subtitle: 'Redesign flow or roles' },
  { key: 'C', title: 'Measure Performance', subtitle: 'Create baseline or monitor changes' },
  { key: 'D', title: 'Prevent Issues', subtitle: 'Build fail-safes and controls' },
  { key: 'E', title: 'Respond to Incident', subtitle: 'Safety event or near miss' },
];

const resourceOptions = [
  { key: '<2h', label: '< 2 hrs/week capacity' },
  { key: '>2h', label: '> 2 hrs/week capacity' },
] as const;

const incidentOptions = [
  { key: 'sentinel', label: 'Sentinel event' },
  { key: 'nearmiss', label: 'Near miss' },
  { key: 'recurring', label: 'Recurring issue' },
  { key: 'system', label: 'System failure' },
] as const;

interface FastTrackFormProps {
  onSubmit: (payload: {
    mode: Mode;
    answers: { goal: 'A' | 'B' | 'C' | 'D' | 'E'; incidentType?: 'sentinel' | 'nearmiss' | 'recurring' | 'system' };
    filters: { resourceLevel: '<2h' | '>2h'; complexity: 'low' | 'high'; dataAvailability: 'none' | 'some' | 'extensive' };
  }) => Promise<void>;
  loading: boolean;
}

export const FastTrackForm = ({ onSubmit, loading }: FastTrackFormProps) => {
  const [goal, setGoal] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [resourceLevel, setResourceLevel] = useState<'<2h' | '>2h'>('<2h');
  const [incidentType, setIncidentType] = useState<'sentinel' | 'nearmiss' | 'recurring' | 'system'>('sentinel');

  const handleSubmit = async () => {
    await onSubmit({
      mode: 'FAST_TRACK',
      answers: { goal, incidentType: goal === 'E' ? incidentType : undefined },
      filters: { resourceLevel, complexity: 'low', dataAvailability: 'some' },
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="Fast Track">
      <h2 className="text-xl font-semibold text-navy">Fast Track: 3-click recommendations</h2>
      <p className="mt-1 text-sm text-slate-600">Pick your goal and time available to get a tailored tool package.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {goals.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setGoal(item.key)}
            className={clsx(
              'flex h-full flex-col rounded-lg border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
              goal === item.key ? 'border-teal bg-teal/10 shadow' : 'border-slate-200 bg-slate-50 hover:border-teal'
            )}
          >
            <span className="text-base font-semibold text-navy">{item.title}</span>
            <span className="mt-2 text-xs text-slate-600">{item.subtitle}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Time you can invest</legend>
          <div className="mt-2 flex gap-3">
            {resourceOptions.map((option) => (
              <label key={option.key} className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
                <input
                  type="radio"
                  name="resource"
                  value={option.key}
                  checked={resourceLevel === option.key}
                  onChange={() => setResourceLevel(option.key)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
        {goal === 'E' && (
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Incident type</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {incidentOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setIncidentType(option.key)}
                  className={clsx(
                    'rounded-full px-4 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
                    incidentType === option.key ? 'bg-navy text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded bg-navy px-5 py-2 text-white transition hover:bg-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          disabled={loading}
        >
          {loading ? 'Generating…' : 'Generate my tool package'}
        </button>
        <p className="text-sm text-slate-500">
          You can refine filters after seeing the recommendation or export an A3 with one click.
        </p>
      </div>
    </section>
  );
};
