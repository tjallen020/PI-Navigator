import { useEffect, useMemo, useState } from 'react';

import { FastTrackForm } from '../components/FastTrackForm';
import { FeedbackDialog } from '../components/FeedbackDialog';
import { GuidedMode } from '../components/GuidedMode';
import { MetricDialog } from '../components/MetricDialog';
import { ModeTabs } from '../components/ModeTabs';
import { PlainLanguageToggle } from '../components/PlainLanguageToggle';
import { RecommendationPanel } from '../components/RecommendationPanel';
import { useAuth } from '../providers/AuthProvider';
import { api } from '../utils/api';
import type { Mode, RecommendationResponse, SessionResponse } from '../types/api';

interface SessionRequestState {
  mode: Mode;
  answers: { goal: 'A' | 'B' | 'C' | 'D' | 'E'; incidentType?: 'sentinel' | 'nearmiss' | 'recurring' | 'system'; pathTag?: string };
  filters: { resourceLevel: '<2h' | '>2h'; complexity: 'low' | 'high'; dataAvailability: 'none' | 'some' | 'extensive' };
}

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const allowFacilitator = user?.role === 'FACILITATOR' || user?.role === 'ADMIN';
  const [mode, setMode] = useState<Mode>(allowFacilitator ? 'FACILITATOR' : 'FAST_TRACK');
  const [filters, setFilters] = useState<SessionRequestState['filters']>({
    resourceLevel: '<2h',
    complexity: 'low',
    dataAvailability: 'some',
  });
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<SessionRequestState | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [metricOpen, setMetricOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const plainLanguage = user?.preferences?.plainLanguage ?? true;

  useEffect(() => {
    if (mode === 'FACILITATOR') {
      setFilters((prev) => ({ ...prev, resourceLevel: '>2h', complexity: 'high', dataAvailability: 'extensive' }));
    }
  }, [mode]);

  const handleSession = async (payload: SessionRequestState) => {
    setLoading(true);
    try {
      const { data } = await api.client.post<SessionResponse>('/sessions', { ...payload, sessionId: sessionId ?? undefined });
      setRecommendation(data.recommendation);
      setSessionId(data.session.id);
      setLastRequest(payload);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!sessionId || !recommendation) return;
    setExporting(true);
    try {
      const { data } = await api.client.post('/export/a3ppt',
        {
          sessionId,
          meta: {
            owner: user?.name ?? 'QI Lead',
            unit: user?.unit ?? 'Unit',
            problemTitle: recommendation.package?.name ?? 'Improvement Focus',
          },
        },
        { responseType: 'blob' }
      );
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'QI-Tool-Selector-A3.pptx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleMetricSubmit = async (metrics: { name: string; type: 'process' | 'outcome' | 'balancing'; unit: string; baseline: string; target: string }[]) => {
    if (!sessionId || !lastRequest) return;
    setMetricOpen(false);
    await api.client.post('/sessions', {
      ...lastRequest,
      sessionId,
      metrics,
    });
  };

  const handleFeedback = async (payload: { effectiveness: number; timeValueNote: string; recommendYN: boolean; notes?: string }) => {
    if (!sessionId) return;
    await api.client.post('/feedback', { sessionId, ...payload });
  };

  const modeDescription = useMemo(() => {
    switch (mode) {
      case 'FAST_TRACK':
        return 'Frontline-friendly bundle with sustainment nudges.';
      case 'GUIDED':
        return 'Answer up to five questions to land on the right tool set.';
      case 'FACILITATOR':
        return 'Advanced analytics, DMAIC/DMADV prompts, and export upgrades.';
      default:
        return '';
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold text-navy">QI Tool Selector</h1>
            <p className="text-sm text-slate-600">{modeDescription}</p>
          </div>
          <div className="flex items-center gap-4">
            <PlainLanguageToggle />
            <div className="rounded bg-slate-100 px-3 py-2 text-sm text-slate-600">
              <span className="font-semibold text-navy">{user?.name}</span>
              <span className="ml-2 text-xs uppercase tracking-wide text-slate-500">{user?.role}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-teal hover:text-teal"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6">
        <ModeTabs value={mode} onChange={setMode} allowFacilitator={allowFacilitator} />
        {mode === 'FAST_TRACK' && <FastTrackForm onSubmit={handleSession} loading={loading} />}
        {mode !== 'FAST_TRACK' && (
          <GuidedMode
            filters={filters}
            onFiltersChange={setFilters}
            onSubmit={handleSession}
            loading={loading}
            facilitator={mode === 'FACILITATOR'}
          />
        )}
        <RecommendationPanel
          recommendation={recommendation}
          plainLanguage={plainLanguage}
          onAddMetric={() => setMetricOpen(true)}
          onExport={handleExport}
          onFeedback={() => setFeedbackOpen(true)}
          exporting={exporting}
        />
      </main>
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} onSubmit={handleFeedback} />
      <MetricDialog open={metricOpen} onClose={() => setMetricOpen(false)} onSubmit={handleMetricSubmit} />
    </div>
  );
};
