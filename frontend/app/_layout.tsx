import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useThemeStore } from '../store/themeStore';
import * as Font from 'expo-font';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#8B4513',
    secondary: '#D2691E',
    background: '#FFF8F0',
    surface: '#FFFFFF',
    surfaceVariant: '#F5DEB3',
    text: '#333333',
    textSecondary: '#666666',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D2691E',
    secondary: '#DEB887',
    background: '#1A120B',
    surface: '#2D1F18',
    surfaceVariant: '#3D2F26',
    text: '#E5E5E5',
    textSecondary: '#B0B0B0',
  },
};

// Custom theme hook that handles font loading
function useAppTheme() {
  const { isDarkMode } = useThemeStore();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
          'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Continue anyway
      }
    }

    loadFonts();
  }, []);

  return { theme: isDarkMode ? darkTheme : lightTheme, fontsLoaded };
}

// Main app layout with bottom tab navigation
export default function RootLayout() {
  const { theme, fontsLoaded } = useAppTheme();

  if (!fontsLoaded) {
    return null; // Or a splash screen
  }

  return (
    <PaperProvider theme={theme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="advisor" options={{ headerShown: false }} />
        <Stack.Screen name="analytics" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ headerShown: false }} />
        <Stack.Screen name="stock" options={{ headerShown: false }} />
        <Stack.Screen name="news" options={{ headerShown: false }} />
        <Stack.Screen name="news/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="subscription" options={{ headerShown: false }} />
        <Stack.Screen name="bottle/add" options={{ headerShown: false }} />
        <Stack.Screen name="bottle/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="bottle/bulkAdd" options={{ headerShown: false }} />
        <Stack.Screen name="cabinet/create" options={{ headerShown: false }} />
        <Stack.Screen name="cabinet/[id]" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
