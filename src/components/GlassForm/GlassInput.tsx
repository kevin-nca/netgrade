import React, { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { closeCircle } from 'ionicons/icons';
import { GlassInputProps } from './types';
import './GlassForm.css';

const GlassInput: React.FC<GlassInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  variant = 'text',
  size = 'medium',
  icon,
  iconPosition = 'start',
  disabled = false,
  required = false,
  error,
  helperText,
  clearable = false,
  autoFocus = false,
  maxLength,
  min,
  max,
  step,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showClearButton, setShowClearButton] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const hasValue = value !== undefined && value !== null && value !== '';
    setShowClearButton(clearable && hasValue && !disabled);
  }, [value, clearable, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (variant === 'number') {
      const numericValue = parseFloat(newValue);
      onChange(isNaN(numericValue) ? '' : numericValue);
    } else {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const wrapperClasses = [
    'glass-input-wrapper',
    'glass-input-base',
    size,
    isFocused && 'focused',
    error && 'error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    ref: inputRef,
    type: variant,
    value: value || '',
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder,
    disabled,
    required,
    maxLength,
    className: 'glass-input-field',
  };

  // Add numeric constraints for number inputs
  if (variant === 'number') {
    if (min !== undefined) inputProps.min = min;
    if (max !== undefined) inputProps.max = max;
    if (step !== undefined) inputProps.step = step;
  }

  return (
    <div className="glass-form-field">
      {label && (
        <label className="glass-form-field-label">
          {label}
          {required && <span className="glass-form-field-required">*</span>}
        </label>
      )}

      <div className={wrapperClasses}>
        <div className="glass-input-container">
          {icon && iconPosition === 'start' && (
            <div className="glass-input-icon">
              <IonIcon icon={icon} />
            </div>
          )}

          <input {...inputProps} />

          {showClearButton && (
            <button
              type="button"
              className="glass-input-clear"
              onClick={handleClear}
              aria-label="Clear input"
            >
              <IonIcon icon={closeCircle} />
            </button>
          )}

          {icon && iconPosition === 'end' && !showClearButton && (
            <div className="glass-input-icon">
              <IonIcon icon={icon} />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="glass-form-field-error">
          <IonIcon icon={closeCircle} />
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="glass-form-field-helper">{helperText}</p>
      )}
    </div>
  );
};

export default GlassInput;
