import { useFieldContext } from '@/shared/components/form';
import { IonInput } from '@ionic/react';
import React from 'react';
import FormInput from '@/shared/components/form-field/form-input';

interface PointsFieldProps {
  label: string;
  htmlFor: string;
  icon: string;
  placeholder?: string;
}

export function PointsField({
  label,
  htmlFor,
  icon,
  placeholder = 'z.B. 19',
}: PointsFieldProps) {
  const field = useFieldContext<string>();

  const errors = field.state.meta.errors;
  const firstError =
    errors.length > 0
      ? errors.map((err) => String(err?.message ?? err)).join(', ')
      : undefined;

  return (
    <FormInput
      icon={icon}
      label={label}
      htmlFor={htmlFor}
      error={firstError}
      errorId={`${htmlFor}-error`}
    >
      <IonInput
        id={htmlFor}
        className="form-input"
        type="number"
        inputmode="decimal"
        value={field.state.value}
        onIonInput={(e) => field.handleChange(e.detail.value ?? '')}
        onIonBlur={field.handleBlur}
        placeholder={placeholder}
      />
    </FormInput>
  );
}
