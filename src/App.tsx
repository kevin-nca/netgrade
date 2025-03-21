import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import './ionic'; // side-effects
import { Main } from '@/pages/main/Main';
import { persistor, store } from '@/store';

function App() {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <IonApp>
            <IonReactRouter>
              <IonRouterOutlet id="main">
                <Route path="/main" render={() => <Main />} />
                <Route exact path="/" render={() => <Redirect to="/main/" />} />
              </IonRouterOutlet>
            </IonReactRouter>
          </IonApp>
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
}

export default App;
