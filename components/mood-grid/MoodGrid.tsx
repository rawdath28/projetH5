import { useCallback } from 'react';
import { Dimensions, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay
} from 'react-native-reanimated';

import { ThemedText } from '../../components/themed-text';
import { MOODS } from '../../constants/moods';
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
      ] as const,
    };
  });

  const viewportCenterX = useSharedValue(SPACE_WIDTH / 2);
  const viewportCenterY = useSharedValue(SPACE_HEIGHT / 2);

  useAnimatedReaction(
    () => ({ x: cameraX.value, y: cameraY.value }),
    (current) => {
      'worklet';
      if (containerWidth.value > 0 && containerHeight.value > 0) {
        viewportCenterX.value = -current.x + containerWidth.value / 2;
        viewportCenterY.value = -current.y + containerHeight.value / 2;
      }
    }
  );

  const handleMoodSelect = useCallback(
    (moodId: string) => {
      onComplete(moodId);
    },
    [onComplete]
  );

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
                />
              );
            })}

            {/* Bouton "Continuer" au centre - taille normale fixe */}
            <View
              style={[
                styles.centerButton,
                {
                  left: SPACE_WIDTH / 2 - 65,
                  top: SPACE_HEIGHT / 2 - 65,
                },
              ]}>
              <Pressable
                style={styles.centerPressable}
                onPress={() => onComplete(null)}>
                <ThemedText type="defaultSemiBold" style={styles.centerLabel}>
                  Continuer Sans
                </ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
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
    overflow: 'hidden',
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
    width: 130,
    height: 130,
    borderRadius: 39, // 130 * 0.3 = coins arrondis comme les émotions
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
    fontSize: 15,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
  },
});