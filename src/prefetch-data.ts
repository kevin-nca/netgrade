import { QueryClient } from '@tanstack/react-query';
import {
  GradesQuery,
  NotificationPermissionsQuery,
  NotificationSettingsQuery,
  OnboardingCompletedQuery,
  ReminderTimesQuery,
  SchoolsQuery,
  SemestersQuery,
  SubjectsQuery,
  UpcomingExamsQuery,
  UserNameQuery,
} from '@/hooks/queries';

export async function prefetchData(queryClient: QueryClient) {
  await queryClient.prefetchQuery(OnboardingCompletedQuery);
  await queryClient.prefetchQuery(SchoolsQuery);
  await queryClient.prefetchQuery(SubjectsQuery);
  await queryClient.prefetchQuery(GradesQuery);
  await queryClient.prefetchQuery(UserNameQuery);
  await queryClient.prefetchQuery(UpcomingExamsQuery);
  await queryClient.prefetchQuery(NotificationSettingsQuery);
  await queryClient.prefetchQuery(ReminderTimesQuery);
  await queryClient.prefetchQuery(NotificationPermissionsQuery);
  await queryClient.prefetchQuery(SemestersQuery);

  // Add more prefetch queries as needed
}
