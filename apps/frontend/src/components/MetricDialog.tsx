import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

import type { MetricPayload } from '../types/api';

interface MetricDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (metrics: MetricPayload[]) => Promise<void>;
}

export const MetricDialog = ({ open, onClose, onSubmit }: MetricDialogProps) => {
  const [metrics, setMetrics] = useState<MetricPayload[]>([
    { name: '', type: 'process', unit: '', baseline: '', target: '' },
  ]);
  const [busy, setBusy] = useState(false);
  const addMetric = () => {
    setMetrics((prev) => [...prev, { name: '', type: 'process', unit: '', baseline: '', target: '' }]);
  };

  const updateMetric = (index: number, patch: Partial<MetricPayload>) => {
    setMetrics((prev) => prev.map((metric, idx) => (idx === index ? { ...metric, ...patch } : metric)));
  };

  const handleSubmit = async () => {
    setBusy(true);
    const filtered = metrics.filter((metric) => metric.name.trim().length > 0);
    if (!filtered.length) {
      onClose();
      return;
    }
    try {
      await onSubmit(filtered);
      onClose();
      setMetrics([{ name: '', type: 'process', unit: '', baseline: '', target: '' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold text-navy">Track progress metrics</Dialog.Title>
                <p className="mt-2 text-sm text-slate-600">Pair a process, outcome, and balancing metric to keep the improvement safe and effective.</p>
                <div className="mt-4 space-y-4">
                  {metrics.map((metric, index) => (
                    <div key={index} className="rounded border border-slate-200 p-4">
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                        <label className="text-xs font-medium text-slate-700">
                          Name
                          <input
                            className="mt-1 w-full rounded border border-slate-300 p-2"
                            value={metric.name}
                            onChange={(event) => updateMetric(index, { name: event.target.value })}
                          />
                        </label>
                        <label className="text-xs font-medium text-slate-700">
                          Type
                          <select
                            className="mt-1 w-full rounded border border-slate-300 p-2"
                            value={metric.type}
                            onChange={(event) => updateMetric(index, { type: event.target.value as MetricPayload['type'] })}
                          >
                            <option value="process">Process</option>
                            <option value="outcome">Outcome</option>
                            <option value="balancing">Balancing</option>
                          </select>
                        </label>
                        <label className="text-xs font-medium text-slate-700">
                          Unit
                          <input
                            className="mt-1 w-full rounded border border-slate-300 p-2"
                            value={metric.unit}
                            onChange={(event) => updateMetric(index, { unit: event.target.value })}
                          />
                        </label>
                        <label className="text-xs font-medium text-slate-700">
                          Baseline
                          <input
                            className="mt-1 w-full rounded border border-slate-300 p-2"
                            value={metric.baseline}
                            onChange={(event) => updateMetric(index, { baseline: event.target.value })}
                          />
                        </label>
                        <label className="text-xs font-medium text-slate-700">
                          Target
                          <input
                            className="mt-1 w-full rounded border border-slate-300 p-2"
                            value={metric.target}
                            onChange={(event) => updateMetric(index, { target: event.target.value })}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMetric}
                    className="rounded bg-slate-100 px-3 py-2 text-xs font-semibold text-navy hover:bg-slate-200"
                  >
                    + Add another metric
                  </button>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" className="rounded px-4 py-2 text-sm text-slate-500 hover:text-navy" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded bg-navy px-4 py-2 text-sm text-white transition hover:bg-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                    onClick={handleSubmit}
                    disabled={busy}
                  >
                    {busy ? 'Saving…' : 'Save metrics'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
