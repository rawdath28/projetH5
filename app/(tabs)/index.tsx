import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
  TouchableOpacity,
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

  useEffect(() => {
    loadNote();
    loadMoodHistory();
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });

    return () => {
      showSubscription.remove();
    };
  }, []);

  const loadMoodHistory = async () => {
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

      // Trier par date/heure croissante
      allMoods.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setMoodHistory(allMoods);

      // Si on a des moods, on reprend l'édition du dernier
      if (allMoods.length > 0) {
        const lastMood = allMoods[allMoods.length - 1];
        setEditingMoodId(lastMood.id);
        setNote(lastMood.text || ""); // On remet le texte dans l'input
      }
    } catch (error) {
      console.error("Erreur chargement historique moods", error);
    }
  };

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
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [moodHistory]);

  const clearMoodHistory = async () => {
    try {
      // 1. Supprimer du téléphone
      const today = new Date().toDateString();
      await AsyncStorage.removeItem(`moods_${today}`);

      // 2. Vider les états React
      setMoodHistory([]);      // Vide la liste affichée
      setNote("");             // Vide le texte en cours
      setEditingMoodId(null);  // Réinitialise l'édition

      console.log("Historique supprimé");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
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
    if (!text.trim() || text.trim().length < 10) {
      // Ne pas analyser si le texte est trop court
      setShowBottomSheet(false);
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeTextWithMistral(text);
      setAnalysisResult(result);

      // Si pensées suicidaires → afficher l'écran d'urgence en plein écran
      if (result.type === 'suicidal_thoughts') {
        setShowBottomSheet(false);
        router.push('/emergency-screen');
      } else if (result.type !== 'none') {
        // Pour les autres troubles (ex : auto-dépréciation) → bottom sheet
        setShowBottomSheet(true);
      } else {
        setShowBottomSheet(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      setShowBottomSheet(false);
    } finally {
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
      // Pour l'auto-dépréciation, on pourrait naviguer vers un exercice de reformulation
      // Pour l'instant, on ferme juste le bottom sheet
      setShowBottomSheet(false);
      router.push('/select-thought-screen');
      // TODO: Naviguer vers l'exercice de reformulation
    } else if (analysisResult?.type === 'suicidal_thoughts') {
      // Pour les pensées suicidaires, appeler le numéro d'aide
      callHelpNumber();
    }
  };

  // Fonction pour obtenir le contenu du bottom sheet selon le type
  const getBottomSheetContent = () => {
    if (analysisResult?.type === 'self_deprecation') {
      // Utiliser la réponse de Mistral si disponible, sinon message par défaut
      const description = analysisResult.responseText ||
        'La reformulation te permet de sortir de l\'émotion pour revenir aux faits. Le but est de reformuler ta pensée avec une approche moins dramatique.';

      return {
        titlePart1: 'Ici, tu fais une ',
        titlePart2: 'auto-dépréciation',
        description: description,
        buttonText: 'Démarrer l\'exercice',
      };
    } else if (analysisResult?.type === 'suicidal_thoughts') {
      // Utiliser la réponse de Mistral si disponible, sinon message par défaut
      const description = analysisResult.responseText ||
        'Si tu traverses une période difficile, n\'hésite pas à appeler le numéro d\'aide. Des professionnels sont disponibles 24h/24 pour t\'écouter.';

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
    const formatted = date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }); // ex: jeu. 18 décembre 2025

    // Première lettre en majuscule
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
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
      <TouchableOpacity
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
      </TouchableOpacity>

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
    alignItems: "flex-start", // force à gauche
  },
  dateHeader: {
    fontSize: 24,
    fontFamily: Fonts.serif.semiBoldItalic,
    lineHeight: 28,
    textAlignVertical: "top",
    textAlign: "left",
    marginVertical: 12,
    paddingVertical: 20,
  },
});
