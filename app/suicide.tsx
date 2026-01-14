import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function SuicideScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton}>
        <Icon name="close" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.text}>
          Je suis nul
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    backgroundColor: 'red',
    width: 358,
    height: 443,
    alignSelf: 'center',
    marginTop: 100,
    paddingBottom: 50,
    borderRadius: 32,
    justifyContent: 'center', // centre verticalement
    alignItems: 'center',     // centre horizontalement
  },  
  closeButton: {
    alignSelf: 'flex-end',
    padding: 20,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    fontFamily: Fonts.sans.regularItalic,
  },
});

