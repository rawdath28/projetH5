import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';

import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { MoodGrid } from '../../components/mood-grid/MoodGrid';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOODS } from '../../constants/moods';

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleComplete = async (moodId: string | null) => {
    if (moodId) {
      const selectedMood = MOODS.find(m => m.id === moodId);
      if (selectedMood) {
        const today = new Date().toDateString();
        const time = new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        try {
          // Charger les moods existants du jour
          const savedMoods = await AsyncStorage.getItem(`moods_${today}`);
          const moodEntries = savedMoods ? JSON.parse(savedMoods) : [];

          // Ajouter le nouveau mood en DÉBUT de liste (plus récent en premier)
          const newEntry = {
            mood: selectedMood,
            time: time,
            id: Date.now().toString(),
            date: new Date().toISOString(),
          };
          moodEntries.unshift(newEntry); // unshift = ajouter au début

          await AsyncStorage.setItem(`moods_${today}`, JSON.stringify(moodEntries));
        } catch (error) {
          console.error('Erreur sauvegarde humeur:', error);
        }
      }
    }
    router.replace('/(tabs)');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safe, { backgroundColor: '#000000' }]} edges={['top', 'bottom']}>
        <MoodGrid onComplete={handleComplete} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
