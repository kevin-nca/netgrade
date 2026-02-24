import './ionic';

import React from 'react';
import { IonApp } from '@ionic/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from '@/AppRouter';

function App({ queryClient }: { queryClient: QueryClient }) {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <IonApp>
          <AppRouter />
        </IonApp>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
