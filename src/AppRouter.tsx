import React, { useEffect, useState } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { IonTabs, IonRouterOutlet, IonPage } from '@ionic/react';
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
  const [initialized, setInitialized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isOnboarded !== undefined) {
      setInitialized(true);
    }
  }, [isOnboarded]);

  if (!initialized) return null;

  return (
    <IonTabs>
      <IonRouterOutlet id="main" animated={false}>
        <PageTransition>
          {(loc) => (
            <Switch location={loc}>
              <Route exact path={Routes.MAIN}>
                <Redirect to={isOnboarded ? Routes.HOME : Routes.ONBOARDING} />
              </Route>

              <Route exact path={Routes.ONBOARDING}>
                <IonPage>
                  <OnboardingPage />
                </IonPage>
              </Route>

              <Route exact path={Routes.HOME}>
                <IonPage>
                  <HomePage />
                </IonPage>
              </Route>
              <Route exact path={Routes.GRADES_ADD}>
                <IonPage>
                  <AddGradePage />
                </IonPage>
              </Route>
              <Route path={Routes.SUBJECT_GRADES}>
                <IonPage>
                  <GradeEntryPage />
                </IonPage>
              </Route>
              <Route exact path={Routes.CALENDAR}>
                <IonPage>
                  <CalendarPage />
                </IonPage>
              </Route>
              <Route exact path={Routes.SETTINGS}>
                <IonPage>
                  <SettingsPage />
                </IonPage>
              </Route>
              <Route exact path={Routes.EXAMS_ADD}>
                <IonPage>
                  <AddExamPage />
                </IonPage>
              </Route>
              <Route exact path={Routes.EXAM_EDIT}>
                <IonPage>
                  <EditExamPage />
                </IonPage>
              </Route>

              <Route exact path={Routes.SCHOOL}>
                <IonPage>
                  <SchoolPage />
                </IonPage>
              </Route>
            </Switch>
          )}
        </PageTransition>
      </IonRouterOutlet>
    </IonTabs>
  );
}
