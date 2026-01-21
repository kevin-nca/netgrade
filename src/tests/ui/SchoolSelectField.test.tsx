import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Mock } from 'vitest';
import { SchoolSelectField } from '@/shared/Form/ui/form-fields/SchoolSelectField';
import { useFieldContext } from '@/shared/Form/ui/form';
import type { School } from '@/db/entities';

vi.mock('@/shared/Form/ui/form');

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

vi.mock('@/shared/Form/ui/form-field/FormInput.tsx', () => ({
  default: (props: { children: React.ReactNode }) => (
    <div>{props.children}</div>
  ),
}));

describe('SchoolSelectField', () => {
  const mockSchools: School[] = [
    { id: '1', name: 'Gymnasium München' } as School,
    { id: '2', name: 'Realschule Berlin' } as School,
    { id: '3', name: 'Gesamtschule Hamburg' } as School,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sollte eine Schule auswählen und speichern können', () => {
    const mockField = {
      state: {
        value: null,
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    const onSchoolChange = vi.fn();

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(
      <SchoolSelectField
        label="Schule"
        schools={mockSchools}
        onSchoolChange={onSchoolChange}
      />,
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;

    fireEvent.change(select, { target: { value: '2' } });

    // handleChange wird mit dem ganzen School-Objekt aufgerufen
    expect(mockField.handleChange).toHaveBeenCalledWith({
      id: '2',
      name: 'Realschule Berlin',
    });
    expect(mockField.handleChange).toHaveBeenCalledTimes(1);

    // onSchoolChange wird mit der ID aufgerufen
    expect(onSchoolChange).toHaveBeenCalledWith('2');
    expect(onSchoolChange).toHaveBeenCalledTimes(1);
  });

  it('sollte den ausgewählten Wert anzeigen', () => {
    const mockField = {
      state: {
        value: { id: '2', name: 'Realschule Berlin' } as School,
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(
      <SchoolSelectField
        label="Schule"
        schools={mockSchools}
        onSchoolChange={vi.fn()}
      />,
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });
});
