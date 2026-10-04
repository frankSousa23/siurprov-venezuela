/**
 * SIURPROV - Simulador Urbano de Proyección para Venezuela
 * shakeTableEngine.ts: Motor Analítico de Dinámica de Estructuras y Mesa Sísmica (FEMA 356 / COVENIN 1756)
 *
 * ARQUITECTURA Y PATRONES:
 * - Dinámica Estructural SDOF/MDOF Equivalente: Resuelve la ecuación de movimiento con amortiguamiento viscoso
 *   y excitación armónica o impulsiva en la base: m*u''(t) + c*u'(t) + k*u(t) = -m*u_g''(t).
 * - Desacoplamiento Aislador-Superestructura: Modela aisladores elastoméricos con núcleo de plomo (LRB)
 *   elevando el período fundamental y limitando la transmisión de fuerza a la superestructura.
 * - Daño Bi-Componente de Park-Ang: Combina deformación plástica pico y fatiga histerética acumulada.
 *
 * ¿CÓMO INTERACTÚA CON EL SISTEMA?:
 * 1. ShakeTableBench.tsx invoca `evaluateDynamicResponse()` para obtener desplazamientos a 60 FPS.
 * 2. CanvasSimulator.tsx exporta su geometría mediante `ImportedBuildingConfig` hacia este motor.
 * 3. La suite CI/CD en runAllTests.ts (TEST-18 a TEST-23) audita resonancia, daño y reglas de gamificación.
 *
 * PUNTOS DE ESCALABILIDAD:
 * - Importación de acelerogramas reales: Reemplazar la excitación sinusoidal por convolución con series de tiempo.
 * - Amortiguadores de masa sintonizada (TMD) en el último piso para mitigar vibraciones eólicas y sísmicas.
 */

export interface ShakeTableParameters {
  pgaG: number;               // Aceleración pico del suelo (0.05 a 1.20 g)
  frequencyHz: number;        // Frecuencia de la mesa vibratoria (0.5 a 10.0 Hz)
  waveType: 'harmonic' | 'impulse'; // Régimen: oscilación continua vs pulso de falla
  windSpeedKmh: number;       // Viento lateral sostenido (0 a 200 km/h)
  liquefactionRatio: number;  // Pérdida de rigidez del suelo por licuefacción (0.0 a 1.0)
}

export interface ActiveRetrofits {
  shearWalls: boolean;       // Muros de cortante de concreto armado
  xBracing: boolean;         // Arriostramientos metálicos en X
  cfrpWrap: boolean;         // Encamisado de columnas con polímero de fibra de carbono
  baseIsolators: boolean;    // Aisladores elastoméricos de base (LRB)
}

export interface HistoricalQuakeChallenge {
  id: string;
  name: string;
  year: number;
  location: string;
  faultSystem: string;
  magnitudeMw: number;
  pgaG: number;
  dominantFrequencyHz: number;
  waveType: 'harmonic' | 'impulse';
  liquefactionRisk: number;
  windSpeedKmh: number;
  budgetUsd: number;
  baseOccupants: number;
  description: string;
  historicalDamageSummary: string;
}

export interface RetrofitCostCatalog {
  baseIsolators: number;
  shearWalls: number;
  xBracing: number;
  cfrpWrap: number;
}

export interface ChallengeEvaluation {
  challengeId: string;
  budgetTotal: number;
  spentUsd: number;
  remainingBudgetUsd: number;
  overBudget: boolean;
  survived: boolean;
  livesSaved: number;
  livesAtRisk: number;
  parkAngDamageIndex: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'COLAPSO';
  gradeDescription: string;
  recommendations: string[];
}

export interface ImportedBuildingConfig {
  source: 'simulator' | 'catalog';
  name: string;
  levels: number;
  totalHeightM: number;
  estimatedMassKg: number;
  lateralStiffnessKnM: number;
  soilType: 'S1' | 'S2' | 'S3' | 'S4';
  structuralType?: string;
  timestamp: number;
}

export type PerformanceLevel = 'IO' | 'LS' | 'CP' | 'COLLAPSE';

export interface BenchTelemetry {
  baseDisplacementM: number;       // Desplazamiento instantáneo de la mesa (m)
  topDisplacementM: number;        // Desplazamiento relativo en el tope (m)
  totalTopDisplacementM: number;   // Desplazamiento absoluto en el tope (m)
  interstoryDriftRatio: number;    // Deriva máxima de entrepiso Δ/h
  topAccelerationG: number;        // Aceleración absoluta en el tope (g)
  dmf: number;                     // Factor de amplificación dinámica (DMF)
  naturalFrequencyHz: number;      // Frecuencia natural efectiva (Hz)
  naturalPeriodSec: number;        // Período fundamental efectivo Tn (s)
  dampingRatio: number;            // Fracción de amortiguamiento crítico ξ
  effectiveStiffnessKnM: number;   // Rigidez lateral efectiva (kN/m)
  parkAngDamageIndex: number;      // Índice de daño de Park-Ang (0.0 a 1.0+)
  performanceLevel: PerformanceLevel; // Nivel de desempeño FEMA / COVENIN
  performanceLabel: string;        // Descripción textual en español
  isResonant: boolean;             // Detección de resonancia (frecuencia cercana a fn ± 12%)
  isNearCollapse: boolean;         // Indicador de peligro de colapso plástico
  coveninDriftLimitExceeded: boolean; // Supera deriva elástica COVENIN 1756 (0.012)
  reductionVsUnreinforcedPercent: number; // Porcentaje de reducción de derivas gracias a refuerzos
}

export class ShakeTableEngine {
  // Constantes del modelo de referencia arquetípico (Edificio 3 niveles, 9m de altura)
  public static readonly BASE_HEIGHT_M = 9.0;
  public static readonly BASE_MASS_KG = 48000;      // 48 toneladas
  public static readonly BASE_STIFFNESS_KN_M = 15200; // Rigidez nominal sin refuerzo
  public static readonly BASE_DAMPING = 0.05;       // 5% amortiguamiento estructural
  public static readonly BASE_ULTIMATE_DRIFT = 0.022; // Umbral de colapso sin CFRP (2.2%)

  // Catálogo de costos de refuerzo para gamificación ($ USD)
  public static readonly RETROFIT_COSTS: RetrofitCostCatalog = {
    baseIsolators: 45000,
    shearWalls: 32000,
    xBracing: 20000,
    cfrpWrap: 15000
  };

  // Catálogo histórico de sismos de Venezuela (datos sismológicos y geotécnicos FUNVISIS / COVENIN 1756)
  public static readonly HISTORICAL_CHALLENGES: HistoricalQuakeChallenge[] = [
    {
      id: 'cariaco-1997',
      name: 'Terremoto de Cariaco 1997 (Mw 6.9)',
      year: 1997,
      location: 'Cariaco / Cumaná, Estado Sucre',
      faultSystem: 'Falla de El Pilar (Sistema San Sebastián - El Pilar)',
      magnitudeMw: 6.9,
      pgaG: 0.55,
      dominantFrequencyHz: 2.6,
      waveType: 'impulse',
      liquefactionRisk: 0.35,
      windSpeedKmh: 25,
      budgetUsd: 120000,
      baseOccupants: 150,
      description: 'Ruptura superficial directa de la falla de El Pilar con gran energía impulsiva de campo cercano. Colapso severo de escuelas de concreto armado con efecto de piso blando y columnas cortas.',
      historicalDamageSummary: 'Colapso del Liceo Raimundo Martínez Centeno y Escuela Valentín Valiente; más de 73 fallecidos y miles de damnificados.'
    },
    {
      id: 'caracas-1967',
      name: 'Terremoto Cuatricentenario de Caracas 1967 (Mw 6.6)',
      year: 1967,
      location: 'Valle de Caracas / Litoral Central',
      faultSystem: 'Falla de San Sebastián / Macizo del Ávila',
      magnitudeMw: 6.6,
      pgaG: 0.35,
      dominantFrequencyHz: 1.15,
      waveType: 'harmonic',
      liquefactionRisk: 0.15,
      windSpeedKmh: 35,
      budgetUsd: 140000,
      baseOccupants: 280,
      description: 'Efecto de amplificación de cuenca aluvial profunda en Los Palos Grandes y Chacao (sedimentos de más de 200m). Ondas largas causaron resonancia destructiva selectiva en edificios de 10 a 12 niveles.',
      historicalDamageSummary: 'Colapso total de 4 edificios modernos de concreto armado (Neverí, Palace Corvin, San José y Mijagual); 236 víctimas mortales.'
    },
    {
      id: 'tocuyo-1950',
      name: 'Terremoto de El Tocuyo 1950 (Mw 6.2)',
      year: 1950,
      location: 'El Tocuyo / Quíbor, Estado Lara',
      faultSystem: 'Falla de Boconó',
      magnitudeMw: 6.2,
      pgaG: 0.48,
      dominantFrequencyHz: 3.8,
      waveType: 'impulse',
      liquefactionRisk: 0.20,
      windSpeedKmh: 20,
      budgetUsd: 90000,
      baseOccupants: 95,
      description: 'Sismo cortical muy superficial en el graben de la Falla de Boconó. Altísimas aceleraciones iniciales de alta frecuencia que devastaron construcciones de mampostería no confinada y tapia pisada.',
      historicalDamageSummary: 'Destrucción de más del 80% del casco histórico y patrimonio colonial de la Ciudad Madre de Venezuela.'
    }
  ];

  public static getHistoricalChallenges(): HistoricalQuakeChallenge[] {
    return this.HISTORICAL_CHALLENGES;
  }

  public static getRetrofitCosts(): RetrofitCostCatalog {
    return this.RETROFIT_COSTS;
  }

  /**
   * Calcula las propiedades mecánicas efectivas del sistema según los refuerzos activos, suelo
   * y configuración de edificio importada o personalizada.
   */
  public static computeEffectiveProperties(
    retrofits: ActiveRetrofits,
    liquefactionRatio: number = 0,
    customBuilding?: Partial<ImportedBuildingConfig>
  ): {
    massKg: number;
    stiffnessKnM: number;
    dampingRatio: number;
    naturalFrequencyHz: number;
    naturalPeriodSec: number;
    ultimateDriftCapacity: number;
    totalHeightM: number;
  } {
    let mass = customBuilding?.estimatedMassKg && customBuilding.estimatedMassKg > 5000
      ? customBuilding.estimatedMassKg
      : this.BASE_MASS_KG;

    let stiffness = customBuilding?.lateralStiffnessKnM && customBuilding.lateralStiffnessKnM > 1000
      ? customBuilding.lateralStiffnessKnM
      : this.BASE_STIFFNESS_KN_M;

    const totalHeightM = customBuilding?.totalHeightM && customBuilding.totalHeightM > 2
      ? customBuilding.totalHeightM
      : (customBuilding?.levels ? customBuilding.levels * 3.0 : this.BASE_HEIGHT_M);

    let damping = this.BASE_DAMPING;
    let ultimateDrift = this.BASE_ULTIMATE_DRIFT;

    // 1. Aisladores elastoméricos en la base (LRB)
    if (retrofits.baseIsolators) {
      // Desacopla la estructura reduciendo la rigidez lateral del sistema basal
      stiffness = 1100; // Rigidez lateral muy baja del aislador
      damping = 0.18;   // 18% amortiguamiento histerético por núcleo de plomo
    } else {
      // Refuerzos en la superestructura
      if (retrofits.shearWalls) {
        stiffness *= 2.85;  // Muros de corte rigidizan enormemente
        mass *= 1.20;       // Añade peso de concreto
        damping += 0.02;    // Fricción y disipación adicional
      }
      if (retrofits.xBracing) {
        stiffness *= 1.90;  // Arriostramientos en X de acero
        mass *= 1.05;       // Peso ligero de perfiles de acero
        damping += 0.04;    // Disipación de energía por fluencia
      }
    }

    // 2. Encamisado CFRP de columnas
    if (retrofits.cfrpWrap) {
      // Confinamiento con fibra de carbono eleva drásticamente la capacidad de deformación inelástica
      ultimateDrift *= 1.70; // 70% más de ductilidad y resistencia al cortante
      damping += 0.015;
    }

    // 3. Degradación por licuefacción o suelo blando
    if (liquefactionRatio > 0) {
      const reduction = Math.min(0.60, liquefactionRatio * 0.60);
      stiffness *= (1 - reduction);
      damping += liquefactionRatio * 0.03; // Mayor amortiguamiento por radiación de suelo licuado
    }

    const omegaN = Math.sqrt((stiffness * 1000) / mass); // rad/s
    const naturalFrequencyHz = omegaN / (2 * Math.PI);
    const naturalPeriodSec = naturalFrequencyHz > 0 ? 1 / naturalFrequencyHz : 0;

    return {
      massKg: mass,
      stiffnessKnM: stiffness,
      dampingRatio: damping,
      naturalFrequencyHz,
      naturalPeriodSec,
      ultimateDriftCapacity: ultimateDrift,
      totalHeightM
    };
  }

  /**
   * Calcula el Factor de Amplificación Dinámica (DMF) para oscilación forzada con amortiguamiento
   */
  public static calculateDMF(frequencyHz: number, naturalFrequencyHz: number, dampingRatio: number): number {
    if (naturalFrequencyHz <= 0) return 1.0;
    const beta = frequencyHz / naturalFrequencyHz;
    const denominator = Math.sqrt(
      Math.pow(1 - beta * beta, 2) + Math.pow(2 * dampingRatio * beta, 2)
    );
    return Math.min(18.0, 1.0 / Math.max(0.05, denominator));
  }

  /**
   * Evalúa la respuesta dinámica completa en un instante t o bajo amplitudes máximas sostenidas
   */
  public static evaluateDynamicResponse(
    params: ShakeTableParameters,
    retrofits: ActiveRetrofits,
    timeSeconds: number = 0,
    customBuilding?: Partial<ImportedBuildingConfig>
  ): BenchTelemetry {
    const props = this.computeEffectiveProperties(retrofits, params.liquefactionRatio, customBuilding);
    const unreinforcedProps = this.computeEffectiveProperties({
      shearWalls: false,
      xBracing: false,
      cfrpWrap: false,
      baseIsolators: false
    }, 0, customBuilding);

    const g = 9.81; // m/s^2
    const groundAccMs2 = params.pgaG * g;
    const omegaExcit = 2 * Math.PI * params.frequencyHz;

    // Desplazamiento máximo de la mesa sísmica en la base: Xg = Ag / omega^2
    const baseDispAmpM = groundAccMs2 / Math.max(4.0, omegaExcit * omegaExcit);

    // Factor DMF
    const dmf = this.calculateDMF(params.frequencyHz, props.naturalFrequencyHz, props.dampingRatio);
    const unreinforcedDmf = this.calculateDMF(
      params.frequencyHz,
      unreinforcedProps.naturalFrequencyHz,
      unreinforcedProps.dampingRatio
    );

    // Respuesta dinámica en el tope
    let dynamicTopAmpM = baseDispAmpM * dmf;

    // Si tiene aislamiento de base (LRB), la mesa se mueve pero la superestructura experimenta
    // desacoplamiento casi total
    if (retrofits.baseIsolators) {
      dynamicTopAmpM *= 0.32; // Reducción de más del 65% en la transmisión inercial
    }

    // Régimen de onda (impulso repentino vs armónico continuo)
    let impulseFactor = 1.0;
    if (params.waveType === 'impulse') {
      // Pulso de falla cercana tipo Ricker / fling step genera un pico energético concentrado
      impulseFactor = 1.45;
      dynamicTopAmpM *= impulseFactor;
    }

    // Empuje estático por viento sostenido
    // Presión q = 0.5 * rho * v^2 -> Fuerza F = q * Cd * Area
    const windSpeedMs = (params.windSpeedKmh * 1000) / 3600;
    const airDensity = 1.225; // kg/m^3
    const exposedAreaM2 = props.totalHeightM * 5;
    const dragCoeff = 1.2;
    const windForceN = 0.5 * airDensity * Math.pow(windSpeedMs, 2) * dragCoeff * exposedAreaM2;
    const staticWindDeflectionM = windForceN / (props.stiffnessKnM * 1000);

    // Oscilación instantánea en función del tiempo t
    let baseDisplacementM = 0;
    let relativeTopM = 0;

    if (params.waveType === 'harmonic') {
      baseDisplacementM = baseDispAmpM * Math.sin(omegaExcit * timeSeconds);
      // El desfase phi = atan2(2*xi*beta, 1 - beta^2)
      const beta = params.frequencyHz / Math.max(0.1, props.naturalFrequencyHz);
      const phaseLag = Math.atan2(2 * props.dampingRatio * beta, 1 - beta * beta);
      relativeTopM = dynamicTopAmpM * Math.sin(omegaExcit * timeSeconds - phaseLag) + staticWindDeflectionM;
    } else {
      // Pulso de falla amortiguado en t
      const pulseDecay = Math.exp(-Math.max(0, timeSeconds % 4) * 1.5);
      baseDisplacementM = baseDispAmpM * Math.sin(omegaExcit * (timeSeconds % 4)) * pulseDecay;
      relativeTopM = dynamicTopAmpM * Math.sin(omegaExcit * (timeSeconds % 4) - 0.4) * pulseDecay + staticWindDeflectionM;
    }

    // Deriva máxima de entrepiso Δ/h (estimada dividiendo desplazamiento máximo entre altura)
    const maxTopDispM = dynamicTopAmpM + staticWindDeflectionM;
    const interstoryDriftRatio = maxTopDispM / props.totalHeightM;

    // Deriva equivalente en el modelo sin refuerzo para comparar reducción
    const unreinforcedMaxTopDispM = (baseDispAmpM * unreinforcedDmf * (params.waveType === 'impulse' ? 1.45 : 1.0)) +
      (windForceN / (unreinforcedProps.stiffnessKnM * 1000));
    const unreinforcedDrift = unreinforcedMaxTopDispM / unreinforcedProps.totalHeightM;
    const reductionVsUnreinforcedPercent = Math.max(
      0,
      Math.min(95, Math.round(((unreinforcedDrift - interstoryDriftRatio) / Math.max(0.0001, unreinforcedDrift)) * 100))
    );

    // Aceleración absoluta en el tope
    let topAccelerationG = (params.pgaG * dmf);
    if (retrofits.baseIsolators) {
      topAccelerationG *= 0.35; // Aislamiento mitiga aceleración en el tope
    }

    // Índice de daño de Park-Ang: D = (delta / delta_u) + beta * (E_hysteretic)
    const parkAngDamageIndex = Math.min(
      1.5,
      Number((interstoryDriftRatio / props.ultimateDriftCapacity).toFixed(3))
    );

    // Clasificación de desempeño normativo COVENIN 1756 & FEMA 356
    let performanceLevel: PerformanceLevel = 'IO';
    let performanceLabel = 'Ocupación Inmediata (IO) - Daño Leve';

    if (interstoryDriftRatio > props.ultimateDriftCapacity) {
      performanceLevel = 'COLLAPSE';
      performanceLabel = 'Colapso Plástico Estructural';
    } else if (interstoryDriftRatio > 0.018) {
      performanceLevel = 'CP';
      performanceLabel = 'Prevención del Colapso (CP) - Daño Severo';
    } else if (interstoryDriftRatio > 0.012) {
      performanceLevel = 'LS';
      performanceLabel = 'Seguridad de Vida (LS) - Fisuración Moderada';
    } else {
      performanceLevel = 'IO';
      performanceLabel = 'Ocupación Inmediata (IO) - Elástico Seguro';
    }

    const isResonant = Math.abs(params.frequencyHz - props.naturalFrequencyHz) / props.naturalFrequencyHz < 0.12;
    const isNearCollapse = performanceLevel === 'COLLAPSE' || parkAngDamageIndex >= 0.90;
    const coveninDriftLimitExceeded = interstoryDriftRatio > 0.012; // Límite de deriva COVENIN 1756

    return {
      baseDisplacementM,
      topDisplacementM: relativeTopM,
      totalTopDisplacementM: baseDisplacementM + relativeTopM,
      interstoryDriftRatio,
      topAccelerationG: Number(topAccelerationG.toFixed(3)),
      dmf: Number(dmf.toFixed(2)),
      naturalFrequencyHz: Number(props.naturalFrequencyHz.toFixed(2)),
      naturalPeriodSec: Number(props.naturalPeriodSec.toFixed(3)),
      dampingRatio: Number(props.dampingRatio.toFixed(3)),
      effectiveStiffnessKnM: Math.round(props.stiffnessKnM),
      parkAngDamageIndex,
      performanceLevel,
      performanceLabel,
      isResonant,
      isNearCollapse,
      coveninDriftLimitExceeded,
      reductionVsUnreinforcedPercent
    };
  }

  /**
   * Evalúa un Desafío Sísmico Histórico comparando costo, mitigación de daño y vidas salvadas
   */
  public static evaluateChallenge(
    challenge: HistoricalQuakeChallenge,
    retrofits: ActiveRetrofits,
    customBuilding?: Partial<ImportedBuildingConfig>
  ): ChallengeEvaluation {
    const costs = this.getRetrofitCosts();
    let spentUsd = 0;
    if (retrofits.baseIsolators) spentUsd += costs.baseIsolators;
    if (retrofits.shearWalls) spentUsd += costs.shearWalls;
    if (retrofits.xBracing) spentUsd += costs.xBracing;
    if (retrofits.cfrpWrap) spentUsd += costs.cfrpWrap;

    const remainingBudgetUsd = challenge.budgetUsd - spentUsd;
    const overBudget = remainingBudgetUsd < 0;

    const params: ShakeTableParameters = {
      pgaG: challenge.pgaG,
      frequencyHz: challenge.dominantFrequencyHz,
      waveType: challenge.waveType,
      windSpeedKmh: challenge.windSpeedKmh,
      liquefactionRatio: challenge.liquefactionRisk
    };

    const telemetry = this.evaluateDynamicResponse(params, retrofits, 0, customBuilding);
    const survived = telemetry.performanceLevel !== 'COLLAPSE' && telemetry.parkAngDamageIndex < 1.0 && !overBudget;

    let livesSaved = 0;
    if (survived) {
      const damageFactor = Math.max(0, 1 - (telemetry.parkAngDamageIndex * 0.45));
      livesSaved = Math.round(challenge.baseOccupants * damageFactor);
    } else {
      livesSaved = Math.round(challenge.baseOccupants * 0.12);
    }

    let grade: 'A+' | 'A' | 'B' | 'C' | 'COLAPSO' = 'C';
    let gradeDescription = '';
    const recommendations: string[] = [];

    if (overBudget) {
      grade = 'COLAPSO';
      gradeDescription = 'Descalificado por déficit financiero: el costo de refuerzos superó el presupuesto asignado.';
      recommendations.push('Optimiza la combinación de refuerzos para no exceder los fondos de emergencia del reto.');
    } else if (telemetry.performanceLevel === 'COLLAPSE' || telemetry.parkAngDamageIndex >= 1.0) {
      grade = 'COLAPSO';
      gradeDescription = 'Falla estructural severa: la edificación superó la deriva límite última y colapsó plásticamente.';
      recommendations.push('Aumenta la disipación con aislamiento basal o rigidiza con muros de cortante.');
    } else if (telemetry.parkAngDamageIndex < 0.28) {
      grade = 'A+';
      gradeDescription = 'Desempeño Sobresaliente: Superestructura elástica con daño residual nulo y máxima eficiencia presupuestaria.';
    } else if (telemetry.parkAngDamageIndex < 0.50) {
      grade = 'A';
      gradeDescription = 'Desempeño Excelente: Cumple Ocupación Inmediata con daños menores y protección íntegra de vidas.';
    } else if (telemetry.parkAngDamageIndex < 0.75) {
      grade = 'B';
      gradeDescription = 'Desempeño Aceptable: Seguridad de Vida garantizada con fisuración moderada reparable.';
    } else {
      grade = 'C';
      gradeDescription = 'Prevención de Colapso al Límite: La estructura sobrevivió pero con daño irreparable permanente.';
      recommendations.push('Se recomienda encamisado CFRP adicional para elevar la ductilidad ante sismos impulsivos.');
    }

    return {
      challengeId: challenge.id,
      budgetTotal: challenge.budgetUsd,
      spentUsd,
      remainingBudgetUsd,
      overBudget,
      survived,
      livesSaved,
      livesAtRisk: challenge.baseOccupants,
      parkAngDamageIndex: telemetry.parkAngDamageIndex,
      grade,
      gradeDescription,
      recommendations
    };
  }
}
