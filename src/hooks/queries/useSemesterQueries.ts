// Query keys
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SemesterService } from '@/services/SemesterService';
import { Semester } from '@/db/entities/Semester';
import { subjectKeys } from '@/hooks';

export const semesterKeys = {
  all: ['semesters'] as const,
  lists: () => [...semesterKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...semesterKeys.lists(), { filters }] as const,
  current: () => [...semesterKeys.all, 'current'] as const,
};

// Types
export interface AddSemesterPayload {
  name: string;
  startDate: Date;
  endDate: Date;
}

// Hooks
export const SemestersQuery = {
  queryKey: semesterKeys.lists(),
  queryFn: () => SemesterService.fetchAll(),
  staleTime: Infinity,
} as const;

export const useSemesters = () => {
  return useQuery(SemestersQuery);
};

export const useSemester = (id: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: semesterKeys.list({ id }),
    queryFn: () => SemesterService.findById(id),
    initialData: () => {
      return queryClient
        .getQueryData<Semester[]>(semesterKeys.lists())
        ?.find((s) => s.id === id);
    },
    staleTime: Infinity,
    enabled: !!id,
  });
};

export const useAddSemester = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddSemesterPayload) => SemesterService.add(payload),
    onSuccess: (newSemester) => {
      queryClient.setQueryData(
        semesterKeys.list({ id: newSemester.id }),
        newSemester,
      );
      // Invalidate and refetch semesters list
      queryClient.invalidateQueries({ queryKey: semesterKeys.all });
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
};

export const useUpdateSemester = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semesterData: Partial<Semester> & { id: string }) =>
      SemesterService.update(semesterData),
    onSuccess: (updatedSemester) => {
      // Update the specific semester in cache
      queryClient.setQueryData(
        semesterKeys.list({ id: updatedSemester.id }),
        updatedSemester,
      );
      // Invalidate and refetch semesters list
      queryClient.invalidateQueries({ queryKey: semesterKeys.all });
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
};

export const useDeleteSemester = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semesterId: string) => SemesterService.delete(semesterId),
    onSuccess: () => {
      // Invalidate and refetch all semester queries
      queryClient.invalidateQueries({ queryKey: semesterKeys.all });
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
};
