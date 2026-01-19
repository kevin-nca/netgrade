import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AddExamAndGradePayload, GradeService } from '@/services/GradeService';
import { Grade } from '@/db/entities/Grade';
import { examKeys, schoolKeys, subjectKeys } from '@/hooks';
import { Exam } from '@/db/entities';

// Query keys
export const gradeKeys = {
  all: ['grades'] as const,
  lists: () => [...gradeKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...gradeKeys.lists(), { filters }] as const,
  examGrades: (examId: string) => [...gradeKeys.all, 'exam', examId] as const,
  subjectGrades: (subjectId: string) =>
    [...gradeKeys.all, 'subject', subjectId] as const,
};

// Hooks

export const GradesQuery = {
  queryKey: gradeKeys.lists(),
  queryFn: () => GradeService.fetchAll(),
  staleTime: Infinity,
} as const;

export const useGrades = () => {
  return useQuery(GradesQuery);
};

export const useSubjectGrades = (subjectId: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: gradeKeys.subjectGrades(subjectId),
    queryFn: () => GradeService.findBySubjectId(subjectId),
    initialData: () => {
      return queryClient
        .getQueryData<Grade[]>(gradeKeys.lists())
        ?.filter((g) => g.exam?.subjectId === subjectId);
    },
  });
};

export const useAddGradeWithExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddExamAndGradePayload) =>
      GradeService.addWithExam(payload),
    onSuccess: (newGrade) => {
      queryClient.setQueryData(gradeKeys.list({ id: newGrade.id }), newGrade);

      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });

      queryClient.invalidateQueries({
        queryKey: schoolKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: subjectKeys.schoolSubjects(newGrade.exam.subject.schoolId),
      });
    },
  });
};

export const useDeleteGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gradeId: string) => GradeService.delete(gradeId),
    onSuccess: () => {
      // Invalidate and refetch grades list
      queryClient.invalidateQueries({
        queryKey: gradeKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: schoolKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: subjectKeys.all,
      });
    },
  });
};

export const useUpdateExamAndGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      examData,
      gradeData,
    }: {
      examData: Partial<Exam> & { id: string };
      gradeData: Partial<Grade> & { id: string };
    }) => GradeService.updateExamAndGrade(examData, gradeData),
    onSuccess: (updatedGrade) => {
      // Update the grade in the cache
      queryClient.invalidateQueries({
        queryKey: gradeKeys.list({ id: updatedGrade.id }),
      });
      // Invalidate and refetch grades list
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
      // If the grade is associated with an exam, invalidate that query too
      if (updatedGrade.exam?.id) {
        queryClient.invalidateQueries({
          queryKey: gradeKeys.examGrades(updatedGrade.exam.id),
        });
      }
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};
