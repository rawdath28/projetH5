// // Continuous emotional space coordinates
// // Valence: -1 (Unpleasant) to +1 (Pleasant)
// // Energy: -1 (Low Energy) to +1 (High Energy)

// export type Mood = {
//   id: string;
//   label: string;
//   color: string;
//   valence: number; // -1 (unpleasant) to +1 (pleasant)
//   energy: number; // -1 (low energy) to +1 (high energy)
// };

// // All emotions from How We Feel app, positioned in continuous 2D emotional space
// export const MOODS: Mood[] = [
//   // High Energy, Unpleasant (top-left quadrant)
//   { id: 'furieux', label: 'Furieux', color: '#7F1D1D', valence: -1.0, energy: 1.0 },
//   { id: 'irrite', label: 'Irrité(e)', color: '#991B1B', valence: -1.0, energy: 0.5 },
//   { id: 'stresse', label: 'Stressé(e)', color: '#B45309', valence: -0.5, energy: 1.0 },
//   { id: 'anxieux', label: 'Anxieux', color: '#B91C1C', valence: -0.5, energy: 0.5 },
//   { id: 'alerte', label: 'Alerte', color: '#92400E', valence: 0.0, energy: 1.0 },
//   { id: 'concentre', label: 'Concentré', color: '#9A3412', valence: 0.0, energy: 0.5 },
//   { id: 'enthousiaste', label: 'Enthousiaste', color: '#166534', valence: 0.5, energy: 1.0 },
//   { id: 'motive', label: 'Motivé(e)', color: '#1B5E20', valence: 0.5, energy: 0.5 },
//   { id: 'excite', label: 'Excité(e)', color: '#0F766E', valence: 1.0, energy: 1.0 },
//   { id: 'joyeux', label: 'Joyeux', color: '#15803D', valence: 1.0, energy: 0.5 },

//   // Medium Energy, Unpleasant (left side)
//   { id: 'frustre', label: 'Frustré(e)', color: '#B91C1C', valence: -1.0, energy: 0.0 },
//   { id: 'inquiet', label: 'Inquiet', color: '#DC2626', valence: -0.5, energy: 0.0 },
//   { id: 'triste', label: 'Triste', color: '#BE123C', valence: -1.0, energy: -0.5 },
//   { id: 'fatigue', label: 'Fatigué(e)', color: '#F97316', valence: -0.5, energy: -0.5 },

//   // Low Energy, Unpleasant (bottom-left quadrant)
//   { id: 'abattu', label: 'Abattu', color: '#9F1239', valence: -1.0, energy: -1.0 },
//   { id: 'decourage', label: 'Découragé(e)', color: '#EA580C', valence: -0.5, energy: -1.0 },

//   // Neutral/Center emotions
//   { id: 'calme', label: 'Calme', color: '#D97706', valence: 0.0, energy: -0.5 },
//   { id: 'pose', label: 'Posé', color: '#EAB308', valence: 0.0, energy: -1.0 },
//   { id: 'content', label: 'Content', color: '#3F6212', valence: 0.5, energy: 0.0 },
//   { id: 'inspire', label: 'Inspiré(e)', color: '#0EA5E9', valence: 1.0, energy: 0.0 },

//   // Low Energy, Pleasant (bottom-right quadrant)
//   { id: 'detendu', label: 'Détendu(e)', color: '#4D7C0F', valence: 0.5, energy: -0.5 },
//   { id: 'satisfait', label: 'Satisfait', color: '#65A30D', valence: 0.5, energy: -1.0 },
//   { id: 'serein', label: 'Serein', color: '#22C55E', valence: 1.0, energy: -0.5 },
//   { id: 'reconnaissant', label: 'Reconnaissant(e)', color: '#16A34A', valence: 1.0, energy: -1.0 },
// ];

