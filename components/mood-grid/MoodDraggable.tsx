import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { Fonts } from '../../constants/theme';

interface Mood {
  id: string;
  label: string;
  color: string;
  valence: number;
  energy: number;
}
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
  closestDistance: SharedValue<number>;
  moodPositions: SharedValue<Record<string, { x: number; y: number; scale: number }>>;
  allMoods: Mood[];
  emotionToPixel: (valence: number, energy: number) => { x: number; y: number };
  onSelect: (id: string) => void;
};

// Configuration des bulles
const BASE_SIZE = 115;
const MAX_SCALE = 1.50;

// Distances pour la détection de l'émotion centrale
const CLOSE_DISTANCE = 180;

// Configuration de la physique de collision
const MIN_GAP = 10;
const COLLISION_DAMPING = 1.0;
const COLLISION_ITERATIONS = 5;

// Spring pour le déplacement des bulles repoussées — plus réactif
const POSITION_SPRING_CONFIG = {
  damping: 28,
  stiffness: 50,
  mass: 1.2,
};

// Spring pour le grossissement — progressif et visible
const SCALE_SPRING_CONFIG = {
  damping: 20,
  stiffness: 60,
  mass: 0.8,
};

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
  closestDistance,
  moodPositions,
  allMoods,
  emotionToPixel,
}: Props) {
  const centerX = viewportCenterX;
  const centerY = viewportCenterY;

  // Positions animées pour cette émotion
  const animatedX = useSharedValue(x);
  const animatedY = useSharedValue(y);

  // ─── CLEF DU FIX ───────────────────────────────────────────────────────────
  // `animatedScale` est la valeur réellement animée avec withSpring.
  // `currentScale` en est un miroir mis à jour à chaque frame via useAnimatedReaction,
  // ce qui permet au système de collision de lire le scale en cours de grossissement
  // et de pousser les voisins AU FUR ET À MESURE que la bulle grandit.
  const animatedScale = useSharedValue(1);
  const currentScale = useSharedValue(1); // miroir synchronisé frame-par-frame
  // ────────────────────────────────────────────────────────────────────────────

  // 1. Calculer le scale cible à chaque fois que la distance au centre change
  useAnimatedReaction(
    () => {
      // Tout en coordonnées MONDE — animatedX/Y et viewportCenter sont dans le même repère
      const dx = animatedX.value - centerX.value;
      const dy = animatedY.value - centerY.value;
      return Math.sqrt(dx * dx + dy * dy);
    },
    (distance) => {
      'worklet';

      const isClosest = distance < closestDistance.value;

      if (isClosest) {
        closestDistance.value = distance;
        selectedMoodId.value = mood.id;
        selectedMoodX.value = animatedX.value;
        selectedMoodY.value = animatedY.value;
        selectedMoodLabel.value = mood.label;
      }

      const isCenter = selectedMoodId.value === mood.id && distance < CLOSE_DISTANCE;
      const targetScale = isCenter
        ? interpolate(distance, [0, CLOSE_DISTANCE], [MAX_SCALE, 1], Extrapolate.CLAMP)
        : 1;

      // Animer le scale progressivement — c'est ici que le grossissement devient fluide
      if (Math.abs(animatedScale.value - targetScale) > 0.01) {
        animatedScale.value = withSpring(targetScale, SCALE_SPRING_CONFIG);
      }
    }
  );

  // 2. Synchroniser currentScale avec animatedScale frame par frame
  //    → les collisions lisent toujours le scale instantané pendant l'animation
  useAnimatedReaction(
    () => animatedScale.value,
    (scale) => {
      'worklet';
      currentScale.value = scale;
    }
  );

  // 3. Système de collision — réagit au scale en cours (currentScale) en temps réel
  useAnimatedReaction(
    () => ({
      selectedId: selectedMoodId.value,
      positions: moodPositions.value,
      // Arrondi à 2 décimales pour éviter de se déclencher à chaque micro-variation
      scale: Math.round(currentScale.value * 100) / 100,
    }),
    (current) => {
      'worklet';

      const myRadius = (BASE_SIZE * current.scale) / 2;

      let totalOffsetX = 0;
      let totalOffsetY = 0;

      for (let iteration = 0; iteration < COLLISION_ITERATIONS; iteration++) {
        let hasCollision = false;

        for (const otherMood of allMoods) {
          if (otherMood.id === mood.id) continue;

          const otherPos = current.positions[otherMood.id];
          if (!otherPos) continue;

          const myCurrentX = x + totalOffsetX;
          const myCurrentY = y + totalOffsetY;

          const dx = myCurrentX - otherPos.x;
          const dy = myCurrentY - otherPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 0.01) continue;

          const otherRadius = (BASE_SIZE * otherPos.scale) / 2;
          const minDist = myRadius + otherRadius + MIN_GAP;

          if (dist < minDist) {
            hasCollision = true;

            const overlap = minDist - dist;
            const separation = overlap * COLLISION_DAMPING;

            const dirX = dx / dist;
            const dirY = dy / dist;

            totalOffsetX += dirX * (separation / 2);
            totalOffsetY += dirY * (separation / 2);
          }
        }

        if (!hasCollision) break;
      }

      const targetX = x + totalOffsetX;
      const targetY = y + totalOffsetY;

      const deltaX = Math.abs(targetX - animatedX.value);
      const deltaY = Math.abs(targetY - animatedY.value);

      if (deltaX > 5 || deltaY > 5) {
        animatedX.value = withSpring(targetX, POSITION_SPRING_CONFIG);
        animatedY.value = withSpring(targetY, POSITION_SPRING_CONFIG);
      }

      const prevPos = moodPositions.value[mood.id];
      const posChangedX = !prevPos || Math.abs(prevPos.x - targetX) > 5;
      const posChangedY = !prevPos || Math.abs(prevPos.y - targetY) > 5;
      const scaleChanged = !prevPos || Math.abs(prevPos.scale - current.scale) > 0.01;

      if (posChangedX || posChangedY || scaleChanged) {
        moodPositions.value = {
          ...moodPositions.value,
          [mood.id]: {
            x: targetX,
            y: targetY,
            scale: current.scale,
          },
        };
      }
    },
    [x, y, mood.id, allMoods]
  );

  const animatedStyle = useAnimatedStyle(() => {
    const borderRadius = BASE_SIZE / 2;
    const isCenter = selectedMoodId.value === mood.id;
    const shadowOpacity = isCenter ? 0.6 : 0.2;
    const shadowRadius = isCenter ? 25 : 10;
    const zIndex = isCenter ? 1000 : 1;

    return {
      position: 'absolute',
      left: animatedX.value - BASE_SIZE / 2,
      top: animatedY.value - BASE_SIZE / 2,
      width: BASE_SIZE,
      height: BASE_SIZE,
      // Utilise directement animatedScale — déjà springé, aucun calcul ici
      transform: [{ scale: animatedScale.value }],
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
          style={styles.label}
          numberOfLines={2}>
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
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Fonts.sans.semiBold,
  },
});