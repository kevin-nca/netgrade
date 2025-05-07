import 'reflect-metadata';
import React from 'react';
import { createRoot } from 'react-dom/client';

import './theme/theme.css';
import './theme/variable.css';
import './theme/ui-elements.css';
import { setupIonicReact } from '@ionic/react';

import App from './App';
import { initializeDatabase } from '@/db/data-source';
import { AppInfoService } from '@/services/AppInfoService';

setupIonicReact();

const container = document.getElementById('root');
const root = createRoot(container!);
const appInfoService = AppInfoService.getInstance();

appInfoService
  .initialize()
  .then(() => {
    console.log('AppInfoService initialized successfully.');
    return initializeDatabase();
  })
  .then(() => {
    console.log('Database initialized successfully.');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  })
  .catch((error) => {
    console.error('FATAL: Failed to initialize application:', error);
    root.render(
      <div style={{ padding: '20px' }}>Error: {JSON.stringify(error)}</div>,
    );
  });
