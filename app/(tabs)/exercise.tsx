import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';
import { ExerciseBottomSheet } from '../../components/exercise-bottom-sheet';
import { ThemedText } from '../../components/themed-text';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors, Fonts } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function ExerciseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [showBottomSheet, setShowBottomSheet] = useState(true);
  const router = useRouter();

  const exercises = [
    {
      id: 1,
      icon: 'wind',
      title: 'Exercice de respiration',
      description: 'Technique de respiration profonde pour gérer l\'anxiété et le stress',
      duration: '5-10 min',
      difficulty: 'Débutant',
      color: '#4A90E2',
    },
    {
      id: 2,
      icon: 'brain.head.profile',
      title: 'Restructuration cognitive',
      description: 'Identifiez et remettez en question vos pensées négatives',
      duration: '15-20 min',
      difficulty: 'Intermédiaire',
      color: '#9B59B6',
    },
    {
      id: 3,
      icon: 'book.closed',
      title: 'Journal de pensées',
      description: 'Enregistrez vos pensées et émotions pour mieux les comprendre',
      duration: '10-15 min',
      difficulty: 'Débutant',
      color: '#E67E22',
    },
    {
      id: 4,
      icon: 'circle.hexagonpath',
      title: 'Cercles de contrôles',
      description: 'Distinguez ce que vous contrôlez de ce qui est hors de votre portée',
      duration: '10-15 min',
      difficulty: 'Débutant',
      color: '#027A54',
    },
  ];

  return (
    <View style={styles.wrapper}>
      {/* Header avec fond vert */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <IconSymbol size={32} name="lightbulb.fill" color="#FFFFFF" />
          </View>
          <ThemedText style={styles.title}>Exercices</ThemedText>
          <ThemedText style={styles.subtitle}>
            Pratiques guidées pour votre bien-être
          </ThemedText>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Stats rapides */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <IconSymbol size={20} name="checkmark.circle.fill" color="#027A54" />
              </View>
              <ThemedText style={styles.statValue}>8</ThemedText>
              <ThemedText style={styles.statLabel}>Complétés</ThemedText>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <IconSymbol size={20} name="flame.fill" color="#027A54" />
              </View>
              <ThemedText style={styles.statValue}>5</ThemedText>
              <ThemedText style={styles.statLabel}>Série</ThemedText>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <IconSymbol size={20} name="clock" color="#027A54" />
              </View>
              <ThemedText style={styles.statValue}>2h</ThemedText>
              <ThemedText style={styles.statLabel}>Cette semaine</ThemedText>
            </View>
          </View>

          {/* Section exercices recommandés */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Recommandés pour vous</ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.seeAllText}>Voir tout</ThemedText>
              </TouchableOpacity>
            </View>

            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => {
                  if (exercise.id === 4) {
                    router.push('/select-thought-screen');
                  }
                }}
              >
                <View style={styles.exerciseCardContent}>
                  <View style={[styles.exerciseIconContainer, { backgroundColor: exercise.color + '20' }]}>
                    {/* <IconSymbol size={28} name={exercise.icon} color={exercise.color} /> */}
                    <IconSymbol size={48} name="lightbulb.fill" color="#027A54" />

                  </View>
                  
                  <View style={styles.exerciseInfo}>
                    <ThemedText style={styles.exerciseTitle}>
                      {exercise.title}
                    </ThemedText>
                    <ThemedText style={styles.exerciseDescription}>
                      {exercise.description}
                    </ThemedText>
                    
                    <View style={styles.exerciseMeta}>
                      <View style={styles.metaItem}>
                        <IconSymbol size={14} name="clock" color="#999999" />
                        <ThemedText style={styles.metaText}>{exercise.duration}</ThemedText>
                      </View>
                      <View style={[styles.difficultyBadge, exercise.difficulty === 'Débutant' ? styles.difficultyEasy : styles.difficultyMedium]}>
                        <ThemedText style={styles.difficultyText}>{exercise.difficulty}</ThemedText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.exerciseArrow}>
                    <IconSymbol size={20} name="chevron.right" color="#027A54" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Section exercices récents */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Exercices récents</ThemedText>
            
            <View style={styles.recentCard}>
              <View style={styles.recentCardHeader}>
                <View style={styles.recentIconWrapper}>
                  <View style={[styles.recentIcon, { backgroundColor: '#027A54' + '20' }]}>
                    <IconSymbol size={20} name="circle.hexagonpath" color="#027A54" />
                  </View>
                </View>
                <View style={styles.recentCardContent}>
                  <ThemedText style={styles.recentTitle}>Cercles de contrôles</ThemedText>
                  <ThemedText style={styles.recentDate}>Il y a 2 heures</ThemedText>
                </View>
                <View style={styles.completedBadge}>
                  <IconSymbol size={16} name="checkmark" color="#027A54" />
                </View>
              </View>
            </View>

            <View style={styles.recentCard}>
              <View style={styles.recentCardHeader}>
                <View style={styles.recentIconWrapper}>
                  <View style={[styles.recentIcon, { backgroundColor: '#027A54' + '20' }]}>
                    <IconSymbol size={20} name="wind" color="#027A54" />
                  </View>
                </View>
                <View style={styles.recentCardContent}>
                  <ThemedText style={styles.recentTitle}>Respiration profonde</ThemedText>
                  <ThemedText style={styles.recentDate}>Hier, 18:30</ThemedText>
                </View>
                <View style={styles.completedBadge}>
                  <IconSymbol size={16} name="checkmark" color="#027A54" />
                </View>
              </View>
            </View>
          </View>

          {/* Bouton pour réafficher le bottom sheet */}
          {!showBottomSheet && (
            <TouchableOpacity
              style={styles.showBottomSheetButton}
              onPress={() => setShowBottomSheet(true)}
            >
              <IconSymbol size={20} name="lightbulb.fill" color="#FFFFFF" />
              <ThemedText style={styles.showBottomSheetButtonText}>
                Afficher la suggestion
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sheet de suggestion d'exercice */}
      <ExerciseBottomSheet
        visible={showBottomSheet}
        titlePart1="Ici, tu fais une "
        titlePart2="distortion cognitive !"
        description="Le tribunal permet de sortir de l'émotion pour revenir aux faits. Le but est de chercher des preuves concrètes comme s'il était dans un tribunal."
        buttonText="Démarrer l'exercice"
        onButtonPress={() => {
          console.log('Démarrer exercice');
          router.push('/select-thought-screen');
        }}
        onDismiss={() => setShowBottomSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    backgroundColor: '#027A54',
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
    paddingBottom: 80,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -30,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(2, 122, 84, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontFamily: Fonts.sans.bold,
    color: '#027A54',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Fonts.sans.regular,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.sans.bold,
    color: '#027A54',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: Fonts.sans.semiBold,
    color: '#027A54',
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontFamily: Fonts.sans.semiBold,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: Fonts.sans.regular,
    color: '#999999',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyEasy: {
    backgroundColor: 'rgba(2, 122, 84, 0.15)',
  },
  difficultyMedium: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
  },
  difficultyText: {
    fontSize: 11,
    fontFamily: Fonts.sans.semiBold,
    color: '#027A54',
  },
  exerciseArrow: {
    marginLeft: 8,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  recentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentIconWrapper: {
    marginRight: 12,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentCardContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontFamily: Fonts.sans.semiBold,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 12,
    fontFamily: Fonts.sans.regular,
    color: '#999999',
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(2, 122, 84, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  showBottomSheetButton: {
    backgroundColor: '#027A54',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#027A54',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  showBottomSheetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.sans.semiBold,
  },
});