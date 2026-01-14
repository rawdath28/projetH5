import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingBubble from './floating-bubble';
import { Stack } from 'expo-router';

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

    return (
        <SafeAreaView style={styles.container}>
            {/* Close */}
            <Stack.Screen options={{ headerShown: false }} />
            <TouchableOpacity style={styles.close}>
                <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            {/* Bulles */}
            <View style={styles.bubblesContainer}>
                {ITEMS.map((item) => {
                    const isActive = selected.includes(item);

                    return (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.bubble,
                                isActive && styles.bubbleActive,
                            ]}
                            onPress={() => toggleItem(item)}
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
                    );
                })}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton}>
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
        backgroundColor: '#0F6B1A',
    },

    close: {
        alignSelf: 'flex-end',
        padding: 20,
    },

    bubblesContainer: {
        flex: 1,
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
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
    },

    bubbleTextActive: {
        color: '#0F6B1A',
        fontWeight: '500',
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
        fontWeight: '600',
    },

    helper: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        textAlign: 'center',
    },
});
