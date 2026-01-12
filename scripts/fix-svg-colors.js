/**
 * Script de transformation des couleurs SVG
 * 
 * Remplace les couleurs hardcodées (#1B1B1B, black, #000000, etc.)
 * par "currentColor" pour permettre la personnalisation dynamique.
 * 
 * Usage: node scripts/fix-svg-colors.js
 */

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', 'assets', 'icon');

// Couleurs à remplacer par currentColor
const COLORS_TO_REPLACE = [
  '#1B1B1B',
  '#1b1b1b',
  '#000000',
  '#000',
  'black',
  '#212529',
];

function fixSvgColors() {
  const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.svg'));
  
  console.log(`🎨 Transformation des couleurs SVG...`);
  console.log(`   ${files.length} fichiers à traiter\n`);
  
  let modifiedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(ICONS_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let wasModified = false;
    
    COLORS_TO_REPLACE.forEach(color => {
      // Remplacer fill="color" par fill="currentColor"
      const fillRegex = new RegExp(`fill="${color}"`, 'gi');
      if (fillRegex.test(content)) {
        content = content.replace(fillRegex, 'fill="currentColor"');
        wasModified = true;
      }
      
      // Remplacer stroke="color" par stroke="currentColor"
      const strokeRegex = new RegExp(`stroke="${color}"`, 'gi');
      if (strokeRegex.test(content)) {
        content = content.replace(strokeRegex, 'stroke="currentColor"');
        wasModified = true;
      }
    });
    
    if (wasModified) {
      fs.writeFileSync(filePath, content);
      modifiedCount++;
    }
  });
  
  console.log(`✅ ${modifiedCount} fichiers modifiés`);
  console.log(`\n💡 Relancez maintenant: npm run generate-icons`);
}

fixSvgColors();
