import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Mock } from 'vitest';
import { SubjectSelectField } from '@/components/Form2/fields/SubjectSelectField';
import { useFieldContext } from '@/components/Form2/form';
import type { Subject } from '@/db/entities';

vi.mock('@/components/Form2/form');

vi.mock('@ionic/react', () => ({
  IonSelect: (props: {
    value?: string;
    placeholder?: string;
    onIonChange?: (e: { detail: { value: string } }) => void;
    children?: React.ReactNode;
  }) => (
    <select
      value={props.value}
      onChange={(e) =>
        props.onIonChange?.({ detail: { value: e.target.value } })
      }
    >
      {props.children}
    </select>
  ),
  IonSelectOption: (props: { value: string; children: React.ReactNode }) => (
    <option value={props.value}>{props.children}</option>
  ),
}));

vi.mock('@/components/Form2/form-field/FormInput', () => ({
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
        value: '',
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    const onSubjectChange = vi.fn();

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(
      <SubjectSelectField
        label="Fach"
        subjects={mockSubjects}
      />,
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;

    fireEvent.change(select, { target: { value: '2' } });

    expect(mockField.handleChange).toHaveBeenCalledWith('2');
    expect(mockField.handleChange).toHaveBeenCalledTimes(1);

    expect(onSubjectChange).toHaveBeenCalledWith('2');
    expect(onSubjectChange).toHaveBeenCalledTimes(1);
  });

  it('sollte den ausgewählten Wert anzeigen', () => {
    const mockField = {
      state: {
        value: '2',
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(
      <SubjectSelectField
        label="Fach"
        subjects={mockSubjects}
      />,
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });
});
