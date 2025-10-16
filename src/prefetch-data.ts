import { QueryClient } from '@tanstack/react-query';
import {
  UpcomingExamsQuery,
  GradeQuery,
  onboardingCompletedQuery,
  SchoolQuery,
  userNameQuery,
} from '@/hooks/queries';

export async function prefetchData(queryClient: QueryClient) {
  await queryClient.prefetchQuery(onboardingCompletedQuery);
  await queryClient.prefetchQuery(SchoolQuery);
  await queryClient.prefetchQuery(GradeQuery);
  await queryClient.prefetchQuery(userNameQuery);
  await queryClient.prefetchQuery(UpcomingExamsQuery);

  // Add more prefetch queries as needed
}
