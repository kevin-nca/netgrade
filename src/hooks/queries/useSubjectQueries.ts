import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubjectService } from '@/services/SubjectService';
import { Subject } from '@/db/entities/Subject';

// Query keys
export const subjectKeys = {
  all: ['subjects'] as const,
  lists: () => [...subjectKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...subjectKeys.lists(), { filters }] as const,
  details: () => [...subjectKeys.all, 'detail'] as const,
  detail: (id: string) => [...subjectKeys.details(), id] as const,
  schoolSubjects: (schoolId: string) =>
    [...subjectKeys.all, 'school', schoolId] as const,
};

// Types
export interface AddSubjectPayload {
  name: string;
  schoolId: string;
  teacher?: string | null;
  description?: string | null;
  weight?: number;
}

// Hooks
export const useSubjects = () => {
  return useQuery({
    queryKey: subjectKeys.lists(),
    queryFn: () => SubjectService.fetchAll(),
    staleTime: Infinity,
  });
};

export const useSchoolSubjects = (schoolId: string) => {
  return useQuery({
    queryKey: subjectKeys.schoolSubjects(schoolId),
    queryFn: () => SubjectService.findBySchoolId(schoolId),
    enabled: !!schoolId,
  });
};

export const useAddSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddSubjectPayload) => SubjectService.add(payload),
    onSuccess: (newSubject) => {
      // Invalidate and refetch subjects list
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
      // Invalidate and refetch school subjects
      if (newSubject.schoolId) {
        queryClient.invalidateQueries({
          queryKey: subjectKeys.schoolSubjects(newSubject.schoolId),
        });
      }
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subjectData: Partial<Subject> & { id: string }) =>
      SubjectService.update(subjectData),
    onSuccess: (updatedSubject) => {
      // Update the subject in the cache
      queryClient.invalidateQueries({
        queryKey: subjectKeys.detail(updatedSubject.id),
      });
      // Invalidate and refetch subjects list
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
      // Invalidate and refetch school subjects
      if (updatedSubject.schoolId) {
        queryClient.invalidateQueries({
          queryKey: subjectKeys.schoolSubjects(updatedSubject.schoolId),
        });
      }
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subjectId: string) => SubjectService.delete(subjectId),
    onSuccess: (deletedSubjectId) => {
      // Remove the subject from the cache
      queryClient.removeQueries({
        queryKey: subjectKeys.detail(deletedSubjectId),
      });
      // Invalidate and refetch subjects list
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
    },
  });
};
