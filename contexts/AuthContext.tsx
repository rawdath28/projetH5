import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { EXPO_URL } from '../lib/config';


interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  username: string | null;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (value: boolean) => void;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Récupère le username depuis la table profiles
  const fetchUsername = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', userId) // ou user_id
      .single();

    console.log('fetchUsername data:', data, 'error:', error);

    if (data?.username) {
      setUsername(data.username);
    }
  };

  // Gère l'URL deep link pour extraire les tokens Supabase (ex: reset password)
  const handleDeepLink = async (url: string) => {
    if (!supabase || !url) return;
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
      if (session?.user) {
        fetchUsername(session.user.id);
      } else {
        // AUTH DÉSACTIVÉE - fetch username avec id de test
        fetchUsername('8e17e66f-0d42-48f7-8188-313251cb4039');
      }
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUsername(session.user.id);
        } else {
          setUsername(null);
        }
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

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    console.log('SignUp data:', JSON.stringify(data));
    console.log('SignUp error:', error);

    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ user_id: data.user.id, username }); // ou user_id selon votre table

      console.log('Profile insert error:', profileError);
      setUsername(username);
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
      fetchUsername(data.user.id);
    }
    return { error };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUsername(null);
    // Vider le cache local au déconnexion
    const allKeys = await AsyncStorage.getAllKeys();
    const moodKeys = allKeys.filter(key => key.startsWith('moods_'));
    await AsyncStorage.multiRemove(moodKeys);
  };

  const resetPassword = async (email: string) => {
    let redirectTo: string;

    if (Platform.OS === 'web') {
      redirectTo = `${window.location.origin}/screens/Auth/ResetPasswordScreen`;
    } else {
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
        username,
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