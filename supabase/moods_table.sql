-- Script SQL pour créer la table 'moods' dans Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- Créer la table moods si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS moods (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  valence NUMERIC NOT NULL CHECK (valence >= -1 AND valence <= 1),
  energy NUMERIC NOT NULL CHECK (energy >= -1 AND energy <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur valence et energy pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_moods_valence ON moods(valence);
CREATE INDEX IF NOT EXISTS idx_moods_energy ON moods(energy);

-- Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer un trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_moods_updated_at ON moods;
CREATE TRIGGER update_moods_updated_at
    BEFORE UPDATE ON moods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activer Row Level Security (RLS) si nécessaire
-- ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre la lecture à tous les utilisateurs authentifiés
-- CREATE POLICY "Allow authenticated users to read moods"
--   ON moods FOR SELECT
--   TO authenticated
--   USING (true);

-- Créer une politique pour permettre l'insertion/update aux utilisateurs authentifiés
-- CREATE POLICY "Allow authenticated users to insert/update moods"
--   ON moods FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);
