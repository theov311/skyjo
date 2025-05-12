import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skyjo.app',
  appName: 'Skyjo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f8fafc'
    }
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    backgroundColor: '#f8fafc'
  }
};

export default config;
