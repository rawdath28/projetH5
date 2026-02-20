import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors, Fonts } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function ProgressScreen() {
  // const colorScheme = useColorScheme();
  // const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {/* Header avec fond vert */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <IconSymbol size={32} name="list.triangle" color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Progrès</Text>
          <Text style={styles.subtitle}>Suivez votre évolution au quotidien</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Stats rapides */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <IconSymbol size={20} name="checkmark.circle.fill" color="#027A54" />
              </View>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Séances</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <IconSymbol size={20} name="calendar" color="#027A54" />
              </View>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Jours</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <IconSymbol size={20} name="chart.line.uptrend.xyaxis" color="#027A54" />
              </View>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Progrès</Text>
            </View>
          </View>

          {/* Section aujourd'hui */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Aujourd'hui</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.sessionCard}>
              <View style={styles.sessionIconWrapper}>
                <View style={[styles.sessionIcon, styles.sessionIconPending]}>
                  <IconSymbol size={24} name="clock" color="#FFA726" />
                </View>
              </View>
              <View style={styles.sessionContent}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>Humeur du jour</Text>
                  <View style={[styles.statusBadge, styles.statusPending]}>
                    <Text style={styles.statusText}>En attente</Text>
                  </View>
                </View>
                <Text style={styles.sessionDescription}>
                  Enregistrez votre humeur et vos notes pour cette journée
                </Text>
                <Text style={styles.sessionTime}>Il y a 2 heures</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Section à venir */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À venir</Text>

            <TouchableOpacity style={styles.sessionCard}>
              <View style={styles.sessionIconWrapper}>
                <View style={[styles.sessionIcon, styles.sessionIconUpcoming]}>
                  <IconSymbol size={24} name="calendar.badge.plus" color="#027A54" />
                </View>
              </View>
              <View style={styles.sessionContent}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>Prochaine séance</Text>
                  <View style={[styles.statusBadge, styles.statusUpcoming]}>
                    <Text style={[styles.statusText, styles.statusTextUpcoming]}>Demain</Text>
                  </View>
                </View>
                <Text style={styles.sessionDescription}>
                  Préparez vos questions et notes pour votre thérapeute
                </Text>
                <View style={styles.sessionFooter}>
                  <IconSymbol size={16} name="clock" color="#999999" />
                  <Text style={styles.sessionTime}>15 Jan, 14:00</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Section historique */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique</Text>

            <TouchableOpacity style={styles.sessionCard}>
              <View style={styles.sessionIconWrapper}>
                <View style={[styles.sessionIcon, styles.sessionIconCompleted]}>
                  <IconSymbol size={24} name="checkmark.circle.fill" color="#027A54" />
                </View>
              </View>
              <View style={styles.sessionContent}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>Séance thérapie</Text>
                  <View style={[styles.statusBadge, styles.statusCompleted]}>
                    <Text style={[styles.statusText, styles.statusTextCompleted]}>Terminée</Text>
                  </View>
                </View>
                <Text style={styles.sessionDescription}>
                  Discussion sur la gestion du stress et des émotions
                </Text>
                <View style={styles.sessionFooter}>
                  <IconSymbol size={16} name="clock" color="#999999" />
                  <Text style={styles.sessionTime}>10 Jan, 10:30</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sessionCard}>
              <View style={styles.sessionIconWrapper}>
                <View style={[styles.sessionIcon, styles.sessionIconCompleted]}>
                  <IconSymbol size={24} name="checkmark.circle.fill" color="#027A54" />
                </View>
              </View>
              <View style={styles.sessionContent}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>Exercice de respiration</Text>
                  <View style={[styles.statusBadge, styles.statusCompleted]}>
                    <Text style={[styles.statusText, styles.statusTextCompleted]}>Terminée</Text>
                  </View>
                </View>
                <Text style={styles.sessionDescription}>
                  Pratique de la cohérence cardiaque - 10 minutes
                </Text>
                <View style={styles.sessionFooter}>
                  <IconSymbol size={16} name="clock" color="#999999" />
                  <Text style={styles.sessionTime}>08 Jan, 18:00</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Bouton voir plus */}
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>Voir plus de séances</Text>
            <IconSymbol size={16} name="chevron.down" color="#027A54" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    backgroundColor: '#027A54',
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -30,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(2, 122, 84, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontFamily: Fonts.sans.bold,
    color: '#027A54',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.sans.regular,
    color: '#666666',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.sans.bold,
    color: '#027A54',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: Fonts.sans.semiBold,
    color: '#027A54',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sessionIconWrapper: {
    marginRight: 16,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionIconPending: {
    backgroundColor: 'rgba(255, 167, 38, 0.15)',
  },
  sessionIconUpcoming: {
    backgroundColor: 'rgba(2, 122, 84, 0.15)',
  },
  sessionIconCompleted: {
    backgroundColor: 'rgba(2, 122, 84, 0.15)',
  },
  sessionContent: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  sessionTitle: {
    fontSize: 16,
    fontFamily: Fonts.sans.semiBold,
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPending: {
    backgroundColor: 'rgba(255, 167, 38, 0.15)',
  },
  statusUpcoming: {
    backgroundColor: 'rgba(2, 122, 84, 0.15)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(2, 122, 84, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.sans.semiBold,
    color: '#FFA726',
  },
  statusTextUpcoming: {
    color: '#027A54',
  },
  statusTextCompleted: {
    color: '#027A54',
  },
  sessionDescription: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionTime: {
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    color: '#999999',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginTop: 8,
    marginBottom: 20,
  },
  loadMoreText: {
    fontSize: 15,
    fontFamily: Fonts.sans.semiBold,
    color: '#027A54',
  },
});