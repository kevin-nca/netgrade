import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useFieldContext } from '@/shared/Form/ui/form';
import { ExamNameField } from '../../shared/Form/ui/form-fields/ExamNameField';

vi.mock('@/shared/Form/ui/form');
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
vi.mock('@/shared/Form/ui/form-field/FormInput.tsx', () => ({
  default: (props: { children: React.ReactNode }) => (
    <div>{props.children}</div>
  ),
}));

describe('EditExamNameField', () => {
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
