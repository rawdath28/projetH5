import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Fonts } from '../../constants/theme';

const BG_IMAGES = [
  require('../../assets/ExerciceBG/Property 1=1.png'),
  require('../../assets/ExerciceBG/Property 1=2.png'),
  require('../../assets/ExerciceBG/Property 1=3.png'),
  require('../../assets/ExerciceBG/Property 1=4.png'),
  require('../../assets/ExerciceBG/Property 1=5.png'),
  require('../../assets/ExerciceBG/Property 1=6.png'),
  require('../../assets/ExerciceBG/Property 1=7.png'),
];
import { useFavorites } from '../../contexts/FavoritesContext';
import { useSymptoms } from '../../hooks/use-symptoms';

const EFFORT_LABEL: Record<number, string> = {
  1: 'Effort faible',
  2: 'Effort modéré',
  3: 'Effort élevé',
};

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();

  const params = useLocalSearchParams<{
    id: string;
    titre: string;
    description_courte: string;
    description_longue: string;
    duree_moyenne: string;
    effort_cognitif: string;
    psychologues: string;
    gradientIndex: string;
  }>();

  const { symptoms } = useSymptoms();

  const gradIndex = parseInt(params.gradientIndex ?? '0', 10);
  const bg = BG_IMAGES[gradIndex % BG_IMAGES.length];
  const effort = parseInt(params.effort_cognitif ?? '1', 10);
  const effortLabel = EFFORT_LABEL[effort] ?? 'Effort faible';

  const associatedSymptoms = symptoms.filter((s) =>
    s.exercices_associes.includes(params.id ?? '')
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header image */}
        <ImageBackground source={bg} style={styles.headerContainer} resizeMode="cover">
          <View style={styles.headerOverlay} />

          {/* Ligne boutons haut */}
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <IconSymbol size={22} name="chevron.left" color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => toggleFavorite(params.id ?? '')}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <IconSymbol
                size={22}
                name={isFavorite(params.id ?? '') ? 'star.fill' : 'star'}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* Titre + sous-titre */}
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>{params.titre}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{params.description_courte}</ThemedText>
          </View>
        </ImageBackground>
        {/* Psychologues + badges — sous le header */}
        <View style={styles.metaSection}>
          {params.psychologues ? (
            <ThemedText style={styles.authors}>
              Construit avec :{' '}
              <ThemedText style={styles.authorsBold}>{params.psychologues}</ThemedText>
            </ThemedText>
          ) : null}

          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <IconSymbol size={13} name="clock" color="#555555" />
              <ThemedText style={styles.badgeText}>{params.duree_moyenne} min</ThemedText>
            </View>
            <View style={styles.badge}>
              <IconSymbol size={13} name="bolt.fill" color="#555555" />
              <ThemedText style={styles.badgeText}>{effortLabel}</ThemedText>
            </View>
            {associatedSymptoms.length > 0 && (
              <View style={styles.badge}>
                <IconSymbol size={13} name="heart.fill" color="#555555" />
                <ThemedText style={styles.badgeText}>
                  {associatedSymptoms.length} Symptômes affectés
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.content}>
          {/* À quoi ça sert ? */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>À quoi ça sert ?</ThemedText>
            <View style={styles.descCard}>
              <ThemedText style={styles.descText}>{params.description_longue}</ThemedText>
            </View>
          </View>

          {/* Qu'est-ce que ça change ? */}
          {associatedSymptoms.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Qu'est-ce que ça change ?</ThemedText>
              <View style={styles.symptomsContainer}>
                {associatedSymptoms.map((symptom) => (
                  <View key={symptom.id} style={styles.symptomCard}>
                    <View style={styles.symptomTitleCard}>
                      <ThemedText style={styles.symptomTitle}>{symptom.titre}</ThemedText>
                    </View>
                    <ThemedText style={styles.symptomDesc}>{symptom.description}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bouton démarrer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            router.push({
              pathname: '/screens/chat',
              params: { titre: params.titre },
            } as any);
          }}
        >
          <ThemedText style={styles.startButtonText}>Démarrer</ThemedText>
          <IconSymbol size={18} name="arrow.right" color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  /* ── Header ── */
  headerContainer: {
    paddingBottom: 10,
    overflow: 'hidden',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.20)',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 56,
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginTop: 80,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: Fonts.sans.semiBoldItalic,
    color: '#FFFFFF',
    textAlign: 'left',
    lineHeight: 50,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.sans.regular,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'left',
  },
  /* ── Meta (sous header) ── */
  metaSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 10,
  },
  authors: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: '#888888',
    fontStyle: 'italic',
    paddingBottom: 10,
    textAlign: 'center',
  },
  authorsBold: {
    fontFamily: Fonts.sans.semiBoldItalic,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: Fonts.sans.semiBoldItalic,
    color: '#444444',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 20,
  },
  /* ── Body ── */
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    gap: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.sans.semiBoldItalic,
    color: '#1A1A1A',
  },
  descCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  descText: {
    fontSize: 16,
    fontFamily: Fonts.sans.regular,
    color: '#555555',
    lineHeight: 23,
  },
  /* ── Symptômes ── */
  symptomsContainer: {
    gap: 10,
  },
  symptomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  symptomTitle: {
    fontSize: 14,
    fontFamily: Fonts.sans.bold,
    // color: '#FFFFFF',
  },
  symptomDesc: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: '#777777',
    lineHeight: 20,
  },
  symptomDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: 12,
  },
  symptomItem: {
    gap: 8,
  },
  symptomTitleCard: {
    alignSelf: 'flex-start',
    backgroundColor: '#E1E1E1',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  /* ── Footer ── */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    // backgroundColor: '#F8F9FA',
    // borderTopWidth: 1,
    // borderTopColor: '#EEEEEE',
  },
  startButton: {
    borderRadius: 25,
    backgroundColor: '#303030',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  startButtonText: {
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
    color: '#FFFFFF',
  },
});
