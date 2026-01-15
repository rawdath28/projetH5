import { useCallback, useState } from 'react';
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

import { ThemedText } from '../../components/themed-text';
import { MOODS } from '../../constants/moods';
import { Fonts } from '../../constants/theme';
import { IconSymbol } from '../ui/icon-symbol';
import { MoodDraggable } from './MoodDraggable';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Espace émotionnel ajusté pour meilleur espacement
const SPACE_WIDTH = SCREEN_WIDTH * 1.3;
const SPACE_HEIGHT = SCREEN_HEIGHT * 1.3;
const PADDING = 30; // Padding pour éviter les superpositions

// Configuration spring plus fluide et naturelle
const SPRING_CONFIG = {
  damping: 25,
  stiffness: 120,
  mass: 0.6,
};

type Props = {
  onComplete: (selectedMood: string | null) => void;
};

export function MoodGrid({ onComplete }: Props) {
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
      // Inertie fluide avec décélération naturelle
      cameraX.value = withDecay({
        velocity: event.velocityX,
        deceleration: 0.997,
        clamp: [
          -(SPACE_WIDTH - containerWidth.value),
          0
        ],
      });
      cameraY.value = withDecay({
        velocity: event.velocityY,
        deceleration: 0.997,
        clamp: [
          -(SPACE_HEIGHT - containerHeight.value),
          0
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
        // Réinitialiser la distance la plus proche quand la caméra bouge pour recalculer
        closestDistance.value = Infinity;
      }
    }
  );
  
  // Réinitialiser la distance la plus proche à chaque frame pour trouver le vrai plus proche
  useAnimatedReaction(
    () => ({ cx: cameraX.value, cy: cameraY.value }),
    () => {
      'worklet';
      // Réinitialiser avant que les moods ne soient évalués
      closestDistance.value = Infinity;
    },
    [closestDistance]
  );

  const handleMoodSelect = useCallback(
    (moodId: string) => {
      onComplete(moodId);
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

            {/* Toutes les émotions */}
            {MOODS.map((mood) => {
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
                />
              );
            })}

            {/* Bouton "Continuer" au centre */}
            <View
              style={[
                styles.centerButton,
                {
                  left: SPACE_WIDTH / 2 - 57.5,
                  top: SPACE_HEIGHT / 2 - 57.5,
                },
              ]}>
              <Pressable
                style={styles.centerPressable}
                onPress={() => onComplete(null)}>
                <ThemedText type="defaultSemiBold" style={styles.centerLabel}>
                  Continuer
                </ThemedText>
              </Pressable>
            </View>
          </Animated.View>

          {/* Description de l'émotion centrée */}
          {displayedMood !== '' && (
            <Animated.View style={[styles.descriptionContainer, descriptionStyle]}>
              <Text style={styles.moodTitle} numberOfLines={2}>
                {displayedMood}
              </Text>
              <Pressable 
                style={styles.arrowButton}
                onPress={() => {
                  const moodId = MOODS.find(m => m.label === displayedMood)?.id;
                  if (moodId) {
                    onComplete(moodId);
                  }
                }}>
                <Text style={styles.arrow}>→</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </GestureDetector>
      
      {/* Search button top-right */}
      <Pressable 
        style={styles.searchButton}
        onPress={() => console.log('Search pressed')}>
        <IconSymbol name="magnifyingglass" size={20} color="#FFFFFF" />
      </Pressable>
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
  centerButton: {
    position: 'absolute',
    width: 115,
    height: 115,
    borderRadius: 39,
    backgroundColor: 'rgba(60, 60, 60, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  centerPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  centerLabel: {
    fontSize: 14,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: Fonts.sans.semiBold,
  },
  descriptionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 80,
    backgroundColor: 'rgba(60, 60, 60, 0.95)',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  moodTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: Fonts.serif.bold,
    flex: 1,
  },
  arrowButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 32,
    color: '#000000',
    fontFamily: Fonts.sans.bold,
  },
  searchButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1000,
  },
});