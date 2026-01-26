import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Mock } from 'vitest';
import { SubjectSelectField } from '@/features/add-subject/fields/subject-select-field';
import { useFieldContext } from '@/shared/components/form';
import type { Subject } from '@/db/entities';

vi.mock('@/shared/components/form');

vi.mock('@ionic/react', () => ({
  IonSelect: (props: {
    value?: string;
    placeholder?: string;
    onIonChange?: (e: { detail: { value: string } }) => void;
    disabled?: boolean;
    children?: React.ReactNode;
  }) => (
    <select
      value={props.value}
      onChange={(e) =>
        props.onIonChange?.({ detail: { value: e.target.value } })
      }
      disabled={props.disabled}
    >
      {props.children}
    </select>
  ),
  IonSelectOption: (props: { value: string; children: React.ReactNode }) => (
    <option value={props.value}>{props.children}</option>
  ),
}));

vi.mock('@/shared/components/form-field/form-input.tsx', () => ({
  default: (props: { children: React.ReactNode }) => (
    <div>{props.children}</div>
  ),
}));

describe('SubjectSelectField', () => {
  const mockSubjects: Subject[] = [
    { id: '1', name: 'Mathematik' } as Subject,
    { id: '2', name: 'Deutsch' } as Subject,
    { id: '3', name: 'Englisch' } as Subject,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sollte ein Fach auswählen und speichern können', () => {
    const mockField = {
      state: {
        value: null,
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<SubjectSelectField label="Fach" subjects={mockSubjects} />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;

    fireEvent.change(select, { target: { value: '2' } });

    // handleChange wird mit dem ganzen Subject-Objekt aufgerufen
    expect(mockField.handleChange).toHaveBeenCalledWith({
      id: '2',
      name: 'Deutsch',
    });
    expect(mockField.handleChange).toHaveBeenCalledTimes(1);
  });

  it('sollte den ausgewählten Wert anzeigen', () => {
    const mockField = {
      state: {
        value: { id: '2', name: 'Deutsch' } as Subject,
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<SubjectSelectField label="Fach" subjects={mockSubjects} />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    // Der Wert im Select ist die ID (field.state.value?.id)
    expect(select.value).toBe('2');
  });
});
