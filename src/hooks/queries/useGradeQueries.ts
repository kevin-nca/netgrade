import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GradeService, AddExamAndGradePayload } from '@/services/GradeService';
import { Grade } from '@/db/entities/Grade';

// Query keys
export const gradeKeys = {
  all: ['grades'] as const,
  lists: () => [...gradeKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...gradeKeys.lists(), { filters }] as const,
  details: () => [...gradeKeys.all, 'detail'] as const,
  detail: (id: string) => [...gradeKeys.details(), id] as const,
  examGrades: (examId: string) => [...gradeKeys.all, 'exam', examId] as const,
};

// Hooks
export const useGrades = () => {
  return useQuery({
    queryKey: gradeKeys.lists(),
    queryFn: () => GradeService.fetchAll(),
  });
};

export const useGrade = (id: string) => {
  return useQuery({
    queryKey: gradeKeys.detail(id),
    queryFn: () => GradeService.findById(id),
    enabled: !!id,
  });
};

export const useExamGrades = (examId: string) => {
  return useQuery({
    queryKey: gradeKeys.examGrades(examId),
    queryFn: () => GradeService.findByExamId(examId),
    enabled: !!examId,
  });
};

export const useAddGradeWithExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddExamAndGradePayload) =>
      GradeService.addWithExam(payload),
    onSuccess: () => {
      // Invalidate and refetch grades list
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
    },
  });
};

export const useUpdateGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gradeData: Partial<Grade> & { id: string }) =>
      GradeService.update(gradeData),
    onSuccess: (updatedGrade) => {
      // Update the grade in the cache
      queryClient.invalidateQueries({
        queryKey: gradeKeys.detail(updatedGrade.id),
      });
      // Invalidate and refetch grades list
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
      // If the grade is associated with an exam, invalidate that query too
      if (updatedGrade.exam?.id) {
        queryClient.invalidateQueries({
          queryKey: gradeKeys.examGrades(updatedGrade.exam.id),
        });
      }
    },
  });
};

export const useDeleteGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gradeId: string) => GradeService.delete(gradeId),
    onSuccess: (deletedGradeId) => {
      // Remove the grade from the cache
      queryClient.removeQueries({ queryKey: gradeKeys.detail(deletedGradeId) });
      // Invalidate and refetch grades list
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
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
      examData: Partial<import('@/db/entities').Exam> & { id: string };
      gradeData: Partial<Grade> & { id: string };
    }) => GradeService.updateExamAndGrade(examData, gradeData),
    onSuccess: (updatedGrade) => {
      // Update the grade in the cache
      queryClient.invalidateQueries({
        queryKey: gradeKeys.detail(updatedGrade.id),
      });
      // Invalidate and refetch grades list
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
      // If the grade is associated with an exam, invalidate that query too
      if (updatedGrade.exam?.id) {
        queryClient.invalidateQueries({
          queryKey: gradeKeys.examGrades(updatedGrade.exam.id),
        });
      }
      // Also invalidate exam queries
      queryClient.invalidateQueries({
        queryKey: ['exams'],
      });
    },
  });
};
