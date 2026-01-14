// controle.tsx
import { StyleSheet, TouchableOpacity, View, TextInput, ScrollView } from 'react-native';
import { Text } from 'react-native';
import { useState, useRef } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../constants/theme';

interface Category {
    id: 'control' | 'influence' | 'external';
    title: string;
    items: string[];
}

interface ProcessedItem {
    text: string;
    action: string;
    category: string;
}

export default function ControleScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const scrollViewRef = useRef<ScrollView>(null);
    
    // Récupérer les catégories depuis les paramètres
    const categories: Category[] = params.categories 
        ? JSON.parse(params.categories as string) 
        : [];
    
    // Extraire les items de "Je contrôle" et "J'influence" uniquement
    const controlCategory = categories.find(cat => cat.id === 'control');
    const influenceCategory = categories.find(cat => cat.id === 'influence');
    const externalCategory = categories.find(cat => cat.id === 'external');
    
    // Combiner les deux catégories pour traiter les actions
    const itemsNeedingActions = [
        ...(controlCategory?.items || []),
        ...(influenceCategory?.items || [])
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);
    const [customText, setCustomText] = useState<string>('');
    
    const currentItem = itemsNeedingActions[currentIndex];

    // Déterminer la catégorie de l'élément actuel
    const getCurrentCategory = (item: string) => {
        if (controlCategory?.items.includes(item)) {
            return 'Je contrôle';
        } else if (influenceCategory?.items.includes(item)) {
            return "J'influence";
        }
        return '';
    };

    const handleNext = () => {
        // Sauvegarder l'action pour cet élément
        const newProcessedItem: ProcessedItem = {
            text: currentItem,
            action: customText,
            category: getCurrentCategory(currentItem)
        };
        
        const updatedProcessedItems = [...processedItems, newProcessedItem];
        
        // Vérifier s'il reste des éléments à traiter
        if (currentIndex < itemsNeedingActions.length - 1) {
            // Passer à l'élément suivant
            setCurrentIndex(currentIndex + 1);
            setProcessedItems(updatedProcessedItems);
            setCustomText('');
            
            // Scroller vers la prochaine bulle
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({
                    x: (currentIndex + 1) * 220,
                    animated: true
                });
            }, 100);
        } else {
            // Tous les éléments sont traités, aller à l'écran final
            router.push({
                pathname: '/delete',
                params: {
                    categories: JSON.stringify(categories),
                    processedItems: JSON.stringify(updatedProcessedItems),
                    externalItems: JSON.stringify(externalCategory?.items || [])
                }
            });
        }
    };

    const handleBubblePress = (index: number) => {
        setCurrentIndex(index);
        setCustomText('');
        scrollViewRef.current?.scrollTo({
            x: index * 220,
            animated: true
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
                {/* Scroll horizontal des bulles */}
                <ScrollView 
                    ref={scrollViewRef}
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.bubblesScroll}
                    contentContainerStyle={styles.bubblesContainer}
                >
                    {itemsNeedingActions.map((item, index) => {
                        const isActive = index === currentIndex;
                        const isProcessed = index < currentIndex;
                        
                        return (
                            <View key={index} style={styles.bubbleWrapper}>
                                <TouchableOpacity
                                    style={[
                                        styles.selectedCircleBox,
                                        isActive && styles.selectedCircleBoxActive,
                                        isProcessed && styles.selectedCircleBoxProcessed
                                    ]}
                                    onPress={() => handleBubblePress(index)}
                                >
                                    <Text style={[
                                        styles.circleText,
                                        isActive && styles.circleTextActive
                                    ]}>
                                        {item}
                                    </Text>
                                    {isProcessed && (
                                        <View style={styles.checkmark}>
                                            <Icon name="checkmark-circle" size={20} color="#0F6B1A" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <Text style={[
                                    styles.controlLabel,
                                    isActive && styles.controlLabelActive
                                ]}>
                                    {getCurrentCategory(item)}
                                </Text>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Zone d'action */}
                <View style={styles.actionSection}>
                    <Text style={styles.jePeuxLabel}>Je peux</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Commence à écrire ici..."
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        value={customText}
                        onChangeText={setCustomText}
                        multiline
                        autoFocus
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                >
                    <Text style={styles.finishButtonText}>
                        {currentIndex < itemsNeedingActions.length - 1 ? 'Suivant' : 'Terminer'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

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
        paddingTop: 20,
    },
    bubblesScroll: {
        maxHeight: 150,
        marginBottom: 20,
    },
    bubblesContainer: {
        paddingHorizontal: 20,
        gap: 15,
    },
    bubbleWrapper: {
        alignItems: 'center',
    },
    selectedCircleBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        minWidth: 200,
        maxWidth: 200,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCircleBoxActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    selectedCircleBoxProcessed: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        opacity: 0.7,
    },
    circleText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.serif.regularItalic,
        textAlign: 'center',
    },
    circleTextActive: {
        color: '#0F6B1A',
    },
    controlLabel: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: Fonts.sans.regular,
        marginTop: 8,
        textAlign: 'center',
    },
    controlLabelActive: {
        color: '#FFFFFF',
    },
    checkmark: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
    actionSection: {
        flex: 1,
        paddingHorizontal: 20,
    },
    jePeuxLabel: {
        color: '#FFFFFF',
        fontSize: 22,
        fontStyle: 'italic',
        marginBottom: 15,
    },
    textInput: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        minHeight: 150,
        textAlignVertical: 'top',
        fontStyle: 'italic',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
        paddingTop: 10,
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
        fontFamily: Fonts.sans.semiBold,
    },
});