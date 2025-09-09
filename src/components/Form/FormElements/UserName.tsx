import React from 'react';
import FormField from '../FormField';
import { validateUserName } from '../validations';
import { BaseFormElementProps } from '../types';

type UserNameProps = BaseFormElementProps;

export const UserName = ({
  form,
  fieldName = 'userName',
  placeholder = 'Dein Name...',
  label = 'Name',
  disabled = false,
}: UserNameProps) => {
  return (
    <form.Field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name={fieldName as any}
      validators={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange: ({ value }: any) => validateUserName(String(value)),
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
