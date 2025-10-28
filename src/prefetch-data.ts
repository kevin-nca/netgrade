import { QueryClient } from '@tanstack/react-query';
import {
  UpcomingExamsQuery,
  GradeQuery,
  OnboardingCompletedQuery,
  SchoolQuery,
  UserNameQuery,
} from '@/hooks/queries';

export async function prefetchData(queryClient: QueryClient) {
  await queryClient.prefetchQuery(OnboardingCompletedQuery);
  await queryClient.prefetchQuery(SchoolQuery);
  await queryClient.prefetchQuery(GradeQuery);
  await queryClient.prefetchQuery(UserNameQuery);
  await queryClient.prefetchQuery(UpcomingExamsQuery);

  // Add more prefetch queries as needed
}
