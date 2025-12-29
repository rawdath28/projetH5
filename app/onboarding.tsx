import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';

import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { MoodGrid } from '../components/mood-grid/MoodGrid';

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleComplete = (moodId: string | null) => {
    // Could store the selected mood for analytics or pre-filling later.
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

