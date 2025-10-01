import { QueryClient } from '@tanstack/react-query';
import { onboardingCompletedQuery } from '@/hooks/queries';

export async function prefetchData(queryClient: QueryClient) {
  await queryClient.prefetchQuery(onboardingCompletedQuery);
  // Add more prefetch queries as needed
}
