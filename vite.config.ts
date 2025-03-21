/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      src: path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
