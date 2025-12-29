import { StyleSheet, ScrollView } from 'react-native';

import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <IconSymbol size={48} name="house.fill" color={colors.tint} />
          <ThemedText type="title" style={styles.title}>
            Accueil
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.welcomeCard}>
          <ThemedText type="subtitle" style={styles.welcomeTitle}>
            Bienvenue
          </ThemedText>
          <ThemedText style={styles.welcomeText}>
            Application de suivi TCC entre les séances. Pratiquez vos exercices, suivez votre humeur et visualisez vos progrès.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Accès rapide
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.quickAccessCard}>
          <IconSymbol size={32} name="figure.run" color={colors.tint} />
          <ThemedView style={styles.quickAccessContent}>
            <ThemedText type="defaultSemiBold" style={styles.quickAccessTitle}>
              Exercices
            </ThemedText>
            <ThemedText style={styles.quickAccessDescription}>
              Pratiquez vos exercices de TCC
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.quickAccessCard}>
          <IconSymbol size={32} name="calendar" color={colors.tint} />
          <ThemedView style={styles.quickAccessContent}>
            <ThemedText type="defaultSemiBold" style={styles.quickAccessTitle}>
              Séances
            </ThemedText>
            <ThemedText style={styles.quickAccessDescription}>
              Suivez vos séances et votre humeur
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.quickAccessCard}>
          <IconSymbol size={32} name="chart.line.uptrend.xyaxis" color={colors.tint} />
          <ThemedView style={styles.quickAccessContent}>
            <ThemedText type="defaultSemiBold" style={styles.quickAccessTitle}>
              Progrès
            </ThemedText>
            <ThemedText style={styles.quickAccessDescription}>
              Visualisez votre évolution
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Aujourd'hui
          </ThemedText>
          <ThemedText style={styles.description}>
            Enregistrez votre humeur et vos notes pour aujourd'hui.
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
  welcomeCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    gap: 8,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    gap: 8,
    marginTop: 10,
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
  quickAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 16,
    marginBottom: 12,
  },
  quickAccessContent: {
    flex: 1,
    gap: 4,
  },
  quickAccessTitle: {
    fontSize: 18,
  },
  quickAccessDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});
