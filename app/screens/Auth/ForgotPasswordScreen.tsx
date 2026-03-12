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

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useAuth } from '../../../contexts/AuthContext';

// export default function ForgotPasswordScreen() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [emailSent, setEmailSent] = useState(false);
//   const { resetPassword } = useAuth();

//   const handleResetPassword = async () => {
//     if (!email) {
//       Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
//       return;
//     }

//     // Validation basique de l'email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
//       return;
//     }

//     setLoading(true);
//     const { error } = await resetPassword(email);
//     setLoading(false);

//     if (error) {
//       Alert.alert('Erreur', error.message);
//     } else {
//       setEmailSent(true);
//       Alert.alert(
//         '✅ Email envoyé !',
//         'Un lien de réinitialisation a été envoyé à ' + email +
//         '\n\nVérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.',
//         [
//           {
//             text: 'OK',
//             onPress: () => router.replace('/screens/Auth/LoginScreen' as any),
//           },
//         ]
//       );
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//       <View style={styles.content}>
//         {/* Bouton retour */}
//         {/* <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => router.back()}>
//           <Text style={styles.backButtonText}>←</Text>
//         </TouchableOpacity> */}

//         <Text style={styles.title}>Mot de passe oublié ?</Text>
//         {/* <Text style={styles.subtitle}>
//           Entrez votre adresse email et nous vous enverrons un lien pour
//           réinitialiser votre mot de passe.
//         </Text> */}

//         <TextInput
//           style={styles.input}
//           placeholder="Adresse e-mail"
//           placeholderTextColor="1#B1B1B"
//           value={email}
//           onChangeText={setEmail}
//           autoCapitalize="none"
//           keyboardType="email-address"
//           autoComplete="email"
//           editable={!emailSent}
//         />

//         <TouchableOpacity
//           style={[styles.button, loading && styles.buttonDisabled]}
//           onPress={handleResetPassword}
//           disabled={loading || emailSent}>
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>
//               {emailSent ? '✓ Email envoyé' : 'Envoyer le lien'}
//             </Text>
//           )}
//         </TouchableOpacity>

//         {emailSent && (
//           <View style={styles.successContainer}>
//             <Text style={styles.successText}>
//               📧 Email envoyé ! Vérifiez votre boîte mail.
//             </Text>
//             <TouchableOpacity
//               style={styles.resendButton}
//               onPress={() => {
//                 setEmailSent(false);
//                 handleResetPassword();
//               }}>
//               <Text style={styles.resendButtonText}>Renvoyer l'email</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         <TouchableOpacity
//           style={styles.loginLink}
//           onPress={() => router.replace('/screens/Auth/LoginScreen' as any)}>

//           <View style={styles.linkContainer}>
//             <Text style={styles.link}>Vous vous souvenez de votre mot de passe ? </Text>
//             <Text style={styles.link2}>Se connecter</Text>
//           </View>
//           {/* <Text style={styles.loginLinkText}>
//             Vous vous souvenez de votre mot de passe ? Se connecter
//           </Text> */}
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#white',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   backButton: {
//     position: 'absolute',
//     top: 60,
//     left: 20,
//     zIndex: 10,
//   },
//   backButtonText: {
//     color: '#000000',
//     fontSize: 20,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#000000',
//     marginBottom: 40,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#999',
//     marginBottom: 40,
//     lineHeight: 24,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: 'white',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     fontSize: 16,
//     color: '#1B1B1B',
//   },
//   button: {
//     backgroundColor: '#1B1B1B',
//     padding: 16,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   successContainer: {
//     marginTop: 30,
//     padding: 20,
//     backgroundColor: '#1A3A1A',
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#2A5A2A',
//   },
//   successText: {
//     color: '#4ADE80',
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   resendButton: {
//     alignSelf: 'center',
//   },
//   resendButtonText: {
//     color: '#4ADE80',
//     fontSize: 14,
//     fontWeight: '600',
//     textDecorationLine: 'underline',
//   },
//   loginLink: {
//     marginTop: 30,
//     alignItems: 'center',
//   },
//   loginLinkText: {
//     color: 'black',
//     fontSize: 14,
//   },
//   linkContainer: {
//     marginBottom: 40,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   link: {
//     color: '#1B1B1B',
//   },
//   link2: {
//     color: '#007AFF',
//   },
// });