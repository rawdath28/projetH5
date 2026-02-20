import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoodGrid } from '../../components/mood-grid/MoodGrid';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useMoods } from '../../contexts/MoodsContext';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { supabase } from '../../lib/supabase';

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { moods: MOODS } = useMoods();

  const handleComplete = async (moodId: string | null) => {
    try {
      if (moodId) {
        const selectedMood = MOODS.find(m => m.id === moodId);
        if (selectedMood) {
          const today = new Date().toDateString();
          const time = new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          try {
            // Générer un UUID valide pour l'ID (compatible avec Supabase)
            const generateUUID = () => {
              return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
              });
            };

            const entryId = generateUUID();
            // Charger les moods existants du jour
            const savedMoods = await AsyncStorage.getItem(`moods_${today}`);
            const moodEntries = savedMoods ? JSON.parse(savedMoods) : [];

            // Ajouter le nouveau mood en DÉBUT de liste (plus récent en premier)
            const newEntry = {
              mood: selectedMood,
              time: time,
              id: entryId, // Utiliser UUID au lieu de Date.now()
              date: new Date().toISOString(),
              text: '',
            };
            moodEntries.unshift(newEntry); // unshift = ajouter au début

            // Sauvegarder dans AsyncStorage (local)
            await AsyncStorage.setItem(`moods_${today}`, JSON.stringify(moodEntries));

            // Sauvegarder dans Supabase (cloud) si l'utilisateur est connecté
            if (user && supabase) {
              try {
                const { data, error } = await supabase
                  .from('journal_entries')
                  .insert({
                    id: entryId,
                    user_id: user.id,
                    mood_id: selectedMood.id,
                    mood_label: selectedMood.label,
                    mood_color: selectedMood.color,
                    note: '',
                    entry_date: newEntry.date,
                    entry_time: time,
                  })
                  .select();

                if (error) {
                  console.error('❌ Erreur sauvegarde Supabase:', error);
                } else {
                  console.log('✅ Mood sauvegardé dans Supabase');
                }
              } catch (supabaseError) {
                console.error('❌ Erreur lors de la sauvegarde Supabase:', supabaseError);
              }
            }
          } catch (error) {
            console.error('Erreur sauvegarde humeur:', error);
          }
        }
      }
      
      // Petit délai pour éviter les problèmes de navigation
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } catch (error) {
      console.error('Erreur dans handleComplete:', error);
      // Rediriger quand même pour éviter de bloquer l'utilisateur
      router.replace('/(tabs)');
    }
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
