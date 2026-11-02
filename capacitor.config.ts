import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.remsfal.app',
  appName: 'REMSFAL',
  webDir: 'dist',
  server: {
    url: 'http://10.0.2.2:5173',/* 10.0.2.2 ist aus dem Android-Emulator von der Adresse meines macs */
    cleartext: true,
  },
  plugins: {PushNotifications: {presentationOptions: ['sound', 'alert', 'banner', 'list'],},},
};

export default config;
