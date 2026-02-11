import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Erreur de connexion', error.message);
    } else {
      // Rediriger vers le mood tracker après connexion
      router.replace('/screens/onboarding' as any);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connecte toi</Text>

      <TouchableOpacity onPress={() => router.push('/screens/Auth/SignUpScreen' as any)}>
        <View style={styles.linkContainer}>
          <Text style={styles.link}>Je n'ai pas de compte ? </Text>
          <Text style={styles.link2}>Créer un compte</Text>
        </View>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Connexion</Text>
        )}
      </TouchableOpacity>

      {/* style={styles.forgotPassword} */}
      <TouchableOpacity onPress={() => {
        router.push('/screens/Auth/ForgotPasswordScreen' as any);
      }}>
        <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1B1B1B',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#1B1B1B',
    fontSize: 14,
  },
  forgotPasswordText: {
    color: '#1B1B1B',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  link2: {
    color: '#007AFF',
  },
  linkContainer: {
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  // forgotPasswordText: {
  //   color: '#007AFF',
  //   fontSize: 14,
  // },
});