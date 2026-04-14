import { Redirect } from 'expo-router';

export default function IndexRedirect() {
  return <Redirect href="/(tabs)/exercise" />;

  // Auth désactivée temporairement
  // const { user, loading } = useAuth();
  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" color="#027A54" />
  //     </View>
  //   );
  // }
  // if (!user) {
  //   return <Redirect href="/screens/Auth/LoginScreen" />;
  // }
  // return <Redirect href="/screens/onboarding" />;
}