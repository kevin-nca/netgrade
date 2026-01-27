import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateField } from '@/features/form-fields/date-field';
import type { Mock } from 'vitest';
import { useFieldContext } from '@/shared/components/form';

vi.mock('@/shared/components/form');
vi.mock('@ionic/react', () => ({
  IonInput: (props: {
    value?: string;
    type?: string;
    onIonChange?: (e: { detail: { value: string } }) => void;
  }) => (
    <input
      type={props.type}
      value={props.value}
      onChange={(e) =>
        props.onIonChange?.({ detail: { value: e.target.value } })
      }
    />
  ),
}));
vi.mock('@/shared/components/form-field/form-input.tsx', () => ({
  default: (props: { children: React.ReactNode }) => (
    <div>{props.children}</div>
  ),
}));

describe('DateField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is empty on start', () => {
    const mockField = {
      state: {
        value: '',
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<DateField label="Datum" />);

    const input = screen.getByDisplayValue('') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.type).toBe('date');
  });

  it('should update the date when the user selects a date', () => {
    const mockField = {
      state: {
        value: '',
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<DateField label="Datum" />);

    const input = screen.getByDisplayValue('') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '2025-12-25' } });

    expect(mockField.handleChange).toHaveBeenCalledWith('2025-12-25');
  });
});
