import { vi } from 'vitest';

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
