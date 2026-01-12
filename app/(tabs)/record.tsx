import { StyleSheet, ScrollView } from 'react-native';

import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function RecordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <IconSymbol size={48} name="mic.fill" color={colors.tint} />
          <ThemedText type="title" style={styles.title}>
            Record
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
  statsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
});

