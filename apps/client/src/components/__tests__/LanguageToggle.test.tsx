import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useSettingsStore } from '../../store/settingsStore';

describe('LanguageToggle', () => {
  it('updates store when toggled', () => {
    const { unmount } = render(<LanguageToggle />);
    const select = screen.getByLabelText(/plain language/i) as HTMLSelectElement;
    expect(select.value).toBe('plain');
    fireEvent.change(select, { target: { value: 'technical' } });
    expect(useSettingsStore.getState().languageMode).toBe('technical');
    unmount();
    useSettingsStore.setState({ languageMode: 'plain' });
  });
});
