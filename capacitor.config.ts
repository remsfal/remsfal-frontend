import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.remsfal.app',
  appName: 'REMSFAL',
  webDir: 'dist',
  server: {
    url: 'http://localhost:5173',
    cleartext: true,
  },
};

export default config;
