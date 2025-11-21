import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { ExamNameField } from '@/components/Form2/fields/ExamNameField';
import { GradeScoreField } from '@/components/Form2/fields/GradeScoreField';

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    ExamNameField,
    GradeScoreField,
  },
  formComponents: {},
});

export { useAppForm, withForm };
