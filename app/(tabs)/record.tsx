import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../../constants/theme';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type RecordItem = {
  id: string;
  date: string;
  duration: string;
  doctor: string;
};

const DATA: RecordItem[] = [
  {
    id: '1',
    date: 'Ven. 5 décembre 2025',
    duration: '52 min',
    doctor: 'Dr. Dupont',
  },
  {
    id: '2',
    date: 'Ven. 7 Novembre 2025',
    duration: '52 min',
    doctor: 'Dr. Dupont',
  },
  {
    id: '3',
    date: 'Mer. 22 Octobre 2025',
    duration: '52 min',
    doctor: 'Dr. Dupont',
  },
  {
    id: '4',
    date: 'Mar. 11 Octobre 2025',
    duration: '52 min',
    doctor: 'Dr. Dupont',
  },
  {
    id: '5',
    date: 'Jeu. 28 Septembre 2025',
    duration: '52 min',
    doctor: 'Dr. Dupont',
  },
  {
    id: '6',
    date: 'Ven. 12 Septembre 2025',
    duration: '52 min',
    doctor: 'Dr. Dupont',
  },
  {
    id: '7',
    date: 'Mar. 1 Aout 2025',
    duration: '52 min',
    doctor: 'Dr. Dupont',
  },
];

const RecordScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Zone micro */}
      <View style={styles.micContainer}>
        <View style={styles.micCircle}>
          <Icon name="mic-outline" size={34} color="#222" />
        </View>
        <Text style={styles.timer}>0:00</Text>
      </View>

      {/* Liste des enregistrements */}
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.date}</Text>
              <Icon name="expand-outline" size={18} color="#222" />
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.info}>
                <Icon name="time-outline" size={16} color="#555" />
                <Text style={styles.infoText}>{item.duration}</Text>
              </View>

              <View style={styles.info}>
                <Icon name="person-outline" size={16} color="#555" />
                <Text style={styles.infoText}>{item.doctor}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default RecordScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2EE',
  },

  micContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },

  micCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F8FAF8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },

  timer: {
    marginTop: 12,
    fontSize: 18,
    color: '#222',
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 20,
    color: '#027A54',
    fontWeight: '600',
    fontFamily: Fonts.sans.semiBoldItalic
  },

  cardFooter: {
    flexDirection: 'row',
    marginTop: 12,
  },

  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },

  infoText: {
    marginLeft: 6,
    color: '#555',
    fontSize: 14,
  },
});
