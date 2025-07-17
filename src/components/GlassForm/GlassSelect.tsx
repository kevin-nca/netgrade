import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDown, closeCircle } from 'ionicons/icons';
import { GlassSelectProps } from './types';
import './GlassForm.css';

const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  size = 'medium',
  icon,
  disabled = false,
  required = false,
  error,
  helperText,
  multiple = false,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (multiple) {
      // Handle multiple selection
      const selectedOptions = Array.from(
        e.target.selectedOptions,
        (option) => option.value,
      );
      onChange(selectedOptions);
    } else {
      // Find the option to get the correct type
      const selectedOption = options.find(
        (opt) => String(opt.value) === selectedValue,
      );
      onChange(selectedOption ? selectedOption.value : selectedValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsOpen(false);
  };

  const wrapperClasses = [
    'glass-select-wrapper',
    'glass-input-base',
    size,
    isFocused && 'focused',
    isOpen && 'open',
    error && 'error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const getDisplayValue = (): string => {
    if (value === undefined || value === null || value === '') {
      return '';
    }

    if (multiple && Array.isArray(value)) {
      const selectedLabels = value
        .map((val) => options.find((opt) => opt.value === val)?.label)
        .filter(Boolean);
      return selectedLabels.join(', ');
    }

    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption?.label || String(value);
  };

  return (
    <div className="glass-form-field">
      {label && (
        <label className="glass-form-field-label">
          {label}
          {required && <span className="glass-form-field-required">*</span>}
        </label>
      )}

      <div className={wrapperClasses}>
        <div className="glass-select-container">
          {icon && (
            <div className="glass-input-icon">
              <IonIcon icon={icon} />
            </div>
          )}

          <select
            value={multiple ? undefined : value || ''}
            multiple={multiple}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            className="glass-select-field"
          >
            {!multiple && placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {!multiple && (
            <IonIcon icon={chevronDown} className="glass-select-chevron" />
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

export default GlassSelect;
