import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SubjectService } from '@/services/SubjectService';
import { Subject } from '@/db/entities/Subject';

// Query keys
export const subjectKeys = {
  all: ['subjects'] as const,
  lists: () => [...subjectKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...subjectKeys.lists(), { filters }] as const,
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
export const SubjectsQuery = {
  queryKey: subjectKeys.lists(),
  queryFn: () => SubjectService.fetchAll(),
  staleTime: Infinity,
} as const;

export const useSubjects = () => {
  return useQuery(SubjectsQuery);
};

export const useSubject = (id: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: subjectKeys.list({ id }),
    queryFn: () => SubjectService.findById(id),
    initialData: () => {
      return queryClient
        .getQueryData<Subject[]>(subjectKeys.lists())
        ?.find((s) => s.id === id);
    },
    staleTime: Infinity,
    enabled: !!id,
  });
};

export const useSchoolSubjects = (schoolId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: subjectKeys.schoolSubjects(schoolId),
    queryFn: () => SubjectService.findBySchoolId(schoolId),
    initialData: () => {
      return queryClient
        .getQueryData<Subject[]>(subjectKeys.lists())
        ?.filter((s) => s.schoolId === schoolId);
    },
    enabled: !!schoolId,
  });
};

export const useAddSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddSubjectPayload) => SubjectService.add(payload),
    onSuccess: (newSubject) => {
      queryClient.setQueryData(
        subjectKeys.list({ id: newSubject.id }),
        newSubject,
      );
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
    onSuccess: () => {
      // Invalidate and refetch subjects list
      queryClient.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
};
