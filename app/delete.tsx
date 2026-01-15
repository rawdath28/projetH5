// deletescreen.tsx
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../constants/theme';

interface ProcessedItem {
    text: string;
    action: string;
    category: string;
}

interface BubbleAnimationRefs {
    pan: Animated.ValueXY;
    opacity: Animated.Value;
}

export default function DeleteScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Récupérer les éléments "Extérieur"
    const externalItems: string[] = params.externalItems 
        ? JSON.parse(params.externalItems as string) 
        : [];
    
    const processedItems: ProcessedItem[] = params.processedItems 
        ? JSON.parse(params.processedItems as string) 
        : [];
    
    const categories = params.categories 
        ? JSON.parse(params.categories as string) 
        : [];

    const [items, setItems] = useState<string[]>(externalItems);
    const bubbleRefs = useRef<Map<string, BubbleAnimationRefs>>(new Map());

    const handleSwipeAll = (swipeDirection: number) => {
        // Animer toutes les bulles simultanément
        const animations = Array.from(bubbleRefs.current.values()).map(ref => 
            Animated.parallel([
                Animated.timing(ref.pan, {
                    toValue: { 
                        x: swipeDirection > 0 ? 400 : -400, 
                        y: 0 
                    },
                    duration: 300,
                    useNativeDriver: false,
                }),
                Animated.timing(ref.opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: false,
                })
            ])
        );

        // Lancer toutes les animations en parallèle
        Animated.parallel(animations).start(() => {
            // Une fois toutes les animations terminées, naviguer
            setItems([]);
            router.push({
                pathname: '/final-screen',
                params: {
                    categories: JSON.stringify(categories),
                    processedItems: JSON.stringify(processedItems),
                    externalItems: JSON.stringify([])
                }
            });
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={styles.header}>
                <View style={styles.headerLeft} />
                <Text style={styles.title}>Cercles de contrôles</Text>
                <TouchableOpacity onPress={() => router.push('/')}>
                    <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.bubblesContainer}>
                    {items.map((item, index) => (
                        <SwipeableItem
                            key={`${item}-${index}`}
                            item={item}
                            itemId={`${item}-${index}`}
                            onSwipe={handleSwipeAll}
                            bubbleRefs={bubbleRefs}
                        />
                    ))}
                </View>

                <Text style={styles.instructionText}>
                    Swipe pour supprimer les éléments hors de ton contrôle.
                </Text>
            </View>
        </SafeAreaView>
    );
}

// Composant pour un élément swipeable
const SwipeableItem: React.FC<{
    item: string;
    itemId: string;
    onSwipe: (swipeDirection: number) => void;
    bubbleRefs: React.MutableRefObject<Map<string, BubbleAnimationRefs>>;
}> = ({ item, itemId, onSwipe, bubbleRefs }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const opacity = useRef(new Animated.Value(1)).current;

    // Enregistrer les références d'animation dans le Map
    React.useEffect(() => {
        bubbleRefs.current.set(itemId, { pan, opacity });
        return () => {
            bubbleRefs.current.delete(itemId);
        };
    }, [itemId]);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return Math.abs(gestureState.dx) > 10;
        },
        onPanResponderMove: (_, gestureState) => {
            // Permettre seulement le swipe horizontal
            pan.setValue({ x: gestureState.dx, y: 0 });
        },
        onPanResponderRelease: (_, gestureState) => {
            // Si swipé de plus de 100px, supprimer toutes les bulles et naviguer
            if (Math.abs(gestureState.dx) > 100) {
                // Déclencher l'animation de toutes les bulles
                onSwipe(gestureState.dx);
            } else {
                // Retour à la position initiale
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            }
        },
    });

    return (
        <Animated.View
            style={[
                styles.bubbleWrapper,
                {
                    transform: pan.getTranslateTransform(),
                    opacity: opacity,
                }
            ]}
            {...panResponder.panHandlers}
        >
            <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{item}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F6B1A',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 10,
    },
    headerLeft: {
        width: 24,
    },
    title: {
        fontSize: 20,
        fontFamily: Fonts.sans.semiBold,
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        justifyContent: 'space-between',
    },
    bubblesContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    bubbleWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    bubble: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 30,
        paddingVertical: 18,
        paddingHorizontal: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        maxWidth: '80%',
        minWidth: 200,
    },
    bubbleText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontFamily: Fonts.serif.regularItalic,
        textAlign: 'center',
    },
    instructionText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontFamily: Fonts.sans.regular,
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
});