import {
  BuildingTypology,
  MultiHazardParameters,
  SimulationResult,
  SoilProfile,
  VenezuelaRegion
} from '../types';

export class StructuralSimulationEngine {
  /**
   * Calcula el período natural fundamental de vibración de la estructura (Tn)
   * según formulación empírica COVENIN 1756: Tn = Ct * Hn^(3/4)
   */
  public static calculateFundamentalPeriod(typology: BuildingTypology): number {
    const totalHeightM = typology.stories * typology.storyHeightM;
    let Ct = 0.075; // Pórticos de concreto armado
    if (typology.structuralSystem.includes('Mampostería')) {
      Ct = 0.050;
    } else if (typology.structuralSystem.includes('Autoconstrucción')) {
      Ct = 0.060;
    } else if (typology.structuralSystem.includes('Puente')) {
      Ct = 0.090;
    } else if (typology.structuralSystem.includes('Metálica')) {
      Ct = 0.085;
    }
    return Math.max(0.12, Ct * Math.pow(totalHeightM, 0.75));
  }

  /**
   * Genera el Espectro de Respuesta Elástica e Inelástica según COVENIN 1756:2019
   * Retorna la aceleración espectral Sa en unidades de gravedad (g)
   */
  public static calculateSpectralAcceleration(
    a0: number,
    soilProfile: SoilProfile,
    periodT: number,
    importanceI: number,
    ductilityR: number
  ): { Sa: number; alpha: number; elasticSa: number } {
    const TStar = soilProfile.coveninTStar;
    const beta = soilProfile.coveninBeta;
    const gamma = soilProfile.coveninGamma;
    const T0 = 0.1 * TStar;

    let alpha = 1.0;
    if (periodT <= T0) {
      alpha = 1.0 + (beta - 1.0) * (periodT / T0);
    } else if (periodT > T0 && periodT <= TStar) {
      alpha = beta;
    } else {
      alpha = beta * Math.pow(TStar / periodT, gamma);
    }

    // Aceleración elástica pura
    const elasticSa = a0 * alpha * importanceI;

    // Aceleración inelástica de diseño considerando reducción por ductilidad R
    const Sa = Math.max(0.04, elasticSa / ductilityR);

    return { Sa, alpha, elasticSa };
  }

  /**
   * Estabilidad de taludes según método de talud infinito con saturación freática
   */
  public static calculateSlopeFactorOfSafety(
    slopeAngleDeg: number,
    soilCohesionKpa: number,
    frictionAngleDeg: number,
    soilSaturationPercent: number,
    seismicCoeffKh: number
  ): number {
    const theta = (Math.max(5, slopeAngleDeg) * Math.PI) / 180;
    const phi = (Math.max(10, frictionAngleDeg) * Math.PI) / 180;

    // Tasa de presión de poros ru (0 = seco, hasta 0.75 en tormenta torrencial)
    const ru = (soilSaturationPercent / 100) * 0.70;

    // Cargas desestabilizadoras (gravedad en la pendiente + empuje sísmico horizontal)
    const driving = Math.sin(theta) + seismicCoeffKh * Math.cos(theta);

    // Esfuerzo normal efectivo
    const effectiveNormal = Math.max(0.02, Math.cos(theta) - ru);

    // Resistencia al corte del suelo de la ladera
    const cohesionComponent = soilCohesionKpa / 65; // Normalización empírica
    const frictionalComponent = effectiveNormal * Math.tan(phi);
    const resisting = cohesionComponent + frictionalComponent;

    const FS = resisting / Math.max(0.05, driving);
    return Math.max(0.2, Number(FS.toFixed(2)));
  }

  /**
   * Cálculo de empuje hidrodinámico e impacto de aluvión (flujo de detritos)
   */
  public static calculateDebrisImpact(
    debrisDepthM: number,
    debrisVelocityMs: number,
    densityKgM3: number,
    boulderSizeM: number,
    buildingWidthM: number
  ): number {
    if (debrisDepthM <= 0 || debrisVelocityMs <= 0) return 0;

    // 1. Presión hidrodinámica del flujo de lodo: F_hidro = 0.5 * Cd * rho * v^2 * Area
    const Cd = 1.4; // Coeficiente de arrastre en cuerpo romo
    const submergedArea = buildingWidthM * Math.min(4.0, debrisDepthM);
    const hydrodynamicForceKn =
      (0.5 * Cd * densityKgM3 * Math.pow(debrisVelocityMs, 2) * submergedArea) / 1000;

    // 2. Presión hidrostática de lodo pesado
    const hydrostaticForceKn =
      (0.5 * (densityKgM3 * 9.81) * Math.pow(debrisDepthM, 2) * buildingWidthM) / 1000;

    // 3. Impacto cinético puntual de roca gigante arrastrada
    const boulderMassKg = (4 / 3) * Math.PI * Math.pow(boulderSizeM / 2, 3) * 2600; // Granito 2600 kg/m3
    const boulderImpactKn = (boulderMassKg * Math.pow(debrisVelocityMs, 1.4)) / (0.1 * 1000); // desaceleración en 0.1s

    const totalImpactKn = hydrodynamicForceKn + hydrostaticForceKn + (boulderSizeM > 0.3 ? boulderImpactKn : 0);
    return Math.round(totalImpactKn);
  }

  /**
   * Simulación completa multi-amenaza y evaluación de daño estructural
   */
  public static runSimulation(
    region: VenezuelaRegion,
    typology: BuildingTypology,
    soilProfile: SoilProfile,
    scenario: MultiHazardParameters,
    selectedYear: number
  ): SimulationResult {
    // 1. Obtener métricas de MapBiomas para el año seleccionado
    const mapBiomasData =
      region.mapBiomasTimeSeries.find((t) => t.year === selectedYear) ||
      region.mapBiomasTimeSeries[region.mapBiomasTimeSeries.length - 1];

    const runoffC = mapBiomasData.meanRunoffCoefficient;
    const slopeDeg = mapBiomasData.averageSlopeDeg;

    // 2. Dinámica estructural
    const T1 = this.calculateFundamentalPeriod(typology);

    // Ajustar PGA por distancia o magnitud si el sismo está activo
    let effectivePga = scenario.earthquake.enabled ? scenario.earthquake.pgaG : 0.05;
    if (scenario.earthquake.enabled && scenario.earthquake.distanceToFaultKm > 10) {
      effectivePga = effectivePga * Math.exp(-0.02 * scenario.earthquake.distanceToFaultKm);
    }

    const { Sa } = this.calculateSpectralAcceleration(
      effectivePga,
      soilProfile,
      T1,
      typology.importanceFactorI,
      typology.ductilityReductionFactorR
    );

    const totalWeightKn = typology.stories * typology.storyWeightKn;
    const designBaseShearKn = Math.round(Sa * totalWeightKn);
    const baseShearToWeightRatio = Number((designBaseShearKn / totalWeightKn).toFixed(3));

    // 3. Cálculo de derivas de entrepiso (%)
    // Factores agravantes: planta baja blanda (+40%), columnas cortas (+30%), suelo blando S4 (+25%)
    let vulnerabilityMultiplier = 1.0;
    if (typology.softStoryVulnerability) vulnerabilityMultiplier += 0.40;
    if (typology.shortColumnRisk) vulnerabilityMultiplier += 0.30;
    if (soilProfile.type === 'S4') vulnerabilityMultiplier += 0.25;
    if (typology.category === 'Informal en Ladera') vulnerabilityMultiplier += 0.50;

    // Deriva elasto-plástica amplificada
    const rawDrift = (Sa * 1.8 * vulnerabilityMultiplier * (typology.stories / 3)) / (typology.ductilityReductionFactorR * 0.4);
    const maxStoryDriftPercent = Number(Math.max(0.15, Math.min(5.5, rawDrift)).toFixed(2));

    const coveninDriftLimitPercent =
      typology.structuralSystem.includes('ND3') ? 1.8 : typology.structuralSystem.includes('Mampostería') ? 1.2 : 0.8;
    const exceedsDriftLimit = maxStoryDriftPercent > coveninDriftLimitPercent;

    // 4. Aluvión y empuje de suelo
    const debrisFlow = scenario.debrisFlow;
    // Si la cuenca está deforestada en MapBiomas, incrementamos la velocidad y volumen de flujo
    const adjustedDebrisVelocity = debrisFlow.enabled
      ? debrisFlow.debrisVelocityMs * (0.8 + runoffC * 0.6)
      : 0;
    const buildingWidthM = typology.bayWidthM * typology.baysCount;
    const debrisImpactForceKn = debrisFlow.enabled
      ? this.calculateDebrisImpact(
          debrisFlow.debrisDepthM,
          adjustedDebrisVelocity,
          debrisFlow.densityKgM3,
          debrisFlow.boulderImpactSizeM,
          buildingWidthM
        )
      : 0;

    // 5. Presión de viento (COVENIN 2003)
    const wind = scenario.wind;
    let windPressureKpa = 0;
    if (wind.enabled) {
      // q = 0.5 * rho * v^2
      const vMs = (wind.speedKmh * 1000) / 3600;
      windPressureKpa = Number(((0.5 * 1.225 * Math.pow(vMs * wind.gustFactor, 2)) / 1000).toFixed(2));
    }

    // 6. Inundación
    const flood = scenario.flood;
    let hydrostaticThrustKn = 0;
    if (flood.enabled) {
      hydrostaticThrustKn = Math.round(
        (0.5 * 9.81 * Math.pow(flood.waterLevelM, 2) * buildingWidthM)
      );
    }

    // 7. Factor de Seguridad de Talud
    const slope = scenario.slope;
    const slopeAngle = slope.enabled ? slope.angleDeg : slopeDeg;
    const slopeKh = scenario.earthquake.enabled ? effectivePga * 0.5 : 0.05;
    const soilSaturation = debrisFlow.enabled
      ? debrisFlow.soilSaturationPercent
      : flood.enabled
      ? Math.min(100, 50 + flood.soilSaturationIncrease)
      : 30;

    const slopeFactorOfSafety = this.calculateSlopeFactorOfSafety(
      slopeAngle,
      slope.cohesionKpa,
      slope.internalFrictionAngleDeg,
      soilSaturation,
      slopeKh
    );

    // 8. Licuefacción de suelos
    const liquefactionOccurred =
      scenario.earthquake.enabled &&
      effectivePga >= 0.18 &&
      soilProfile.waterTableDepthM <= 2.5 &&
      (soilProfile.type === 'S4' || (soilProfile.type === 'S3' && soilSaturation > 80));

    // 9. Cálculo del Índice de Daño de Park-Ang (0.0 a 1.2+)
    let parkAng = 0.0;
    // Componente por deriva lateral
    parkAng += (maxStoryDriftPercent / (coveninDriftLimitPercent * 2.2));
    // Componente por aluvión / impacto
    if (debrisImpactForceKn > 0) {
      const debrisDamage = debrisImpactForceKn / (totalWeightKn * 0.35);
      parkAng += debrisDamage;
    }
    // Componente por falla de ladera
    if (slopeFactorOfSafety < 1.0) {
      parkAng += (1.0 - slopeFactorOfSafety) * 0.8;
    }
    // Componente por licuefacción
    if (liquefactionOccurred) {
      parkAng += 0.45;
    }

    // Nivel base por vulnerabilidad de la tipología
    parkAng += (typology.baseVulnerabilityScore / 100) * 0.15;

    const finalParkAng = Number(Math.max(0.02, Math.min(1.35, parkAng)).toFixed(2));

    // Determinar categoría EMS-98
    let ems98Grade: SimulationResult['ems98Grade'] = 'Grado 1: Daño Leve / Fisuras Cosméticas';
    if (finalParkAng >= 1.0 || slopeFactorOfSafety < 0.7) {
      ems98Grade = 'Grado 5: Colapso Total / Inhabitable';
    } else if (finalParkAng >= 0.75) {
      ems98Grade = 'Grado 4: Muy Severo / Falla Parcial de Columnas';
    } else if (finalParkAng >= 0.45) {
      ems98Grade = 'Grado 3: Daño Severo / Rótulas Plásticas y Grietas en Vigas';
    } else if (finalParkAng >= 0.22) {
      ems98Grade = 'Grado 2: Daño Moderado / Grietas en Muros';
    }

    const structuralStressRatio = Number(
      Math.min(2.8, (designBaseShearKn + debrisImpactForceKn * 0.7) / (totalWeightKn * 0.22 * (typology.ductilityReductionFactorR / 3))).toFixed(2)
    );

    const residualCapacityPercent = Math.max(
      0,
      Math.round(100 - finalParkAng * 90 - (liquefactionOccurred ? 20 : 0))
    );

    const estimatedRepairCostPercent = Math.min(
      120,
      Math.round(finalParkAng * 85 + (finalParkAng > 0.8 ? 25 : 0))
    );

    // 10. Evaluación FEMA 356 / ASCE 41 de Nivel de Desempeño
    let performanceLevel: SimulationResult['performanceLevel'] = 'Operacional (O)';
    if (finalParkAng >= 0.95 || slopeFactorOfSafety < 0.85 || maxStoryDriftPercent > 3.5) {
      performanceLevel = 'Colapso Inminente (C)';
    } else if (finalParkAng >= 0.65 || maxStoryDriftPercent > 2.2) {
      performanceLevel = 'Prevención de Colapso (CP)';
    } else if (finalParkAng >= 0.35 || maxStoryDriftPercent > 1.2) {
      performanceLevel = 'Seguridad de Vida (LS)';
    } else if (finalParkAng >= 0.15 || maxStoryDriftPercent > 0.5) {
      performanceLevel = 'Ocupación Inmediata (IO)';
    }

    // 11. Análisis de Segundo Orden P-Delta (COVENIN 1756 Art. 8.4)
    const driftM = (maxStoryDriftPercent / 100) * typology.storyHeightM;
    const rawTheta = (totalWeightKn * driftM) / (Math.max(50, designBaseShearKn) * typology.storyHeightM);
    const pDeltaStabilityCoefficient = Number(Math.max(0.01, Math.min(0.40, rawTheta)).toFixed(3));
    const thetaMax = Math.min(0.25, 0.50 / (2.6 * (typology.ductilityReductionFactorR / 4)));
    const pDeltaExceeded = pDeltaStabilityCoefficient > thetaMax;
    const pDeltaAmplificationFactor = pDeltaStabilityCoefficient <= 0.10
      ? 1.00
      : Number((1.0 / Math.max(0.15, 1.0 - pDeltaStabilityCoefficient)).toFixed(2));

    // 12. Ductilidad Requerida vs Capacidad
    const ductilityCapacity = typology.ductilityReductionFactorR;
    const ductilityDemand = Number(
      Math.max(1.0, 1.0 + ((ductilityCapacity - 1.0) / 2.0) * (Sa / 0.25)).toFixed(2)
    );
    const ductilityAdequate = ductilityDemand <= ductilityCapacity;

    // 13. Tiempo Estimado de Inhabitabilidad / Recuperación Funcional (Downtime)
    let estimatedDowntimeDays = 0;
    let downtimeClassification: SimulationResult['downtimeClassification'] = 'Inmediata (0-3 días)';
    if (finalParkAng >= 0.95 || slopeFactorOfSafety < 0.85) {
      estimatedDowntimeDays = 540;
      downtimeClassification = 'Demolición Total';
    } else if (finalParkAng >= 0.65) {
      estimatedDowntimeDays = 240;
      downtimeClassification = 'Prolongada (> 6 meses)';
    } else if (finalParkAng >= 0.35) {
      estimatedDowntimeDays = 90;
      downtimeClassification = 'Media (1-6 meses)';
    } else if (finalParkAng >= 0.15) {
      estimatedDowntimeDays = 21;
      downtimeClassification = 'Corta (1-4 semanas)';
    } else {
      estimatedDowntimeDays = 2;
      downtimeClassification = 'Inmediata (0-3 días)';
    }

    // 14. Pérdida Económica y Costo de Reposición en USD
    const footprintAreaM2 = typology.bayWidthM * typology.baysCount * (typology.bayWidthM * 1.5);
    const totalBuiltAreaM2 = footprintAreaM2 * typology.stories;
    const isEssential = typology.category === 'Educativo / Salud' || typology.category === 'Puente / Vialidad' || typology.importanceFactorI > 1.15;
    const costPerM2Usd = typology.category === 'Informal en Ladera'
      ? 280
      : isEssential
      ? 1100
      : 750;
    const replacementCostUsd = Math.round(totalBuiltAreaM2 * costPerM2Usd);
    const estimatedLossUsd = Math.round(replacementCostUsd * (estimatedRepairCostPercent / 100));
    const lossRatioPercent = Number(((estimatedLossUsd / replacementCostUsd) * 100).toFixed(1));

    // 15. Geotecnia Avanzada: Desplazamiento Newmark y Licuefacción
    const slopeCriticalAccelerationKc = Number(
      Math.max(0.01, (Math.max(0.5, slopeFactorOfSafety) - 0.95) * Math.sin((slopeAngle * Math.PI) / 180)).toFixed(3)
    );
    let newmarkDisplacementCm = 0;
    if (scenario.earthquake.enabled && effectivePga > slopeCriticalAccelerationKc) {
      const ratio = slopeCriticalAccelerationKc / Math.max(0.05, effectivePga);
      const logDn = 0.215 - 2.341 * ratio;
      newmarkDisplacementCm = Number(Math.max(0, Math.min(150, Math.pow(10, logDn))).toFixed(1));
    }

    const liquefactionPotentialIndex = liquefactionOccurred
      ? Number(Math.min(35, 14 + effectivePga * 25).toFixed(1))
      : 0;

    const footingStressKpa = totalWeightKn / Math.max(10, footprintAreaM2 * 0.35);
    const allowableKpa = soilProfile.allowableBearingCapacityQa * 98.1; // 1 kg/cm² ~ 98.1 kPa
    const bearingCapacitySafetyFactor = Number(
      (allowableKpa / Math.max(10, footingStressKpa)).toFixed(2)
    );

    // 16. Hidráulica & Aluviones Profunda
    const overturningMomentKnM = Math.round(
      debrisImpactForceKn * Math.min(2.5, (debrisFlow.debrisDepthM || 1.0) * 0.6) +
      hydrostaticThrustKn * ((flood.waterLevelM || 1.0) / 3)
    );

    const backwaterSurgeHeightM = debrisFlow.enabled
      ? Number(((Math.pow(adjustedDebrisVelocity, 2) / (2 * 9.81)) * 0.65).toFixed(2))
      : 0;

    // Identificar modos de falla
    const failureModes: string[] = [];
    if (exceedsDriftLimit) failureModes.push(`Exceso de deriva de entrepiso (${maxStoryDriftPercent}% > ${coveninDriftLimitPercent}%)`);
    if (pDeltaExceeded) failureModes.push(`Inestabilidad por efectos de segundo orden P-Delta (θ = ${pDeltaStabilityCoefficient} > ${thetaMax})`);
    if (typology.softStoryVulnerability && effectivePga > 0.20) failureModes.push('Concentración de deformación inelástica en planta baja (Piso Blando)');
    if (typology.shortColumnRisk) failureModes.push('Falla frágil por corte en columnas confinadas por antepechos rígidos (Efecto Columna Corta)');
    if (debrisImpactForceKn > 300) failureModes.push(`Falla por empuje hidrodinámico e impacto de detritos (${debrisImpactForceKn} kN en planta baja)`);
    if (slopeFactorOfSafety < 1.0) failureModes.push(`Deslizamiento masivo del talud de apoyo (FS = ${slopeFactorOfSafety} < 1.0)`);
    if (newmarkDisplacementCm > 15) failureModes.push(`Deformación permanente cosísmica del terreno inadmisible (Newmark dN = ${newmarkDisplacementCm} cm)`);
    if (bearingCapacitySafetyFactor < 1.2) failureModes.push(`Capacidad portante del suelo insuficiente ante sobrecargas combinadas (FS = ${bearingCapacitySafetyFactor})`);
    if (liquefactionOccurred) failureModes.push(`Pérdida súbita de capacidad portante por licuefacción de suelos (LPI = ${liquefactionPotentialIndex})`);

    if (failureModes.length === 0) failureModes.push('Comportamiento dentro del rango elástico admisible');

    // Recomendaciones de ingeniería civil sismorresistente y geotécnica
    const recommendations: string[] = [];
    if (typology.category === 'Informal en Ladera') {
      recommendations.push('Reubicación prioritaria o sustitución estructural; la autoconstrucción sin confinamiento carece de anclaje para eventos combinados.');
      recommendations.push('Construcción urgente de muros de gaviones escalonados y pantallas ancladas para estabilizar la ladera superior.');
    }
    if (exceedsDriftLimit || pDeltaExceeded) {
      recommendations.push('Incorporación de muros de corte de concreto armado (pantallas sismorresistentes) o cruces de San Andrés para rigidizar la estructura y controlar derivas y efectos P-Delta.');
      recommendations.push('Encamisado de columnas con fibras de carbono polimerizadas (CFRP) o perfiles metálicos para aumentar el confinamiento y ductilidad.');
    }
    if (typology.softStoryVulnerability) {
      recommendations.push('Rigidización de la planta baja mediante pórticos con diagonales concéntricas para erradicar el mecanismo de piso blando.');
    }
    if (debrisFlow.enabled && debrisImpactForceKn > 150) {
      recommendations.push('Construcción de diques de retención y disipadores de sedimentos tipo Sabo aguas arriba de la cuenca.');
      recommendations.push('Reforestación de la cabecera montañosa para reducir el coeficiente de escorrentía C según proyecciones MapBiomas.');
    }
    if (liquefactionOccurred || bearingCapacitySafetyFactor < 1.5) {
      recommendations.push('Mejoramiento del suelo mediante inclusiones rígidas de grava compactada o inyecciones de lechada de cemento para aumentar la capacidad portante.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Mantenimiento preventivo regular de juntas sísmicas y revisión periódica de anclajes de elementos no estructurales.');
    }

    const safeForOccupancy = finalParkAng < 0.40 && slopeFactorOfSafety >= 1.25 && !liquefactionOccurred && !pDeltaExceeded;

    const evacuationPriority: SimulationResult['evacuationPriority'] =
      finalParkAng >= 0.8 || slopeFactorOfSafety < 0.95 || pDeltaExceeded
        ? 'Rojo (Inmediata)'
        : finalParkAng >= 0.45 || slopeFactorOfSafety < 1.2
        ? 'Naranja (Alta)'
        : finalParkAng >= 0.25
        ? 'Amarillo (Media)'
        : 'Verde (Baja)';

    const primaryFailureMechanism =
      slopeFactorOfSafety < 1.0
        ? 'Deslizamiento y Colapso Geotécnico de Talud'
        : pDeltaExceeded
        ? 'Inestabilidad Global por Efectos de Segundo Orden P-Delta'
        : debrisImpactForceKn > totalWeightKn * 0.4
        ? 'Aplastamiento por Empuje de Aluvión / Lodo'
        : liquefactionOccurred
        ? 'Hundimiento y Vuelco por Licuefacción'
        : exceedsDriftLimit
        ? 'Ruptura Inelástica de Nudos y Deriva Excesiva'
        : 'Respuesta Estructural Estable';

    return {
      timestamp: new Date().toISOString(),
      regionId: region.id,
      typologyId: typology.id,
      selectedYear,
      fundamentalPeriodT1: Number(T1.toFixed(3)),
      spectralAccelerationSa: Number(Sa.toFixed(3)),
      designBaseShearKn,
      baseShearToWeightRatio,
      maxStoryDriftPercent,
      coveninDriftLimitPercent,
      exceedsDriftLimit,
      debrisImpactForceKn,
      hydrostaticThrustKn,
      windPressureKpa,
      slopeFactorOfSafety,
      liquefactionOccurred,
      parkAngDamageIndex: finalParkAng,
      ems98Grade,
      structuralStressRatio,
      residualCapacityPercent,
      estimatedRepairCostPercent,
      performanceLevel,
      pDeltaStabilityCoefficient,
      pDeltaExceeded,
      pDeltaAmplificationFactor,
      ductilityDemand,
      ductilityCapacity,
      ductilityAdequate,
      estimatedDowntimeDays,
      downtimeClassification,
      estimatedLossUsd,
      replacementCostUsd,
      lossRatioPercent,
      newmarkDisplacementCm,
      slopeCriticalAccelerationKc,
      liquefactionPotentialIndex,
      bearingCapacitySafetyFactor,
      overturningMomentKnM,
      backwaterSurgeHeightM,
      primaryFailureMechanism,
      identifiedVulnerabilities: failureModes,
      recommendedRetrofits: recommendations,
      safeForOccupancy,
      evacuationPriority
    };
  }
}
