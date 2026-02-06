import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../constants/theme';
import { HELP_PHONE_NUMBER } from '../lib/config';

interface SuicidePreventionScreenProps {
  onClose: () => void;
}

export function SuicidePreventionScreen({ onClose }: SuicidePreventionScreenProps) {
  const callHelpNumber = () => {
    const phoneUrl = `tel:${HELP_PHONE_NUMBER}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone');
        }
      })
      .catch((err) => {
        console.error('Erreur lors de l\'appel:', err);
        Alert.alert('Erreur', 'Impossible de passer l\'appel');
      });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Bouton fermer */}
      <Pressable style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </Pressable>

      <View style={styles.content}>
        {/* Numéro à appeler */}
        <Pressable onPress={callHelpNumber} style={styles.phoneButton}>
          <Text style={styles.phoneNumber}>{HELP_PHONE_NUMBER}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1000,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: Fonts.sans.regular,
  },
  phoneButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  phoneNumber: {
    fontSize: 64,
    fontFamily: Fonts.sans.bold,
    color: '#FFFFFF',
    letterSpacing: 4,
  },
});
