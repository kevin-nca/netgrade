import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { calendarOutline, closeCircle } from 'ionicons/icons';
import { GlassDatePickerProps } from './types';
import './GlassForm.css';

const GlassDatePicker: React.FC<GlassDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder,
  size = 'medium',
  icon = calendarOutline,
  disabled = false,
  required = false,
  error,
  helperText,
  min,
  max,
  format = 'date',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const formatDateValue = (val: string | Date | undefined): string => {
    if (!val) return '';

    if (val instanceof Date) {
      if (format === 'date') {
        return val.toISOString().split('T')[0];
      } else if (format === 'datetime-local') {
        return val.toISOString().slice(0, 16);
      } else if (format === 'time') {
        return val.toTimeString().slice(0, 5);
      }
    }

    return String(val);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (!newValue) {
      onChange('');
      return;
    }

    // Return the value as a Date object or string based on preference
    if (format === 'date' || format === 'datetime-local') {
      const dateValue = new Date(newValue);
      if (!isNaN(dateValue.getTime())) {
        onChange(dateValue);
      } else {
        onChange(newValue);
      }
    } else {
      onChange(newValue);
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

  const inputType = format === 'datetime-local' ? 'datetime-local' : format;

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
          {icon && (
            <div className="glass-input-icon">
              <IonIcon icon={icon} />
            </div>
          )}

          <input
            type={inputType}
            value={formatDateValue(value)}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            min={min}
            max={max}
            className="glass-input-field"
          />
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

export default GlassDatePicker;
