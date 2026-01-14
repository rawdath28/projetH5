// deletescreen.tsx
import { StyleSheet, TouchableOpacity, View, Animated, PanResponder } from 'react-native';
import { Text } from 'react-native';
import { useState, useRef } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

interface ProcessedItem {
    text: string;
    action: string;
    category: string;
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

    const handleRemoveItem = (itemToRemove: string) => {
        setItems(items.filter(item => item !== itemToRemove));
    };

    const handleFinish = () => {
        // Aller vers l'écran final avec toutes les données
        router.push({
            pathname: '/final-screen',
            params: {
                categories: JSON.stringify(categories),
                processedItems: JSON.stringify(processedItems),
                externalItems: JSON.stringify(items)
            }
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
                            onRemove={() => handleRemoveItem(item)}
                        />
                    ))}
                </View>

                <Text style={styles.instructionText}>
                    Swipe pour supprimer les éléments hors de ton contrôle.
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleFinish}
                >
                    <Text style={styles.finishButtonText}>Terminer</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Composant pour un élément swipeable
const SwipeableItem: React.FC<{
    item: string;
    onRemove: () => void;
}> = ({ item, onRemove }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const opacity = useRef(new Animated.Value(1)).current;

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
            // Si swipé de plus de 100px, supprimer l'élément
            if (Math.abs(gestureState.dx) > 100) {
                Animated.parallel([
                    Animated.timing(pan, {
                        toValue: { 
                            x: gestureState.dx > 0 ? 400 : -400, 
                            y: 0 
                        },
                        duration: 200,
                        useNativeDriver: false,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                    })
                ]).start(() => {
                    onRemove();
                });
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
        fontWeight: '600',
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
        fontStyle: 'italic',
        textAlign: 'center',
    },
    instructionText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
    },
    nextButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
    },
    finishButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});