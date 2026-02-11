import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState, useCallback } from 'react';
import {
    Animated,
    Dimensions,
    LayoutChangeEvent,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../../constants/theme';

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
    
    // Refs pour stocker les refs des vues des catégories
    const categoryRefs = useRef<{
        control: View | null;
        influence: View | null;
        external: View | null;
    }>({
        control: null,
        influence: null,
        external: null,
    });

    // Fonction pour gérer le drop dans une catégorie
    const handleDrop = (categoryId: 'control' | 'influence' | 'external', item: string) => {
        // Ajouter l'item à la catégorie
        setCategories(prevCategories => 
            prevCategories.map(cat => 
                cat.id === categoryId 
                    ? { ...cat, items: [...cat.items, item] }
                    : cat
            )
        );
        
        // Retirer l'item des disponibles
        setAvailableItems(prevItems => prevItems.filter(i => i !== item));
        setDraggedItem(null);
    };

    // Fonction pour retirer un item d'une catégorie
    const removeFromCategory = (categoryId: 'control' | 'influence' | 'external', item: string) => {
        // Retirer de la catégorie
        setCategories(prevCategories => prevCategories.map(cat =>
            cat.id === categoryId
                ? { ...cat, items: cat.items.filter(i => i !== item) }
                : cat
        ));
        
        // Remettre dans les disponibles
        setAvailableItems(prevItems => [...prevItems, item]);
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
                <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)}>
                    <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                    <View 
                        key={category.id} 
                        ref={(ref) => {
                            if (ref) {
                                categoryRefs.current[category.id] = ref;
                            }
                        }}
                        style={styles.categoryBox}
                    >
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
                            categoryRefs={categoryRefs.current}
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
                            pathname: '/screens/controle',
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
    categoryRefs: {
        control: View | null;
        influence: View | null;
        external: View | null;
    };
}> = ({ item, onDrop, categoryRefs }) => {
    const pan = useState(new Animated.ValueXY())[0];
    const [isDragging, setIsDragging] = useState(false);
    const itemRef = useRef<View>(null);

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
            
            // Utiliser e.nativeEvent.pageY qui donne la position Y absolue de l'événement de toucher
            // C'est plus fiable que gesture.moveY car c'est la position réelle du doigt
            const dropY = e.nativeEvent.pageY;
            
            // Obtenir les positions actuelles des catégories en les mesurant maintenant
            const positions: {
                control: { top: number; bottom: number } | null;
                influence: { top: number; bottom: number } | null;
                external: { top: number; bottom: number } | null;
            } = {
                control: null,
                influence: null,
                external: null,
            };
            
            // Mesurer chaque catégorie et stocker les positions
            const measureAndStore = (categoryId: 'control' | 'influence' | 'external'): Promise<void> => {
                return new Promise((resolve) => {
                    const categoryRef = categoryRefs[categoryId];
                    if (categoryRef) {
                        // Utiliser measureInWindow pour obtenir la position absolue dans la fenêtre
                        categoryRef.measureInWindow((x, y, width, height) => {
                            positions[categoryId] = {
                                top: y,
                                bottom: y + height,
                            };
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            };
            
            // Mesurer toutes les catégories de manière synchrone
            Promise.all([
                measureAndStore('control'),
                measureAndStore('influence'),
                measureAndStore('external'),
            ]).then(() => {
                // Vérifier que toutes les catégories ont été mesurées
                if (!positions.control || !positions.influence || !positions.external) {
                    // console.error('❌ Some categories were not measured!');
                    // console.log('Control:', positions.control);
                    // console.log('Influence:', positions.influence);
                    // console.log('External:', positions.external);
                    // Réinitialiser quand même la position
                    return;
                }
                
                // Déterminer dans quelle catégorie on a relâché
                let targetCategory: 'control' | 'influence' | 'external' | null = null;
                
                // Debug: afficher les positions
                // console.log('=== DROP DEBUG ===');
                // console.log('Drop Y:', dropY);
                // console.log('Control:', positions.control);
                // console.log('Influence:', positions.influence);
                // console.log('External:', positions.external);
                
                // Vérifier toutes les catégories et trouver celle qui contient le point de drop
                // Les catégories sont dans l'ordre : control (haut), influence (milieu), external (bas)
                const categories: Array<{ id: 'control' | 'influence' | 'external'; pos: { top: number; bottom: number } | null }> = [
                    { id: 'control', pos: positions.control },
                    { id: 'influence', pos: positions.influence },
                    { id: 'external', pos: positions.external },
                ];
                
                // Vérifier toutes les catégories qui contiennent le point de drop
                // On utilise une marge de tolérance pour être plus flexible
                const margin = 20; // Marge plus grande pour être plus tolérant
                const matchingCategories: Array<{ id: 'control' | 'influence' | 'external'; distance: number }> = [];
                
                for (const cat of categories) {
                    if (cat.pos) {
                        // Vérifier si le point de drop est dans les limites de la catégorie (avec marge)
                        const isInBounds = dropY >= (cat.pos.top - margin) && dropY <= (cat.pos.bottom + margin);
                        const categoryCenter = (cat.pos.top + cat.pos.bottom) / 2;
                        const distance = Math.abs(dropY - categoryCenter);
                        
                        console.log(`Checking ${cat.id}: top=${cat.pos.top}, bottom=${cat.pos.bottom}, center=${categoryCenter}, dropY=${dropY}, inBounds=${isInBounds}, distance=${distance}`);
                        
                        if (isInBounds) {
                            matchingCategories.push({ id: cat.id, distance });
                        }
                    }
                }
                
                // Si plusieurs catégories correspondent, prendre celle qui est la plus proche du centre
                if (matchingCategories.length > 0) {
                    // Trier par distance (la plus proche en premier)
                    matchingCategories.sort((a, b) => a.distance - b.distance);
                    targetCategory = matchingCategories[0].id;
                    console.log(`Selected category (in bounds): ${targetCategory}`);
                } else {
                    // Si aucune catégorie ne contient le point, trouver la plus proche
                    console.log('Not in any category bounds, finding closest...');
                    let minDistance = Infinity;
                    for (const cat of categories) {
                        if (cat.pos) {
                            const categoryCenter = (cat.pos.top + cat.pos.bottom) / 2;
                            const distance = Math.abs(dropY - categoryCenter);
                            console.log(`Distance to ${cat.id} center: ${distance}`);
                            if (distance < minDistance) {
                                minDistance = distance;
                                targetCategory = cat.id;
                            }
                        }
                    }
                    console.log(`Closest category: ${targetCategory} (distance: ${minDistance})`);
                }
                
                // Si on a trouvé une catégorie, faire le drop
                if (targetCategory) {
                    console.log(`✅ Dropping into: ${targetCategory}`);
                    onDrop(targetCategory);
                } else {
                    console.log('❌ No category found!');
                }
                console.log('=== END DEBUG ===');
            });
            
            // Réinitialiser la position
            Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
            }).start();
        },
    });

    return (
        <Animated.View
            ref={itemRef}
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
        backgroundColor: '#027A54',
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
