/**
 * Configuration Supabase
 * Pour utiliser Supabase, vous devez configurer vos identifiants :
 * 
 * Option 1 (Recommandé) : Variables d'environnement
 * Créez un fichier .env à la racine du projet avec :
 * EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
 * EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
 * 
 * Option 2 : Utiliser expo-constants avec app.json
 * Ajoutez dans app.json -> expo.extra :
 * {
 *   "supabaseUrl": "votre_url_supabase",
 *   "supabaseAnonKey": "votre_cle_anonyme_supabase"
 * }
 */

import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

/**
 * Récupère l'URL Supabase depuis différentes sources
 */
const getSupabaseUrl = () => {
  // Option 1 : Via expo-constants depuis app.json
  const fromConstants = Constants.expoConfig?.extra?.supabaseUrl;
  if (fromConstants) {
    return fromConstants;
  }
  
  // Option 2 : Variables d'environnement Expo (EXPO_PUBLIC_*)
  const fromEnv = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (fromEnv) {
    console.log('URL Supabase chargée depuis EXPO_PUBLIC_SUPABASE_URL');
    return fromEnv.trim();
  }
  
  // Option 3 : Variables d'environnement standard
  if (process.env.SUPABASE_URL) {
    return process.env.SUPABASE_URL.trim();
  }
  
  return undefined;
};

/**
 * Récupère la clé anonyme Supabase depuis différentes sources
 */
const getSupabaseAnonKey = () => {
  // Option 1 : Via expo-constants depuis app.json
  const fromConstants = Constants.expoConfig?.extra?.supabaseAnonKey;
  if (fromConstants) {
    return fromConstants;
  }
  
  // Option 2 : Variables d'environnement Expo (EXPO_PUBLIC_*)
  const fromEnv = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (fromEnv) {
    console.log('Clé Supabase chargée depuis EXPO_PUBLIC_SUPABASE_ANON_KEY');
    return fromEnv.trim();
  }
  
  // Option 3 : Variables d'environnement standard
  if (process.env.SUPABASE_ANON_KEY) {
    return process.env.SUPABASE_ANON_KEY.trim();
  }
  
  return undefined;
};

// Récupération des identifiants
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Vérification de la configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase non configuré. ' +
    'Veuillez définir EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY ' +
    'dans votre fichier .env ou dans app.json'
  );
}

/**
 * Client Supabase
 * Utilisez ce client pour interagir avec votre base de données Supabase
 * 
 * Exemple d'utilisation :
 * import { supabase } from '@/lib/supabase';
 * 
 * const { data, error } = await supabase
 *   .from('table_name')
 *   .select('*');
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Export des fonctions utilitaires si nécessaire
export { getSupabaseUrl, getSupabaseAnonKey };
