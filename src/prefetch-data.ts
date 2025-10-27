import { QueryClient } from '@tanstack/react-query';
import {
  UpcomingExamsQuery,
  GradeQuery,
  onboardingCompletedQuery,
  SchoolQuery,
  userNameQuery,
  SchoolIdQuery,
} from '@/hooks/queries';

export async function prefetchData(queryClient: QueryClient, schoolId: string) {
  await queryClient.prefetchQuery(onboardingCompletedQuery);
  await queryClient.prefetchQuery(SchoolQuery);
  await queryClient.prefetchQuery(GradeQuery);
  await queryClient.prefetchQuery(userNameQuery);
  await queryClient.prefetchQuery(UpcomingExamsQuery);
  await queryClient.prefetchQuery(SchoolIdQuery(schoolId));


  // Add more prefetch queries as needed
}
