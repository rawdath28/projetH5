/**
 * ExerciseBottomSheet - Composant de suggestion d'exercice
 *
 * Apparaît en bas de l'écran avec une animation de slide.
 * Peut être fermé en glissant vers le bas.
 *
 * Usage:
 *   <ExerciseBottomSheet
 *     visible={true}
 *     titlePart1="Ici, tu fais une"
 *     titlePart2="distortion cognitive !"
 *     description="Le tribunal permet de sortir de l'émotion..."
 *     buttonText="Démarrer l'exercice"
 *     onButtonPress={() => {}}
 *     onDismiss={() => {}}
 *   />
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { Fonts } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Hauteur estimée du composant (incluant le padding pour passer derrière la TabBar)
const SHEET_HEIGHT = 300;
// Seuil de swipe pour fermer (en pixels)
const DISMISS_THRESHOLD = 100;

export interface ExerciseBottomSheetProps {
  /** Affiche ou cache le composant */
  visible: boolean;
  /** Première partie du titre (en noir) */
  titlePart1: string;
  /** Deuxième partie du titre (en turquoise) */
  titlePart2: string;
  /** Description de l'exercice */
  description: string;
  /** Texte du bouton */
  buttonText: string;
  /** Callback quand on appuie sur le bouton */
  onButtonPress: () => void;
  /** Callback quand on ferme en swipant */
  onDismiss: () => void;
}

export function ExerciseBottomSheet({
  visible,
  titlePart1,
  titlePart2,
  description,
  buttonText,
  onButtonPress,
  onDismiss,
}: ExerciseBottomSheetProps) {
  // Position Y animée (0 = visible, SHEET_HEIGHT = caché)
  const translateY = useSharedValue(SHEET_HEIGHT);
  // Contexte pour le geste (position de départ)
  const context = useSharedValue({ y: 0 });

  // Animation d'entrée/sortie basée sur visible
  useEffect(() => {
    if (visible) {
      // Entrée douce avec timing linéaire
      translateY.value = withTiming(0, { duration: 250 });
    } else {
      // Sortie rapide
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 });
    }
  }, [visible, translateY]);

  // Geste de pan pour le swipe
  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      // Permettre seulement le swipe vers le bas (translationY > 0)
      const newValue = context.value.y + event.translationY;
      translateY.value = Math.max(0, newValue);
    })
    .onEnd((event) => {
      // Si swipe dépasse le seuil, fermer
      if (event.translationY > DISMISS_THRESHOLD) {
        translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 });
        runOnJS(onDismiss)();
      } else {
        // Sinon, revenir doucement à la position initiale
        translateY.value = withTiming(0, { duration: 150 });
      }
    });

  // Style animé pour la translation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Ne pas rendre si complètement caché
  if (!visible && translateY.value >= SHEET_HEIGHT) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <LinearGradient
          colors={['rgba(2, 122, 84, 0.05)', 'rgba(2, 119, 134, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBackground}
        >
          {/* Indicateur de drag */}
          <View style={styles.dragIndicator} />

          {/* Contenu */}
          <View style={styles.content}>
            {/* Titre en deux parties */}
            <View style={styles.titleContainer}>
              <Text style={styles.titlePart1}>{titlePart1}</Text>
              <Text style={styles.titlePart2}>{titlePart2}</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* Bouton */}
          <Pressable onPress={onButtonPress} style={styles.buttonPressable}>
            <LinearGradient
              colors={['#027A54', '#027786']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    // overflow: 'hidden' retiré pour permettre l'affichage de l'ombre
  },
  gradientBackground: {
    padding: 16,
    paddingBottom: 96,
    gap: 16,
  },
  dragIndicator: {
    alignSelf: 'center',
    width: 32,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 1000,
  },
  content: {
    gap: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingRight: 32,
  },
  titlePart1: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    lineHeight: 28,
    color: '#1B1B1B',
  },
  titlePart2: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    lineHeight: 28,
    color: '#027A54',
  },
  description: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#1B1B1B',
  },
  buttonPressable: {
    width: '100%',
  },
  button: {
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#FAFAFA',
  },
});
