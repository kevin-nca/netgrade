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
  onChange: (value: string | number | boolean) => void;
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
}) => {
  const handleGenericChange = (val: string | null | undefined | string[]) => {
    // Safely handle the case where val might be null, undefined, or string[]
    if (typeof val === 'string') {
      // OK to cast to string -> onChange expects string | number | boolean
      onChange(val);
    }
    // If it's not a string (like string[] or null), handle or ignore as needed
    // For example:
    // else if (Array.isArray(val)) {
    //   onChange(val.join(','));
    // }
  };

  return (
    <IonItem>
      <IonLabel position={type === 'toggle' ? 'stacked' : 'stacked'}>
        {label}
      </IonLabel>

      {type === 'select' ? (
        <IonSelect
          value={value}
          onIonChange={(e) => {
            // e.detail.value can be string | number | undefined | null | string[]
            handleGenericChange(e.detail.value);
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
          // IonDatetime's value should be a string (e.g. "YYYY-MM-DD")
          value={value as string}
          presentation="date"
          onIonChange={(e) => {
            // e.detail.value can be string | string[] | null | undefined
            handleGenericChange(e.detail.value);
          }}
        />
      ) : type === 'toggle' ? (
        <IonToggle
          checked={Boolean(value)}
          onIonChange={(e) => {
            // e.detail.checked is boolean | undefined
            if (typeof e.detail.checked !== 'undefined') {
              onChange(e.detail.checked);
            }
          }}
        />
      ) : (
        <IonInput
          type={type}
          // For a text or number field, ensure we convert the value to string
          // to display in the input.
          value={value !== undefined && value !== null ? value.toString() : ''}
          onIonChange={(e) => {
            // e.detail.value can be string | null | undefined
            handleGenericChange(e.detail.value);
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </IonItem>
  );
};

export default FormField;
