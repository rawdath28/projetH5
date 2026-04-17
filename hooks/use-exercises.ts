import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type Exercise = {
  id: string;
  titre: string;
  description_courte: string;
  description_longue: string;
  duree_moyenne: number;
  effort_cognitif: number;
  psychologues: string;
  gradientIndex: number;
};

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error: sbError } = await supabase!
          .from('exercises')
          .select('id, titre, description_courte, description_longue, duree_moyenne, effort_cognitif, psychologues')
          .order('titre', { ascending: true });

        if (sbError) throw new Error(sbError.message);

        if (!cancelled && data) {
          const mapped: Exercise[] = data.map((row: any) => ({
            id: String(row.id),
            titre: row.titre ?? '',
            description_courte: row.description_courte ?? '',
            description_longue: row.description_longue ?? '',
            duree_moyenne: Number(row.duree_moyenne) || 10,
            effort_cognitif: Number(row.effort_cognitif) || 1,
            psychologues: (row.psychologues ?? '').replace(/;/g, ','),
            gradientIndex: (Number(row.id) - 1) % 7,
          }));
          setExercises(mapped);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { exercises, loading, error };
}
