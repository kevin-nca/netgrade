import { useFieldContext } from '@/components/Form2/form';
import { IonInput } from '@ionic/react';
import { ribbonOutline } from 'ionicons/icons';
import React, { useCallback } from 'react';
import FormInput from '@/components/Form2/form-field/FormInput';
import { validateGrade } from '@/utils/validation';

interface ScoreFieldProps {
  label: string;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function GradeScoreField({
  label,
  fieldErrors,
  setFieldErrors,
}: ScoreFieldProps) {
  const field = useFieldContext<string>();

  const validateScore = useCallback(
    (value: string | number) => {
      setTimeout(() => {
        let error = '';
        let suggestion = '';

        const stringValue = String(value);
        const scoreNum = Number(value);

        if (stringValue.endsWith('.') || stringValue === '') {
          error = '';
          suggestion = '';
        } else if (isNaN(scoreNum)) {
          error = 'Bitte eine gültige Zahl eingeben.';
          suggestion = '';
        } else {
          error = validateGrade(scoreNum) || '';
          if (!error && scoreNum > 0) {
            if (scoreNum >= 5.5)
              suggestion = '💡 Ausgezeichnet! Eine sehr gute Note.';
            else if (scoreNum >= 4.5) suggestion = '✨ Gute Leistung!';
            else if (scoreNum >= 3.5) suggestion = '👍 Solide Note.';
            else if (scoreNum >= 2.5)
              suggestion = '📚 Noch Verbesserungspotential.';
            else suggestion = '🎯 Beim nächsten Mal wird es besser!';
          }
        }

        setFieldErrors((prev) => ({
          ...prev,
          score: error,
          score_suggestion: suggestion,
        }));
      }, 300);
    },
    [setFieldErrors],
  );

  const handleScoreInput = (e: CustomEvent) => {
    const value = e.detail.value ?? '';
    field.handleChange(value);
    validateScore(value);
  };

  const error = fieldErrors.score;

  return (
    <FormInput
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
        value={field.state.value ?? ''}
        onIonInput={handleScoreInput}
        onIonBlur={field.handleBlur}
        placeholder="6.0"
        aria-invalid={!!error}
        aria-describedby={error ? 'score-error' : undefined}
        required
      />
    </FormInput>
  );
}
