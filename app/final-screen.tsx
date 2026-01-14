// profile-screen.tsx
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { Text } from 'react-native';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../constants/theme';

export default function ProfileScreen() {
    const router = useRouter();
    const [userName] = useState('Marie');
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

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header avec fond vert */}
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Icon name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mon Profil</Text>
                    <TouchableOpacity onPress={() => {}}>
                        <Icon name="settings-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Profile Header dans le vert */}
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
            </View>

            <ScrollView 
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Icon name={stat.icon} size={24} color="#0F6B1A" />
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
                                <Icon name="chevron-forward" size={20} color="#0F6B1A" />
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
                        <Icon name="chevron-forward" size={20} color="#0F6B1A" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => {}}
                    >
                        <View style={styles.actionIconContainer}>
                            <Icon name="book-outline" size={22} color="#FFFFFF" />
                        </View>
                        <Text style={styles.actionButtonText}>Mon journal</Text>
                        <Icon name="chevron-forward" size={20} color="#0F6B1A" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => {}}
                    >
                        <View style={styles.actionIconContainer}>
                            <Icon name="bulb-outline" size={22} color="#FFFFFF" />
                        </View>
                        <Text style={styles.actionButtonText}>Conseils & astuces</Text>
                        <Icon name="chevron-forward" size={20} color="#0F6B1A" />
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
    headerContainer: {
        backgroundColor: '#0F6B1A',
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: Fonts.sans.semiBold,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    avatarContainer: {
        marginBottom: 15,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 38,
        fontFamily: Fonts.serif.bold,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 26,
        fontFamily: Fonts.serif.bold,
        marginBottom: 6,
    },
    userBio: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        fontFamily: Fonts.sans.regularItalic,
    },
    scrollContent: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: -30,
        marginBottom: 30,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(15, 107, 26, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        color: '#0F6B1A',
        fontSize: 22,
        fontFamily: Fonts.serif.bold,
        marginBottom: 4,
    },
    statLabel: {
        color: '#666666',
        fontSize: 12,
        fontFamily: Fonts.sans.regular,
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
        color: '#0F6B1A',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
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
        marginBottom: 6,
    },
    circleTitle: {
        color: '#0F6B1A',
        fontSize: 17,
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
        backgroundColor: '#0F6B1A',
    },
    circleStatDotInfluence: {
        backgroundColor: 'rgba(15, 107, 26, 0.5)',
    },
    circleStatText: {
        color: '#666666',
        fontSize: 13,
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
        backgroundColor: '#0F6B1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionButtonText: {
        color: '#333333',
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
        backgroundColor: '#0F6B1A',
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
        color: '#0F6B1A',
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