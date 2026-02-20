import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring
} from 'react-native-reanimated';
import { Fonts } from '../../constants/theme';
import { useMoods } from '../../contexts/MoodsContext';
import { IconSymbol } from '../ui/icon-symbol';
import { MoodDraggable } from './MoodDraggable';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Espace émotionnel ajusté pour meilleur espacement
const SPACE_WIDTH = SCREEN_WIDTH * 1.3;
const SPACE_HEIGHT = SCREEN_HEIGHT * 1.3;
const PADDING = 30; // Padding pour éviter les superpositions
const PAN_MARGIN = SCREEN_WIDTH * 0.6; // Marge supplémentaire pour le défilement de la caméra

// Configuration spring plus fluide et naturelle
const SPRING_CONFIG = {
  damping: 25,
  stiffness: 120,
  mass: 0.6,
};

// Bulle "Continuer" traitée comme une émotion - participe aux collisions
const CONTINUER_MOOD = {
  id: 'continuer',
  label: 'Continuer',
  color: '#FFFFFF',
  valence: 0,
  energy: 0,
};

type Props = {
  onComplete: (selectedMood: string | null) => void;
};


export function MoodGrid({ onComplete }: Props) {
  const { moods: MOODS, loading: moodsLoading, error: moodsError } = useMoods();

  // Afficher un loader pendant le chargement des moods
  if (moodsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Chargement des moods...</Text>
      </View>
    );
  }

  // Afficher une erreur si les moods n'ont pas pu être chargés
  if (moodsError || MOODS.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000', padding: 20 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, textAlign: 'center', marginBottom: 10 }}>
          {moodsError ? 'Erreur lors du chargement des moods depuis la base de données' : 'Aucun mood trouvé dans la base de données'}
        </Text>
        <Text style={{ color: '#999999', fontSize: 14, textAlign: 'center' }}>
          Veuillez vous assurer que la table 'moods' existe dans Supabase et contient des données.
        </Text>
      </View>
    );
  }

  const containerWidth = useSharedValue(0);
  const containerHeight = useSharedValue(0);

  const cameraX = useSharedValue(0);
  const cameraY = useSharedValue(0);

  // Tracking de l'émotion sélectionnée pour le repoussage et la description
  const selectedMoodId = useSharedValue<string | null>(null);
  const selectedMoodX = useSharedValue(0);
  const selectedMoodY = useSharedValue(0);
  const selectedMoodLabel = useSharedValue<string>('');
  const closestDistance = useSharedValue<number>(Infinity);

  // Inclure le bouton Continuer dans le système de collisions
  const allMoodsWithContinuer = useMemo(
    () => [CONTINUER_MOOD, ...MOODS],
    [MOODS]
  );

  // Positions animées pour chaque émotion (pour le système de repoussement)
  const moodPositions = useSharedValue<Record<string, { x: number; y: number; scale: number }>>({});

  // État React pour afficher le nom de l'émotion
  const [displayedMood, setDisplayedMood] = useState<string>('');

  // Synchroniser la shared value avec l'état React
  useAnimatedReaction(
    () => selectedMoodLabel.value,
    (currentLabel) => {
      runOnJS(setDisplayedMood)(currentLabel);
    }
  );

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      containerWidth.value = width;
      containerHeight.value = height;
      // Centrer la vue sur l'espace émotionnel
      cameraX.value = -(SPACE_WIDTH - width) / 2;
      cameraY.value = -(SPACE_HEIGHT - height) / 2;
    }
  }, [cameraX, cameraY, containerWidth, containerHeight]);

  const emotionToPixel = useCallback(
    (valence: number, energy: number) => {
      // Grille carrée uniforme - espacement égal horizontal et vertical
      const usableWidth = SPACE_WIDTH - 2 * PADDING;
      const usableHeight = SPACE_HEIGHT - 2 * PADDING;

      // Normaliser pour créer une grille carrée parfaite
      const gridSize = Math.min(usableWidth, usableHeight);
      const offsetX = (SPACE_WIDTH - gridSize) / 2;
      const offsetY = (SPACE_HEIGHT - gridSize) / 2;

      // Position dans la grille carrée
      const x = offsetX + ((valence + 1) / 2) * gridSize;
      const y = offsetY + ((1 - energy) / 2) * gridSize;

      return { x, y };
    },
    []
  );

  // Initialiser les positions pour tous les moods + le bouton Continuer
  useEffect(() => {
    if (MOODS.length === 0 || moodsLoading) return;

    try {
      const initialPositions: Record<string, { x: number; y: number; scale: number }> = {};
      allMoodsWithContinuer.forEach((mood) => {
        const pos = emotionToPixel(mood.valence, mood.energy);
        initialPositions[mood.id] = { x: pos.x, y: pos.y, scale: 1 };
      });
      moodPositions.value = initialPositions;
    } catch (e) {
      console.error('Erreur lors de l\'initialisation des positions:', e);
    }
  }, [emotionToPixel, allMoodsWithContinuer, moodsLoading]);

  // Valeurs de départ pour le pan gesture
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Gesture de pan avec inertie (momentum scrolling)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startX.value = cameraX.value;
      startY.value = cameraY.value;
    })
    .onUpdate((event) => {
      'worklet';
      cameraX.value = startX.value + event.translationX;
      cameraY.value = startY.value + event.translationY;
    })
    .onEnd((event) => {
      'worklet';
      // Inertie fluide avec marge étendue pour accéder aux bords
      cameraX.value = withDecay({
        velocity: event.velocityX,
        deceleration: 0.9985,
        clamp: [
          -(SPACE_WIDTH - containerWidth.value + PAN_MARGIN),
          PAN_MARGIN
        ],
      });
      cameraY.value = withDecay({
        velocity: event.velocityY,
        deceleration: 0.9985,
        clamp: [
          -(SPACE_HEIGHT - containerHeight.value + PAN_MARGIN),
          PAN_MARGIN
        ],
      });
    });

  const spaceStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: cameraX.value },
        { translateY: cameraY.value },
      ] as const
    };
  });

  const viewportCenterX = useSharedValue(SPACE_WIDTH / 2);
  const viewportCenterY = useSharedValue(SPACE_HEIGHT / 2);

  useAnimatedReaction(
    () => ({ x: cameraX.value, y: cameraY.value, width: containerWidth.value, height: containerHeight.value }),
    (current) => {
      'worklet';
      if (current.width > 0 && current.height > 0) {
        viewportCenterX.value = -current.x + current.width / 2;
        viewportCenterY.value = -current.y + current.height / 2;
        // Réinitialiser pour permettre aux bulles de recalculer laquelle est la plus proche
        closestDistance.value = Infinity;
        selectedMoodId.value = null;
      }
    }
  );

  const handleMoodSelect = useCallback(
    (moodId: string) => {
      if (moodId === 'continuer') {
        onComplete(null);
      } else {
        onComplete(moodId);
      }
    },
    [onComplete]
  );

  // Animation de la barre de description
  const descriptionStyle = useAnimatedStyle(() => {
    const hasSelection = selectedMoodLabel.value !== '';
    const translateY = withSpring(hasSelection ? 0 : 150, {
      damping: 20,
      stiffness: 200,
    });
    const opacity = hasSelection ? 1 : 0;

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={panGesture}>
        <View onLayout={handleLayout} style={styles.container}>
          <Animated.View
            style={[
              styles.emotionalSpace,
              {
                width: SPACE_WIDTH,
                height: SPACE_HEIGHT,
              },
              spaceStyle,
            ]}>
            {/* Grille très subtile - juste pour l'orientation */}
            {Array.from({ length: 5 }).map((_, i) => {
              const gridSize = Math.min(SPACE_WIDTH - 2 * PADDING, SPACE_HEIGHT - 2 * PADDING);
              const offsetX = (SPACE_WIDTH - gridSize) / 2;
              const offsetY = (SPACE_HEIGHT - gridSize) / 2;
              const pos = offsetX + (i / 4) * gridSize;
              return (
                <View
                  key={`v-${i}`}
                  style={[
                    styles.gridLine,
                    {
                      left: pos,
                      top: offsetY,
                      height: gridSize,
                      width: 1,
                      opacity: i === 2 ? 0.12 : 0.04,
                    },
                  ]}
                />
              );
            })}
            {Array.from({ length: 5 }).map((_, i) => {
              const gridSize = Math.min(SPACE_WIDTH - 2 * PADDING, SPACE_HEIGHT - 2 * PADDING);
              const offsetX = (SPACE_WIDTH - gridSize) / 2;
              const offsetY = (SPACE_HEIGHT - gridSize) / 2;
              const pos = offsetY + (i / 4) * gridSize;
              return (
                <View
                  key={`h-${i}`}
                  style={[
                    styles.gridLine,
                    {
                      top: pos,
                      left: offsetX,
                      width: gridSize,
                      height: 1,
                      opacity: i === 2 ? 0.12 : 0.04,
                    },
                  ]}
                />
              );
            })}

            {/* Axes centraux */}
            <View
              style={[
                styles.centerAxis,
                {
                  left: SPACE_WIDTH / 2 - 1,
                  top: (SPACE_HEIGHT - Math.min(SPACE_WIDTH - 2 * PADDING, SPACE_HEIGHT - 2 * PADDING)) / 2,
                  height: Math.min(SPACE_WIDTH - 2 * PADDING, SPACE_HEIGHT - 2 * PADDING),
                  width: 2,
                },
              ]}
            />
            <View
              style={[
                styles.centerAxis,
                {
                  top: SPACE_HEIGHT / 2 - 1,
                  left: (SPACE_WIDTH - Math.min(SPACE_WIDTH - 2 * PADDING, SPACE_HEIGHT - 2 * PADDING)) / 2,
                  width: Math.min(SPACE_WIDTH - 2 * PADDING, SPACE_HEIGHT - 2 * PADDING),
                  height: 2,
                },
              ]}
            />

            {/* Toutes les émotions + bouton Continuer (participent tous aux collisions) */}
            {allMoodsWithContinuer.map((mood) => {
              const pixelPos = emotionToPixel(mood.valence, mood.energy);
              return (
                <MoodDraggable
                  key={mood.id}
                  mood={mood}
                  x={pixelPos.x}
                  y={pixelPos.y}
                  viewportCenterX={viewportCenterX}
                  viewportCenterY={viewportCenterY}
                  cameraX={cameraX}
                  cameraY={cameraY}
                  onSelect={handleMoodSelect}
                  selectedMoodId={selectedMoodId}
                  selectedMoodX={selectedMoodX}
                  selectedMoodY={selectedMoodY}
                  selectedMoodLabel={selectedMoodLabel}
                  closestDistance={closestDistance}
                  moodPositions={moodPositions}
                  allMoods={allMoodsWithContinuer}
                  emotionToPixel={emotionToPixel}
                />
              );
            })}
          </Animated.View>

          {/* Description de l'émotion centrée */}
          {displayedMood !== '' && (
            <Animated.View style={[styles.descriptionContainer, descriptionStyle]}>
              <View style={styles.moodInfoContainer}>
                <Text style={styles.moodTitle} numberOfLines={1}>
                  {displayedMood}
                </Text>
                <Text style={styles.moodDescription} numberOfLines={2}>
                  {MOODS.find(m => m.label === displayedMood)?.description ?? ''}
                </Text>
              </View>
              <Pressable
                style={styles.arrowButton}
                onPress={() => {
                  const moodId = MOODS.find(m => m.label === displayedMood)?.id;
                  if (moodId) {
                    onComplete(moodId);
                  }
                }}>
                <IconSymbol name="arrow.right" size={24} color="#000000" />
              </Pressable>
            </Animated.View>
          )}
        </View>
      </GestureDetector>

      {/* Texte à gauche et icône de recherche à droite sur la même ligne */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchText}>Comment te sens tu aujourd'hui ?</Text>
        <Pressable
          style={styles.searchButton}
          onPress={() => console.log('Search pressed')}>
          <IconSymbol name="magnifyingglass" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    // overflow: 'hidden',
    backgroundColor: '#000000',
  },
  emotionalSpace: {
    position: 'relative',
    backgroundColor: '#000000',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  centerAxis: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  descriptionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    minHeight: 100,
    backgroundColor: 'rgba(60, 60, 60, 0.95)',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 30,
    paddingRight: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  moodInfoContainer: {
    flex: 1,
    marginRight: 15,
  },
  moodTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: Fonts.serif.bold,
    marginBottom: 6,
  },
  moodDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    lineHeight: 18,
  },
  arrowButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
    searchContainer: {
      position: 'absolute',
      top: 25,
      left: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
    },
  searchText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: Fonts.sans.regular,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});