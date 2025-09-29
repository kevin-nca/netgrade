import './ionic';

import React from 'react';
import { IonApp } from '@ionic/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from '@/AppRouter';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <IonApp>
        <AppRouter />
      </IonApp>
    </QueryClientProvider>
  );
}

export default App;
