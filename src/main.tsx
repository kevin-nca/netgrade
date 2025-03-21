import { createRoot } from 'react-dom/client';
import './theme/theme.css';
import './theme/variable.css';
import './theme/ui-elements.css';

import App from './App';
import db from '@/store/db';

const container = document.getElementById('root');
const root = createRoot(container!);

db.create()
  .then(() => {
    root.render(<App />);
  })
  .catch((error) => {
    console.error('Failed to initialize storage:', error);
    // Handle the error appropriately
  });
