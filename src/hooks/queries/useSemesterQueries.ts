// Query keys
export const semesterKeys = {
  all: ['semesters'] as const,
  lists: () => [...semesterKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...semesterKeys.lists(), { filters }] as const,
  current: () => [...semesterKeys.all, 'current'] as const,
};
