import { GradeScoreField } from '@/features/add-grade/fields/GradeScoreField';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { ExamNameField } from '@/features/add-exam/fields/ExamNameField';
import { SchoolSelectField } from '@/features/add-school/fields/SchoolSelectField';
import { SubjectSelectField } from '@/features/add-subject/fields/SubjectSelectField';
import { DateField } from '@/features/form-fields/DateField';
import { DescriptionField } from '@/features/form-fields/DescriptionField';
import { WeightField } from '@/features/add-grade/fields/WeightField';
import { EditExamNameField } from '@/features/edit-exam/fields/EditExamNameField';
import { EditExamSubjectSelectField } from '@/features/edit-exam/fields/EditExamSubjectSelectField';

import { AddSchoolField } from '@/features/add-school/fields/AddSchoolField';
import { EditSubjectField } from '@/features/edit-subject/fields/EditSubjectField';
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
    EditExamNameField,
    EditExamSubjectSelectField,
    AddSchoolField,
    EditSubjectField,
  },
  formComponents: {},
});

export { useAppForm, withForm };
