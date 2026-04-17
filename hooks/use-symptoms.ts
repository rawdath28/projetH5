import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type Symptom = {
  id: string;
  titre: string;
  description: string;
  exercices_associes: string[];
};

export function useSymptoms() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase!
          .from('symptomes')
          .select('id, titre, description, exercices_associes');

        if (error) throw new Error(error.message);

        if (!cancelled && data) {
          const mapped: Symptom[] = data.map((row: any) => ({
            id: String(row.id),
            titre: row.titre ?? '',
            description: row.description ?? '',
            // Colonne text → on split par ";" comme dans le CSV
            exercices_associes: typeof row.exercices_associes === 'string'
              ? row.exercices_associes.split(';').map((s: string) => s.trim()).filter(Boolean)
              : [],
          }));
          setSymptoms(mapped);
        }
      } catch (_) {
        // ignore silencieusement comme avant
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { symptoms, loading };
}
