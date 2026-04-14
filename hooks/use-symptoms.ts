import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export type Symptom = {
  id: string;
  titre: string;
  description: string;
  exercices_associes: string[];
};

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

function parseCsv(text: string): Symptom[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const header = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const get = (col: string) => values[header.indexOf(col)] ?? '';
    return {
      id: get('id'),
      titre: get('titre'),
      description: get('description'),
      exercices_associes: get('exercices_associes').split(';').map((s) => s.trim()).filter(Boolean),
    };
  });
}

export function useSymptoms() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const asset = Asset.fromModule(require('../assets/symptomes_tcc.csv'));
        await asset.downloadAsync();
        const uri = asset.localUri ?? asset.uri;
        const text = await FileSystem.readAsStringAsync(uri);
        if (!cancelled) setSymptoms(parseCsv(text));
      } catch (_) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { symptoms, loading };
}
