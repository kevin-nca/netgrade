import React from 'react';
import { IonIcon, IonSelect, IonSelectOption } from '@ionic/react';
import { schoolOutline } from 'ionicons/icons';

interface Option {
  value: string;
  label: string;
}

interface SelectedSchoolFieldProps {
  field: any;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  schoolOptions: Option[];
  handleSchoolChange: (value: string | number | boolean) => void;
}

const SelectedSchoolField: React.FC<SelectedSchoolFieldProps> = ({
  field,
  fieldErrors,
  setFieldErrors,
  schoolOptions,
  handleSchoolChange,
}) => {
  return (
    <div className={`input-row ${fieldErrors.selectedSchoolId ? 'error' : ''}`}>
      <div className="field-icon-wrapper">
        <IonIcon icon={schoolOutline} className="field-icon" />
      </div>
      <div className="field-content">
        <label className="field-label" htmlFor="school-select">
          Schule *
        </label>

        <IonSelect
          id="school-select"
          className="form-input"
          interface="popover"
          placeholder="Schule auswählen"
          value={field.state.value}
          onIonChange={(e) => {
            handleSchoolChange(e.detail.value);
            setFieldErrors((prev) => ({ ...prev, selectedSchoolId: '' }));
          }}
          aria-describedby={
            fieldErrors.selectedSchoolId ? 'school-error' : undefined
          }
        >
          {schoolOptions.map((option) => (
            <IonSelectOption key={option.value} value={option.value}>
              {option.label}
            </IonSelectOption>
          ))}
        </IonSelect>

        <div className="message-area">
          {fieldErrors.selectedSchoolId && (
            <div id="school-error" className="field-error" role="alert">
              {fieldErrors.selectedSchoolId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedSchoolField;
