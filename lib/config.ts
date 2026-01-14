/**
 * Configuration de l'application
 * Pour utiliser la clé API Mistral, vous avez plusieurs options :
 * 
 * Option 1 (Recommandé) : Mettre directement votre clé ici
 * Remplacez 'undefined' par votre clé API Mistral
 * 
 * Option 2 : Utiliser expo-constants avec app.json
 * Ajoutez dans app.json -> expo.extra : { "mistralApiKey": "votre_cle" }
 * 
 * Option 3 : Variables d'environnement (nécessite configuration supplémentaire)
 */

import Constants from 'expo-constants';

export const getMistralApiKey = (): string | undefined => {
  // 1) Config Expo (via app.config.js / app.json -> extra.mistralApiKey)
  const fromExtra = Constants.expoConfig?.extra?.mistralApiKey as
    | string
    | undefined;
  if (typeof fromExtra === 'string' && fromExtra.trim().length > 0) {
    console.log('✅ Clé API récupérée depuis Constants.expoConfig.extra.mistralApiKey');
    return fromExtra.trim();
  }

  // 2) Fallback: variables d'environnement (dev local, EAS secrets, etc.)
  const fromEnv =
    process.env.EXPO_PUBLIC_MISTRAL_API_KEY || process.env.MISTRAL_API_KEY;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    console.log('✅ Clé API récupérée depuis process.env');
    return fromEnv.trim();
  }

  // Debug: afficher ce qui est disponible
  console.error('❌ Aucune clé API trouvée');
  console.error('   Constants.expoConfig?.extra?.mistralApiKey:', fromExtra);
  console.error('   process.env.EXPO_PUBLIC_MISTRAL_API_KEY:', process.env.EXPO_PUBLIC_MISTRAL_API_KEY ? 'définie' : 'undefined');
  console.error('   process.env.MISTRAL_API_KEY:', process.env.MISTRAL_API_KEY ? 'définie' : 'undefined');

  return undefined;
};

// Numéro de téléphone d'aide (France)
export const HELP_PHONE_NUMBER = '3114'; // Numéro national de prévention du suicide
