import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { ModeSummary } from '../components/ModeSummary';
import { RecommendationCard } from '../components/RecommendationCard';
import { fetchPackages, fetchTools, resolveRecommendation } from '../lib/api';
import { useSettingsStore } from '../store/settingsStore';

export const FacilitatorPage = () => {
  const plain = useSettingsStore((state) => state.languageMode) === 'plain';
  const [selectedPackage, setSelectedPackage] = useState<string>('ProcessRedesign');
  const [recommendation, setRecommendation] = useState<any>();
  const [resourceLevel, setResourceLevel] = useState<'<2h' | '>2h'>('>2h');
  const [complexity, setComplexity] = useState<'low' | 'high'>('high');
  const [dataAvailability, setDataAvailability] = useState<'none' | 'some' | 'extensive'>('extensive');

  const { data: packages } = useSWR('packages', fetchPackages, { revalidateOnFocus: false });
  const { data: tools } = useSWR('tools', fetchTools, { revalidateOnFocus: false });

  useEffect(() => {
    const mapping: Record<string, { node: string; option: string }> = {
      QuickWin: { node: 'A.urgency', option: 'now' },
      Efficiency: { node: 'B.aspect', option: 'flow' },
      ProcessRedesign: { node: 'B.aspect', option: 'redesign' },
      DataDriven: { node: 'C.measure', option: 'baseline' },
      Safety: { node: 'E.type', option: 'sentinel' }
    };
    const target = mapping[selectedPackage] ?? mapping.ProcessRedesign;
    const fetchRecommendation = async () => {
      const response = await resolveRecommendation(target.node, {
        option: target.option,
        resourceLevel,
        complexity,
        dataAvailability,
        mode: 'facilitator',
        plainLanguage: plain
      });
      setRecommendation(response);
    };
    fetchRecommendation();
  }, [resourceLevel, complexity, dataAvailability, plain, selectedPackage]);

  const advancedTools = tools?.filter((tool: any) => ['DMAIC', 'DMADV', 'Capability', 'DOE', 'Regression'].includes(tool.key)) ?? [];

  return (
    <div className="space-y-8">
      <ModeSummary
        title="Facilitator Mode"
        description="Unlock Six Sigma and statistical toolsets, charters, and change plans for complex multi-team efforts."
        highlights={["DMAIC/DMADV ready", 'Project + change management templates', 'Extended A3 export']}
      />
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Package Composer</h2>
        <p className="mt-2 text-sm text-slate-600">
          Choose a base package and layer on advanced filters to tailor the toolkit for high-complexity work.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <label className="flex flex-col text-sm">
            Package focus
            <select
              className="mt-1 rounded border border-slate-300 px-3 py-2"
              value={selectedPackage}
              onChange={(event) => setSelectedPackage(event.target.value)}
            >
              {packages?.map((pkg: any) => (
                <option key={pkg.key} value={pkg.key}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm">
            Resource level
            <select
              className="mt-1 rounded border border-slate-300 px-3 py-2"
              value={resourceLevel}
              onChange={(event) => setResourceLevel(event.target.value as '<2h' | '>2h')}
            >
              <option value="<2h">Under 2 hours</option>
              <option value={'>2h'}>More than 2 hours</option>
            </select>
          </label>
          <label className="flex flex-col text-sm">
            Complexity
            <select
              className="mt-1 rounded border border-slate-300 px-3 py-2"
              value={complexity}
              onChange={(event) => setComplexity(event.target.value as 'low' | 'high')}
            >
              <option value="low">Single unit</option>
              <option value="high">Multi-unit / regulatory</option>
            </select>
          </label>
          <label className="flex flex-col text-sm">
            Data availability
            <select
              className="mt-1 rounded border border-slate-300 px-3 py-2"
              value={dataAvailability}
              onChange={(event) => setDataAvailability(event.target.value as 'none' | 'some' | 'extensive')}
            >
              <option value="none">Observation first</option>
              <option value="some">Some structured data</option>
              <option value="extensive">Extensive dataset</option>
            </select>
          </label>
        </div>
      </section>
      {recommendation && (
        <RecommendationCard
          tools={recommendation.tools}
          packageName={packages?.find((pkg: any) => pkg.key === selectedPackage)?.name ?? recommendation.package?.name}
          packageDescription={packages?.find((pkg: any) => pkg.key === selectedPackage)?.description ?? recommendation.package?.description}
          rationale={recommendation.rationales}
          sustainment={recommendation.sustainment}
        />
      )}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Advanced Toolkit Highlights</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {advancedTools.map((tool: any) => (
            <article key={tool.key} className="rounded border border-slate-200 p-4">
              <h4 className="font-semibold text-primary">{plain ? tool.namePlain : tool.nameTech}</h4>
              <p className="text-sm text-slate-600">{tool.description}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">Templates</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-slate-500">
                {tool.templates.map((template: string) => (
                  <li key={template}>{template}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
