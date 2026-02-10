import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { ExerciseBottomSheet } from '../../components/exercise-bottom-sheet';
import GradientText from '../../components/gradient-text';
import { Mood } from '../../constants/moods';
import { Colors, Fonts } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { HELP_PHONE_NUMBER } from '../../lib/config';
import { AnalysisResult, analyzeTextWithMistral } from '../../lib/mistral';

type MoodEntry = {
  id: string;
  mood: { id: string; label: string; color: string };
  text?: string;
  time: string; // affichage HH:MM
  date: string; // ISO string pour trier
};

const clearMoodHistoryStorage = async () => {
  try {
    await AsyncStorage.removeItem("moodHistory"); // ou la clé que tu utilises
  } catch (error) {
    console.error("Erreur suppression historique :", error);
  }
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [note, setNote] = useState("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [moodTexts, setMoodTexts] = useState<{ [key: string]: string }>({});

  // États pour l'analyse et l'affichage du bottom sheet
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // On trie le tableau par date/heure croissante
  const sortedMoodHistory = [...moodHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const loadMoodHistory = useCallback(async () => {
    try {
      // Charger tous les jours depuis AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      const moodKeys = allKeys.filter(key => key.startsWith('moods_'));

      let allMoods: MoodEntry[] = [];

      // Charger les moods de tous les jours
      for (const key of moodKeys) {
        const savedMoods = await AsyncStorage.getItem(key);
        if (savedMoods) {
          const parsedMoods: MoodEntry[] = JSON.parse(savedMoods);
          allMoods = [...allMoods, ...parsedMoods];
        }
      }

      // Trier par date/heure croissante (les plus anciennes en haut, les plus récentes en bas)
      allMoods.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setMoodHistory(allMoods);

      // Si on a des moods, on reprend l'édition du dernier
      if (allMoods.length > 0) {
        const lastMood = allMoods[allMoods.length - 1];
        setEditingMoodId(lastMood.id);
        setNote(lastMood.text || ""); // On remet le texte dans l'input
        
        // Scroller vers le bas pour montrer les données les plus récentes après le rendu
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    } catch (error) {
      console.error("Erreur chargement historique moods", error);
    }
  }, []);

  useEffect(() => {
    loadNote();
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });

    return () => {
      showSubscription.remove();
    };
  }, []);

  // Recharger les données chaque fois que l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      loadMoodHistory();
    }, [loadMoodHistory])
  );

  const loadNote = async () => {
    try {
      const savedNote = await AsyncStorage.getItem("daily_note");
      if (savedNote) {
        setNote(savedNote);
      }
    } catch (e) {
      console.log("Erreur chargement note", e);
    }
  };

  // mood en cours d'édition
  const [editingMoodId, setEditingMoodId] = useState<string | null>(null);

  // ajouter un nouveau mood
  const handleSelectMood = async (newMood: Mood) => {
    // 1. Sauvegarder le texte du mood précédent avant de changer
    if (editingMoodId && note.trim() !== "") {
      handleSaveText(editingMoodId, note);
      await saveMoodToStorage(editingMoodId, note);
    }

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: newMood,
      text: "",
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString(),
    };

    // On ajoute le nouveau et on le met en mode édition
    setMoodHistory(prev => {
      const updated = [...prev, newEntry];

      // Sauvegarder immédiatement le nouveau mood
      const today = new Date().toDateString();
      const todayMoods = updated.filter(m => {
        const moodDate = new Date(m.date).toDateString();
        return moodDate === today;
      });

      AsyncStorage.setItem(`moods_${today}`, JSON.stringify(todayMoods)).catch(e => {
        console.error("Erreur sauvegarde nouveau mood", e);
      });

      return updated;
    });

    setEditingMoodId(newEntry.id);
    setNote(""); // On vide l'input pour le nouveau
  };

  // sauvegarder le texte
  const handleSaveText = (id: string, text: string) => {
    setMoodHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, text } : item
      )
    );
    // SURTOUT : Ne pas faire setNote("") ici, sinon l'input se vide pendant la saisie
  };

  const scrollViewRef = useRef<ScrollView>(null);
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    return () => showSub.remove();
  }, []);

  useEffect(() => {
    // Scroller vers le bas après un court délai pour laisser le rendu se terminer
    // Cela permet d'afficher directement les données les plus récentes en bas
    if (moodHistory.length > 0) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [moodHistory]);

  const clearMoodHistory = async () => {
    try {
      // Date limite : mercredi 14 janvier 2026
      const limitDate = new Date('2026-01-14T23:59:59.999Z');
      
      // Récupérer toutes les clés de moods
      const allKeys = await AsyncStorage.getAllKeys();
      const moodKeys = allKeys.filter(key => key.startsWith('moods_'));

      // Supprimer tous les jours jusqu'au mercredi 14 janvier inclus
      for (const key of moodKeys) {
        // Extraire la date de la clé (format: "moods_Wed Jan 14 2026")
        const dayKey = key.replace('moods_', '');
        const dayDate = new Date(dayKey);
        
        // Si la date est avant ou égale au mercredi 14 janvier, supprimer
        if (dayDate <= limitDate) {
          await AsyncStorage.removeItem(key);
          console.log(`Supprimé: ${key}`);
        }
      }

      // Recharger l'historique pour mettre à jour l'affichage
      await loadMoodHistory();

      Alert.alert(
        "Historique supprimé",
        "Toutes les données jusqu'au mercredi 14 janvier ont été supprimées.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la suppression.",
        [{ text: "OK" }]
      );
    }
  };

  // Fonction pour charger les données de démonstration
  const loadDemoData = async () => {
    try {
      // Importer les données de démonstration
      const demoData = require('../../demo-data.json');
      const entries: MoodEntry[] = demoData.moodEntries;

      // Supprimer d'abord toutes les anciennes données de démonstration pour éviter les doublons
      const allKeys = await AsyncStorage.getAllKeys();
      const moodKeys = allKeys.filter(key => key.startsWith('moods_'));
      
      for (const key of moodKeys) {
        const savedMoods = await AsyncStorage.getItem(key);
        if (savedMoods) {
          const parsedMoods: MoodEntry[] = JSON.parse(savedMoods);
          // Filtrer les entrées qui ne sont pas des données de démonstration
          const nonDemoMoods = parsedMoods.filter(m => !m.id?.startsWith('demo_'));
          
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
      const entriesByDay: { [key: string]: MoodEntry[] } = {};
      
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
        const nonDemoMoods = existingMoods ? JSON.parse(existingMoods).filter((m: MoodEntry) => !m.id?.startsWith('demo_')) : [];
        
        // Combiner les non-démos existantes avec les nouvelles démos
        const allMoods = [...nonDemoMoods, ...dayEntries];
        await AsyncStorage.setItem(existingKey, JSON.stringify(allMoods));
      }

      // Recharger l'historique
      await loadMoodHistory();

      Alert.alert(
        "Données de démonstration chargées",
        `${entries.length} entrées ont été chargées avec succès !`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Erreur lors du chargement des données de démonstration :", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger les données de démonstration. Vérifiez que le fichier demo-data.json existe.",
        [{ text: "OK" }]
      );
    }
  };

  const saveMoodToStorage = async (id: string, finalText: string) => {
    try {
      const today = new Date().toDateString();
      // On récupère uniquement les moods du jour actuel
      const todayMoods = moodHistory.filter(m => {
        const moodDate = new Date(m.date).toDateString();
        return moodDate === today;
      });

      // Mettre à jour le texte du mood spécifique
      const updatedTodayMoods = todayMoods.map(m =>
        m.id === id ? { ...m, text: finalText } : m
      );

      await AsyncStorage.setItem(`moods_${today}`, JSON.stringify(updatedTodayMoods));
    } catch (e) {
      console.error("Erreur storage", e);
    }
  };

  // Fonction pour analyser le texte avec Mistral
  const analyzeText = async (text: string) => {
    console.log('🚀 [ANALYZE TEXT] Fonction analyzeText appelée');
    console.log('📝 [ANALYZE TEXT] Texte reçu:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    console.log('📏 [ANALYZE TEXT] Longueur du texte:', text.length);
    
    if (!text.trim() || text.trim().length < 10) {
      console.log('⚠️ [ANALYZE TEXT] Texte trop court, analyse annulée');
      // Ne pas analyser si le texte est trop court
      setShowBottomSheet(false);
      return;
    }

    console.log('✅ [ANALYZE TEXT] Texte valide, démarrage de l\'analyse...');
    setIsAnalyzing(true);
    try {
      console.log('📞 [ANALYZE TEXT] Appel de analyzeTextWithMistral...');
      const result = await analyzeTextWithMistral(text);
      console.log('✅ [ANALYZE TEXT] Résultat reçu de l\'API:', {
        type: result.type,
        confidence: result.confidence,
        hasResponseText: !!result.responseText,
      });
      
      setAnalysisResult(result);

      // Si pensées suicidaires → afficher l'écran d'urgence en plein écran
      if (result.type === 'suicidal_thoughts') {
        console.log('🚨 [ANALYZE TEXT] Pensées suicidaires détectées, redirection vers emergency-screen');
        setShowBottomSheet(false);
        router.push('/emergency-screen');
      } else if (result.type !== 'none') {
        console.log('📋 [ANALYZE TEXT] Trouble détecté:', result.type, '- Affichage du bottom sheet');
        // Pour les autres troubles (ex : auto-dépréciation) → bottom sheet
        setShowBottomSheet(true);
      } else {
        console.log('ℹ️ [ANALYZE TEXT] Aucun trouble détecté (type: none)');
        setShowBottomSheet(false);
      }
    } catch (error) {
      console.error('❌ [ANALYZE TEXT] Erreur lors de l\'analyse:', error);
      if (error instanceof Error) {
        console.error('❌ [ANALYZE TEXT] Message d\'erreur:', error.message);
        console.error('❌ [ANALYZE TEXT] Stack:', error.stack);
      }
      setShowBottomSheet(false);
    } finally {
      console.log('🏁 [ANALYZE TEXT] Analyse terminée, setIsAnalyzing(false)');
      setIsAnalyzing(false);
    }
  };

  // Fonction pour appeler le numéro d'aide
  const callHelpNumber = () => {
    const phoneUrl = `tel:${HELP_PHONE_NUMBER}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone');
        }
      })
      .catch((err) => {
        console.error('Erreur lors de l\'appel:', err);
        Alert.alert('Erreur', 'Impossible de passer l\'appel');
      });
  };

  // Fonction pour gérer le bouton du bottom sheet selon le type
  const handleBottomSheetButtonPress = () => {
    if (analysisResult?.type === 'self_deprecation') {
      // Pour l'auto-dépréciation, naviguer vers l'exercice des cercles de contrôle
      setShowBottomSheet(false);
      router.push('/select-thought-screen');
    } else if (analysisResult?.type === 'anxiety' || analysisResult?.type === 'stress') {
      // Pour l'anxiété et le stress, naviguer vers l'exercice des cercles de contrôle
      setShowBottomSheet(false);
      router.push('/select-thought-screen');
    } else if (analysisResult?.type === 'suicidal_thoughts') {
      // Pour les pensées suicidaires, appeler le numéro d'aide
      callHelpNumber();
    }
  };

  // Fonction pour obtenir le contenu du bottom sheet selon le type
  const getBottomSheetContent = () => {
    if (analysisResult?.type === 'self_deprecation') {
      // Description de l'exercice adapté (cercles de contrôle)
      const description = 'Les cercles de contrôle te permettent de distinguer ce que tu contrôles, ce sur quoi tu peux avoir une influence, et ce qui est hors de ton contrôle. Cet exercice t\'aide à te concentrer sur ce que tu peux réellement changer et à accepter ce qui ne dépend pas de toi.';

      return {
        titlePart1: 'Ici, tu fais une ',
        titlePart2: 'auto-dépréciation',
        description: description,
        buttonText: 'Démarrer l\'exercice',
      };
    } else if (analysisResult?.type === 'anxiety') {
      // Description de l'exercice adapté (cercles de contrôle)
      const description = 'Les cercles de contrôle peuvent t\'aider à distinguer ce qui dépend de toi et ce qui ne dépend pas de toi. En te concentrant sur ce que tu peux réellement contrôler, tu peux réduire l\'anxiété liée à l\'incertitude.';

      return {
        titlePart1: 'Tu ressens de l\'',
        titlePart2: 'anxiété',
        description: description,
        buttonText: 'Démarrer l\'exercice',
      };
    } else if (analysisResult?.type === 'stress') {
      // Description de l'exercice adapté (cercles de contrôle)
      const description = 'Les cercles de contrôle t\'aident à identifier ce que tu peux réellement contrôler et à accepter ce qui est hors de ta portée. Cet exercice te permet de prioriser et de réduire le sentiment de surcharge.';

      return {
        titlePart1: 'Tu ressens du ',
        titlePart2: 'stress',
        description: description,
        buttonText: 'Démarrer l\'exercice',
      };
    } else if (analysisResult?.type === 'suicidal_thoughts') {
      // Message d'aide pour les pensées suicidaires
      const description = 'Si tu traverses une période difficile, n\'hésite pas à appeler le numéro d\'aide. Des professionnels sont disponibles 24h/24 pour t\'écouter.';

      return {
        titlePart1: 'Besoin d\'aide ?',
        titlePart2: 'Nous sommes là pour toi',
        description: description,
        buttonText: 'Appeler le ' + HELP_PHONE_NUMBER,
      };
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Utiliser une méthode plus fiable pour formater la date
    const weekday = date.toLocaleDateString("fr-FR", { weekday: "short" });
    const day = date.toLocaleDateString("fr-FR", { day: "2-digit" });
    const month = date.toLocaleDateString("fr-FR", { month: "long" });
    const year = date.toLocaleDateString("fr-FR", { year: "numeric" });
    
    // Construire la date manuellement pour éviter les problèmes de locale
    const months = ['Janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const monthIndex = date.getMonth();
    const monthName = months[monthIndex];
    
    const weekdays = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    const weekdayIndex = date.getDay();
    const weekdayName = weekdays[weekdayIndex];
    
    // Première lettre en majuscule pour le jour de la semaine
    const capitalizedWeekday = weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1);
    
    return `${capitalizedWeekday} ${day} ${monthName} ${year}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          // Scroller vers le bas chaque fois que le contenu change
          // pour toujours montrer les données les plus récentes
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }}
      >
        {moodHistory
          // On trie une seule fois pour l'affichage
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((item, index, arr) => {
            const isLast = index === arr.length - 1;

            const currentDay = new Date(item.date).toDateString();
            const previousDay = index > 0 ? new Date(arr[index - 1].date).toDateString() : null;
            const showDateHeader = currentDay !== previousDay;

            return (
              <View key={item.id} style={styles.moodItem}>
                {/* Date si nécessaire */}
                {showDateHeader && (
                  // <View style={styles.dateHeaderContainer}>
                  <GradientText style={styles.dateHeader}>
                    {formatDate(item.date)}
                  </GradientText>
                  // </View>
                )}

                <View style={styles.moodRowCentered}>
                  <Text style={styles.moodTime}>{item.time}</Text>
                  <View style={[styles.moodCard, { backgroundColor: item.mood.color }]}>
                    <Text style={styles.moodText}>{item.mood.label}</Text>
                  </View>
                </View>
                {isLast ? (
                  <TextInput
                    style={styles.editor}
                    placeholder="Commence à écrire ici..."
                    placeholderTextColor="#B0B0B0"
                    multiline
                    value={note} // Utilise l'état local "note"
                    onChangeText={(text) => {
                      setNote(text); // Met à jour l'affichage instantanément
                    }}
                    onBlur={async () => {
                      // Sauvegarde définitive quand l'utilisateur a fini d'écrire
                      handleSaveText(item.id, note);
                      saveMoodToStorage(item.id, note);
                      // Analyser le texte avec Mistral
                      await analyzeText(note);
                    }}
                    blurOnSubmit={false}
                  />
                ) : (
                  item.text ? <Text style={styles.moodNote}>{item.text}</Text> : null
                )}
              </View>
            );
          })}
      </ScrollView>
      {/* <TouchableOpacity
        style={colors === Colors.light ? {
          backgroundColor: '#000000',
          padding: 12,
          alignItems: 'center',
          justifyContent: 'center',
        } : {
          backgroundColor: '#FFFFFF',
          padding: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={clearMoodHistory}
      >
        <Text style={colors === Colors.light ? { color: '#FFFFFF' } : { color: '#000000' }}>Effacer l'historique du jour</Text>
      </TouchableOpacity> */}

      {/* Bottom Sheet pour les suggestions d'exercices */}
      {showBottomSheet && analysisResult && getBottomSheetContent() && (
        <ExerciseBottomSheet
          visible={showBottomSheet}
          titlePart1={getBottomSheetContent()!.titlePart1}
          titlePart2={getBottomSheetContent()!.titlePart2}
          description={getBottomSheetContent()!.description}
          buttonText={getBottomSheetContent()!.buttonText}
          onButtonPress={handleBottomSheetButtonPress}
          onDismiss={() => setShowBottomSheet(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 80,
    flexGrow: 1,
  },
  moodItem: {
    marginTop: 30,
    marginBottom: 20,
  },
  moodRowCentered: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    justifyContent: "center",
  },
  moodCard: {
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "center",
  },
  moodTime: {
    fontSize: 14,
    opacity: 0.7,
    marginRight: 8,
    fontFamily: Fonts.sans.regular,
  },
  moodText: {
    fontSize: 14,
    fontFamily: Fonts.sans.semiBold,
    color: "#FFFFFF",
  },
  moodNote: {
    fontSize: 18,
    marginTop: 4,
    fontFamily: Fonts.sans.regular,
  },
  editor: {
    fontSize: 18,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 12,
    fontFamily: Fonts.serif.regular,
  },
  dateHeaderContainer: {
    width: "100%",
    alignItems: "center", // force à gauche
  },
  dateHeader: {
    fontSize: 24,
    fontFamily: Fonts.serif.semiBoldItalic,
    lineHeight: 28,
    textAlignVertical: "top",
    textAlign: "center",
    marginVertical: 12,
    paddingVertical: 20,
  },
});