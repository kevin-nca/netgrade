import { GradeScoreField } from '@/components/Form2/fields/GradeScoreField';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { ExamNameField } from '@/components/Form2/fields/ExamNameField';
import { SchoolSelectField } from '@/components/Form2/fields/SchoolSelectField';
import { SubjectSelectField } from '@/components/Form2/fields/SubjectSelectField';
import { DateField } from '@/components/Form2/fields/DateField';

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    ExamNameField,
    GradeScoreField,
    SchoolSelectField,
    SubjectSelectField,
    DateField,
  },
  formComponents: {},
});

export { useAppForm, withForm };
