import React from 'react';
import { GlassFormProps } from './types';
import './GlassForm.css';

const GlassForm: React.FC<GlassFormProps> = ({
  children,
  onSubmit,
  className = '',
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(event);
    }
  };

  const formClasses = ['glass-form', className].filter(Boolean).join(' ');

  return (
    <form className={formClasses} onSubmit={handleSubmit} noValidate>
      {children}
    </form>
  );
};

export default GlassForm;
