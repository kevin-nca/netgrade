import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DescriptionField } from '@/features/form-fields/DescriptionField';
import type { Mock } from 'vitest';
import { useFieldContext } from '@/shared/components/form';

vi.mock('@/shared/components/form');
vi.mock('@ionic/react', () => ({
  IonInput: (props: {
    value?: string;
    placeholder?: string;
    onIonChange?: (e: { detail: { value: string } }) => void;
  }) => (
    <input
      value={props.value}
      placeholder={props.placeholder}
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

describe('DescriptionField', () => {
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

    render(<DescriptionField label="Beschreibung" />);

    const input = screen.getByPlaceholderText(
      /Zusätzliche Notizen.../i,
    ) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should update the description when the user types', () => {
    const mockField = {
      state: {
        value: '',
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<DescriptionField label="Beschreibung" />);

    const input = screen.getByPlaceholderText(
      /Zusätzliche Notizen.../i,
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Wichtige Prüfung' } });

    expect(mockField.handleChange).toHaveBeenCalledWith('Wichtige Prüfung');
  });
});
