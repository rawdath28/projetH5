import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Ionicons } from '@expo/vector-icons'; // ou 'react-native-vector-icons/Ionicons'

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // const handleSendOtp = async () => {
  //   if (!email.trim()) {
  //     Alert.alert('Erreur', 'Veuillez entrer votre email');
  //     return;
  //   }
  //   setLoading(true);
  //   const { error } = await supabase.auth.signInWithOtp({
  //     email,
  //     options: { shouldCreateUser: false }, // ne pas créer de compte si inexistant
  //   });
  //   setLoading(false);

  //   if (error) {
  //     Alert.alert('Erreur', error.message);
  //   } else {
  //     setStep('otp');
  //   }
  // };

  // Étape 1 — Envoyer le code OTP
  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: undefined,
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      setStep('otp');
    }
  };

  // Étape 2 — Vérifier le code OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le code reçu');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Erreur', 'Code incorrect ou expiré');
    } else {
      Alert.alert(
        '✅ Code vérifié !',
        'Votre identité a été confirmée. Vous pouvez maintenant choisir un nouveau mot de passe.',
        [{ text: 'Continuer', onPress: () => setStep('password') }]
      );
    }
  };

  // Étape 3 — Mettre à jour le mot de passe
  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      Alert.alert('Succès', 'Mot de passe mis à jour !', [
        { text: 'OK', onPress: () => router.replace('/screens/Auth/LoginScreen' as any) },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>

        {/* ÉTAPE 1 — Email */}
        {step === 'email' && (
          <>
            <Text style={styles.title}>Mot de passe oublié</Text>
            <Text style={styles.subtitle}>
              Entre ton email, on t'envoie un code de vérification.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Envoyer le code</Text>
              }
            </TouchableOpacity>
          </>
        )}

        {/* ÉTAPE 2 — Code OTP */}
        {step === 'otp' && (
          <>
            <Text style={styles.title}>Vérifie ton email</Text>
            <Text style={styles.subtitle}>
              Entre le code à 6 chiffres envoyé à {email}.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Code OTP"
              placeholderTextColor="#999"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Vérifier le code</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('email')}>
              <Text style={styles.link}>Renvoyer un code</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ÉTAPE 3 — Nouveau mot de passe */}
        {step === 'password' && (
          <>
            <Text style={styles.title}>Nouveau mot de passe</Text>
            <Text style={styles.subtitle}>
              Choisis un nouveau mot de passe pour ton compte.
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nouveau mot de passe"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
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
                secureTextEntry={!isConfirmPasswordVisible}
                autoCapitalize="none"
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
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Mettre à jour</Text>
              }
            </TouchableOpacity>
          </>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 40,
    lineHeight: 24
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
    backgroundColor: '#1B1B1B',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  link: {
    color: '#1B1B1B',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14
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