/**
 * Lógica visual pura compartida por los visores (2D/3D) y las pruebas.
 * Sin dependencias de React/Three para poder verificarse en Node.
 */

export type DamageBand = 'elastico' | 'microfisuras' | 'rotula' | 'falla';

export const damageBand = (parkAngIndex: number): DamageBand => {
  if (parkAngIndex >= 0.8) return 'falla';
  if (parkAngIndex >= 0.45) return 'rotula';
  if (parkAngIndex >= 0.2) return 'microfisuras';
  return 'elastico';
};

const BAND_COLORS: Record<DamageBand, string> = {
  elastico: '#3b82f6',
  microfisuras: '#eab308',
  rotula: '#f97316',
  falla: '#ef4444'
};

/** Color del gradiente de esfuerzos según el índice de daño Park-Ang. */
export const stressColor = (parkAngIndex: number): string => BAND_COLORS[damageBand(parkAngIndex)];

/** Color del estrato superficial según el perfil de suelo COVENIN. */
export const soilColor = (type: string): string =>
  type === 'S4' ? '#44403c' : type === 'S3' ? '#78350f' : type === 'S2' ? '#78716c' : '#64748b';

/** Geometría 3D derivada de la tipología (unidades en metros). */
export const buildingGeometry = (stories: number, storyHeightM: number, baysCount: number, bayWidthM: number) => {
  const n = Math.max(1, stories);
  const storyH = Math.max(2.4, storyHeightM || 3);
  const bays = Math.max(1, baysCount);
  const bayW = Math.max(2.5, bayWidthM || 4);
  return { stories: n, storyH, bays, bayW, width: bays * bayW, depth: 2 * bayW, totalH: n * storyH };
};
