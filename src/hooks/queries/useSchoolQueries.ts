import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SchoolService } from '@/services/SchoolService';
import { School } from '@/db/entities/School';

// Query keys

export const schoolKeys = {
  all: ['schools'] as const,
  lists: () => [...schoolKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...schoolKeys.lists(), { filters }] as const,
};

// Types
export interface AddSchoolPayload {
  name: string;
  type?: string;
  address?: string;
}

// Hooks

export const SchoolsQuery = {
  queryKey: schoolKeys.lists(),
  queryFn: () => SchoolService.fetchAll(),
  staleTime: Infinity,
} as const;

export const useSchools = () => {
  return useQuery(SchoolsQuery);
};

export const useSchool = (id: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: schoolKeys.list({ id }),
    queryFn: () => SchoolService.findById(id),
    initialData: () => {
      return queryClient
        .getQueryData<School[]>(schoolKeys.lists())
        ?.find((s) => s.id === id);
    },
    staleTime: Infinity,
    enabled: !!id,
  });
};

export const useAddSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddSchoolPayload) => SchoolService.add(payload),
    onSuccess: () => {
      // Invalidate and refetch schools list
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() });
    },
  });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schoolData: Partial<School> & { id: string }) =>
      SchoolService.update(schoolData),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.list({ id }) });
    },
  });
};

export const useDeleteSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schoolId: string) => SchoolService.delete(schoolId),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.list({ id }) });
    },
  });
};
