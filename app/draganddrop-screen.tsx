import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../constants/theme';

const { height } = Dimensions.get('window');

interface Category {
    id: 'control' | 'influence' | 'external';
    title: string;
    items: string[];
}

const DragAndDropScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Récupérer les éléments sélectionnés depuis les paramètres
    const selectedItems = params.selected 
        ? (typeof params.selected === 'string' 
            ? JSON.parse(params.selected) 
            : params.selected)
        : [];

    const [categories, setCategories] = useState<Category[]>([
        { id: 'control', title: 'Je contrôle', items: [] },
        { id: 'influence', title: "J'influence", items: [] },
        { id: 'external', title: 'Exterieur', items: [] },
    ]);

    const [availableItems, setAvailableItems] = useState<string[]>(selectedItems);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    // Fonction pour gérer le drop dans une catégorie
    const handleDrop = (categoryId: 'control' | 'influence' | 'external', item: string) => {
        // Ajouter l'item à la catégorie
        setCategories(categories.map(cat => 
            cat.id === categoryId 
                ? { ...cat, items: [...cat.items, item] }
                : cat
        ));
        
        // Retirer l'item des disponibles
        setAvailableItems(availableItems.filter(i => i !== item));
        setDraggedItem(null);
    };

    // Fonction pour retirer un item d'une catégorie
    const removeFromCategory = (categoryId: 'control' | 'influence' | 'external', item: string) => {
        // Retirer de la catégorie
        setCategories(categories.map(cat =>
            cat.id === categoryId
                ? { ...cat, items: cat.items.filter(i => i !== item) }
                : cat
        ));
        
        // Remettre dans les disponibles
        setAvailableItems([...availableItems, item]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Icon name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cercles de contrôles</Text>
                <TouchableOpacity onPress={() => router.push('/')}>
                    <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                    <View key={category.id} style={styles.categoryBox}>
                        <Text style={styles.categoryTitle}>{category.title}</Text>
                        <View style={styles.categoryContent}>
                            {category.items.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.categoryItem}
                                    onPress={() => removeFromCategory(category.id, item)}
                                >
                                    <Text style={styles.categoryItemText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            {/* Available Items */}
            <View style={styles.availableItemsContainer}>
                <Text style={styles.instructionText}>
                    Glisse les éléments dans les catégories
                </Text>
                <View style={styles.itemsWrapper}>
                    {availableItems.map((item, index) => (
                        <DraggableItem
                            key={index}
                            item={item}
                            onDrop={(categoryId) => handleDrop(categoryId, item)}
                            categories={categories}
                        />
                    ))}
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.finishButton,
                        availableItems.length > 0 && styles.finishButtonDisabled
                    ]}
                    disabled={availableItems.length > 0}
                    onPress={() => {
                        // Navigation vers l'écran suivant avec les données
                        router.push({
                            pathname: '/controle',
                            params: {
                                categories: JSON.stringify(categories)
                            }
                        });
                    }}
                >
                    <Text style={styles.finishButtonText}>Suivant</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Composant pour un élément draggable
const DraggableItem: React.FC<{
    item: string;
    onDrop: (categoryId: 'control' | 'influence' | 'external') => void;
    categories: Category[];
}> = ({ item, onDrop, categories }) => {
    const pan = useState(new Animated.ValueXY())[0];
    const [isDragging, setIsDragging] = useState(false);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            setIsDragging(true);
        },
        onPanResponderMove: Animated.event(
            [null, { dx: pan.x, dy: pan.y }],
            { useNativeDriver: false }
        ),
        onPanResponderRelease: (e, gesture) => {
            setIsDragging(false);
            
            // Déterminer dans quelle zone on a relâché
            const dropY = gesture.moveY;
            
            // Zones approximatives (à ajuster selon votre layout)
            if (dropY < height * 0.3) {
                onDrop('control');
            } else if (dropY < height * 0.5) {
                onDrop('influence');
            } else if (dropY < height * 0.7) {
                onDrop('external');
            }
            
            // Réinitialiser la position
            Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
            }).start();
        },
    });

    return (
        <Animated.View
            style={[
                styles.draggableItem,
                {
                    transform: pan.getTranslateTransform(),
                    opacity: isDragging ? 0.7 : 1,
                    zIndex: isDragging ? 1000 : 1,
                },
            ]}
            {...panResponder.panHandlers}
        >
            <Text style={styles.draggableItemText}>{item}</Text>
        </Animated.View>
    );
};

export default DragAndDropScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F6B1A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: Fonts.sans.semiBold,
    },
    categoriesContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    categoryBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        minHeight: 100,
    },
    categoryTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.sans.semiBold,
        marginBottom: 10,
    },
    categoryContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 8,
        marginBottom: 8,
    },
    categoryItemText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: Fonts.serif.regularItalic,
    },
    availableItemsContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    instructionText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontFamily: Fonts.sans.regular,
        textAlign: 'center',
        marginBottom: 20,
    },
    itemsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    draggableItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    draggableItemText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.serif.regularItalic,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
    },
    finishButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
    },
    finishButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    finishButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.sans.semiBold,
    },
});