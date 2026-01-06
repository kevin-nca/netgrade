import { vi } from 'vitest';

vi.mock('@/components/Form2/form');
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
vi.mock('@/components/Form2/form-field/FormInput', () => ({
  default: (props: { children: React.ReactNode }) => (
    <div>{props.children}</div>
  ),
}));
