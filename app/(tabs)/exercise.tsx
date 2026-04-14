import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { GRADIENTS } from '../../constants/exercise-gradients';
import { Fonts } from '../../constants/theme';
import { useFavorites } from '../../contexts/FavoritesContext';
import type { Exercise } from '../../hooks/use-exercises';
import { useExercises } from '../../hooks/use-exercises';

export default function ExerciseScreen() {
  const router = useRouter();
  const { exercises, loading, error } = useExercises();
  const [search, setSearch] = useState('');
  const { toggleFavorite, isFavorite } = useFavorites();

  const filteredExercises = useMemo(() => {
    if (!search.trim()) return exercises;
    const q = search.toLowerCase();
    return exercises.filter(
      (e) =>
        e.titre.toLowerCase().includes(q) ||
        e.description_courte.toLowerCase().includes(q)
    );
  }, [search, exercises]);

  const favoriteExercises = exercises.filter((e) => isFavorite(e.id));

  const goToDetail = (exercise: Exercise) => {
    router.push({
      pathname: '/screens/exercise-detail',
      params: {
        id: exercise.id,
        titre: exercise.titre,
        description_courte: exercise.description_courte,
        description_longue: exercise.description_longue,
        duree_moyenne: exercise.duree_moyenne,
        effort_cognitif: exercise.effort_cognitif,
        psychologues: exercise.psychologues,
        gradientIndex: exercise.gradientIndex,
      },
    } as any);
  };

  return (
    <View style={styles.wrapper}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <IconSymbol size={18} name="magnifyingglass" color="#AAAAAA" />
        <TextInput
          style={styles.searchInput}
          placeholder="Recherchez un exercice"
          placeholderTextColor="#AAAAAA"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <IconSymbol size={16} name="xmark.circle.fill" color="#AAAAAA" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#027A54" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Section Favoris — grille 2 colonnes */}
          {favoriteExercises.length > 0 && !search.trim() && (
            <View style={styles.favoritesSection}>
              <ThemedText style={styles.sectionTitle}>Favoris</ThemedText>
              <View style={styles.favoritesGrid}>
                {favoriteExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.favoriteCard}
                    onPress={() => router.push({ pathname: '/screens/chat', params: { titre: exercise.titre, exerciseId: exercise.id } } as any)}
                  >
                    <ThemedText style={styles.favoriteCardTitle} numberOfLines={2}>
                      {exercise.titre}
                    </ThemedText>
                    <IconSymbol size={13} name="arrow.right" color="#666666" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Séparateur */}
          {favoriteExercises.length > 0 && !search.trim() && (
            <View style={styles.separator} />
          )}

          {/* Grille d'exercices */}
          <View style={styles.gridContainer}>
            {filteredExercises.map((exercise) => {
              const grad = GRADIENTS[exercise.gradientIndex];
              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.gridCard}
                  onPress={() => goToDetail(exercise)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={grad.colors}
                    start={grad.start}
                    end={grad.end}
                    style={StyleSheet.absoluteFill}
                  />

                  {/* Étoile favoris */}
                  <TouchableOpacity
                    style={styles.starButton}
                    onPress={() => toggleFavorite(exercise.id)}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <IconSymbol
                      size={20}
                      name={isFavorite(exercise.id) ? 'star.fill' : 'star'}
                      color='rgba(0,0,0,0.35)'
                    />
                  </TouchableOpacity>

                  {/* Titre */}
                  <ThemedText style={styles.gridCardTitle}>{exercise.titre}</ThemedText>
                </TouchableOpacity>
              );
            })}
            {filteredExercises.length % 2 !== 0 && <View style={styles.gridCardPlaceholder} />}
          </View>

          {filteredExercises.length === 0 && (
            <View style={styles.emptyState}>
              <IconSymbol size={40} name="magnifyingglass" color="#CCCCCC" />
              <ThemedText style={styles.emptyText}>Aucun exercice trouvé</ThemedText>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: '#CC0000',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: '#1A1A1A',
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  favoritesSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.sans.bold,
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  favoriteCard: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '47%',
  },
  favoriteCardTitle: {
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    color: '#333333',
    flexShrink: 1,
    lineHeight: 18,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    gap: 18
  },
  gridCard: {
    height: '47.5%',
    width: '47.5%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  gridCardPlaceholder: {
    width: '47.5%',
  },
  starButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  durationText: {
    fontSize: 11,
    fontFamily: Fonts.sans.semiBold,
    color: '#FFFFFF',
  },
  gridCardTitle: {
    fontSize: 18,
    fontFamily: Fonts.sans.semiBold,
    color: '#FFFFFF',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: '#AAAAAA',
  },
});
