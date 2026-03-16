import { GradeScoreField } from '@/features/add-grade/fields/grade-score-field';
import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { ExamNameField } from '@/features/add-exam/fields/exam-name-field';
import { SchoolSelectField } from '@/features/add-school/fields/school-select-field';
import { SubjectSelectField } from '@/features/add-subject/fields/subject-select-field';
import { DateField } from '@/features/form-fields/date-field';
import { DescriptionField } from '@/features/form-fields/description-field';
import { WeightField } from '@/features/add-grade/fields/weight-field';
import { EditExamNameField } from '@/features/edit-exam/fields/edit-exam-name-field';
import { EditExamSubjectSelectField } from '@/features/edit-exam/fields/edit-exam-subject-select-field';
import { AddSchoolField } from '@/features/add-school/fields/add-school-field';
import { EditSubjectField } from '@/features/edit-subject/fields/edit-subject-field';
import { NameField } from '@/features/form-fields/name-field';
import { SchoolTypeField } from '@/features/add-school/fields/school-type-field';
import { TeacherField } from '@/features/form-fields/teacher-field';

import { AddSemesterNameField } from '@/features/add-semester/fields/add-semester-name-field';
import { SubjectNameField } from '@/features/add-subject/fields/subject-name-field';
import { OnboardingNameField } from '@/pages/onboarding/fields/onboarding-name-field';
import { OnboardingSchoolNameField } from '@/pages/onboarding/fields/onboarding-school-name-field';
import { OnboardingSchoolTypeField } from '@/pages/onboarding/fields/onboarding-school-type-field';
import { OnboardingTeacherField } from '@/pages/onboarding/fields/onboarding-teacher-field';
import { OnboardingSubjectNameField } from '@/pages/onboarding/fields/onboarding-subject-name-field';
import { OnboardingDateField } from '@/pages/onboarding/fields/onboarding-date-field';
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
    NameField,
    SchoolTypeField,
    TeacherField,
    AddSemesterNameField,
    SubjectNameField,
    OnboardingNameField,
    OnboardingSchoolNameField,
    OnboardingSchoolTypeField,
    OnboardingTeacherField,
    OnboardingSubjectNameField,
    OnboardingDateField,
  },
  formComponents: {},
});

export { useAppForm, withForm };
