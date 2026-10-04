/**
 * SIURPROV - Simulador Urbano de Proyección para Venezuela
 * shakeTableEngine.ts: Motor analítico de dinámica de estructuras para el Banco de Pruebas
 *
 * Implementa ecuaciones de movimiento para osciladores acoplados bajo excitación en la base,
 * amplificación armónica (DMF), directividad de pulsos de falla y modificación por refuerzos
 * estructurales según COVENIN 1756 y FEMA 356.
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

  /**
   * Calcula las propiedades mecánicas efectivas del sistema según los refuerzos activos y suelo
   */
  public static computeEffectiveProperties(
    retrofits: ActiveRetrofits,
    liquefactionRatio: number = 0
  ): {
    massKg: number;
    stiffnessKnM: number;
    dampingRatio: number;
    naturalFrequencyHz: number;
    naturalPeriodSec: number;
    ultimateDriftCapacity: number;
  } {
    let mass = this.BASE_MASS_KG;
    let stiffness = this.BASE_STIFFNESS_KN_M;
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
      ultimateDriftCapacity: ultimateDrift
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
    timeSeconds: number = 0
  ): BenchTelemetry {
    const props = this.computeEffectiveProperties(retrofits, params.liquefactionRatio);
    const unreinforcedProps = this.computeEffectiveProperties({
      shearWalls: false,
      xBracing: false,
      cfrpWrap: false,
      baseIsolators: false
    }, 0);

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
    const exposedAreaM2 = 45; // 9m x 5m
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
    const interstoryDriftRatio = maxTopDispM / this.BASE_HEIGHT_M;

    // Deriva equivalente en el modelo sin refuerzo para comparar reducción
    const unreinforcedMaxTopDispM = (baseDispAmpM * unreinforcedDmf * (params.waveType === 'impulse' ? 1.45 : 1.0)) +
      (windForceN / (unreinforcedProps.stiffnessKnM * 1000));
    const unreinforcedDrift = unreinforcedMaxTopDispM / this.BASE_HEIGHT_M;
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
}
