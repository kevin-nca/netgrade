import { useFieldContext } from '@/components/Form2/form';
import { IonInput } from '@ionic/react';
import { scaleOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/components/Form2/form-field/FormInput';

interface WeightFieldProps {
  label: string;
}

export function WeightField({ label }: WeightFieldProps) {
  const field = useFieldContext<string>();

  const errors = Array.isArray(field.state.meta.errors)
    ? field.state.meta.errors
    : [];

  const firstError =
    errors.length > 0 ? String(errors[0]?.message ?? errors[0]) : undefined;

  const setPresetWeight = (weight: string) => {
    field.handleChange(weight);
  };

  return (
    <FormInput
      icon={scaleOutline}
      label={label}
      htmlFor="weight"
      required
      error={firstError}
      errorId="weight-error"
    >
      <div className="weight-input-container">
        <IonInput
          id="weight"
          className="form-input weight-input"
          type="text"
          inputmode="decimal"
          min="0"
          max="100"
          step="0.01"
          value={field.state.value ?? ''}
          onIonChange={(e) => {
            const val = e.detail.value ?? '';
            field.handleChange(val);
          }}
          onIonBlur={field.handleBlur}
          placeholder="100"
          aria-invalid={!!firstError}
          aria-describedby={firstError ? 'weight-error' : undefined}
          required
        />
        <div className="weight-quick-actions">
          <button
            type="button"
            className="weight-preset-btn"
            onClick={() => setPresetWeight('25')}
            tabIndex={-1}
          >
            25%
          </button>
          <button
            type="button"
            className="weight-preset-btn"
            onClick={() => setPresetWeight('50')}
            tabIndex={-1}
          >
            50%
          </button>
          <button
            type="button"
            className="weight-preset-btn"
            onClick={() => setPresetWeight('100')}
            tabIndex={-1}
          >
            100%
          </button>
        </div>
      </div>
    </FormInput>
  );
}
