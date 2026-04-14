import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

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

/** Parse naïve d'une ligne CSV en gérant les champs entre guillemets */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(text: string): Exercise[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const header = parseCsvLine(lines[0]);

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const get = (col: string) => values[header.indexOf(col)] ?? '';

    const id = get('id');
    return {
      id,
      titre: get('titre'),
      description_courte: get('description_courte'),
      description_longue: get('description_longue'),
      duree_moyenne: parseInt(get('duree_moyenne'), 10) || 10,
      effort_cognitif: parseInt(get('effort_cognitif'), 10) || 1,
      // Remplace ";" par ", " pour l'affichage
      psychologues: get('psychologues').replace(/;/g, ','),
      gradientIndex: (parseInt(id, 10) - 1) % 7,
    };
  });
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const asset = Asset.fromModule(require('../assets/exercices_tcc.csv'));
        await asset.downloadAsync();
        const uri = asset.localUri ?? asset.uri;
        const text = await FileSystem.readAsStringAsync(uri);
        if (!cancelled) {
          const sorted = parseCsv(text).sort((a, b) =>
            a.titre.localeCompare(b.titre, 'fr', { sensitivity: 'base' })
          );
          setExercises(sorted);
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
