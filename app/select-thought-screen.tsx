import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../constants/theme';

const ITEMS = [
    'Les silences pendant le dates',
    "L’heure à laquelle j’arrive",
    'Lieu de rendez-vous',
    'Ce qu’elle va penser de moi',
    'Mains moites',
    'Ce que je porte',
    'Mon état d’esprit',
    "Est-ce qu’elle va vouloir un second date",
];

const MAX_SELECTION = 5;

// Component for animated bubble
const AnimatedBubble: React.FC<{
    item: string;
    index: number;
    isActive: boolean;
    onPress: () => void;
}> = ({ item, index, isActive, onPress }) => {
    // Create unique animation values for each bubble
    const floatAnim = useRef(new Animated.Value(0)).current;
    const driftXAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Each bubble has slightly different animation timing for natural movement
        const duration = 8000 + (index * 500); // 8-11.5 seconds - much slower for calmer movement
        const delay = index * 600; // Staggered start

        // Floating animation (vertical)
        const floatLoop = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: duration,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: duration,
                    useNativeDriver: true,
                }),
            ])
        );

        // Horizontal drift animation
        const driftLoop = Animated.loop(
            Animated.sequence([
                Animated.delay(delay + 1000),
                Animated.timing(driftXAnim, {
                    toValue: 1,
                    duration: duration + 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(driftXAnim, {
                    toValue: 0,
                    duration: duration + 2000,
                    useNativeDriver: true,
                }),
            ])
        );

        // More noticeable scale pulse for larger movements
        const scaleLoop = Animated.loop(
            Animated.sequence([
                Animated.delay(delay + 2000),
                Animated.timing(scaleAnim, {
                    toValue: 1.08,
                    duration: duration * 2,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: duration * 2,
                    useNativeDriver: true,
                }),
            ])
        );

        floatLoop.start();
        driftLoop.start();
        scaleLoop.start();

        return () => {
            floatLoop.stop();
            driftLoop.stop();
            scaleLoop.stop();
        };
    }, [index]);

    // Interpolate animations - larger movement range
    const translateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-40, 40], // Much larger vertical movement
    });

    const translateX = driftXAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 50], // Much larger horizontal drift
    });

    return (
        <Animated.View
            style={{
                transform: [
                    { translateY },
                    { translateX },
                    { scale: scaleAnim },
                ],
            }}
        >
            <TouchableOpacity
                style={[
                    styles.bubble,
                    isActive && styles.bubbleActive,
                ]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Text
                    style={[
                        styles.bubbleText,
                        isActive && styles.bubbleTextActive,
                    ]}
                >
                    {item}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const SelectThoughtsScreen: React.FC = () => {
    const [selected, setSelected] = useState<string[]>([]);

    const toggleItem = (item: string) => {
        if (selected.includes(item)) {
            setSelected(selected.filter((i) => i !== item));
        } else {
            if (selected.length < MAX_SELECTION) {
                setSelected([...selected, item]);
            }
        }
    };
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Icon name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerSpacer} />
                <Text style={styles.headerTitle}>Cercles de contrôles</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
            {/* Animated Bulles */}
            <View style={styles.bubblesContainer}>
                {ITEMS.map((item, index) => {
                    const isActive = selected.includes(item);

                    return (
                        <AnimatedBubble
                            key={item}
                            item={item}
                            index={index}
                            isActive={isActive}
                            onPress={() => toggleItem(item)}
                        />
                    );
                })}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => {
                        router.push({
                            pathname: '/draganddrop-screen',
                            params: {
                                selected: JSON.stringify(selected) // Passer les items sélectionnés
                            }
                        });
                    }}
                >
                    <Text style={styles.nextText}>Suivant</Text>
                </TouchableOpacity>
                <Text style={styles.helper}>
                    Sélectionne jusqu’à {MAX_SELECTION} éléments
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default SelectThoughtsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#027A54',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },

    headerSpacer: {
        width: 24, // Same width as close icon to center the title
    },

    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
        flex: 1,
    },

    close: {
        padding: 8,
        width: 40,
        alignItems: 'flex-end',
    },

    bubblesContainer: {
        flex: 1,
        marginTop: 100,
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },

    bubble: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        margin: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },

    bubbleActive: {
        backgroundColor: '#FFFFFF',
    },

    bubbleText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: Fonts.serif.regularItalic,
        textAlign: 'center',
    },

    bubbleTextActive: {
        color: '#027A54',
        fontFamily: Fonts.serif.regularItalic,
    },

    footer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
    },

    nextButton: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },

    nextText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.serif.semiBold,
    },

    helper: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontFamily: Fonts.serif.regular,
        textAlign: 'center',
    },
});
