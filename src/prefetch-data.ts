import { QueryClient } from '@tanstack/react-query';
import {
  GradesQuery,
  OnboardingCompletedQuery,
  SchoolsQuery,
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

  // Add more prefetch queries as needed
}
