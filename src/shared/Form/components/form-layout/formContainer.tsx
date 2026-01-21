import React from 'react';
import './formLayout.css';

interface FormContainerProps {
  children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  return (
    <div className="form-group">
      <div className="form-card">
        <div className="form-fields">{children}</div>
      </div>
    </div>
  );
};

export default FormContainer;
