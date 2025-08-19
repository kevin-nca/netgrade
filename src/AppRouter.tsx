import React, { useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { IonTabs, IonRouterOutlet } from '@ionic/react';
import { PageTransition } from '@/components/PageTransition';
import { Routes } from '@/routes';
import { useOnboardingCompleted } from '@/hooks/queries';

import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import SchoolPage from '@/pages/home/school/SchoolPage';
import HomePage from '@/pages/home/HomePage';
import AddGradePage from '@/pages/home/grades/AddGradePage';
import GradeEntryPage from '@/pages/home/grades/GradeEntryPage';
import CalendarPage from '@/pages/home/calendar/CalendarPage';
import SettingsPage from '@/pages/home/settings/SettingsPage';
import AddExamPage from '@/pages/home/exams/AddExamPage';
import EditExamPage from '@/pages/home/exams/EditExamPage/EditExamPage';

import './AppRouter.css';

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
      <IonRouterOutlet id="main" animated={false}>
        <PageTransition>
          {(location) => (
            <Switch location={location}>
              <Route exact path={Routes.MAIN}>
                <Redirect to={isOnboarded ? Routes.HOME : Routes.ONBOARDING} />
              </Route>

              <Route
                exact
                path={Routes.ONBOARDING}
                component={OnboardingPage}
              />
              <Route exact path={Routes.HOME} component={HomePage} />
              <Route exact path={Routes.GRADES_ADD} component={AddGradePage} />
              <Route path={Routes.SUBJECT_GRADES} component={GradeEntryPage} />
              <Route exact path={Routes.CALENDAR} component={CalendarPage} />
              <Route exact path={Routes.SETTINGS} component={SettingsPage} />
              <Route exact path={Routes.EXAMS_ADD} component={AddExamPage} />
              <Route exact path={Routes.EXAM_EDIT} component={EditExamPage} />
              <Route exact path={Routes.SCHOOL} component={SchoolPage} />
            </Switch>
          )}
        </PageTransition>
      </IonRouterOutlet>
    </IonTabs>
  );
}
