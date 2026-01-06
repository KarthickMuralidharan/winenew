/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: "WineCabinetApp",
  slug: "WineCabinetApp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./frontend/assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./frontend/assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.winecellar.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./frontend/assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.winecellar.app"
  },
  web: {
    favicon: "./frontend/assets/favicon.png"
  },
  plugins: [
    "expo-router"
  ],
  experiments: {
    typedRoutes: true
  },
  // Point to the frontend app directory
  extra: {
    routerRoot: "frontend/app",
    eas: {
      projectId: "wine-cabinet-app"
    }
  }
};
