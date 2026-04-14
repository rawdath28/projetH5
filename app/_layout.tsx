import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AuthProvider } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { MoodsProvider } from '../contexts/MoodsContext';
import {
  SourceSansPro_300Light,
  SourceSansPro_400Regular,
  SourceSansPro_400Regular_Italic,
  SourceSansPro_600SemiBold,
  SourceSansPro_600SemiBold_Italic,
  SourceSansPro_700Bold,
  useFonts,
} from '@expo-google-fonts/source-sans-pro';
import {
  SourceSerifPro_300Light,
  SourceSerifPro_400Regular,
  SourceSerifPro_400Regular_Italic,
  SourceSerifPro_600SemiBold,
  SourceSerifPro_600SemiBold_Italic,
  SourceSerifPro_700Bold,
} from '@expo-google-fonts/source-serif-pro';


// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ gestureEnabled: false }}>
      {/* Écran index pour la redirection conditionnelle */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Écrans d'authentification */}
      <Stack.Screen
        name="screens/Auth/LoginScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="screens/Auth/SignUpScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="screens/Auth/ForgotPasswordScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="screens/Auth/ResetPasswordScreen"
        options={{
          headerShown: false,
        }}
      />

      {/* Écrans de l'application */}
      <Stack.Screen
        name="screens/onboarding"
        options={{
          title: 'Mood tracker',
          headerShown: false,
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

      {/* Autres écrans */}
      {/* <Stack.Screen name="screens/controle" options={{ headerShown: false }} />
      <Stack.Screen name="screens/delete" options={{ headerShown: false }} />
      <Stack.Screen name="screens/draganddrop-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/emergency-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/final-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/select-thought-screen" options={{ headerShown: false }} /> */}
      <Stack.Screen
        name="screens/chat"
        options={{
          presentation: 'transparentModal',
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="screens/profile"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="screens/exercise-detail"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {

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
      <ThemeProvider value={DefaultTheme}>
        <AuthProvider>
          <FavoritesProvider>
            <MoodsProvider>
              <RootLayoutNav />
              <StatusBar style="dark" />
            </MoodsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
