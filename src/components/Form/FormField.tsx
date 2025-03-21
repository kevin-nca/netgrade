import {
  IonDatetime,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonToggle,
} from '@ionic/react';
import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormFieldProps {
  label?: string;
  value: string | number | boolean;
  onChange: (value: any) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'date' | 'toggle' | 'select';
  options?: SelectOption[];
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  options = [],
  disabled = false,
}) => (
  <IonItem>
    <IonLabel position={type === 'toggle' ? 'stacked' : 'stacked'}>
      {label}
    </IonLabel>

    {type === 'select' ? (
      <IonSelect
        value={value}
        onIonChange={(e) => {
          if (e.detail && e.detail.value !== undefined) {
            onChange(e.detail.value);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
      >
        {options.length > 0 ? (
          options.map((option) => (
            <IonSelectOption key={option.value} value={option.value}>
              {option.label}
            </IonSelectOption>
          ))
        ) : (
          <IonSelectOption disabled>Keine Optionen verfügbar</IonSelectOption>
        )}
      </IonSelect>
    ) : type === 'date' ? (
      <IonDatetime
        value={value as string}
        presentation="date"
        onIonChange={(e) => {
          if (e.detail && e.detail.value !== undefined) {
            onChange(e.detail.value);
          }
        }}
      />
    ) : type === 'toggle' ? (
      <IonToggle
        checked={Boolean(value)}
        onIonChange={(e) => {
          if (e.detail && e.detail.checked !== undefined) {
            onChange(e.detail.checked);
          }
        }}
      />
    ) : (
      <IonInput
        type={type}
        value={value !== undefined && value !== null ? value.toString() : ''}
        onIonChange={(e) => {
          if (e.detail && e.detail.value !== undefined) {
            onChange(e.detail.value);
          }
        }}
        placeholder={placeholder}
      />
    )}
  </IonItem>
);

export default FormField;
