// profile-screen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../../constants/theme';

export default function ProfileScreen() {
    const router = useRouter();
    const [userName] = useState('Sarah');
    const [completedExercises] = useState(12);
    const [streak] = useState(7);

    const recentCircles = [
        {
            title: 'Premier rendez-vous',
            date: '14 Jan 2026',
            controlItems: 3,
            influenceItems: 2,
        },
        {
            title: 'Entretien d\'embauche',
            date: '10 Jan 2026',
            controlItems: 4,
            influenceItems: 1,
        },
        {
            title: 'Présentation projet',
            date: '08 Jan 2026',
            controlItems: 2,
            influenceItems: 3,
        },
    ];

    const stats = [
        { icon: 'checkmark-circle', label: 'Exercices', value: completedExercises.toString() },
        { icon: 'flame', label: 'Série', value: `${streak} jours` },
        { icon: 'trending-up', label: 'Progrès', value: '87%' },
    ];

    // Fonction pour charger les données de démonstration
    const loadDemoData = () => {
        Alert.alert(
            "Charger les données de démonstration ?",
            "Cette action va charger 15 entrées de mood réparties sur 3 jours. Les données existantes ne seront pas supprimées.",
            [
                {
                    text: "Annuler",
                    style: "cancel"
                },
                {
                    text: "Charger",
                    onPress: async () => {
                        try {
                            // Importer les données de démonstration
                            const demoData = require('../../demo-data.json');
                            const entries = demoData.moodEntries;

                            // Supprimer d'abord toutes les anciennes données de démonstration
                            const allKeys = await AsyncStorage.getAllKeys();
                            const moodKeys = allKeys.filter(key => key.startsWith('moods_'));
                            
                            for (const key of moodKeys) {
                                const savedMoods = await AsyncStorage.getItem(key);
                                if (savedMoods) {
                                    const parsedMoods = JSON.parse(savedMoods);
                                    // Filtrer les entrées qui ne sont pas des données de démonstration
                                    const nonDemoMoods = parsedMoods.filter((m: any) => !m.id?.startsWith('demo_'));
                                    
                                    if (nonDemoMoods.length === 0) {
                                        // Si toutes les entrées étaient des démos, supprimer la clé
                                        await AsyncStorage.removeItem(key);
                                    } else {
                                        // Sinon, garder seulement les non-démos
                                        await AsyncStorage.setItem(key, JSON.stringify(nonDemoMoods));
                                    }
                                }
                            }

                            // Grouper les nouvelles entrées par jour
                            const entriesByDay: { [key: string]: any[] } = {};
                            
                            for (const entry of entries) {
                                const entryDate = new Date(entry.date);
                                const dayKey = entryDate.toDateString();
                                
                                if (!entriesByDay[dayKey]) {
                                    entriesByDay[dayKey] = [];
                                }
                                entriesByDay[dayKey].push(entry);
                            }

                            // Sauvegarder chaque jour dans AsyncStorage
                            for (const [dayKey, dayEntries] of Object.entries(entriesByDay)) {
                                // Récupérer les entrées existantes (non-démo) pour ce jour
                                const existingKey = `moods_${dayKey}`;
                                const existingMoods = await AsyncStorage.getItem(existingKey);
                                const nonDemoMoods = existingMoods ? JSON.parse(existingMoods).filter((m: any) => !m.id?.startsWith('demo_')) : [];
                                
                                // Combiner les non-démos existantes avec les nouvelles démos
                                const allMoods = [...nonDemoMoods, ...dayEntries];
                                await AsyncStorage.setItem(existingKey, JSON.stringify(allMoods));
                            }

                            Alert.alert(
                                "✅ Données chargées !",
                                `${entries.length} entrées ont été chargées avec succès !\n\nRevenez à l'écran d'accueil pour voir les données.`,
                                [{ text: "OK" }]
                            );
                        } catch (error) {
                            console.error("Erreur lors du chargement des données de démonstration :", error);
                            Alert.alert(
                                "❌ Erreur",
                                "Impossible de charger les données de démonstration.\n\nVérifiez que le fichier demo-data.json existe à la racine du projet.",
                                [{ text: "OK" }]
                            );
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Icon name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mon Profil</Text>
                <TouchableOpacity onPress={() => {}}>
                    <Icon name="settings-outline" size={24} color="#027A54" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
                        </View>
                    </View>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userBio}>
                        En quête de contrôle et de sérénité
                    </Text>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Icon name={stat.icon} size={28} color="#027A54" />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Recent Circles */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mes cercles récents</Text>
                    
                    {recentCircles.map((circle, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.circleCard}
                            onPress={() => {}}
                        >
                            <View style={styles.circleCardHeader}>
                                <Text style={styles.circleTitle}>{circle.title}</Text>
                                <Icon name="chevron-forward" size={20} color="#027A54" />
                            </View>
                            <Text style={styles.circleDate}>{circle.date}</Text>
                            <View style={styles.circleStats}>
                                <View style={styles.circleStat}>
                                    <View style={styles.circleStatDot} />
                                    <Text style={styles.circleStatText}>
                                        {circle.controlItems} contrôle
                                    </Text>
                                </View>
                                <View style={styles.circleStat}>
                                    <View style={[styles.circleStatDot, styles.circleStatDotInfluence]} />
                                    <Text style={styles.circleStatText}>
                                        {circle.influenceItems} influence
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions rapides</Text>
                    
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => router.push('/select-thought-screen')}
                    >
                        <View style={styles.actionIconContainer}>
                            <Icon name="add-circle-outline" size={22} color="#FFFFFF" />
                        </View>
                        <Text style={styles.actionButtonText}>Nouveau cercle</Text>
                        <Icon name="chevron-forward" size={20} color="#027A54" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => {}}
                    >
                        <View style={styles.actionIconContainer}>
                            <Icon name="book-outline" size={22} color="#FFFFFF" />
                        </View>
                        <Text style={styles.actionButtonText}>Mon journal</Text>
                        <Icon name="chevron-forward" size={20} color="#027A54" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => {}}
                    >
                        <View style={styles.actionIconContainer}>
                            <Icon name="bulb-outline" size={22} color="#FFFFFF" />
                        </View>
                        <Text style={styles.actionButtonText}>Conseils & astuces</Text>
                        <Icon name="chevron-forward" size={20} color="#027A54" />
                    </TouchableOpacity>

                    {/* Bouton pour charger les données de démonstration */}
                    <TouchableOpacity 
                        style={styles.demoButton}
                        onPress={loadDemoData}
                    >
                        <View style={styles.demoIconContainer}>
                            <Icon name="download-outline" size={22} color="#FFFFFF" />
                        </View>
                        <Text style={styles.demoButtonText}>Charger données de démo</Text>
                        <Icon name="chevron-forward" size={20} color="#DC2626" />
                    </TouchableOpacity>
                </View>

                {/* Achievements */}
                <View style={[styles.section, styles.lastSection]}>
                    <Text style={styles.sectionTitle}>Accomplissements</Text>
                    
                    <View style={styles.achievementsGrid}>
                        <View style={styles.achievementBadge}>
                            <View style={styles.achievementIconContainer}>
                                <Icon name="trophy" size={28} color="#FFFFFF" />
                            </View>
                            <Text style={styles.achievementText}>Première semaine</Text>
                        </View>
                        <View style={styles.achievementBadge}>
                            <View style={styles.achievementIconContainer}>
                                <Icon name="star" size={28} color="#FFFFFF" />
                            </View>
                            <Text style={styles.achievementText}>10 cercles</Text>
                        </View>
                        <View style={[styles.achievementBadge, styles.achievementLocked]}>
                            <View style={styles.achievementIconContainerLocked}>
                                <Icon name="lock-closed" size={28} color="#999999" />
                            </View>
                            <Text style={styles.achievementTextLocked}>30 jours</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        color: '#027A54',
        fontSize: 20,
        fontFamily: Fonts.sans.semiBold,
    },
    scrollContent: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    avatarContainer: {
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#027A54',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#027A54',
        shadowColor: '#027A54',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 42,
        fontFamily: Fonts.sans.semiBold,
    },
    userName: {
        color: '#027A54',
        fontSize: 28,
        fontFamily: Fonts.serif.bold,
        marginBottom: 8,
    },
    userBio: {
        color: '#666666',
        fontSize: 15,
        fontFamily: Fonts.sans.regularItalic,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 30,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statValue: {
        color: '#027A54',
        fontSize: 24,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        color: '#666666',
        fontSize: 12,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    lastSection: {
        marginBottom: 40,
    },
    sectionTitle: {
        color: '#027A54',
        fontSize: 20,
        fontFamily: Fonts.serif.semiBold,
        marginBottom: 16,
    },
    statIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(2, 122, 84, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    circleCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    circleCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    circleTitle: {
        color: '#027A54',
        fontSize: 18,
        fontFamily: Fonts.serif.regularItalic,
    },
    circleDate: {
        color: '#999999',
        fontSize: 13,
        fontFamily: Fonts.sans.regular,
        marginBottom: 12,
    },
    circleStats: {
        flexDirection: 'row',
        gap: 20,
    },
    circleStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    circleStatDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#027A54',
    },
    circleStatDotInfluence: {
        backgroundColor: 'rgba(2, 122, 84, 0.5)',
    },
    circleStatText: {
        color: '#666666',
        fontSize: 13,
        fontFamily: Fonts.sans.regular,
    },
    actionButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#027A54',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionButtonText: {
        color: '#333333',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    demoButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#DC2626',
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    demoIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#DC2626',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    demoButtonText: {
        color: '#DC2626',
        fontSize: 16,
        fontFamily: Fonts.sans.semiBold,
        flex: 1,
    },
    achievementsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    achievementBadge: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    achievementLocked: {
        opacity: 0.6,
    },
    achievementIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#027A54',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    achievementIconContainerLocked: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    achievementText: {
        color: '#027A54',
        fontSize: 12,
        fontFamily: Fonts.sans.semiBold,
        textAlign: 'center',
    },
    achievementTextLocked: {
        color: '#999999',
        fontSize: 12,
        fontFamily: Fonts.sans.semiBold,
        textAlign: 'center',
    },
});