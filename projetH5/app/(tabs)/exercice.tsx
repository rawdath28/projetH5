import { StyleSheet, ScrollView } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ExerciceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <IconSymbol size={48} name="figure.run" color={colors.tint} />
          <ThemedText type="title" style={styles.title}>
            Exercices
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Exercices disponibles
          </ThemedText>
          <ThemedText style={styles.description}>
            Pratiquez vos exercices de TCC entre les séances pour renforcer vos compétences.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.exerciseCard}>
          <ThemedText type="defaultSemiBold" style={styles.exerciseTitle}>
            Exercice de respiration
          </ThemedText>
          <ThemedText style={styles.exerciseDescription}>
            Technique de respiration profonde pour gérer l'anxiété et le stress.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.exerciseCard}>
          <ThemedText type="defaultSemiBold" style={styles.exerciseTitle}>
            Restructuration cognitive
          </ThemedText>
          <ThemedText style={styles.exerciseDescription}>
            Identifiez et remettez en question vos pensées négatives.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.exerciseCard}>
          <ThemedText type="defaultSemiBold" style={styles.exerciseTitle}>
            Journal de pensées
          </ThemedText>
          <ThemedText style={styles.exerciseDescription}>
            Enregistrez vos pensées et émotions pour mieux les comprendre.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  exerciseCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});

