// src/routes/routes.ts
export enum Routes {
  // AppRouter routes
  MAIN = '/main',

  // Onboarding
  ONBOARDING = '/main/onboarding',

  // Home routes
  HOME = '/main/home',

  // School routes
  SCHOOL = '/main/home/schools/:schoolId',

  // Subject routes
  SUBJECT_GRADES = '/main/home/schools/:schoolId/subjects/:subjectId/grades',

  // Grades routes
  GRADES_ADD = '/main/home/grades/add',

  // Calendar route
  CALENDAR = '/main/home/calendar',

  // Settings route
  SETTINGS = '/main/home/settings',

  // Exams routes
  EXAMS_ADD = '/main/home/exams/add',
  EXAM_EDIT = '/main/home/exams/:examId/edit',
}
