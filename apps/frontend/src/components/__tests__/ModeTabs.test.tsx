import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { ModeTabs } from '../ModeTabs';

describe('ModeTabs', () => {
  it('renders all modes and triggers change', () => {
    const handleChange = vi.fn();
    render(<ModeTabs value="FAST_TRACK" onChange={handleChange} allowFacilitator />);

    expect(screen.getByText('Fast Track')).toBeInTheDocument();
    expect(screen.getByText('Guided Path')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Guided Path'));
    expect(handleChange).toHaveBeenCalledWith('GUIDED');
  });
});
