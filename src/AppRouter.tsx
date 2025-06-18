import React, { useEffect, useState, useRef } from 'react';
import { IonRouterOutlet, IonTabs } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { setupNavigation } from '@/services/navigation';

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
  const routerOutletRef = useRef<HTMLIonRouterOutletElement>(null);
  const { handleSwipe } = setupNavigation(routerOutletRef);

  useEffect(() => {
    if (isOnboarded !== undefined) {
      setIsInitialized(true);
    }
  }, [isOnboarded]);

  useEffect(() => {
    const routerOutlet = routerOutletRef.current;
    if (!routerOutlet) return;

    const handleSwipeGesture = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail as { direction: 'forward' | 'backward' };
      if (detail.direction === 'forward') {
        handleSwipe('forward');
      } else if (detail.direction === 'backward') {
        handleSwipe('backward');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipe('backward');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('forward');
      }
    };

    routerOutlet.addEventListener('ionSwipe', handleSwipeGesture);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      routerOutlet.removeEventListener('ionSwipe', handleSwipeGesture);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSwipe]);

  return (
    <IonTabs>
      <IonRouterOutlet ref={routerOutletRef}>
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
