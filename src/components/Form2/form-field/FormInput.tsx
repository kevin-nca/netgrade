import React from 'react';
import { IonIcon } from '@ionic/react';
import './FormInput.module.css';

interface FormFieldRowProps {
  icon: string;
  label: string;
  htmlFor: string;
  required?: boolean;
  errors: string[];
  errorId?: string;
  children: React.ReactNode;
}

const FormInput: React.FC<FormFieldRowProps> = ({
  icon,
  label,
  htmlFor,
  required = false,
  errors,
  errorId,
  children,
}) => {
  const computedErrorId = errorId || `${htmlFor}-error`;

  return (
    <div className={`input-row ${errors.length > 0 ? 'error' : ''}`}>
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
          {errors?.length > 0 &&
            errors?.map((error, idx) => (
              <div
                key={idx}
                id={computedErrorId}
                className="field-error"
                role="alert"
              >
                {error}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FormInput;
