import { Switch } from '@headlessui/react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { useAuth } from '../providers/AuthProvider';

export const PlainLanguageToggle = () => {
  const { user, updatePreferences } = useAuth();
  const [enabled, setEnabled] = useState<boolean>(user?.preferences?.plainLanguage ?? true);

  useEffect(() => {
    setEnabled(user?.preferences?.plainLanguage ?? true);
  }, [user?.preferences?.plainLanguage]);

  const toggle = async (value: boolean) => {
    setEnabled(value);
    try {
      await updatePreferences({ plainLanguage: value });
    } catch (error) {
      setEnabled(!value);
    }
  };

  return (
    <Switch.Group as="div" className="flex items-center gap-3">
      <Switch.Label className="text-sm font-medium text-slate-600">Plain language labels</Switch.Label>
      <Switch
        checked={enabled}
        onChange={toggle}
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
          enabled ? 'bg-teal' : 'bg-slate-300'
        )}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </Switch>
      <span className="text-xs text-slate-500">{enabled ? 'Plain language' : 'Technical'}</span>
    </Switch.Group>
  );
};
