import React from 'react';
import { IonIcon } from '@ionic/react';

interface FormFieldRowProps {
  icon: string;
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}

const FormInput: React.FC<FormFieldRowProps> = ({
  icon,
  label,
  htmlFor,
  required = false,
  error,
  errorId,
  children,
}) => {
  const computedErrorId = errorId || `${htmlFor}-error`;

  return (
    <div className={`input-row ${error ? 'error' : ''}`}>
      <div className="field-icon-wrapper">
        <IonIcon icon={icon} className="field-icon" />
      </div>
      <div className="field-content">
        <label className="field-label" htmlFor={htmlFor}>
          {label}
          {required && ' *'}
        </label>

        {children}

        <div className="message-area">
          {error && (
            <div id={computedErrorId} className="field-error" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormInput;
