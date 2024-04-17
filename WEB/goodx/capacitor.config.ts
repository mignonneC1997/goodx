import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'za.co.goodx.goodxapp',
  appName: 'GoodX',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  },
  cordova: {
    preferences: {
      SplashMaintainAspectRatio: "true",
      FadeSplashScreenDuration: "300",
      SplashShowOnlyFirstTime: "false",
      SplashScreen: "screen",
      SplashScreenDelay: "3000"
    }
  }
};

export default config;
