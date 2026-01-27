import { useFieldContext } from '@/shared/components/form';
import { IonInput } from '@ionic/react';
import { ribbonOutline } from 'ionicons/icons';
import React from 'react';
import FormInput from '@/shared/components/form-field/form-input';

interface ScoreFieldProps {
  label: string;
}

export function GradeScoreField({ label }: ScoreFieldProps) {
  const field = useFieldContext<number>();

  const errors = field.state.meta.errors;

  const firstError =
    errors.length > 0
      ? errors.map((err) => String(err?.message ?? err)).join(', ')
      : undefined;

  return (
    <FormInput
      icon={ribbonOutline}
      label={label}
      htmlFor="score"
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
        required // probably not needed here
      />
    </FormInput>
  );
}
