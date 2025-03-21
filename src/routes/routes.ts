// src/routes/routes.ts
export enum Routes {
  MAIN = '/main',
  ONBOARDING = '/main/onboarding',
  HOME = '/main/home',
  HOME_SCHOOL = '/main/home/:schoolId',
  HOME_GRADES_ADD = '/main/home/grades/add',
  HOME_GRADES_ENTRY = '/main/home/grades/grade-entry/:schoolId/:subjectId',
  HOME_CALENDAR = '/main/home/calendar',
  HOME_SETTINGS = '/main/home/settings',
  HOME_EXAMS_ADD = '/main/home/exams/add',
  HOME_EDIT_EVENT = '/main/home/:title/edit',
}
