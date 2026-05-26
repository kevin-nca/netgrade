import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExamService } from '@/services/ExamService';
import { Exam } from '@/db/entities/Exam';

// Query keys
export const examKeys = {
  all: ['exams'] as const,
  lists: () => [...examKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...examKeys.lists(), { filters }] as const,
  upcoming: () => [...examKeys.all, 'upcoming'] as const,
  details: () => [...examKeys.all, 'detail'] as const,
  detail: (id: string) => [...examKeys.details(), id] as const,
  subjectExams: (subjectId: string) =>
    [...examKeys.all, 'subject', subjectId] as const,
};

// Types
export interface AddExamPayload {
  schoolId: string;
  subjectId: string;
  title: string;
  date: Date;
  description?: string;
  weight?: number;
}

// Hooks

export const UpcomingExamsQuery = {
  queryKey: examKeys.upcoming(),
  queryFn: () => ExamService.fetchUpcoming(),
  staleTime: Infinity,
} as const;

export const useUpcomingExams = () => {
  return useQuery(UpcomingExamsQuery);
};

export const createExamDetailQuery = (examId: string) => ({
  queryKey: examKeys.detail(examId),
  queryFn: () => ExamService.findById(examId),
});

export const useExam = (id: string) => {
  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: () => ExamService.findById(id),
    enabled: !!id,
  });
};

export const useSubjectExams = (subjectId: string) => {
  return useQuery({
    queryKey: examKeys.subjectExams(subjectId),
    queryFn: () => ExamService.findBySubjectId(subjectId),
    enabled: !!subjectId,
  });
};

export const useAddExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddExamPayload) => ExamService.add(payload),
    onSuccess: () => {
      // Invalidate exams list
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examData: Partial<Exam> & { id: string }) =>
      ExamService.update(examData),
    onSuccess: () => {
      // Invalidate exams list
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId: string) => ExamService.delete(examId),
    onSuccess: () => {
      // Invalidate exams list
      queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};

export const useTakeExamPhoto = () => {
  return useMutation({
    mutationFn: () => ExamService.takeExamPhoto(),
  });
};

export const useAddExamScans = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      photoPaths,
    }: {
      examId: string;
      photoPaths: string[];
    }) => ExamService.addScans(examId, photoPaths),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: examKeys.all }),
  });
};

export const useDeleteExamScan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scanId: string) => ExamService.deleteScan(scanId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: examKeys.all }),
  });
};

export const usePhotoSrcs = (photoPaths: string[]) => {
  return useQuery({
    queryKey: ['photos', ...photoPaths],
    queryFn: () => ExamService.resolvePhotoSrcs(photoPaths),
    enabled: photoPaths.length > 0,
    staleTime: Infinity,
  });
};
