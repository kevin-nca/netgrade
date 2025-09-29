import './ionic';

import React from 'react';
import { IonApp, IonSpinner, IonRouterOutlet, IonTabs } from '@ionic/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from '@/AppRouter';
import { useOnboardingCompleted } from '@/hooks/queries';
import { Routes } from '@/routes';
import { Route } from 'react-router-dom';
import { IonReactRouter } from '@ionic/react-router';

const queryClient = new QueryClient();

function AppRouterWithOnboardBoolean() {
  const { data: isOnboarded, isLoading } = useOnboardingCompleted();

  if (isLoading) {
    return (
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet animated={true}>
            <Route exact path={Routes.MAIN}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100vh',
                }}
              >
                <IonSpinner />
              </div>
            </Route>
          </IonRouterOutlet>
        </IonTabs>
      </IonReactRouter>
    );
  }

  return <AppRouter isOnboarded={isOnboarded} />;
}

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <IonApp>
          <AppRouterWithOnboardBoolean />
        </IonApp>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
