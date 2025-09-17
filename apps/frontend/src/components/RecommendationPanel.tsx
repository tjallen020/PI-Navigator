import { ArrowDownTrayIcon, ClipboardDocumentCheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

import type { RecommendationResponse } from '../types/api';

interface RecommendationPanelProps {
  recommendation: RecommendationResponse | null;
  plainLanguage: boolean;
  onExport: () => Promise<void>;
  onAddMetric: () => void;
  onFeedback: () => void;
  exporting: boolean;
}

const labelForTool = (plain: boolean, tool: RecommendationResponse['tools'][number]['tool']) =>
  plain ? tool.namePlain : tool.nameTech;

export const RecommendationPanel = ({ recommendation, plainLanguage, onExport, onAddMetric, onFeedback, exporting }: RecommendationPanelProps) => {
  if (!recommendation) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        Select a mode and answer the prompts to see recommendations.
      </section>
    );
  }

  const toolList = recommendation.tools;
  const sustainment = recommendation.sustainmentPrompts;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-navy">Recommended next steps</h2>
          <p className="text-sm text-slate-600">Powered by pathway: {recommendation.contextTag}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAddMetric}
            className="flex items-center gap-2 rounded bg-slate-100 px-4 py-2 text-sm text-navy transition hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" /> Add metric
          </button>
          <button
            type="button"
            onClick={onFeedback}
            className="flex items-center gap-2 rounded bg-slate-100 px-4 py-2 text-sm text-navy transition hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            <ClipboardDocumentCheckIcon className="h-4 w-4" aria-hidden="true" /> Give feedback
          </button>
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-2 rounded bg-navy px-4 py-2 text-sm text-white transition hover:bg-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            disabled={exporting}
          >
            <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" /> {exporting ? 'Exporting…' : 'Export A3 PPT'}
          </button>
        </div>
      </header>
      {recommendation.package && (
        <article className="mt-6 rounded-lg border border-teal/50 bg-teal/5 p-5">
          <h3 className="text-lg font-semibold text-navy">Tool package: {recommendation.package.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{recommendation.package.description}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {recommendation.package.tools.map((tool) => (
              <div key={tool.key} className="rounded border border-slate-200 bg-white p-4">
                <h4 className="text-sm font-semibold text-navy">{labelForTool(plainLanguage, tool)}</h4>
                <p className="mt-1 text-xs text-slate-600">{tool.description}</p>
                <dl className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
                  <div>
                    <dt className="font-semibold">Time</dt>
                    <dd>{tool.estTime}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Difficulty</dt>
                    <dd>{tool.difficulty}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Pitfalls</dt>
                    <dd>{tool.pitfalls.join(', ')}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </article>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {toolList.map(({ tool, rationale }) => (
          <article key={tool.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <header className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-navy">{labelForTool(plainLanguage, tool)}</h3>
                <p className="text-xs uppercase tracking-wide text-slate-500">{tool.category}</p>
              </div>
              <span className={clsx('rounded-full px-2 py-1 text-[11px]', tool.difficulty === 'Advanced' ? 'bg-amber-100 text-amber-700' : 'bg-teal/20 text-teal-900')}>
                {tool.difficulty}
              </span>
            </header>
            <p className="mt-3 text-sm text-slate-600">{plainLanguage ? rationale.plain : rationale.technical}</p>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              <li>
                <span className="font-semibold">Watch outs:</span> {tool.pitfalls.join('; ')}
              </li>
              {tool.nextToolKeys.length > 0 && (
                <li>
                  <span className="font-semibold">Next up:</span> {tool.nextToolKeys.join(', ')}
                </li>
              )}
            </ul>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-navy">Control plan checklist</h3>
          <ul className="mt-2 list-disc pl-5 text-xs text-slate-600">
            <li>{sustainment.controlPlan.ownerHint}</li>
            <li>{sustainment.controlPlan.metricHint}</li>
            <li>{sustainment.controlPlan.frequencyHint}</li>
            <li>{sustainment.controlPlan.responseHint}</li>
          </ul>
        </article>
        <article className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-navy">Daily huddle nudge</h3>
          <p className="mt-2 text-xs text-slate-600">{sustainment.huddles}</p>
        </article>
        <article className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-navy">30/60/90 follow-ups</h3>
          <p className="mt-2 text-xs text-slate-600">{sustainment.followUps}</p>
        </article>
      </div>
      {recommendation.frameworks.length > 0 && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <h3 className="text-sm font-semibold text-navy">Framework prompts</h3>
          <p className="mt-2">Consider layering: {recommendation.frameworks.join(', ')}.</p>
        </div>
      )}
      {recommendation.extras.length > 0 && (
        <div className="mt-4 text-xs text-slate-500">Additional tools enabled: {recommendation.extras.join(', ')}</div>
      )}
    </section>
  );
};
