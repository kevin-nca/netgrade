import React, { useEffect, useState } from 'react';
import { IonRouterOutlet, IonTabs } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';

import GradeEntryPage from '@/pages/home/grades/GradeEntryPage';
import CalendarPage from '@/pages/home/calendar/CalendarPage';
import SettingsPage from '@/pages/home/settings/SettingsPage';
import AddExamPage from '@/pages/home/exams/AddExamPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import SchoolPage from '@/pages/home/school/SchoolPage';
import AddGradePage from '@/pages/home/grades/AddGradePage';
import HomePage from '@/pages/home/HomePage';
import EditExamPage from '@/pages/home/exams/EditExamPage/EditExamPage';
import { Routes } from '@/routes';
import { useOnboardingCompleted } from '@/hooks/queries';

export function AppRouter() {
  const { data: isOnboarded } = useOnboardingCompleted();
  const [, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isOnboarded !== undefined) {
      setIsInitialized(true);
    }
  }, [isOnboarded]);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect
          exact
          path={Routes.MAIN}
          to={isOnboarded ? Routes.HOME : Routes.ONBOARDING}
        />
        <Route exact path={Routes.ONBOARDING} component={OnboardingPage} />
        <Route exact path={Routes.SCHOOL} component={SchoolPage} />
        <Route exact path={Routes.HOME} component={HomePage} />
        <Route exact path={Routes.GRADES_ADD} component={AddGradePage} />
        <Route path={Routes.SUBJECT_GRADES} component={GradeEntryPage} />
        <Route exact path={Routes.CALENDAR} component={CalendarPage} />
        <Route exact path={Routes.SETTINGS} component={SettingsPage} />
        <Route exact path={Routes.EXAMS_ADD} component={AddExamPage} />
        <Route exact path={Routes.EXAM_EDIT} component={EditExamPage} />
      </IonRouterOutlet>
    </IonTabs>
  );
}
