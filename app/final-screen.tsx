// final-screen.tsx
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

interface ProcessedItem {
    text: string;
    action: string;
    category: string;
}

export default function FinalScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const processedItems: ProcessedItem[] = params.processedItems 
        ? JSON.parse(params.processedItems as string) 
        : [];

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

            <ScrollView 
                style={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentContainer}
            >
                {processedItems.map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                        <View style={styles.bubble}>
                            <Text style={styles.bubbleText}>{item.text}</Text>
                        </View>
                        <Text style={styles.actionText}>{item.action}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.finishButton}
                    onPress={() => {
                        // Rediriger vers l'écran HomeScreen
                        router.replace('/(tabs)' as any);
                    }}
                >
                    <Text style={styles.finishButtonText}>Terminer</Text>
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
        fontWeight: '600',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    itemContainer: {
        marginBottom: 35,
        alignItems: 'center',
    },
    bubble: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 30,
        paddingVertical: 18,
        paddingHorizontal: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        alignSelf: 'center',
        minWidth: 200,
        maxWidth: '90%',
        marginBottom: 12,
    },
    bubbleText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        paddingHorizontal: 20,
        maxWidth: '90%',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
        paddingTop: 10,
    },
    finishButton: {
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