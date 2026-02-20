import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMoodsFromSupabase } from '../services/moodsService';
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

interface MoodsContextType {
  moods: Mood[];
  loading: boolean;
  error: Error | null;
  refreshMoods: () => Promise<void>;
}

const MoodsContext = createContext<MoodsContextType>({
  moods: [], // Tableau vide par défaut - les moods doivent venir de Supabase uniquement
  loading: false,
  error: null,
  refreshMoods: async () => {},
});

export function MoodsProvider({ children }: { children: React.ReactNode }) {
  const [moods, setMoods] = useState<Mood[]>([]); // Tableau vide - pas de fallback depuis le code
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMoodsFromSupabase = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [MoodsProvider] Début du chargement des moods...');
      
      // Vérifier que Supabase est configuré
      if (!supabase) {
        const errorMsg = 'Supabase client non initialisé';
        console.error('❌ [MoodsProvider]', errorMsg);
        setError(new Error(errorMsg));
        setMoods([]);
        setLoading(false);
        return;
      }

      console.log('✓ [MoodsProvider] Supabase client OK');

      // Test de connexion direct pour diagnostiquer RLS
      console.log('🔍 [MoodsProvider] Test de connexion à la table moods...');
      const testQuery = await supabase
        .from('moods')
        .select('count', { count: 'exact', head: true });
      
      console.log('📊 [MoodsProvider] Résultat du test:', {
        count: testQuery.count,
        error: testQuery.error,
        status: testQuery.status,
        statusText: testQuery.statusText
      });

      if (testQuery.error) {
        console.error('❌ [MoodsProvider] Erreur de connexion:', {
          code: testQuery.error.code,
          message: testQuery.error.message,
          details: testQuery.error.details,
          hint: testQuery.error.hint
        });
      }

      // Charger les moods
      const { data, error: fetchError } = await getMoodsFromSupabase();

      console.log('📊 [MoodsProvider] Résultat getMoodsFromSupabase:', {
        dataLength: data?.length,
        hasError: !!fetchError,
        errorDetails: fetchError
      });

      if (fetchError) {
        console.error('❌ [MoodsProvider] Erreur lors du chargement:', fetchError);
        setMoods([]);
        setError(fetchError as Error);
      } else if (data && data.length > 0) {
        // Convertir les données Supabase au format Mood
        const loadedMoods: Mood[] = data.map((item: any) => ({
          id: item.id,
          label: item.label,
          color: item.color,
          valence: item.valence,
          energy: item.energy,
          description: item.description ?? '',
        }));
        setMoods(loadedMoods);
        console.log(`✅ [MoodsProvider] ${loadedMoods.length} moods chargés avec succès`);
        console.log('📝 [MoodsProvider] Premiers moods:', loadedMoods.slice(0, 3));
      } else {
        console.warn('⚠️ [MoodsProvider] Aucun mood trouvé dans Supabase');
        console.warn('⚠️ [MoodsProvider] Data reçue:', data);
        setMoods([]);
        setError(new Error('Aucun mood trouvé dans la base de données'));
      }
    } catch (err) {
      console.error('❌ [MoodsProvider] Exception lors du chargement:', err);
      console.error('❌ [MoodsProvider] Stack trace:', (err as Error).stack);
      setError(err as Error);
      setMoods([]);
    } finally {
      setLoading(false);
      console.log('🏁 [MoodsProvider] Chargement terminé');
    }
  };

  useEffect(() => {
    console.log('🚀 [MoodsProvider] Montage du composant');
    loadMoodsFromSupabase();
    
    return () => {
      console.log('🔚 [MoodsProvider] Démontage du composant');
    };
  }, []);

  const refreshMoods = async () => {
    console.log('🔄 [MoodsProvider] Rafraîchissement manuel des moods');
    await loadMoodsFromSupabase();
  };

  return (
    <MoodsContext.Provider value={{ moods, loading, error, refreshMoods }}>
      {children}
    </MoodsContext.Provider>
  );
}

export function useMoods() {
  const context = useContext(MoodsContext);
  if (!context) {
    throw new Error('useMoods must be used within a MoodsProvider');
  }
  return context;
}
