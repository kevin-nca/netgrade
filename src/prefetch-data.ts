import { QueryClient } from '@tanstack/react-query';
import {
  ExamCompletedQuery,
  GradeQuery,
  onboardingCompletedQuery,
  SchoolCompletedQuery,
  userNameQuery,
} from '@/hooks/queries';

export async function prefetchData(queryClient: QueryClient) {
  await queryClient.prefetchQuery(onboardingCompletedQuery);
  await queryClient.prefetchQuery(SchoolCompletedQuery);
  await queryClient.prefetchQuery(GradeQuery);
  await queryClient.prefetchQuery(userNameQuery);
  await queryClient.prefetchQuery(ExamCompletedQuery);

  // Add more prefetch queries as needed
}
