import { GradeScoreField } from '@/components/Form2/fields/GradeScoreField';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { ExamNameField } from '@/components/Form2/fields/ExamNameField';
import { SchoolSelectField } from '@/components/Form2/fields/SchoolSelectField';
import { SubjectSelectField } from '@/components/Form2/fields/SubjectSelectField';
import { DateField } from '@/components/Form2/fields/DateField';
import { DescriptionField } from '@/components/Form2/fields/DescriptionField';
import { WeightField } from '@/components/Form2/fields/WeightField';
import { EditSubjectField } from '@/components/Form2/fields/EditSubjectField';
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
    DescriptionField,
    WeightField,
    EditSubjectField,
  },
  formComponents: {},
});

export { useAppForm, withForm };
