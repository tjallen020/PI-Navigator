import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { ModeSummary } from '../components/ModeSummary';
import { RecommendationCard } from '../components/RecommendationCard';
import { SustainmentForm, SustainmentFormValues } from '../components/SustainmentForm';
import { fetchNode, resolveRecommendation } from '../lib/api';
import { useSettingsStore } from '../store/settingsStore';

const goalOptions = [
  { label: 'Fix an immediate problem', value: 'A', node: 'A.urgency' },
  { label: 'Improve an existing process', value: 'B', node: 'B.aspect' },
  { label: 'Measure/track performance', value: 'C', node: 'C.measure' },
  { label: 'Prevent future problems', value: 'D', node: 'D.prevent' },
  { label: 'Respond to incident/event', value: 'E', node: 'E.type' }
];

const resourceOptions = [
  { label: 'Under 2 hours per week', value: '<2h' },
  { label: 'More than 2 hours per week', value: '>2h' }
];

export const FastTrackPage = () => {
  const plain = useSettingsStore((state) => state.languageMode) === 'plain';
  const [goal, setGoal] = useState(goalOptions[0]);
  const [resources, setResources] = useState(resourceOptions[0]);
  const [recommendation, setRecommendation] = useState<any>();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [controlPlan, setControlPlan] = useState<SustainmentFormValues | null>(null);

  const { data: nodeData } = useSWR(goal.node, (key) => fetchNode(key), { revalidateOnFocus: false });

  useEffect(() => {
    if (nodeData) {
      setSelectedOption(nodeData.options[0]?.value ?? '');
    }
  }, [nodeData]);

  const handleRecommend = async () => {
    if (!nodeData) return;
    const optionValue = selectedOption || nodeData.options[0]?.value || goal.value;
    const response = await resolveRecommendation(nodeData.key, {
      option: optionValue,
      resourceLevel: resources.value as '<2h' | '>2h',
      complexity: 'low',
      dataAvailability: 'none',
      mode: 'fast',
      plainLanguage: plain
    });
    setRecommendation(response);
  };

  return (
    <div className="space-y-8">
      <ModeSummary
        title="Fast Track"
        description="Select your goal and time available to get an immediate tool package and sustainment prompts."
        highlights={["≤3 clicks to action", 'Bundles Lean + IHI favorites', 'Built-in sustainment prompts']}
      />
      <div className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <label className="flex flex-col text-sm">
            Primary Goal
            <select
              className="mt-1 rounded border border-slate-300 px-3 py-2"
              value={goal.value}
              onChange={(event) => {
                const next = goalOptions.find((option) => option.value === event.target.value)!;
                setGoal(next);
                setRecommendation(undefined);
              }}
            >
              {goalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm">
            Time Available
            <select
              className="mt-1 rounded border border-slate-300 px-3 py-2"
              value={resources.value}
              onChange={(event) => {
                const next = resourceOptions.find((option) => option.value === event.target.value)!;
                setResources(next);
                setRecommendation(undefined);
              }}
            >
              {resourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {nodeData && nodeData.options.length > 1 && (
            <label className="flex flex-col text-sm">
              Fast Track Detail
              <select
                className="mt-1 rounded border border-slate-300 px-3 py-2"
                value={selectedOption}
                onChange={(event) => setSelectedOption(event.target.value)}
              >
                {nodeData.options.map((option: any) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white"
            onClick={handleRecommend}
          >
            Get Recommendation
          </button>
        </div>
        <div className="rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <h3 className="font-semibold text-slate-900">This mode works best when:</h3>
          <ul className="mt-2 list-disc pl-4">
            <li>You need guidance in minutes.</li>
            <li>Stakeholders expect a quick plan.</li>
            <li>You still want sustainment guardrails.</li>
          </ul>
        </div>
      </div>
      {recommendation && (
        <div className="space-y-6">
          <RecommendationCard
            tools={recommendation.tools}
            packageName={recommendation.package?.name}
            packageDescription={recommendation.package?.description}
            rationale={recommendation.rationales}
            sustainment={recommendation.sustainment}
          />
          <div className="grid gap-6 md:grid-cols-2">
            <SustainmentForm onSubmit={setControlPlan} />
            {controlPlan && (
              <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Your Sustainment Snapshot</h3>
                <dl className="mt-4 space-y-2 text-sm text-slate-700">
                  <div>
                    <dt className="font-medium text-slate-500">Owner</dt>
                    <dd>{controlPlan.owner}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Metric</dt>
                    <dd>{controlPlan.metric}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Frequency</dt>
                    <dd>{controlPlan.frequency}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Response Plan</dt>
                    <dd>{controlPlan.responsePlan}</dd>
                  </div>
                </dl>
                <div className="mt-4 space-x-3">
                  <button className="rounded border border-primary px-4 py-2 text-sm font-semibold text-primary">Start PDSA</button>
                  <button className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Add Metric</button>
                  <button className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white">Export A3 PPT</button>
                </div>
              </aside>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
