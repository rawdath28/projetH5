import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import {
  SourceSansPro_300Light,
  SourceSansPro_400Regular,
  SourceSansPro_600SemiBold,
  SourceSansPro_700Bold,
  SourceSansPro_400Regular_Italic,
  SourceSansPro_600SemiBold_Italic,
  useFonts,
} from '@expo-google-fonts/source-sans-pro';

import {
  SourceSerifPro_300Light,
  SourceSerifPro_400Regular,
  SourceSerifPro_600SemiBold,
  SourceSerifPro_700Bold,
  SourceSerifPro_400Regular_Italic,
  SourceSerifPro_600SemiBold_Italic,
} from '@expo-google-fonts/source-serif-pro';

import { useColorScheme } from '../hooks/use-color-scheme';

// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    // Source Sans Pro
    SourceSansPro_300Light,
    SourceSansPro_400Regular,
    SourceSansPro_600SemiBold,
    SourceSansPro_700Bold,
    SourceSansPro_400Regular_Italic,
    SourceSansPro_600SemiBold_Italic,
    // Source Serif Pro
    SourceSerifPro_300Light,
    SourceSerifPro_400Regular,
    SourceSerifPro_600SemiBold,
    SourceSerifPro_700Bold,
    SourceSerifPro_400Regular_Italic,
    SourceSerifPro_600SemiBold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Attendre le chargement des polices
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="onboarding">
          <Stack.Screen
            name="onboarding"
            options={{
              title: 'Mood tracker',
              headerShown: false,
            }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
