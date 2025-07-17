import { ReactNode } from 'react';

export type GlassInputVariant =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url';
export type GlassInputSize = 'small' | 'medium' | 'large';
export type GlassButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type GlassButtonSize = 'small' | 'medium' | 'large';

export interface GlassInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  variant?: GlassInputVariant;
  size?: GlassInputSize;
  icon?: string;
  iconPosition?: 'start' | 'end';
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  clearable?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export interface GlassSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface GlassSelectProps {
  label?: string;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  options: GlassSelectOption[];
  placeholder?: string;
  size?: GlassInputSize;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  multiple?: boolean;
  searchable?: boolean;
  className?: string;
}

export interface GlassTextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: GlassInputSize;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  rows?: number;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autoGrow?: boolean;
  className?: string;
}

export interface GlassDatePickerProps {
  label?: string;
  value: string | Date | undefined;
  onChange: (value: string | Date) => void;
  placeholder?: string;
  size?: GlassInputSize;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  min?: string;
  max?: string;
  format?: 'date' | 'datetime-local' | 'time';
  className?: string;
}

export interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  icon?: string;
  iconPosition?: 'start' | 'end';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface GlassFormSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  className?: string;
}

export interface GlassFormProps {
  children: ReactNode;
  onSubmit?: (event: React.FormEvent) => void;
  className?: string;
}
