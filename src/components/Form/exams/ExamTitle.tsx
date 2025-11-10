import React from 'react';
import { IonIcon, IonInput } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';

interface TitleFieldProps {
  field: any;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const TitleField: React.FC<TitleFieldProps> = ({ field, fieldErrors, setFieldErrors }) => {
  return (
    <div className={`input-row ${fieldErrors.title ? 'error' : ''}`}>
      <div className="field-icon-wrapper">
        <IonIcon icon={documentTextOutline} className="field-icon" />
      </div>
      <div className="field-content">
        <label className="field-label" htmlFor="exam-title">
          Titel *
        </label>
        <IonInput
          id="exam-title"
          className="form-input"
          type="text"
          value={field.state.value}
          onIonChange={(e) => {
            const val = e.detail.value ?? '';
            field.handleChange(val);
            setFieldErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder="z.B. Mathe-Klausur, Vokabeltest"
          aria-describedby={fieldErrors.title ? 'title-error' : undefined}
          required
        />
        <div className="message-area">
          {fieldErrors.title && (
            <div id="title-error" className="field-error" role="alert">
              {fieldErrors.title}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TitleField;
