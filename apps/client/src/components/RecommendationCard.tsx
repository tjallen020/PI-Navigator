import { useMemo } from 'react';
import { toolLabelMap } from '../data/toolLabels';
import { useSettingsStore } from '../store/settingsStore';

export interface ToolSummary {
  key: string;
  namePlain: string;
  nameTech: string;
  description?: string;
  category?: string;
  difficulty?: string;
  estTime?: string;
  pitfalls?: string[];
}

export interface RecommendationProps {
  tools: ToolSummary[];
  packageName?: string;
  packageDescription?: string;
  rationale?: Array<{ toolKey: string; text: string }>;
  sustainment?: {
    controlPlan: { prompt: string; checklist: string[] };
    huddle: { prompt: string; cadence: string };
    followUps: string[];
  };
}

export const RecommendationCard: React.FC<RecommendationProps> = ({
  tools,
  packageName,
  packageDescription,
  rationale,
  sustainment
}) => {
  const mode = useSettingsStore((state) => state.languageMode);

  const displayTools = useMemo(() => {
    return tools.map((tool) => {
      const mapEntry = toolLabelMap[tool.key];
      return {
        ...tool,
        displayName: mode === 'plain' ? mapEntry?.plain ?? tool.namePlain : mapEntry?.technical ?? tool.nameTech
      };
    });
  }, [tools, mode]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recommended Toolkit</h2>
          {packageName && <p className="text-sm text-slate-600">{packageName}</p>}
        </div>
      </header>
      {packageDescription && <p className="mb-4 text-sm text-slate-700">{packageDescription}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {displayTools.map((tool) => (
          <article key={tool.key} className="rounded border border-slate-200 p-4">
            <h3 className="font-semibold text-primary">{tool.displayName}</h3>
            <p className="text-sm text-slate-600">{tool.description}</p>
            <dl className="mt-2 space-y-1 text-xs text-slate-500">
              {tool.category && (
                <div>
                  <dt className="font-medium uppercase tracking-wide text-slate-400">Category</dt>
                  <dd>{tool.category}</dd>
                </div>
              )}
              {tool.difficulty && (
                <div>
                  <dt className="font-medium uppercase tracking-wide text-slate-400">Difficulty</dt>
                  <dd>{tool.difficulty}</dd>
                </div>
              )}
              {tool.estTime && (
                <div>
                  <dt className="font-medium uppercase tracking-wide text-slate-400">Time Need</dt>
                  <dd>{tool.estTime}</dd>
                </div>
              )}
            </dl>
          </article>
        ))}
      </div>
      {rationale && rationale.length > 0 && (
        <div className="mt-6 rounded border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
          <h4 className="mb-2 font-semibold uppercase tracking-wide text-primary/80">Why these tools?</h4>
          <ul className="space-y-2">
            {rationale.map((item) => (
              <li key={`${item.toolKey}-${item.text}`} className="leading-relaxed">
                <strong className="mr-1">{displayTools.find((tool) => tool.key === item.toolKey)?.displayName}:</strong>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      )}
      {sustainment && (
        <div className="mt-6 rounded border border-slate-200 bg-slate-100 p-4 text-sm text-slate-700">
          <h4 className="mb-2 font-semibold text-slate-800">Sustainment Prompts</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h5 className="font-semibold text-slate-800">Control Plan</h5>
              <p className="text-xs text-slate-600">{sustainment.controlPlan.prompt}</p>
              <ul className="mt-2 list-disc pl-4 text-xs">
                {sustainment.controlPlan.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-slate-800">Daily Huddle</h5>
              <p className="text-xs text-slate-600">{sustainment.huddle.prompt}</p>
              <p className="mt-1 text-xs font-medium text-slate-700">Cadence: {sustainment.huddle.cadence}</p>
            </div>
            <div>
              <h5 className="font-semibold text-slate-800">Follow Ups</h5>
              <ul className="mt-2 list-disc pl-4 text-xs">
                {sustainment.followUps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
