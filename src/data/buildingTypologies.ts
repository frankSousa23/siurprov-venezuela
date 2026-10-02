import { BuildingTypology } from '../types';

export const BUILDING_TYPOLOGIES: BuildingTypology[] = [
  {
    id: 'autoconstruccion-ladera',
    name: 'Autoconstrucción Informal en Ladera',
    category: 'Informal en Ladera',
    stories: 4,
    storyHeightM: 2.7,
    bayWidthM: 3.5,
    baysCount: 3,
    structuralSystem: 'Autoconstrucción Informal sin Vigas',
    ductilityReductionFactorR: 1.5, // Nula ductilidad, comportamiento frágil
    importanceFactorI: 1.0, // Vivienda regular
    dampingRatio: 0.05,
    concreteStrengthFpcMpa: 15.0, // Mezclas de obra pobres (~150 kg/cm²)
    steelStrengthFyMpa: 280.0, // Acero liso o corrugado no certificado
    storyWeightKn: 180, // kN por piso
    foundationType: 'Cimiento Superficial de Bloque Hueco (Sin Confinar)',
    softStoryVulnerability: true,
    shortColumnRisk: true,
    baseVulnerabilityScore: 92,
    description:
      'Vivienda espontánea típica de las laderas venezolanas (Petare, Macarao, Vargas, cerros de Barquisimeto). Cimientos precarios sobre terreno no nivelado o rellenos inestables, ausencia de vigas de riostra, bloques de arcilla hueca portantes sin amarre y columnas subdimensionadas de 15x15 cm.'
  },
  {
    id: 'porticos-nd3-sismo',
    name: 'Pórticos Concreto Armado Dúctil (COVENIN 1756 ND3)',
    category: 'Residencial',
    stories: 8,
    storyHeightM: 3.0,
    bayWidthM: 5.5,
    baysCount: 4,
    structuralSystem: 'Pórticos Concreto Armado Dúctil (ND3)',
    ductilityReductionFactorR: 6.0, // Nivel de Diseño 3 (alta ductilidad)
    importanceFactorI: 1.0,
    dampingRatio: 0.05,
    concreteStrengthFpcMpa: 28.0, // f'c = 280 kg/cm²
    steelStrengthFyMpa: 420.0, // fy = 4200 kg/cm² (S-60)
    storyWeightKn: 520,
    foundationType: 'Zapatas Aisladas con Vigas de Riostra',
    softStoryVulnerability: false,
    shortColumnRisk: false,
    baseVulnerabilityScore: 24,
    description:
      'Estructura de concreto armado proyectada bajo los lineamientos sismorresistentes venezolanos modernos (COVENIN 1756 / 1753). Columnas con estribos densificados en zonas de confinamiento ($d/4$), criterio de columna fuerte - viga débil y nudos confinados.'
  },
  {
    id: 'porticos-pre1982-nd1',
    name: 'Edificio Antiguo Pórticos No Dúctiles (Pre-Norma 1982)',
    category: 'Residencial',
    stories: 10,
    storyHeightM: 3.1,
    bayWidthM: 5.0,
    baysCount: 4,
    structuralSystem: 'Pórticos Concreto No Dúctil (ND1)',
    ductilityReductionFactorR: 2.5,
    importanceFactorI: 1.0,
    dampingRatio: 0.04,
    concreteStrengthFpcMpa: 21.0, // f'c = 210 kg/cm²
    steelStrengthFyMpa: 280.0,
    storyWeightKn: 580,
    foundationType: 'Losa de Fundación Maciza',
    softStoryVulnerability: true, // Planta baja libre para estacionamiento o comercio
    shortColumnRisk: true,
    baseVulnerabilityScore: 78,
    description:
      'Edificaciones construidas en las décadas de 1950 a 1970 (típicas en Los Palos Grandes, Chacao, San Bernardino, Maracaibo). Estribos espaciados a 20-30 cm, ganchos a 90 grados en vez de 135°, planta baja libre para garajes (piso blando) y alta vulnerabilidad a falla frágil por corte.'
  },
  {
    id: 'mamposteria-confinada',
    name: 'Mampostería Confinada Normativa',
    category: 'Residencial',
    stories: 2,
    storyHeightM: 2.8,
    bayWidthM: 4.0,
    baysCount: 3,
    structuralSystem: 'Mampostería Confinada',
    ductilityReductionFactorR: 3.0,
    importanceFactorI: 1.0,
    dampingRatio: 0.05,
    concreteStrengthFpcMpa: 21.0,
    steelStrengthFyMpa: 420.0,
    storyWeightKn: 240,
    foundationType: 'Zapatas Aisladas con Vigas de Riostra',
    softStoryVulnerability: false,
    shortColumnRisk: false,
    baseVulnerabilityScore: 38,
    description:
      'Vivienda de 1 o 2 niveles con muros de bloques macizos o perforados confinados perimetralmente con machones de concreto y vigas de corona. Excelente desempeño ante vientos y sismos moderados si se mantiene simetría de muros.'
  },
  {
    id: 'hospital-infraestructura',
    name: 'Hospital Tipo IV / Escuela Esencial (Grupo A)',
    category: 'Educativo / Salud',
    stories: 6,
    storyHeightM: 3.6,
    bayWidthM: 6.0,
    baysCount: 5,
    structuralSystem: 'Pórticos Concreto Armado Dúctil (ND3)',
    ductilityReductionFactorR: 5.0,
    importanceFactorI: 1.3, // Factor de Importancia Grupo A (+30% de fuerza sísmica de diseño)
    dampingRatio: 0.05,
    concreteStrengthFpcMpa: 35.0,
    steelStrengthFyMpa: 420.0,
    storyWeightKn: 780,
    foundationType: 'Pilotes de Gran Diámetro',
    softStoryVulnerability: false,
    shortColumnRisk: false,
    baseVulnerabilityScore: 18,
    description:
      'Edificación de vital importancia que debe permanecer operativa durante y después de desastres catastróficos. Diseñada con coeficientes de seguridad reforzados, sobredimensionamiento de elementos y control estricto de derivas de entrepiso.'
  },
  {
    id: 'puente-vial',
    name: 'Puente Vial Viga-Cajón (Acceso Estratégico)',
    category: 'Puente / Vialidad',
    stories: 1,
    storyHeightM: 12.0, // Altura de pilas sobre el cauce
    bayWidthM: 28.0, // Luz del vano
    baysCount: 3,
    structuralSystem: 'Puente Viga-Cajón Concreto Presforzado',
    ductilityReductionFactorR: 3.0,
    importanceFactorI: 1.3,
    dampingRatio: 0.03,
    concreteStrengthFpcMpa: 40.0,
    steelStrengthFyMpa: 1860.0, // Torones de pretensado
    storyWeightKn: 2400,
    foundationType: 'Pilotes de Gran Diámetro',
    softStoryVulnerability: false,
    shortColumnRisk: false,
    baseVulnerabilityScore: 35,
    description:
      'Pilas de concreto armado y superestructura presforzada cruzando cauces torrenciales o fallas geológicas. Vulnerable al socavamiento hidráulico de pilas, empuje de troncos durante aluviones y aceleraciones sísmicas longitudinales.'
  }
];
