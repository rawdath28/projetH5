import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { EXPO_URL } from '../lib/config';

// Expo Go web = localhost, build mobile = scheme custom
const RESET_PASSWORD_REDIRECT =
  Platform.OS === 'web'
    ? 'http://localhost:8081'
    : 'projeth5://reset-password';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (value: boolean) => void;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Gère l'URL deep link pour extraire les tokens Supabase (ex: reset password)
  const handleDeepLink = async (url: string) => {
    if (!supabase || !url) return;
    // L'URL contient #access_token=...&refresh_token=...&type=recovery
    const hash = url.split('#')[1];
    if (!hash) return;
    const params = Object.fromEntries(new URLSearchParams(hash));
    if (params.access_token && params.refresh_token) {
      await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (_event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }
      }
    );

    // Gérer le deep link initial (app ouverte depuis le lien email)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Gérer les deep links quand l'app est en arrière-plan
    const linkSub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));

    return () => {
      subscription.unsubscribe();
      linkSub.remove();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase non configuré' } };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.user);
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase non configuré' } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.user);
    }
    return { error };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    // Vider le cache local au déconnexion
    const allKeys = await AsyncStorage.getAllKeys();
    const moodKeys = allKeys.filter(key => key.startsWith('moods_'));
    await AsyncStorage.multiRemove(moodKeys);
  };

  // const resetPassword = async (email: string) => {
  //   const redirectTo =
  //     Platform.OS === 'web'
  //       ? `${window.location.origin}/screens/Auth/ResetPasswordScreen`
  //       : 'projeth5://reset-password';

  //   const { error } = await supabase.auth.resetPasswordForEmail(email, {
  //     redirectTo,
  //   });
  //   return { error };
  // };
  // const resetPassword = async (email: string) => {
  //   let redirectTo: string;

  //   if (Platform.OS === 'web') {
  //     redirectTo = `${window.location.origin}/screens/Auth/ResetPasswordScreen`;
  //   } else {
  //     // Génère automatiquement le bon scheme selon l'environnement
  //     // Expo Go → exp://192.168.x.x:8081/--/screens/Auth/ResetPasswordScreen
  //     // Build natif → projeth5://screens/Auth/ResetPasswordScreen
  //     redirectTo = Linking.createURL('/screens/Auth/ResetPasswordScreen');
  //   }

  //   console.log('🔗 Redirect URL:', redirectTo);

  //   const { error } = await supabase.auth.resetPasswordForEmail(email, {
  //     redirectTo,
  //   });
  //   return { error };
  // };
  const resetPassword = async (email: string) => {
    let redirectTo: string;

    if (Platform.OS === 'web') {
      redirectTo = `${window.location.origin}/screens/Auth/ResetPasswordScreen`;
    } else {
      // Utilise l'IP de ta machine (même IP qu'Expo Go utilise)
      redirectTo = `${EXPO_URL}/screens/Auth/ResetPasswordScreen`;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isPasswordRecovery,
        setIsPasswordRecovery,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
