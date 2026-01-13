import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ExerciseBottomSheet } from '../../components/exercise-bottom-sheet';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function ExerciseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // État pour afficher/cacher le bottom sheet (pour test)
  const [showBottomSheet, setShowBottomSheet] = useState(true);

  return (
    <View style={styles.wrapper}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <IconSymbol size={48} name="lightbulb.fill" color={colors.tint} />
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

        {/* Bouton pour réafficher le bottom sheet (test) */}
        {!showBottomSheet && (
          <Pressable
            style={styles.showBottomSheetButton}
            onPress={() => setShowBottomSheet(true)}
          >
            <ThemedText style={styles.showBottomSheetButtonText}>
              Afficher la suggestion
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
    </ScrollView>

      {/* Bottom Sheet de suggestion d'exercice */}
      <ExerciseBottomSheet
        visible={showBottomSheet}
        titlePart1="Ici, tu fais une "
        titlePart2="distortion cognitive !"
        description="Le tribunal permet de sortir de l'émotion pour revenir aux faits. Le but est de chercher des preuves concrètes comme s'il était dans un tribunal."
        buttonText="Démarrer l'exercice"
        onButtonPress={() => {
          // TODO: Naviguer vers l'exercice
          console.log('Démarrer exercice');
        }}
        onDismiss={() => setShowBottomSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
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
  showBottomSheetButton: {
    backgroundColor: '#027A54',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  showBottomSheetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

