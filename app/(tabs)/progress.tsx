import { StyleSheet, ScrollView } from 'react-native';

import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <IconSymbol size={48} name="list.triangle" color={colors.tint} />
          <ThemedText type="title" style={styles.title}>
            Progrès
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Suivi des séances
          </ThemedText>
          <ThemedText style={styles.description}>
            Gérez vos séances de thérapie et suivez votre humeur entre les rendez-vous.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.sessionCard}>
          <ThemedView style={styles.sessionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sessionDate}>
              Aujourd'hui
            </ThemedText>
            <ThemedText style={styles.sessionStatus}>En attente</ThemedText>
          </ThemedView>
          <ThemedText style={styles.sessionDescription}>
            Enregistrez votre humeur et vos notes pour cette journée.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.sessionCard}>
          <ThemedView style={styles.sessionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sessionDate}>
              Prochaine séance
            </ThemedText>
            <ThemedText style={styles.sessionStatus}>À venir</ThemedText>
          </ThemedView>
          <ThemedText style={styles.sessionDescription}>
            Préparez vos questions et notes pour votre prochaine séance avec votre thérapeute.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Historique
          </ThemedText>
          <ThemedText style={styles.description}>
            Consultez vos séances précédentes et vos notes.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.sessionCard}>
          <ThemedView style={styles.sessionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sessionDate}>
              Séance précédente
            </ThemedText>
            <ThemedText style={styles.sessionStatus}>Terminée</ThemedText>
          </ThemedView>
          <ThemedText style={styles.sessionDescription}>
            Aucune séance enregistrée pour le moment.
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
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: 18,
  },
  sessionStatus: {
    fontSize: 14,
    opacity: 0.7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  sessionDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});

