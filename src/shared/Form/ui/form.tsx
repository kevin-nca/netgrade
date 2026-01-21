import { GradeScoreField } from '@/shared/Form/ui/form-fields/GradeScoreField';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { ExamNameField } from '@/shared/Form/ui/form-fields/ExamNameField';
import { SchoolSelectField } from '@/shared/Form/ui/form-fields/SchoolSelectField';
import { SubjectSelectField } from '@/shared/Form/ui/form-fields/SubjectSelectField';
import { DateField } from '@/shared/Form/ui/form-fields/DateField';
import { DescriptionField } from '@/shared/Form/ui/form-fields/DescriptionField';
import { WeightField } from '@/shared/Form/ui/form-fields/WeightField';
import { EditExamNameField } from '@/shared/Form/ui/editExamFields/EditExamNameField';
import { EditExamSubjectSelectField } from '@/shared/Form/ui/editExamFields/EditExamSubjectSelectField';

import { AddSchoolField } from '@/shared/Form/ui/form-fields/AddSchoolField';
import { EditSubjectField } from '@/shared/Form/ui/form-fields/EditSubjectField';
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
