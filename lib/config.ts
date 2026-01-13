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
  // Option 1 : Clé directement dans le code (pour développement rapide)
  // Décommentez la ligne suivante et mettez votre clé :
  // return 'votre_cle_api_mistral_ici';
  
  // Option 2 : Via expo-constants depuis app.json
  const fromConstants = Constants.expoConfig?.extra?.mistralApiKey;
  if (fromConstants && fromConstants !== 'your_mistral_api_key_here') {
    return fromConstants;
  }
  
  // Option 3 : Variables d'environnement Expo (EXPO_PUBLIC_*)
  // Note: Pour que cela fonctionne, vous devez redémarrer Expo après avoir créé/modifié .env
  const fromEnv = process.env.EXPO_PUBLIC_MISTRAL_API_KEY;
  if (fromEnv) {
    console.log('Clé API chargée depuis EXPO_PUBLIC_MISTRAL_API_KEY');
    return fromEnv.trim(); // Enlever les espaces éventuels
  }
  
  // Option 4 : Variables d'environnement standard
  if (process.env.MISTRAL_API_KEY) {
    return process.env.MISTRAL_API_KEY.trim();
  }
  
  // Option 5 : Lecture directe depuis .env (pour développement)
  // Clé API Mistral depuis le fichier .env
  // Note: Pour que les variables d'environnement fonctionnent avec Expo,
  // vous devez redémarrer complètement le serveur Expo (pas juste reload)
  return '2haQR5kEQFrjxvwVDuCuK4fgTK5TVKBb';
  
  // return undefined;
};

// Numéro de téléphone d'aide (France)
export const HELP_PHONE_NUMBER = '3114'; // Numéro national de prévention du suicide
