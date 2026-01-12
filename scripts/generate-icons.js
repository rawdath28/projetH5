/**
 * Script de génération de la librairie d'icônes
 * 
 * Ce script scanne le dossier assets/icon/ et génère :
 * - lib/icons/types.ts : type TypeScript pour les noms d'icônes (autocomplétion)
 * - lib/icons/icons-map.ts : mapping de toutes les icônes vers les composants SVG
 * - lib/icons/index.ts : point d'entrée qui re-exporte tout
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Chemins
const ICONS_DIR = path.join(__dirname, '..', 'assets', 'icon');
const OUTPUT_DIR = path.join(__dirname, '..', 'lib', 'icons');

/**
 * Convertit un nom de fichier SVG en nom de variable JavaScript valide
 * Ex: "arrow-right.svg" -> "arrowRight"
 *     "123-icon.svg" -> "_123Icon" (les chiffres au début sont préfixés)
 */
function toVariableName(filename) {
  // Retirer l'extension .svg
  let name = filename.replace('.svg', '');
  
  // Convertir kebab-case en camelCase
  name = name.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
  
  // Si le nom commence par un chiffre, préfixer avec underscore
  if (/^[0-9]/.test(name)) {
    name = '_' + name;
  }
  
  return name;
}

/**
 * Génère les fichiers TypeScript
 */
function generateIconLibrary() {
  // Créer le dossier de sortie s'il n'existe pas
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Lire tous les fichiers SVG
  const files = fs.readdirSync(ICONS_DIR)
    .filter(file => file.endsWith('.svg'))
    .sort();

  console.log(`📦 Génération de la librairie d'icônes...`);
  console.log(`   ${files.length} icônes trouvées dans assets/icon/`);

  // Générer les imports et le mapping
  const imports = [];
  const mappingEntries = [];
  const iconNames = [];

  files.forEach(file => {
    const iconName = file.replace('.svg', ''); // Nom original (ex: "arrow-right")
    const varName = toVariableName(file);       // Nom de variable (ex: "arrowRight")
    
    imports.push(`import ${varName} from '@/assets/icon/${file}';`);
    mappingEntries.push(`  '${iconName}': ${varName},`);
    iconNames.push(`  | '${iconName}'`);
  });

  // Générer lib/icons/types.ts
  const typesContent = `/**
 * Types pour la librairie d'icônes
 * 
 * ⚠️ FICHIER GÉNÉRÉ AUTOMATIQUEMENT
 * Ne pas modifier manuellement - Exécuter: node scripts/generate-icons.js
 */

/**
 * Noms des icônes disponibles (pour l'autocomplétion)
 * Total: ${files.length} icônes
 */
export type IconName =
${iconNames.join('\n')};
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'types.ts'), typesContent);
  console.log(`   ✅ lib/icons/types.ts généré`);

  // Générer lib/icons/icons-map.ts (le mapping, sans dépendance circulaire)
  const iconsMapContent = `/**
 * Mapping des icônes SVG
 * 
 * ⚠️ FICHIER GÉNÉRÉ AUTOMATIQUEMENT
 * Ne pas modifier manuellement - Exécuter: node scripts/generate-icons.js
 */

import { FC } from 'react';
import { SvgProps } from 'react-native-svg';
import { IconName } from './types';

// Imports des icônes SVG
${imports.join('\n')}

/**
 * Mapping des noms d'icônes vers les composants SVG
 */
export const icons: Record<IconName, FC<SvgProps>> = {
${mappingEntries.join('\n')}
};
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'icons-map.ts'), iconsMapContent);
  console.log(`   ✅ lib/icons/icons-map.ts généré`);

  // Générer lib/icons/index.ts (point d'entrée simple)
  const indexContent = `/**
 * Librairie d'icônes SVG
 * 
 * Usage:
 *   import { Icon } from '@/lib/icons';
 *   <Icon name="heart" size={24} color="#FF0000" />
 * 
 * Ou pour accéder directement au mapping :
 *   import { icons, IconName } from '@/lib/icons';
 */

// Export du composant principal
export { Icon } from './Icon';
export type { IconProps } from './Icon';

// Export du mapping et des types
export { icons } from './icons-map';
export type { IconName } from './types';
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), indexContent);
  console.log(`   ✅ lib/icons/index.ts généré`);

  console.log(`\n🎉 Génération terminée !`);
  console.log(`   Utilisation: import { Icon } from '@/lib/icons';`);
  console.log(`                <Icon name="heart" size={24} color="#FF0000" />`);
}

// Exécution
generateIconLibrary();
