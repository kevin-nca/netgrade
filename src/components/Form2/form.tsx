import { createFormHookContexts, createFormHook } from '@tanstack/react-form';
import { ExamNameField } from '@/components/Form2/fields/ExamNameField';

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    ExamNameField,
  },
  formComponents: {},
});

export { useAppForm, withForm };
