/**
 * SIURPROV - Simulador Urbano de Proyección Venezuela
 * Data definitions and interfaces for MapBiomas, Geotechnical & Civil Engineering simulations
 */

export type SoilProfileType = 'S1' | 'S2' | 'S3' | 'S4';

export interface SoilProfile {
  type: SoilProfileType;
  name: string;
  shearWaveVelocityVs: number; // m/s
  allowableBearingCapacityQa: number; // kg/cm²
  waterTableDepthM: number; // metros
  liquefactionPotential: 'Nulo' | 'Bajo' | 'Moderado' | 'Alto' | 'Extremo';
  coveninTStar: number; // Período característico T* (segundos)
  coveninBeta: number; // Factor de corrección β
  coveninGamma: number; // Factor de corrección γ
  description: string;
}

export interface MapBiomasClass {
  id: number;
  name: string;
  code: string;
  color: string;
  runoffCoefficient: number; // Coeficiente C método racional (0.1 a 0.95)
  soilErosionFactorK: number; // Factor USLE (0.01 a 0.5)
  description: string;
}

export interface HistoricalLandCover {
  year: number;
  forestCoverKm2: number;
  urbanCoverKm2: number;
  informalSlopeCoverKm2: number;
  waterBodiesKm2: number;
  agricultureKm2: number;
  meanRunoffCoefficient: number; // C promedio de la cuenca
  averageSlopeDeg: number;
  deforestationAccumulatedPercent: number;
  urbanImperviousRatePercent: number;
}

export type BuildingDamageStatus =
  | 'Seguro'
  | 'Fisuras Leves'
  | 'Daño Moderado'
  | 'Daño Severo'
  | 'Colapso Inminente';

export interface MapBuilding {
  id: string;
  name: string;
  typeId: string; // references BuildingTypology
  x: number; // percentage in micro map (0 - 100)
  y: number; // percentage in micro map (0 - 100)
  elevationM: number;
  slopeDeg: number;
  distanceToFaultKm: number;
  distanceToStreamM: number;
  stories: number;
  isUserPlaced?: boolean;
  yearConstructed?: number;
  soilType: SoilProfileType;
  // Computed dynamic state
  damageState?: {
    driftPercent: number;
    parkAngIndex: number;
    emsGrade: string;
    stressRatio: number;
    status: BuildingDamageStatus;
    primaryRisk: string;
    performanceLevel?: 'Operacional (O)' | 'Ocupación Inmediata (IO)' | 'Seguridad de Vida (LS)' | 'Prevención de Colapso (CP)' | 'Colapso Inminente (C)';
    pDeltaStabilityCoefficient?: number;
    residualCapacityPercent?: number;
    estimatedLossUsd?: number;
    estimatedDowntimeDays?: number;
  };
}

export interface PlanningSuggestion {
  id: string;
  level: 'Macro' | 'Micro';
  title: string;
  category: 'Zonificación' | 'Ingeniería Civil' | 'MapBiomas & Reforestación' | 'Mitigación Hidráulica';
  description: string;
  priority: 'Crítica' | 'Alta' | 'Recomendada';
  affectedArea: string;
  estimatedCostBenefit: string;
}

export interface UrbanSector {
  id: string;
  name: string;
  description: string;
  centerCoords: [number, number];
  zoomLevel: number;
  terrainType: 'Ladra Escarpada' | 'Valle Aluvial' | 'Llanura Costera' | 'Terraza Tectónica';
  detectedBuildings: MapBuilding[];
  suggestions: PlanningSuggestion[];
}

export interface VenezuelaRegion {
  id: string;
  name: string;
  state: string;
  capitalCity: string;
  lat: number;
  lng: number;
  elevationM: number;
  seismicZoneCOVENIN: number; // 1 to 7
  designAccelerationA0: number; // g (e.g. 0.30g for Caracas, 0.40g for Cariaco)
  geologicalFault: {
    name: string;
    system: string;
    type: string;
    slipRateMmYear: number;
    maxExpectedMagnitudeMw: number;
    description: string;
  };
  defaultSoilProfile: SoilProfileType;
  basinTorrencialRisk: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  slopeRiskIndex: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  description: string;
  mapBiomasTimeSeries: HistoricalLandCover[];
  urbanSectors: UrbanSector[];
  historicalEvents: {
    year: number;
    title: string;
    type: 'Sismo' | 'Aluvión / Deslave' | 'Inundación' | 'Subsidencia';
    impact: string;
    engineeringLessons: string;
  }[];
  criticalInfrastructure: {
    hospitals: number;
    civilProtectionStations: number;
    fireStations: number;
    mainEvacuationArteries: string[];
  };
}

export type StructuralCategory =
  | 'Residencial'
  | 'Comercial'
  | 'Informal en Ladera'
  | 'Educativo / Salud'
  | 'Puente / Vialidad'
  | 'Industrial';

export interface BuildingTypology {
  id: string;
  name: string;
  category: StructuralCategory;
  stories: number;
  storyHeightM: number;
  bayWidthM: number;
  baysCount: number;
  structuralSystem:
    | 'Pórticos Concreto Armado Dúctil (ND3)'
    | 'Pórticos Concreto No Dúctil (ND1)'
    | 'Mampostería Confinada'
    | 'Autoconstrucción Informal sin Vigas'
    | 'Estructura Metálica Arriostrada'
    | 'Puente Viga-Cajón Concreto Presforzado';
  ductilityReductionFactorR: number; // COVENIN R (1.5 - 6.0)
  importanceFactorI: number; // Grupo A=1.30, Grupo B1=1.15, Grupo B2=1.00
  dampingRatio: number; // Normalmente 0.05 (5%)
  concreteStrengthFpcMpa: number; // f'c (MPa)
  steelStrengthFyMpa: number; // fy (MPa)
  storyWeightKn: number; // Peso por nivel (kN)
  foundationType:
    | 'Zapatas Aisladas con Vigas de Riostra'
    | 'Losa de Fundación Maciza'
    | 'Pilotes de Gran Diámetro'
    | 'Cimiento Superficial de Bloque Hueco (Sin Confinar)';
  softStoryVulnerability: boolean; // Planta baja débil
  shortColumnRisk: boolean; // Efecto columna corta
  baseVulnerabilityScore: number; // 0 a 100
  description: string;
}

export interface MultiHazardParameters {
  // Sismo / Terremoto
  earthquake: {
    enabled: boolean;
    pgaG: number; // Aceleración máxima del terreno (0.05g - 1.20g)
    magnitudeMw: number;
    depthKm: number;
    durationSeconds: number;
    distanceToFaultKm: number;
  };
  // Aluvión / Flujo de Detritos
  debrisFlow: {
    enabled: boolean;
    rainfallAccumulation24hMm: number; // mm de lluvia
    soilSaturationPercent: number; // 0 - 100%
    debrisVelocityMs: number; // m/s
    debrisDepthM: number; // Altura de ola de lodo (m)
    densityKgM3: number; // ~1800 - 2200 kg/m³
    boulderImpactSizeM: number; // Diámetro de rocas arrastradas (m)
  };
  // Inundación / Subida de Nivel Freático
  flood: {
    enabled: boolean;
    waterLevelM: number; // m sobre nivel de calle
    flowVelocityMs: number;
    durationHours: number;
    soilSaturationIncrease: number; // %
  };
  // Viento Huracanado / Ráfagas
  wind: {
    enabled: boolean;
    speedKmh: number;
    gustFactor: number;
  };
  // Talud / Deslizamiento
  slope: {
    enabled: boolean;
    angleDeg: number;
    cohesionKpa: number;
    internalFrictionAngleDeg: number;
  };
}

export interface SimulationResult {
  timestamp: string;
  regionId: string;
  typologyId: string;
  selectedYear: number;
  
  // Parámetros dinámicos calculados
  fundamentalPeriodT1: number; // Segundos
  spectralAccelerationSa: number; // g
  designBaseShearKn: number; // V0 cortante basal
  baseShearToWeightRatio: number; // V0 / W
  maxStoryDriftPercent: number; // Deriva de entrepiso %
  coveninDriftLimitPercent: number; // Límite de norma (ej. 1.8% o 1.2%)
  exceedsDriftLimit: boolean;

  // Impactos multi-amenaza
  debrisImpactForceKn: number;
  hydrostaticThrustKn: number;
  windPressureKpa: number;
  slopeFactorOfSafety: number;
  liquefactionOccurred: boolean;

  // Métricas de daño estructural
  parkAngDamageIndex: number; // 0.0 a 1.2+
  ems98Grade:
    | 'Grado 1: Daño Leve / Fisuras Cosméticas'
    | 'Grado 2: Daño Moderado / Grietas en Muros'
    | 'Grado 3: Daño Severo / Rótulas Plásticas y Grietas en Vigas'
    | 'Grado 4: Muy Severo / Falla Parcial de Columnas'
    | 'Grado 5: Colapso Total / Inhabitable';
  structuralStressRatio: number; // Esfuerzo máximo / Capacidad admisible (0 - 2.5)
  residualCapacityPercent: number; // 100% intacta a 0% colapsada
  estimatedRepairCostPercent: number; // 0% a 120% del valor de reposición

  // Evaluaciones Avanzadas de Desempeño y Resiliencia (FEMA 356, P-Delta, Pérdidas y Geotecnia)
  performanceLevel:
    | 'Operacional (O)'
    | 'Ocupación Inmediata (IO)'
    | 'Seguridad de Vida (LS)'
    | 'Prevención de Colapso (CP)'
    | 'Colapso Inminente (C)';
  pDeltaStabilityCoefficient: number; // Coeficiente theta COVENIN 1756 Art. 8.4
  pDeltaExceeded: boolean;
  pDeltaAmplificationFactor: number; // 1 / (1 - theta)
  ductilityDemand: number; // mu_delta
  ductilityCapacity: number;
  ductilityAdequate: boolean;
  estimatedDowntimeDays: number; // Días de inoperatividad funcional
  downtimeClassification:
    | 'Inmediata (0-3 días)'
    | 'Corta (1-4 semanas)'
    | 'Media (1-6 meses)'
    | 'Prolongada (> 6 meses)'
    | 'Demolición Total';
  estimatedLossUsd: number; // Pérdida monetaria esperada en USD
  replacementCostUsd: number; // Costo total de reposición a nuevo
  lossRatioPercent: number;
  newmarkDisplacementCm: number; // Desplazamiento permanente sísmico en talud (Newmark)
  slopeCriticalAccelerationKc: number; // Aceleración crítica de fluencia del talud kc (g)
  liquefactionPotentialIndex: number; // LPI (Iwasaki: 0 a 35+)
  bearingCapacitySafetyFactor: number; // Capacidad portante admisible de la cimentación
  overturningMomentKnM: number; // Momento de volcamiento basal por aluvión/sismo
  backwaterSurgeHeightM: number; // Sobreelevación hidráulica de ola en fachada

  // Conclusiones técnicas y diagnósticos de ingeniería
  primaryFailureMechanism: string;
  identifiedVulnerabilities: string[];
  recommendedRetrofits: string[];
  safeForOccupancy: boolean;
  evacuationPriority: 'Verde (Baja)' | 'Amarillo (Media)' | 'Naranja (Alta)' | 'Rojo (Inmediata)';
}

export interface LearningLesson {
  id: string;
  title: string;
  category: 'Sismorresistencia COVENIN' | 'Geotecnia y Taludes' | 'MapBiomas e Hidrología' | 'Código TypeScript y Métodos Numéricos';
  difficulty: 'Iniciación' | 'Intermedio' | 'Avanzado';
  summary: string;
  formulaLatex: string;
  formulaExplanation: string;
  practicalApplication: string;
  interactiveVariables: {
    id: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    description: string;
  }[];
  compute: (inputs: Record<string, number>) => {
    value: number;
    formatted: string;
    status: 'Seguro' | 'Alerta' | 'Falla Estructural';
    explanation: string;
    steps: { step: string; calculation: string }[];
  };
  codeSnippet: string;
  codeExplanation: string;
}
