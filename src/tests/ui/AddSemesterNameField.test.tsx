import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useFieldContext } from '@/shared/components/form';
import { AddSemesterNameField } from '@/features/add-semester/fields/add-semester-name-field';

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

describe('AddSemesterNameField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ist am Anfang leer', () => {
    const mockField = {
      state: {
        value: '',
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<AddSemesterNameField label="Semestername" />);

    const input = screen.getByPlaceholderText(
      /Name des Semesters/i,
    ) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('ruft handleChange auf wenn der Benutzer tippt', () => {
    const mockField = {
      state: {
        value: '',
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<AddSemesterNameField label="Semestername" />);

    const input = screen.getByPlaceholderText(
      /Name des Semesters/i,
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Wintersemester 2025' } });

    expect(mockField.handleChange).toHaveBeenCalledWith('Wintersemester 2025');
    expect(mockField.handleChange).toHaveBeenCalledTimes(1);
  });

  it('zeigt eine Fehlermeldung wenn Fehler vorhanden sind', () => {
    const mockField = {
      state: {
        value: '',
        meta: { errors: [{ message: 'Name ist erforderlich' }] },
      },
      handleChange: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<AddSemesterNameField label="Semestername" />);

    expect(screen.getByPlaceholderText(/Name des Semesters/i)).toBeDefined();
  });
});
