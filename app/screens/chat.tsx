// app/chat/index.tsx (ou le chemin de ton écran de chat existant)

import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Fonts } from '../../constants/theme';
import { CirclesOfControlData } from '../../lib/circles_of_control';
import { useGeminiChat, ChatMessage } from '../../hooks/Usegeminichat';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ titre?: string; exerciseId?: string }>();
  const listRef = useRef<FlatList>(null);
  const inputRef = useRef('');
  const fadeOverlay = useRef(new Animated.Value(0)).current;

  // ── Callback quand l'exercice est prêt à être lancé ───────────────────────
  const handleExerciseLaunch = (data: CirclesOfControlData) => {
    const labels = (data.items ?? []).map((i) => i.label).filter(Boolean);
    // Fondu vert → puis navigation seamless vers l'écran de même couleur
    Animated.timing(fadeOverlay, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      router.replace({
        pathname: '/screens/draganddrop-screen',
        params: {
          selected: JSON.stringify(labels),
        },
      } as any);
    });
  };

  const { messages, isLoading, error, sendMessage, initConversation } =
    useGeminiChat(handleExerciseLaunch);

  // ── Démarre la conversation au montage ────────────────────────────────────
  useEffect(() => {
    initConversation();
  }, []);

  // ── Scroll automatique ────────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // ── Envoi du message ──────────────────────────────────────────────────────
  const handleSend = () => {
    const text = inputRef.current.trim();
    if (!text || isLoading) return;
    sendMessage(text);
    // Reset l'input via la ref (évite un setState supplémentaire)
    inputRef.current = '';
    // Force le re-render du TextInput en changeant sa key ou via ref
    if (textInputRef.current) {
      textInputRef.current.clear();
    }
  };

  const textInputRef = useRef<TextInput>(null);

  // ── Rendu d'un message ────────────────────────────────────────────────────
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.role === 'ai') {
      return (
        <View style={styles.aiRow}>
          <ThemedText style={styles.aiText}>{item.text}</ThemedText>
        </View>
      );
    }
    return (
      <View style={styles.userRow}>
        <BlurView intensity={90} tint="light" style={styles.userBubble}>
          <ThemedText style={styles.userText}>{item.text}</ThemedText>
        </BlurView>
      </View>
    );
  };

  return (
    <View style={styles.overlay}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <IconSymbol size={18} name="xmark" color="#1A1A1A" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            Dis-m'en un peu plus
          </ThemedText>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#888" />
              </View>
            ) : null
          }
        />

        {/* Erreur */}
        {error && (
          <View style={styles.errorBanner}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputWrapper}>
          <BlurView intensity={80} tint="light" style={styles.inputBlur}>
            <TextInput
              ref={textInputRef}
              style={styles.input}
              placeholder="Écrivez ici..."
              placeholderTextColor="#AAAAAA"
              onChangeText={(t) => { inputRef.current = t; }}
              multiline
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={isLoading}
            >
              <IconSymbol size={18} name="arrow.up" color="#FFFFFF" />
            </TouchableOpacity>
          </BlurView>
        </View>
      </KeyboardAvoidingView>

      {/* Overlay de transition vers l'exercice */}
      <Animated.View
        pointerEvents="none"
        style={[styles.transitionOverlay, { opacity: fadeOverlay }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sheet: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 30,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: Fonts.sans.semiBold,
    color: '#1A1A1A',
    textAlign: 'center',
    flex: 1,
  },
  headerPlaceholder: {},
  messagesList: {
    paddingHorizontal: 15,
    gap: 18,
    paddingBottom: 8,
  },
  aiRow: {
    maxWidth: '100%',
    alignSelf: 'flex-start',
  },
  aiText: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  userRow: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
  },
  userText: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  loadingRow: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,80,80,0.12)',
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#C0392B',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    paddingTop: 10,
    gap: 10,
  },
  inputBlur: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.5)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 99,
    paddingRight: 6,
    paddingTop: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: 'black',
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 16,
    height: 99,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 6,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#027A54',
  },
});