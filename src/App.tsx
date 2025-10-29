import './ionic';

import React from 'react';
import { IonApp } from '@ionic/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from '@/AppRouter';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App({ queryClient }: { queryClient: QueryClient }) {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <IonApp>
          <AppRouter />
        </IonApp>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
