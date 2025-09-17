import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { effectiveness: number; timeValueNote: string; recommendYN: boolean; notes?: string }) => Promise<void>;
}

export const FeedbackDialog = ({ open, onClose, onSubmit }: FeedbackDialogProps) => {
  const [effectiveness, setEffectiveness] = useState(4);
  const [timeValueNote, setTimeValueNote] = useState('');
  const [recommendYN, setRecommendYN] = useState(true);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reset = () => {
    setEffectiveness(4);
    setTimeValueNote('');
    setRecommendYN(true);
    setNotes('');
    setMessage(null);
  };

  const handleSubmit = async () => {
    if (!timeValueNote.trim()) {
      setMessage('Please share a quick note on time vs value.');
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ effectiveness, timeValueNote, recommendYN, notes: notes || undefined });
      setMessage('Thanks! Your feedback helps tune the recommendations.');
      onClose();
    } catch (error) {
      setMessage('Unable to save feedback. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment} afterLeave={reset}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold text-navy">How did this recommendation land?</Dialog.Title>
                <div className="mt-4 space-y-4 text-sm text-slate-600">
                  <label className="block text-sm font-medium text-slate-700">
                    Effectiveness (1–5)
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={effectiveness}
                      onChange={(event) => setEffectiveness(Number(event.target.value))}
                      className="mt-2 w-full"
                    />
                    <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {effectiveness}
                    </span>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Time invested vs. value gained
                    <input
                      className="mt-2 w-full rounded border border-slate-300 p-2"
                      placeholder="e.g., 45 minutes for big clarity"
                      value={timeValueNote}
                      onChange={(event) => setTimeValueNote(event.target.value)}
                    />
                  </label>
                  <fieldset className="flex items-center gap-3">
                    <legend className="text-sm font-medium text-slate-700">Would you recommend this path?</legend>
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input type="radio" checked={recommendYN === true} onChange={() => setRecommendYN(true)} /> Yes
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input type="radio" checked={recommendYN === false} onChange={() => setRecommendYN(false)} /> No
                    </label>
                  </fieldset>
                  <label className="block text-sm font-medium text-slate-700">
                    Notes for the QI team (optional)
                    <textarea
                      className="mt-2 w-full rounded border border-slate-300 p-2"
                      rows={3}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </label>
                  {message && <p className="text-xs text-red-500">{message}</p>}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded px-4 py-2 text-sm text-slate-500 hover:text-navy"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded bg-navy px-4 py-2 text-sm text-white transition hover:bg-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                    onClick={handleSubmit}
                    disabled={busy}
                  >
                    {busy ? 'Saving…' : 'Submit feedback'}
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
