import React from 'react';
import FormField from '../FormField';
import { validateSubjectName } from '../validations';
import { BaseFormElementProps } from '../types';

type SubjectNameProps = BaseFormElementProps;

export const SubjectName = ({
  form,
  fieldName = 'subjectName',
  placeholder = 'Fachname eingeben',
  label = 'Fach',
  disabled = false,
}: SubjectNameProps) => {
  return (
    <form.Field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name={fieldName as any}
      validators={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange: ({ value }: any) => validateSubjectName(String(value)),
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
