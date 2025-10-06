import { QueryClient } from '@tanstack/react-query';
import {
  ExamCompletedQuery,
  GradeCompletedQuery,
  onboardingCompletedQuery,
  SchoolCompletedQuery,
  userNameQuery,
} from '@/hooks/queries';

export async function prefetchData(queryClient: QueryClient) {
  await queryClient.prefetchQuery(onboardingCompletedQuery);

  await Promise.all([
    queryClient.prefetchQuery(SchoolCompletedQuery),
    queryClient.prefetchQuery(GradeCompletedQuery),
    queryClient.prefetchQuery(userNameQuery),
    queryClient.prefetchQuery(ExamCompletedQuery),
  ]);

  // Add more prefetch queries as needed
}
