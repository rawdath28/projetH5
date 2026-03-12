import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, Platform } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
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
import { supabase } from '../lib/supabase';

// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

// Composant interne qui utilise le contexte d'authentification
function RootLayoutNav() {
  const { loading, isPasswordRecovery } = useAuth();
  const router = useRouter();

  // Rediriger vers l'écran de réinitialisation quand le deep link password recovery est reçu
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');

    if (accessToken && refreshToken && type === 'recovery') {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(() => {
        window.history.replaceState(null, '', window.location.pathname);
        router.replace('/screens/Auth/ResetPasswordScreen');
      });
    }
  }, []);

  // Afficher un loader pendant le chargement de l'authentification
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#027A54" />
      </View>
    );
  }

  return (
    <Stack>
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
      <Stack.Screen name="screens/controle" options={{ headerShown: false }} />
      <Stack.Screen name="screens/delete" options={{ headerShown: false }} />
      <Stack.Screen name="screens/draganddrop-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/emergency-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/final-screen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/select-thought-screen" options={{ headerShown: false }} />
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
          <MoodsProvider>
            <RootLayoutNav />
            <StatusBar style="dark" />
          </MoodsProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
