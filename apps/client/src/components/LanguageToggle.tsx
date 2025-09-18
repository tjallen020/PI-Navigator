import { useSettingsStore } from '../store/settingsStore';

export const LanguageToggle = () => {
  const mode = useSettingsStore((state) => state.languageMode);
  const setMode = useSettingsStore((state) => state.setLanguageMode);

  return (
    <label className="flex items-center gap-2 text-slate-600">
      <span className="text-xs uppercase tracking-wide text-slate-500">Labels</span>
      <select
        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
        value={mode}
        onChange={(event) => setMode(event.target.value as 'plain' | 'technical')}
        aria-label="Toggle plain language labels"
      >
        <option value="plain">Plain Language</option>
        <option value="technical">Technical</option>
      </select>
    </label>
  );
};
