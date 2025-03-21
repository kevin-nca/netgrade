// src/pages/main/Main.tsx
import { IonRouterOutlet, IonTabs } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';

import GradeEntryPage from '@/pages/grade-entry-page/gradeEntryPage';
import CalendarPage from '@/pages/calendar-page/calendarPage';
import SettingsPage from '@/pages/settings-page/settingsPage';
import AddUpcomingExam from '@/pages/add-upcoming-grade-or-event-page/addUpcomingGradeOrEventPage';
import OnboardingPage from '@/pages/onboarding-page/onboardingPage';
import DynamicSchoolPage from '@/pages/dynamic-school-page/dynamicSchoolPage';
import GradeAddingPage from '@/pages/grade-adding-page/gradeAddingPage';
import HomePage from '@/pages/home-page/homePage';
import EditUpcomingExamOrEvent from '@/features/exam-or-upcoming-event/edit/EditUpcomingExamOrEvent';
import { Routes } from '@/routes/routes';

export function Main() {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path={Routes.MAIN} to={Routes.ONBOARDING} />
        <Route exact path={Routes.ONBOARDING} component={OnboardingPage} />
        <Route exact path={Routes.HOME_SCHOOL} component={DynamicSchoolPage} />
        <Route exact path={Routes.HOME} component={HomePage} />
        <Route
          exact
          path={Routes.HOME_GRADES_ADD}
          component={GradeAddingPage}
        />
        <Route path={Routes.HOME_GRADES_ENTRY} component={GradeEntryPage} />
        <Route exact path={Routes.HOME_CALENDAR} component={CalendarPage} />
        <Route exact path={Routes.HOME_SETTINGS} component={SettingsPage} />
        <Route path={Routes.HOME_EXAMS_ADD} component={AddUpcomingExam} />
        <Route
          path={Routes.HOME_EDIT_EVENT}
          render={() => <EditUpcomingExamOrEvent path={Routes.HOME} />}
        />
      </IonRouterOutlet>
    </IonTabs>
  );
}
