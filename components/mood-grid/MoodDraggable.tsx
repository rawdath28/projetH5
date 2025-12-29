import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';

import { Mood } from '../../constants/moods';

type Props = {
  mood: Mood;
  x: number;
  y: number;
  viewportCenterX: SharedValue<number>;
  viewportCenterY: SharedValue<number>;
  cameraX: SharedValue<number>;
  cameraY: SharedValue<number>;
  onSelect: (id: string) => void;
};

// Cercles optimisés pour éviter les superpositions
const BASE_SIZE = 130;
const MIN_SIZE = 95;
const MAX_SIZE = 170;

// Distances pour un effet de grossissement progressif et doux
const CLOSE_DISTANCE = 150;
const FAR_DISTANCE = 320;

function MoodDraggableComponent({
  mood,
  x,
  y,
  viewportCenterX,
  viewportCenterY,
  cameraX,
  cameraY,
  onSelect,
}: Props) {
  const centerX = viewportCenterX;
  const centerY = viewportCenterY;

  const animatedStyle = useAnimatedStyle(() => {
    const screenX = x + cameraX.value;
    const screenY = y + cameraY.value;

    const dx = screenX - centerX.value;
    const dy = screenY - centerY.value;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Effet de grossissement progressif et fluide au centre
    // Plus l'émotion est proche du centre, plus elle grossit
    const scale = interpolate(
      distance,
      [0, CLOSE_DISTANCE, FAR_DISTANCE],
      [MAX_SIZE / BASE_SIZE, 1, MIN_SIZE / BASE_SIZE],
      Extrapolate.CLAMP
    );

    // Coins arrondis style "rounded square" (pas des cercles parfaits)
    const borderRadius = interpolate(
      distance,
      [0, CLOSE_DISTANCE, FAR_DISTANCE],
      [BASE_SIZE * 0.35, BASE_SIZE * 0.3, BASE_SIZE * 0.25],
      Extrapolate.CLAMP
    );

    // Opacité : les émotions lointaines sont légèrement transparentes
    const opacity = interpolate(
      distance,
      [0, FAR_DISTANCE, FAR_DISTANCE * 1.5],
      [1, 0.95, 0.7],
      Extrapolate.CLAMP
    );

    // Ombres plus prononcées au centre pour accentuer l'effet de focus
    const shadowOpacity = interpolate(
      distance,
      [0, CLOSE_DISTANCE, FAR_DISTANCE],
      [0.6, 0.3, 0.15],
      Extrapolate.CLAMP
    );

    const shadowRadius = interpolate(
      distance,
      [0, CLOSE_DISTANCE, FAR_DISTANCE],
      [25, 15, 8],
      Extrapolate.CLAMP
    );

    // Z-index : les émotions centrales passent au premier plan
    const zIndex = Math.round(1000 - distance);

    return {
      position: 'absolute',
      left: x - BASE_SIZE / 2,
      top: y - BASE_SIZE / 2,
      width: BASE_SIZE,
      height: BASE_SIZE,
      transform: [{ scale }],
      borderRadius,
      opacity,
      zIndex,
      shadowOpacity,
      shadowRadius,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      elevation: Math.round(scale * 10),
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const screenX = x + cameraX.value;
    const screenY = y + cameraY.value;
    const dx = screenX - centerX.value;
    const dy = screenY - centerY.value;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Taille de police adaptative
    const fontSize = interpolate(
      distance,
      [0, CLOSE_DISTANCE, FAR_DISTANCE],
      [18, 15, 11],
      Extrapolate.CLAMP
    );

    const fontWeight = distance < CLOSE_DISTANCE ? '700' : '600';

    return {
      fontSize,
      fontWeight,
    };
  });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      'worklet';
      runOnJS(onSelect)(mood.id);
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.chip,
          animatedStyle,
          { backgroundColor: mood.color },
        ]}>
        <Animated.Text 
          style={[styles.label, textStyle]}
          numberOfLines={2}
          adjustsFontSizeToFit>
          {mood.label}
        </Animated.Text>
      </Animated.View>
    </GestureDetector>
  );
}

export const MoodDraggable = memo(MoodDraggableComponent);

const styles = StyleSheet.create({
  chip: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  label: {
    color: '#000000',
    textAlign: 'center',
    lineHeight: 18,
  },
});