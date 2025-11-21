import { createFormHookContexts, createFormHook } from '@tanstack/react-form';
import { ExamNameField } from '@/components/Form2/fields/ExamNameField';
import { SchoolSelectField } from '@/components/Form2/fields/SchoolSelectField';

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    ExamNameField,
    SchoolSelectField,
  },
  formComponents: {},
});

export { useAppForm, withForm };
