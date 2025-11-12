import { useFieldContext } from '@/components/Form2/form';
import { IonIcon, IonInput } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import React from 'react';

export function ExamNameField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = Array.isArray(field.state.meta.errors)
    ? field.state.meta.errors
    : [];

  const firstError =
    errors.length > 0 ? String(errors[0]?.message ?? errors[0]) : undefined;

  return (
    <div className={`input-row ${firstError ? 'error' : ''}`}>
      <div className="field-icon-wrapper">
        <IonIcon icon={documentTextOutline} className="field-icon" />
      </div>
      <div className="field-content">
        <label className="field-label" htmlFor="exam-title">
          {label}
        </label>
        <IonInput
          id="exam-title"
          className="form-input"
          type="text"
          value={field.state.value}
          onIonChange={(e) => {
            const val = e.detail.value ?? '';
            field.handleChange(val);
          }}
          placeholder="z.B. Mathe-Klausur, Vokabeltest"
          aria-invalid={!!firstError}
          aria-describedby={firstError ? 'title-error' : undefined}
          required
          maxlength={255}
        />
        <div className="message-area">
          {firstError && (
            <div id="title-error" className="field-error" role="alert">
              {firstError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
