import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const EmergencyScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Bouton fermer */}
      <TouchableOpacity style={styles.closeButton}>
        <Icon name="close" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Texte principal */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Tu n’es{'\n'}pas seul·e
        </Text>

        <Text style={styles.subtitle}>
          De l’aide immédiate est disponible !
        </Text>
      </View>

      {/* Boutons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.mainButton}>
          <Icon name="call-outline" size={18} color="#fff" />
          <Text style={styles.mainButtonText}>Suicide Écoute</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Icon name="call-outline" size={18} color="#fff" />
          <Text style={styles.secondaryButtonText}>
            Prévention suicide
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EmergencyScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0A1B6F', // bleu profond
      justifyContent: 'space-between',
    },
  
    closeButton: {
      alignSelf: 'flex-end',
      padding: 20,
    },
  
    content: {
      alignItems: 'center',
      paddingHorizontal: 30,
    },
  
    title: {
      fontSize: 42,
      color: '#fff',
      textAlign: 'center',
      fontWeight: '300',
      fontStyle: 'italic',
      marginBottom: 20,
    },
  
    subtitle: {
      fontSize: 14,
      color: '#D1D5FF',
      textAlign: 'center',
    },
  
    buttonsContainer: {
      paddingHorizontal: 30,
      paddingBottom: 40,
    },
  
    mainButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#4A5CFF',
      borderRadius: 30,
      paddingVertical: 14,
      marginBottom: 16,
    },
  
    mainButtonText: {
      color: '#fff',
      fontSize: 16,
      marginLeft: 8,
    },
  
    secondaryButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  
    secondaryButtonText: {
      color: '#fff',
      fontSize: 15,
      marginLeft: 8,
    },
  });
  