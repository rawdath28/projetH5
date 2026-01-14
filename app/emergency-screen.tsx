import { useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Fonts } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Stack } from 'expo-router';

const EmergencyScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const callNumber = (phoneNumber: string) => {
    let phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (!supported) {
          console.log("Impossible d’ouvrir le téléphone");
        } else {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch((err) => console.error("Erreur lors de l'appel :", err));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Bouton fermer */}
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Icon name="close" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Texte principal */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Tu n’es{'\n'}pas seul·e
        </Text>

        <Text style={styles.subtitle}>
          De l’aide immédiate est disponible !
        </Text>
      </View>

      {/* Boutons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => callNumber("01 45 39 40 00")} // exemple Suicide Écoute
        >
          <Icon name="call-outline" size={18} color="#fff" />
          <Text style={styles.mainButtonText}>Suicide Écoute</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => callNumber("31 14")} // exemple Prévention suicide
        >
          <Icon name="call-outline" size={18} color="#fff" />
          <Text style={styles.secondaryButtonText}>Prévention suicide</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EmergencyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1B6F', // bleu profond
    justifyContent: 'space-between',
  },

  closeButton: {
    alignSelf: 'flex-end',
    padding: 20,
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 42,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '300',
    fontStyle: 'italic',
    marginBottom: 20,
    fontFamily: Fonts.sans.regularItalic,
  },

  subtitle: {
    fontSize: 14,
    color: '#D1D5FF',
    textAlign: 'center',
    fontFamily: Fonts.sans.regular,
  },

  buttonsContainer: {
    paddingHorizontal: 30,
    paddingBottom: 100,
  },

  mainButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A5CFF',
    borderRadius: 30,
    paddingVertical: 14,
    marginBottom: 16,
  },

  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: Fonts.sans.regular,
  },

  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
    fontFamily: Fonts.sans.regular,
  },
});
