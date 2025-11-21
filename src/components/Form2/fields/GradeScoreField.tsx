import { useFieldContext } from '@/components/Form2/form';
import { IonInput } from '@ionic/react';
import { ribbonOutline } from 'ionicons/icons';
import React from 'react';
import FormFieldRow from '@/components/Form2/FormFieldRow';

interface ScoreFieldProps {
  label: string;
  fieldErrors: Record<string, string>;
  validateField: (fieldName: string, value: string | number) => void;
}

export function GradeScoreField({
  label,
  fieldErrors,
  validateField,
}: ScoreFieldProps) {
  const field = useFieldContext<string>();

  const handleScoreInput = (e: CustomEvent) => {
    const value = e.detail.value ?? '';
    field.handleChange(value);
    validateField('score', value);
  };

  const error = fieldErrors.score;

  return (
    <FormFieldRow
      icon={ribbonOutline}
      label={label}
      htmlFor="score"
      required
      error={error}
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
        value={String(field.state.value ?? '')}
        onIonInput={handleScoreInput}
        onIonBlur={field.handleBlur}
        placeholder="6.0"
        aria-describedby={error ? 'score-error' : undefined}
        required
      />
    </FormFieldRow>
  );
}
