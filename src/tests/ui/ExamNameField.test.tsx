import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamNameField } from '@/components/Form2/fields/ExamNameField';
import type { Mock } from 'vitest';
import { useFieldContext } from '@/components/Form2/form';

vi.mock('@/components/Form2/form');
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
vi.mock('@/components/Form2/FormFieldRow', () => ({
  default: (props: { children: React.ReactNode }) => (
    <div>{props.children}</div>
  ),
}));

describe('ExamNameField', () => {
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

    render(<ExamNameField label="Prüfungsname" />);

    const input = screen.getByPlaceholderText(
      /z.B. Mathe-Klausur/i,
    ) as HTMLInputElement;
    expect(input.value).toBe('');
  });
  it('should update the title when the user types', () => {
    const mockField = {
      state: {
        value: '',
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<ExamNameField label="Prüfungsname" />);

    const input = screen.getByPlaceholderText(
      /z.B. Mathe-Klausur/i,
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Deutsch Test' } });

    expect(mockField.handleChange).toHaveBeenCalledWith('Deutsch Test');
  });
});
