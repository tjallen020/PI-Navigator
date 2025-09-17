import clsx from 'clsx';

import type { Mode } from '../types/api';

const MODES: Array<{ key: Mode; title: string; description: string }> = [
  {
    key: 'FAST_TRACK',
    title: 'Fast Track',
    description: '≤3 clicks to get a curated tool package and sustainment nudges.',
  },
  {
    key: 'GUIDED',
    title: 'Guided Path',
    description: 'Step-by-step decision support with explanations at every branch.',
  },
  {
    key: 'FACILITATOR',
    title: 'Facilitator Mode',
    description: 'Unlock advanced analytics, DMAIC/DMADV, and extended export.',
  },
];

interface ModeTabsProps {
  value: Mode;
  onChange: (mode: Mode) => void;
  allowFacilitator: boolean;
}

export const ModeTabs = ({ value, onChange, allowFacilitator }: ModeTabsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {MODES.map((mode) => {
        if (mode.key === 'FACILITATOR' && !allowFacilitator) {
          return (
            <article key={mode.key} className="rounded-lg border border-dashed border-slate-300 p-4 text-slate-400">
              <h3 className="text-lg font-semibold">{mode.title}</h3>
              <p className="mt-1 text-sm">Facilitator mode is available for facilitator/admin roles.</p>
            </article>
          );
        }
        const active = value === mode.key;
        return (
          <button
            key={mode.key}
            onClick={() => onChange(mode.key)}
            className={clsx(
              'text-left rounded-lg border p-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
              active ? 'border-teal bg-white shadow-lg' : 'border-slate-200 bg-slate-50 hover:border-teal'
            )}
            type="button"
          >
            <h3 className="text-lg font-semibold text-navy">{mode.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{mode.description}</p>
            {active && <p className="mt-3 text-xs uppercase tracking-wide text-teal">Selected</p>}
          </button>
        );
      })}
    </div>
  );
};
