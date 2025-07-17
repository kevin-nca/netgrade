import React, { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { closeCircle } from 'ionicons/icons';
import { GlassTextareaProps } from './types';
import './GlassForm.css';

const GlassTextarea: React.FC<GlassTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  size = 'medium',
  icon,
  disabled = false,
  required = false,
  error,
  helperText,
  rows = 3,
  maxLength,
  resize = 'vertical',
  autoGrow = false,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoGrow && textareaRef.current) {
      // Reset height to get accurate scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, autoGrow]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Check maxLength constraint
    if (maxLength && newValue.length > maxLength) {
      return;
    }

    onChange(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const wrapperClasses = [
    'glass-textarea-wrapper',
    'glass-input-base',
    size,
    isFocused && 'focused',
    error && 'error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const textareaClasses = ['glass-textarea-field', autoGrow && 'auto-grow']
    .filter(Boolean)
    .join(' ');

  const textareaStyle: React.CSSProperties = {
    resize: autoGrow ? 'none' : resize,
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
        <div className="glass-textarea-container">
          {icon && (
            <div className="glass-input-icon">
              <IonIcon icon={icon} />
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            maxLength={maxLength}
            className={textareaClasses}
            style={textareaStyle}
          />
        </div>
      </div>

      <div className="glass-form-field-footer">
        {maxLength && (
          <div className="glass-form-field-counter">
            {value.length}/{maxLength}
          </div>
        )}
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

export default GlassTextarea;
