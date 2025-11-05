import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.netgrade.app',
  appName: 'NetGrade',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: 'none',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
