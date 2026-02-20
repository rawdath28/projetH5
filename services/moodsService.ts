import { supabase } from '../lib/supabase';

// Définir le type Mood localement sans dépendre de constants/moods.ts
interface Mood {
  id: string;
  label: string;
  color: string;
  valence: number;
  energy: number;
  description: string;
}

/**
 * Service pour interagir avec les moods dans Supabase
 */

/**
 * Synchronise les moods fournis vers Supabase
 * @param moodsData - Tableau de moods à synchroniser
 */
export async function syncMoodsToSupabase(moodsData: Mood[] = []) {
  if (!supabase) {
    console.warn('⚠️ Supabase non configuré');
    return { error: { message: 'Supabase non configuré' } };
  }

  if (moodsData.length === 0) {
    console.warn('⚠️ Aucun mood à synchroniser');
    return { error: { message: 'Aucun mood fourni pour la synchronisation' } };
  }

  try {
    console.log('🔄 Synchronisation des moods vers Supabase...');
    console.log(`📊 Nombre de moods à synchroniser: ${moodsData.length}`);

    // Préparer les données pour l'insertion
    const dataToSync = moodsData.map((mood: Mood) => ({
      id: mood.id,
      label: mood.label,
      color: mood.color,
      valence: mood.valence,
      energy: mood.energy,
    }));

    // Utiliser upsert pour éviter les doublons (insert ou update si existe déjà)
    const { data, error } = await supabase
      .from('moods')
      .upsert(dataToSync, {
        onConflict: 'id', // Si l'id existe déjà, mettre à jour
      })
      .select();

    if (error) {
      console.error('❌ Erreur lors de la synchronisation des moods:', error);
      return { error };
    }

    console.log(`✅ ${data?.length || 0} moods synchronisés avec succès dans Supabase`);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des moods:', error);
    return { error };
  }
}

/**
 * Récupère tous les moods depuis Supabase
 */
export async function getMoodsFromSupabase() {
  if (!supabase) {
    console.warn('⚠️ Supabase non configuré');
    return { data: null, error: { message: 'Supabase non configuré' } };
  }

  try {
    console.log('🔍 Tentative de récupération des moods...');
    
    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .order('valence', { ascending: false })
      .order('energy', { ascending: false });

    // 👇 Ajoutez ces logs pour déboguer
    console.log('📊 Résultat brut:', { data, error });
    console.log('📊 Nombre de lignes:', data?.length);
    
    if (error) {
      console.error('❌ Code erreur:', error.code);
      console.error('❌ Message erreur:', error.message);
      console.error('❌ Détails:', error.details);
      console.error('❌ Hint:', error.hint);
      return { data: null, error };
    }

    console.log(`✅ ${data?.length || 0} moods récupérés depuis Supabase`);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Exception:', error);
    return { data: null, error };
  }
}

/**
 * Récupère un mood spécifique par son ID depuis Supabase
 */
export async function getMoodByIdFromSupabase(moodId: string) {
  if (!supabase) {
    console.warn('⚠️ Supabase non configuré');
    return { data: null, error: { message: 'Supabase non configuré' } };
  }

  try {
    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .eq('id', moodId)
      .single();

    if (error) {
      console.error(`❌ Erreur lors de la récupération du mood ${moodId}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération du mood ${moodId}:`, error);
    return { data: null, error };
  }
}
