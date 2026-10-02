import { SoilProfile, SoilProfileType } from '../types';

export const SOIL_PROFILES: Record<SoilProfileType, SoilProfile> = {
  S1: {
    type: 'S1',
    name: 'S1: Roca o Suelo Muy Duro',
    shearWaveVelocityVs: 800, // Vs > 500 m/s
    allowableBearingCapacityQa: 5.0, // kg/cm²
    waterTableDepthM: 15.0,
    liquefactionPotential: 'Nulo',
    coveninTStar: 0.40,
    coveninBeta: 2.4,
    coveninGamma: 1.0,
    description:
      'Macizo rocoso ígneo/metamórfico o depósitos de grava densa cementada. Muy baja amplificación de ondas sísmicas superficiales. Común en estribaciones del Waraira Repano (Ávila) y el Escudo Guayanés.'
  },
  S2: {
    type: 'S2',
    name: 'S2: Suelo Firme o Compacto',
    shearWaveVelocityVs: 420, // 250 - 500 m/s
    allowableBearingCapacityQa: 2.8, // kg/cm²
    waterTableDepthM: 7.5,
    liquefactionPotential: 'Bajo',
    coveninTStar: 0.70,
    coveninBeta: 2.6,
    coveninGamma: 1.0,
    description:
      'Suelo cohesivo firme o arenas densas con espesores moderados. Respuesta sísmica intermedia. Típico de las terrazas intermedias de Caracas, San Antonio de Los Altos y zonas altas de Barquisimeto.'
  },
  S3: {
    type: 'S3',
    name: 'S3: Suelo Blando o Aluvial Moderado',
    shearWaveVelocityVs: 210, // 150 - 250 m/s
    allowableBearingCapacityQa: 1.4, // kg/cm²
    waterTableDepthM: 3.2,
    liquefactionPotential: 'Moderado',
    coveninTStar: 1.00,
    coveninBeta: 2.8,
    coveninGamma: 0.9,
    description:
      'Depósitos de aluvión reciente, limos y arenas con matriz húmeda. Período de vibración del suelo prolongado, capaz de entrar en resonancia con edificios de mediana y gran altura (ej. Los Palos Grandes en Caracas, valles de Mérida).'
  },
  S4: {
    type: 'S4',
    name: 'S4: Suelo Muy Blando / Saturado / Cenagoso',
    shearWaveVelocityVs: 120, // Vs < 150 m/s
    allowableBearingCapacityQa: 0.8, // kg/cm²
    waterTableDepthM: 1.0,
    liquefactionPotential: 'Extremo',
    coveninTStar: 1.40,
    coveninBeta: 3.0,
    coveninGamma: 0.8,
    description:
      'Arcillas blandas saturadas, turbas, lodos lagunares o rellenos no compactados. Altísima amplificación de sismos de baja frecuencia y grave susceptibilidad a la licuefacción del suelo. Característico de las costas del Lago de Maracaibo, Cariaco y zonas de aluvión costero de Vargas.'
  }
};
