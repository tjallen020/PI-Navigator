import { useState } from 'react';

export interface SustainmentFormValues {
  owner: string;
  metric: string;
  frequency: string;
  responsePlan: string;
}

interface SustainmentFormProps {
  onSubmit: (values: SustainmentFormValues) => void;
}

export const SustainmentForm: React.FC<SustainmentFormProps> = ({ onSubmit }) => {
  const [values, setValues] = useState<SustainmentFormValues>({ owner: '', metric: '', frequency: '', responsePlan: '' });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900">Control Plan Snapshot</h3>
      <p className="mt-1 text-sm text-slate-600">Capture who will sustain the change and how.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col text-sm">
          Owner
          <input
            required
            className="mt-1 rounded border border-slate-300 px-3 py-2"
            value={values.owner}
            onChange={(event) => setValues((prev) => ({ ...prev, owner: event.target.value }))}
          />
        </label>
        <label className="flex flex-col text-sm">
          Metric / KPI
          <input
            required
            className="mt-1 rounded border border-slate-300 px-3 py-2"
            value={values.metric}
            onChange={(event) => setValues((prev) => ({ ...prev, metric: event.target.value }))}
          />
        </label>
        <label className="flex flex-col text-sm">
          Check-in Frequency
          <input
            required
            className="mt-1 rounded border border-slate-300 px-3 py-2"
            value={values.frequency}
            onChange={(event) => setValues((prev) => ({ ...prev, frequency: event.target.value }))}
          />
        </label>
        <label className="flex flex-col text-sm md:col-span-2">
          Response Plan
          <textarea
            required
            className="mt-1 rounded border border-slate-300 px-3 py-2"
            rows={3}
            value={values.responsePlan}
            onChange={(event) => setValues((prev) => ({ ...prev, responsePlan: event.target.value }))}
          />
        </label>
      </div>
      <button type="submit" className="mt-4 inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white">
        Save Sustainment Plan
      </button>
    </form>
  );
};
