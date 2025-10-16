import { IonRouterOutlet, IonTabs, isPlatform } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';

import GradeEntryPage from '@/pages/home/grades/GradeEntryPage';
import CalendarPage from '@/pages/home/calendar/CalendarPage';
import SettingsPage from '@/pages/home/settings/SettingsPage';
import AddExamPage from '@/pages/home/exams/AddExamPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import SchoolPage from '@/pages/home/school/SchoolPage';
import AddGradePage from '@/pages/home/grades/AddGradePage';
import MainPage from '@/pages/home/main/MainPage';
import EditExamPage from '@/pages/home/exams/EditExamPage/EditExamPage';
import { Routes } from '@/routes';

import { EdgeSwipeBack } from '@/components/navigation/EdgeSwipeBack';
import { IonReactRouter } from '@ionic/react-router';
import { useOnboardingCompleted } from '@/hooks/queries';

export function AppRouter() {
  const { data: isOnboarded } = useOnboardingCompleted();

  return (
    <IonReactRouter>
      <Route exact path="/" render={() => <Redirect to="/main/" />} />

      <IonTabs>
        <IonRouterOutlet animated={true}>
          <Route exact path={Routes.MAIN}>
            <Redirect to={isOnboarded ? Routes.HOME : Routes.ONBOARDING} />
          </Route>

          <Route exact path={Routes.ONBOARDING} component={OnboardingPage} />
          <Route exact path={Routes.SCHOOL} component={SchoolPage} />
          <Route exact path={Routes.HOME} component={MainPage} />
          <Route exact path={Routes.GRADES_ADD} component={AddGradePage} />
          <Route path={Routes.SUBJECT_GRADES} component={GradeEntryPage} />
          <Route exact path={Routes.CALENDAR} component={CalendarPage} />
          <Route exact path={Routes.SETTINGS} component={SettingsPage} />
          <Route exact path={Routes.EXAMS_ADD} component={AddExamPage} />
          <Route exact path={Routes.EXAM_EDIT} component={EditExamPage} />
        </IonRouterOutlet>

        {isPlatform('ios') && <EdgeSwipeBack />}
      </IonTabs>
    </IonReactRouter>
  );
}
