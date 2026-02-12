import React, { useState } from 'react';
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
import { useAuth } from '../../../contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      setEmailSent(true);
      Alert.alert(
        '✅ Email envoyé !',
        'Un lien de réinitialisation a été envoyé à ' + email + 
        '\n\nVérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/screens/Auth/LoginScreen' as any),
          },
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        {/* Bouton retour */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Mot de passe oublié ?</Text>
        {/* <Text style={styles.subtitle}>
          Entrez votre adresse email et nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
        </Text> */}

        <TextInput
          style={styles.input}
          placeholder="Adresse email"
          placeholderTextColor="1#B1B1B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!emailSent}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading || emailSent}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {emailSent ? '✓ Email envoyé' : 'Envoyer le lien'}
            </Text>
          )}
        </TouchableOpacity>

        {emailSent && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              📧 Email envoyé ! Vérifiez votre boîte mail.
            </Text>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                setEmailSent(false);
                handleResetPassword();
              }}>
              <Text style={styles.resendButtonText}>Renvoyer l'email</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.replace('/screens/Auth/LoginScreen' as any)}>
          <Text style={styles.loginLinkText}>
            Vous vous souvenez de votre mot de passe ? Se connecter
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#white',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 40,
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    color: '#1B1B1B',
  },
  button: {
    backgroundColor: '#1B1B1B',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#1A3A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A5A2A',
  },
  successText: {
    color: '#4ADE80',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  resendButton: {
    alignSelf: 'center',
  },
  resendButtonText: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  loginLinkText: {
    color: 'black',
    fontSize: 14,
  },
});