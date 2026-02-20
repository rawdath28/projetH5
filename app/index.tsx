import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

function IndexRedirect() {
  const { user, loading } = useAuth();

  // Afficher un loader pendant le chargement de l'authentification
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#027A54" />
      </View>
    );
  }

  // Rediriger vers Login si non connecté, sinon vers onboarding
  if (!user) {
    return <Redirect href="/screens/Auth/LoginScreen" />;
  }
  return <Redirect href="/screens/onboarding" />;
}

export default IndexRedirect;