import React from 'react';
import FormField from '../FormField';
import { validateSchoolName } from '../validations';
import { BaseFormElementProps } from '../types';

type SchoolNameProps = BaseFormElementProps;

export const SchoolName = ({
  form,
  fieldName = 'schoolName',
  placeholder = 'Schulname eingeben',
  label = 'Schule',
  disabled = false,
}: SchoolNameProps) => {
  return (
    <form.Field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name={fieldName as any}
      validators={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange: ({ value }: any) => validateSchoolName(String(value)),
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(field: any) => (
        <FormField
          label={label}
          value={String(field.state.value || '')}
          onChange={(value) => field.handleChange(String(value))}
          placeholder={placeholder}
          type="text"
          disabled={disabled}
        />
      )}
    </form.Field>
  );
};
