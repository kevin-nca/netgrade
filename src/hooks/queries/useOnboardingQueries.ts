import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OnboardingService } from '@/services/OnboardingService';
import { preferencesKeys } from './usePreferencesQueries';
import { schoolKeys } from './useSchoolQueries';
import { subjectKeys } from './useSubjectQueries';

export const onboardingKeys = {
  all: ['onboarding'] as const,
  status: () => [...onboardingKeys.all, 'status'] as const,
};

/**
 * Hook to save the user's name during onboarding
 */
export const useOnboardingSaveUserName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => OnboardingService.saveUserName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: preferencesKeys.userName() });
    },
  });
};

/**
 * Hook to add a school during onboarding
 */
export const useOnboardingAddSchool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; type?: string; address?: string }) =>
      OnboardingService.addSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.lists() });
    },
  });
};

/**
 * Hook to add a subject during onboarding
 */
export const useOnboardingAddSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      schoolId: string;
      teacher?: string | null;
      description?: string | null;
      weight?: number;
    }) => OnboardingService.addSubject(data),
    onSuccess: (newSubject) => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
      if (newSubject.schoolId) {
        queryClient.invalidateQueries({
          queryKey: subjectKeys.schoolSubjects(newSubject.schoolId),
        });
      }
    },
  });
};

/**
 * Hook to check if onboarding can be completed
 */
export const useCanCompleteOnboarding = (
  userName: string | null | undefined,
  schoolsCount: number,
) => {
  return OnboardingService.canCompleteOnboarding(userName, schoolsCount > 0);
};
