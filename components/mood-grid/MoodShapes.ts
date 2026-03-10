// Formes géométriques définies par borderRadius asymétrique (% par coin)
// Toutes les bulles partent d'un cercle (50%) et se transforment vers leur forme cible

export type ShapeRadii = {
  topLeftX:     number; topLeftY:     number;
  topRightX:    number; topRightY:    number;
  bottomRightX: number; bottomRightY: number;
  bottomLeftX:  number; bottomLeftY:  number;
};

// Cercle parfait — état de repos
export const CIRCLE: ShapeRadii = {
  topLeftX: 50,     topLeftY: 50,
  topRightX: 50,    topRightY: 50,
  bottomRightX: 50, bottomRightY: 50,
  bottomLeftX: 50,  bottomLeftY: 50,
};

const SHAPES: ShapeRadii[] = [
  // 0 — Goutte (pointe en bas)
  { topLeftX:50,topLeftY:50, topRightX:50,topRightY:50, bottomRightX:10,bottomRightY:10, bottomLeftX:10,bottomLeftY:10 },
  // 1 — Carré arrondi
  { topLeftX:25,topLeftY:25, topRightX:25,topRightY:25, bottomRightX:25,bottomRightY:25, bottomLeftX:25,bottomLeftY:25 },
  // 2 — Feuille verticale
  { topLeftX:50,topLeftY:10, topRightX:10,topRightY:50, bottomRightX:50,bottomRightY:10, bottomLeftX:10,bottomLeftY:50 },
  // 3 — Larme inversée (pointe en haut)
  { topLeftX:10,topLeftY:10, topRightX:10,topRightY:10, bottomRightX:50,bottomRightY:50, bottomLeftX:50,bottomLeftY:50 },
  // 4 — Diamant
  { topLeftX:50,topLeftY:5, topRightX:5,topRightY:50, bottomRightX:50,bottomRightY:5, bottomLeftX:5,bottomLeftY:50 },
  // 5 — Bouclier
  { topLeftX:15,topLeftY:15, topRightX:15,topRightY:15, bottomRightX:50,bottomRightY:10, bottomLeftX:10,bottomLeftY:50 },
  // 6 — Pétale (rotation feuille)
  { topLeftX:10,topLeftY:50, topRightX:50,topRightY:10, bottomRightX:10,bottomRightY:50, bottomLeftX:50,bottomLeftY:10 },
  // 7 — Œuf
  { topLeftX:50,topLeftY:38, topRightX:50,topRightY:38, bottomRightX:50,bottomRightY:62, bottomLeftX:50,bottomLeftY:62 },
  // 8 — Haricot
  { topLeftX:50,topLeftY:18, topRightX:18,topRightY:50, bottomRightX:50,bottomRightY:18, bottomLeftX:18,bottomLeftY:50 },
  // 9 — Hexagone arrondi
  { topLeftX:28,topLeftY:8, topRightX:8,topRightY:28, bottomRightX:28,bottomRightY:8, bottomLeftX:8,bottomLeftY:28 },
  // 10 — Croix arrondie (style screenshot)
  { topLeftX:35,topLeftY:10, topRightX:10,topRightY:35, bottomRightX:35,bottomRightY:10, bottomLeftX:10,bottomLeftY:35 },
  // 11 — Triangle arrondi
  { topLeftX:50,topLeftY:5, topRightX:5,topRightY:50, bottomRightX:8,bottomRightY:8, bottomLeftX:8,bottomLeftY:8 },
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getShapeForMood(moodId: string): ShapeRadii {
  if (moodId === 'continuer') return CIRCLE;
  return SHAPES[hashId(moodId) % SHAPES.length];
}

// Interpolation linéaire entre deux formes (worklet-safe)
export function interpolateShape(from: ShapeRadii, to: ShapeRadii, t: number): ShapeRadii {
  'worklet';
  const l = (a: number, b: number) => a + (b - a) * t;
  return {
    topLeftX:     l(from.topLeftX,     to.topLeftX),
    topLeftY:     l(from.topLeftY,     to.topLeftY),
    topRightX:    l(from.topRightX,    to.topRightX),
    topRightY:    l(from.topRightY,    to.topRightY),
    bottomRightX: l(from.bottomRightX, to.bottomRightX),
    bottomRightY: l(from.bottomRightY, to.bottomRightY),
    bottomLeftX:  l(from.bottomLeftX,  to.bottomLeftX),
    bottomLeftY:  l(from.bottomLeftY,  to.bottomLeftY),
  };
}