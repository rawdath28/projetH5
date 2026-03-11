import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons'; // ou 'react-native-vector-icons/Ionicons'

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { setIsPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Lire le hash IMMÉDIATEMENT avant qu'Expo Router le supprime
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type');

    console.log('🔑 Hash capturé dans _layout :', type, accessToken);

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) console.error('Erreur setSession:', error.message);
        else console.log('✅ Session établie, type:', type);
      });
    }
    // Nettoyer l'URL
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    // if (error) {
    //   Alert.alert('Erreur', error.message);
    // } else {
    //   setIsPasswordRecovery(false);
    //   Alert.alert(
    //     '✅ Mot de passe mis à jour !',
    //     'Votre mot de passe a été modifié avec succès.',
    //     [{ text: 'OK', onPress: () => router.replace('/screens/Auth/LoginScreen' as any) }]
    //   );
    // }
    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      setIsPasswordRecovery(false);
      router.replace('/screens/Auth/LoginScreen' as any);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Nouveau mot de passe</Text>
        <Text style={styles.subtitle}>
          Choisissez un nouveau mot de passe pour votre compte.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nouveau mot de passe"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            secureTextEntry={!isConfirmPasswordVisible}
          />
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} // bascule affichage
          >
            <Ionicons
              name={isConfirmPasswordVisible ? 'eye-off' : 'eye'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdatePassword}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Mettre à jour le mot de passe</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 40,
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#1B1B1B',
  },
  button: {
    backgroundColor: '#027A54',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    marginVertical: 10,
  },
  icon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
});
