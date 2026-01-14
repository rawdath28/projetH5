require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

// Debug: vérifier si .env est chargé (ne pas logger la clé complète)
const apiKeyFromEnv = process.env.EXPO_PUBLIC_MISTRAL_API_KEY;
if (apiKeyFromEnv) {
  console.log('✅ .env chargé: EXPO_PUBLIC_MISTRAL_API_KEY trouvée (longueur:', apiKeyFromEnv.length, ')');
} else {
  console.warn('⚠️ .env non chargé ou EXPO_PUBLIC_MISTRAL_API_KEY absente');
  console.warn('   Chemin recherché:', require('path').resolve(__dirname, '.env'));
  console.warn('   Assurez-vous que le fichier .env existe à la racine avec:');
  console.warn('   EXPO_PUBLIC_MISTRAL_API_KEY=votre_cle');
}

module.exports = ({ config }) => ({
  ...config,
  name: 'projetH5',
  slug: 'projetH5',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/app-icon.jpg',
  platforms: ['ios', 'android', 'web'],
  scheme: 'projeth5',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'myApp',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: { backgroundColor: '#000000' },
      },
    ],
    'expo-font',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '2ef1c68a-a4c9-4bcc-8e7d-23646aa1174e',
    },
    // Clé injectée depuis .env (non commitée)
    mistralApiKey: process.env.EXPO_PUBLIC_MISTRAL_API_KEY,
  },
});
