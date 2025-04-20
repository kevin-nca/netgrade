import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SchoolService } from '@/services/SchoolService';
import { School } from '@/db/entities/School';

// Query keys
export const schoolKeys = {
  all: ['schools'] as const,
  lists: () => [...schoolKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...schoolKeys.lists(), { filters }] as const,
  details: () => [...schoolKeys.all, 'detail'] as const,
  detail: (id: string) => [...schoolKeys.details(), id] as const,
};

// Types
export interface AddSchoolPayload {
  name: string;
  type?: string;
  address?: string;
}

// Hooks
export const useSchools = () => {
  return useQuery({
    queryKey: schoolKeys.lists(),
    queryFn: () => SchoolService.fetchAll(),
  });
};

export const useSchool = (id: string) => {
  return useQuery({
    queryKey: schoolKeys.detail(id),
    queryFn: () => SchoolService.findById(id),
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
    onSuccess: (updatedSchool) => {
      // Update the school in the cache
      queryClient.invalidateQueries({
        queryKey: schoolKeys.detail(updatedSchool.id),
      });
      // Invalidate and refetch schools list
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() });
    },
  });
};

export const useDeleteSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schoolId: string) => SchoolService.delete(schoolId),
    onSuccess: (deletedSchoolId) => {
      // Remove the school from the cache
      queryClient.removeQueries({
        queryKey: schoolKeys.detail(deletedSchoolId),
      });
      // Invalidate and refetch schools list
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() });
    },
  });
};
