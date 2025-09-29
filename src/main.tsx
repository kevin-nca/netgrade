import 'reflect-metadata';
import './ionic';
import { createRoot } from 'react-dom/client';

import './theme/theme.css';
import './theme/variable.css';
import './theme/ui-elements.css';
import { setupIonicReact } from '@ionic/react';

import App from './App';
import { initializeDatabase } from '@/db/data-source';
import { AppInfo } from '@/AppInfo';
import { notificationScheduler } from './notification-scheduler';
import { QueryClient } from '@tanstack/react-query';
import { prefetchData } from './prefetch-data';

setupIonicReact({
  animated: true,
  swipeBackEnabled: true,
});

const queryClient = new QueryClient();

const container = document.getElementById('root');
const root = createRoot(container!);

AppInfo.initialize()
  .then(() => {
    console.log('AppInfo initialized successfully.');
    initializeDatabase()
      .then(async () => {
        console.log('Database initialized successfully.');
        await notificationScheduler.start();
        await prefetchData(queryClient);

        root.render(<App queryClient={queryClient} />);
      })
      .catch((error) => {
        console.error('FATAL: Failed to initialize database:', error);
        root.render(
          <div style={{ padding: '20px' }}>Error: {JSON.stringify(error)}</div>,
        );
      });
  })
  .catch((error) => {
    console.error('FATAL: Failed to initialize app info service:', error);
    root.render(
      <div style={{ padding: '20px' }}>Error: {JSON.stringify(error)}</div>,
    );
  });
