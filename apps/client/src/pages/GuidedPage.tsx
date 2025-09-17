import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { DecisionBreadcrumb } from '../components/DecisionBreadcrumb';
import { ModeSummary } from '../components/ModeSummary';
import { RecommendationCard } from '../components/RecommendationCard';
import { fetchNode, resolveRecommendation } from '../lib/api';
import { useSettingsStore } from '../store/settingsStore';

interface NodeOption {
  label: string;
  value: string;
  next?: string;
  recommend?: {
    package?: string;
    tools?: string[];
    extras?: string[];
  };
}

interface DecisionNode {
  key: string;
  question: string;
  pathTag: string;
  options: NodeOption[];
}

export const GuidedPage = () => {
  const plain = useSettingsStore((state) => state.languageMode) === 'plain';
  const [currentKey, setCurrentKey] = useState('entry.goal');
  const [history, setHistory] = useState<Array<{ key: string; question: string; option: NodeOption }>>([]);
  const [recommendation, setRecommendation] = useState<any>();
  const [resourceLevel, setResourceLevel] = useState<'<2h' | '>2h'>('<2h');
  const [complexity, setComplexity] = useState<'low' | 'high'>('low');
  const [dataAvailability, setDataAvailability] = useState<'none' | 'some' | 'extensive'>('none');

  const { data: node } = useSWR<DecisionNode>(currentKey, (key) => fetchNode(key), { revalidateOnFocus: false });

  const breadcrumb = useMemo(() => history.map((entry) => ({ label: entry.option.label })), [history]);

  const handleSelect = async (option: NodeOption) => {
    if (!node) return;
    const newHistory = [...history, { key: node.key, question: node.question, option }];
    setHistory(newHistory);

    if (option.next) {
      setCurrentKey(option.next);
      setRecommendation(undefined);
    }
    if (option.recommend) {
      const response = await resolveRecommendation(node.key, {
        option: option.value,
        resourceLevel,
        complexity,
        dataAvailability,
        mode: 'guided',
        plainLanguage: plain
      });
      setRecommendation(response);
    }
  };

  const reset = () => {
    setHistory([]);
    setRecommendation(undefined);
    setCurrentKey('entry.goal');
  };

  return (
    <div className="space-y-8">
      <ModeSummary
        title="Guided Path"
        description="Walk through a structured decision tree covering goals, process, data readiness, and safety needs."
        highlights={["≤5 questions to first answer", 'Path-specific rationale', 'Sustainment prompts baked in']}
      />
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Decision Support</h2>
              <button className="text-sm text-primary" onClick={reset}>
                Start Over
              </button>
            </div>
            {breadcrumb.length > 0 && <DecisionBreadcrumb steps={breadcrumb} />}
            {node ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700">{node.question}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {node.options.map((option) => (
                    <button
                      key={option.value}
                      className="rounded border border-slate-300 px-4 py-3 text-left text-sm hover:border-primary hover:text-primary"
                      onClick={() => handleSelect(option)}
                    >
                      <span className="block font-semibold text-slate-800">{option.label}</span>
                      {option.recommend?.package && (
                        <span className="text-xs text-slate-500">Recommends {option.recommend.package}</span>
                      )}
                      {option.recommend?.tools && (
                        <span className="text-xs text-slate-500">Tools: {option.recommend.tools.join(', ')}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Loading decision node…</p>
            )}
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Advanced filters</h3>
            <label className="mt-3 flex flex-col text-sm">
              Resource level
              <select
                className="mt-1 rounded border border-slate-300 px-3 py-2"
                value={resourceLevel}
                onChange={(event) => setResourceLevel(event.target.value as '<2h' | '>2h')}
              >
                <option value="<2h">Under 2 hours / week</option>
                <option value={'>2h'}>More than 2 hours / week</option>
              </select>
            </label>
            <label className="mt-3 flex flex-col text-sm">
              Complexity
              <select
                className="mt-1 rounded border border-slate-300 px-3 py-2"
                value={complexity}
                onChange={(event) => setComplexity(event.target.value as 'low' | 'high')}
              >
                <option value="low">Single team / < 10 variables</option>
                <option value="high">Multi-unit / high regulation</option>
              </select>
            </label>
            <label className="mt-3 flex flex-col text-sm">
              Data availability
              <select
                className="mt-1 rounded border border-slate-300 px-3 py-2"
                value={dataAvailability}
                onChange={(event) => setDataAvailability(event.target.value as 'none' | 'some' | 'extensive')}
              >
                <option value="none">Observation first</option>
                <option value="some">Some structured data</option>
                <option value="extensive">Extensive data available</option>
              </select>
            </label>
          </div>
        </aside>
      </div>
      {recommendation && (
        <RecommendationCard
          tools={recommendation.tools}
          packageName={recommendation.package?.name}
          packageDescription={recommendation.package?.description}
          rationale={recommendation.rationales}
          sustainment={recommendation.sustainment}
        />
      )}
    </div>
  );
};
