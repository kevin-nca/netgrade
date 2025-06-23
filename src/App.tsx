import './ionic';

import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from '@/AppRouter';

const queryClient = new QueryClient();

setupIonicReact({
  mode: 'ios',
  animated: true,
  swipeBackEnabled: true,
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <IonApp>
          <IonReactRouter>
            <IonRouterOutlet id="main" animated={true}>
              <Route path="/main" render={() => <AppRouter />} />
              <Route exact path="/" render={() => <Redirect to="/main/" />} />
            </IonRouterOutlet>
          </IonReactRouter>
        </IonApp>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
