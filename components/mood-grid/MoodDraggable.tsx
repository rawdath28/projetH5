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
import { Fonts } from '../../constants/theme';

type Props = {
  mood: Mood;
  x: number;
  y: number;
  viewportCenterX: SharedValue<number>;
  viewportCenterY: SharedValue<number>;
  cameraX: SharedValue<number>;
  cameraY: SharedValue<number>;
  selectedMoodId: SharedValue<string | null>;
  selectedMoodX: SharedValue<number>;
  selectedMoodY: SharedValue<number>;
  selectedMoodLabel: SharedValue<string>;
  onSelect: (id: string) => void;
};

// Cercles optimisés pour éviter les superpositions
const BASE_SIZE = 115;
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
  selectedMoodId,
  selectedMoodX,
  selectedMoodY,
  selectedMoodLabel,
}: Props) {
  const centerX = viewportCenterX;
  const centerY = viewportCenterY;

  const animatedStyle = useAnimatedStyle(() => {
    const screenX = x + cameraX.value;
    const screenY = y + cameraY.value;

    const dx = screenX - centerX.value;
    const dy = screenY - centerY.value;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const isCenter = distance < CLOSE_DISTANCE;
    
    // Calculer le déplacement si une autre émotion est au centre
    let offsetX = 0;
    let offsetY = 0;
    
    if (selectedMoodId.value && selectedMoodId.value !== mood.id) {
      const distFromSelected = Math.sqrt(
        Math.pow(x - selectedMoodX.value, 2) + 
        Math.pow(y - selectedMoodY.value, 2)
      );
      
      const PUSH_DISTANCE = 200;
      const PUSH_STRENGTH = 40;
      
      if (distFromSelected < PUSH_DISTANCE) {
        const pushFactor = 1 - (distFromSelected / PUSH_DISTANCE);
        const angle = Math.atan2(y - selectedMoodY.value, x - selectedMoodX.value);
        offsetX = Math.cos(angle) * PUSH_STRENGTH * pushFactor;
        offsetY = Math.sin(angle) * PUSH_STRENGTH * pushFactor;
      }
    }
    
    const scale = isCenter ? interpolate(distance, [0, CLOSE_DISTANCE], [MAX_SIZE / BASE_SIZE, 1], Extrapolate.CLAMP) : 1;
    const borderRadius = isCenter ? interpolate(distance, [0, CLOSE_DISTANCE], [BASE_SIZE * 0.35, BASE_SIZE * 0.3], Extrapolate.CLAMP) : BASE_SIZE * 0.3;
    const shadowOpacity = isCenter ? 0.6 : 0.2;
    const shadowRadius = isCenter ? 25 : 10;
    const zIndex = isCenter ? 1000 : 1;

    // Mettre à jour la position de l'émotion sélectionnée
    if (isCenter) {
      selectedMoodId.value = mood.id;
      selectedMoodX.value = x;
      selectedMoodY.value = y;
      selectedMoodLabel.value = mood.label;
    } else if (selectedMoodId.value === mood.id) {
      selectedMoodId.value = null;
      selectedMoodLabel.value = '';
    }

    return {
      position: 'absolute',
      left: x - BASE_SIZE / 2 + offsetX,
      top: y - BASE_SIZE / 2 + offsetY,
      width: BASE_SIZE,
      height: BASE_SIZE,
      transform: [{ scale }],
      borderRadius,
      opacity: 1,
      zIndex,
      shadowOpacity,
      shadowRadius,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      elevation: isCenter ? 10 : 4,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const screenX = x + cameraX.value;
    const screenY = y + cameraY.value;
    const dx = screenX - centerX.value;
    const dy = screenY - centerY.value;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const isCenter = distance < CLOSE_DISTANCE;

    const fontSize = isCenter ? 18 : 15;

    return {
      fontSize,
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
    fontFamily: Fonts.sans.semiBold,
  },
});