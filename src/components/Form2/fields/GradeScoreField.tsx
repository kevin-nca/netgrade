import { useFieldContext } from '@/components/Form2/form';
import { IonInput } from '@ionic/react';
import { ribbonOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/components/Form2/form-field/FormInput';

interface ScoreFieldProps {
  label: string;
}

export function GradeScoreField({ label }: ScoreFieldProps) {
  const field = useFieldContext<number>();

  const errors = Array.isArray(field.state.meta.errors)
    ? field.state.meta.errors
    : [];

  const firstError =
    errors.length > 0 ? String(errors[0]?.message ?? errors[0]) : undefined;

  return (
    <FormInput
      icon={ribbonOutline}
      label={label}
      htmlFor="score"
      required // probably not needed here
      error={firstError}
      errorId="score-error"
    >
      <IonInput
        id="score"
        className="form-input"
        type="text"
        inputmode="decimal"
        min="1"
        max="6"
        step="0.01"
        value={field.state.value}
        onIonChange={(e) => {
          const val = e.detail.value;
          const numVal = parseFloat(val || '0'); // this should be a number?
          field.handleChange(numVal);
        }}
        onIonBlur={field.handleBlur}
        placeholder="6.0"
        aria-invalid={!!field.state.meta.errors}
        aria-describedby={field.state.meta.errors ? 'score-error' : undefined}
        required // probably not needed here
      />
    </FormInput>
  );
}
