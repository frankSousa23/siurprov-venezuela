import { LearningLesson } from '../types';

export const LEARNING_CURRICULUM: LearningLesson[] = [
  {
    id: 'covenin-cortante-basal',
    title: 'Cálculo del Cortante Basal Sísmico (Norma COVENIN 1756)',
    category: 'Sismorresistencia COVENIN',
    difficulty: 'Iniciación',
    summary:
      'Aprende a determinar la fuerza cortante horizontal en la base de una estructura producida por un sismo, el fundamento de todo diseño estructural en Venezuela.',
    formulaLatex: 'V_0 = \\frac{A_0 \\cdot \\alpha \\cdot I}{R} \\cdot W',
    formulaExplanation:
      'Donde:\n- A0 = Aceleración horizontal del terreno según la zona sísmica (ej. 0.30g en Caracas, 0.40g en Cariaco)\n- α (alfa) = Factor de amplificación dinámica espectral dependiente del suelo (S1 a S4) y del período natural de vibración T\n- I = Factor de importancia (1.0 para viviendas, 1.30 para hospitales y escuelas esenciales Grupo A)\n- R = Factor de reducción de respuesta por ductilidad (6.0 para pórticos dúctiles ND3, 1.5 para autoconstrucción informal)\n- W = Peso sísmico total de la edificación (kN o toneladas)',
    practicalApplication:
      'Esta fuerza V0 es la carga lateral total que las columnas de la planta baja y las fundaciones deben resistir sin fallar por cortante o volcamiento.',
    interactiveVariables: [
      {
        id: 'A0',
        label: 'A0 (Aceleración de diseño en g)',
        unit: 'g',
        min: 0.10,
        max: 0.45,
        step: 0.05,
        defaultValue: 0.30,
        description: 'Según mapa de zonificación sísmica COVENIN (Zona 1 a Zona 7)'
      },
      {
        id: 'alpha',
        label: 'α (Factor de amplificación)',
        unit: 'adimensional',
        min: 1.0,
        max: 3.0,
        step: 0.1,
        defaultValue: 2.4,
        description: 'Amplificación en la meseta del espectro elástico'
      },
      {
        id: 'I',
        label: 'I (Factor de Importancia)',
        unit: 'adimensional',
        min: 1.0,
        max: 1.30,
        step: 0.15,
        defaultValue: 1.0,
        description: '1.0: Edificaciones normales; 1.30: Hospitales, estaciones de bomberos (Grupo A)'
      },
      {
        id: 'R',
        label: 'R (Factor de Reducción por Ductilidad)',
        unit: 'adimensional',
        min: 1.5,
        max: 6.0,
        step: 0.5,
        defaultValue: 6.0,
        description: '6.0: Pórticos dúctiles venezolanos (ND3); 1.5: Autoconstrucción informal frágil'
      },
      {
        id: 'W',
        label: 'W (Peso sísmico total)',
        unit: 'kN',
        min: 500,
        max: 20000,
        step: 500,
        defaultValue: 4500,
        description: 'Cargas permanentes + % de sobrecarga de uso'
      }
    ],
    compute: (inputs) => {
      const { A0, alpha, I, R, W } = inputs;
      const coef = (A0 * alpha * I) / R;
      const V0 = coef * W;
      const status = coef > 0.35 ? 'Alerta' : 'Seguro';
      return {
        value: V0,
        formatted: `${V0.toFixed(1)} kN (Coef. Sísmico: ${(coef * 100).toFixed(1)}% del peso)`,
        status,
        explanation: `El edificio demandará una resistencia en la base de ${V0.toFixed(0)} kN. Nótese que a menor ductilidad (R bajo en construcciones informales), la fuerza sísmica que absorbe el edificio se multiplica drásticamente.`,
        steps: [
          {
            step: '1. Calcular Coeficiente Sísmico C_s',
            calculation: `C_s = (A_0 × α × I) / R = (${A0} × ${alpha} × ${I}) / ${R} = ${coef.toFixed(4)}`
          },
          {
            step: '2. Multiplicar por el Peso Sísmico W',
            calculation: `V_0 = C_s × W = ${coef.toFixed(4)} × ${W} kN = ${V0.toFixed(2)} kN`
          }
        ]
      };
    },
    codeSnippet: `// Implementación en TypeScript del Cortante Basal COVENIN 1756
export function calculateBaseShear(params: {
  a0: number; // Aceleración en g
  alpha: number; // Factor de forma espectral
  importanceI: number; // Factor de uso
  ductilityR: number; // Ductilidad
  totalWeightKn: number;
}): { baseShearKn: number; seismicCoefficient: number } {
  const seismicCoefficient = (params.a0 * params.alpha * params.importanceI) / params.ductilityR;
  const baseShearKn = seismicCoefficient * params.totalWeightKn;
  
  return { baseShearKn, seismicCoefficient };
}`,
    codeExplanation:
      'En programación, esta función lineal transforma propiedades del terreno y de la edificación en una fuerza estática equivalente en la base, sirviendo como entrada para distribuir fuerzas en cada piso.'
  },
  {
    id: 'bishop-taludes',
    title: 'Estabilidad de Taludes en Laderas (Factor de Seguridad FS)',
    category: 'Geotecnia y Taludes',
    difficulty: 'Intermedio',
    summary:
      'Calcula si una ladera o cerro habitado es estable o si fallará en deslizamiento ante lluvias torrenciales y saturación freática.',
    formulaLatex: 'FS = \\frac{\\text{Fuerzas Resistentes}}{\\text{Fuerzas Desestabilizadoras}} = \\frac{c\' \\cdot L + (W \\cdot \\cos\\theta - u \\cdot L) \\tan\\phi\'}{W \\cdot \\sin\\theta + F_{sismo}}',
    formulaExplanation:
      'Donde:\n- c\' = Cohesión efectiva del suelo (kPa)\n- φ\' (phi) = Ángulo de fricción interna del suelo (grados)\n- θ (theta) = Ángulo de inclinación del talud o ladera (grados)\n- W = Peso de la masa de tierra deslizante\n- u = Presión intersticial del agua en los poros (aumenta con las lluvias)\n- F_sismo = Fuerza inercial por aceleración sísmica (k_h × W)',
    practicalApplication:
      'Si FS > 1.5, el talud es seguro. Si 1.0 ≤ FS ≤ 1.5, está en equilibrio límite con alto riesgo. Si FS < 1.0, el talud colapsa en un deslizamiento o deslave masivo.',
    interactiveVariables: [
      {
        id: 'slopeAngle',
        label: 'θ (Inclinación de la ladera)',
        unit: '°',
        min: 15,
        max: 55,
        step: 1,
        defaultValue: 35,
        description: 'Pendiente del cerro'
      },
      {
        id: 'cohesion',
        label: "c' (Cohesión del suelo)",
        unit: 'kPa',
        min: 5,
        max: 50,
        step: 5,
        defaultValue: 20,
        description: 'Resistencia por unión de partículas arcillosas'
      },
      {
        id: 'frictionAngle',
        label: "φ' (Ángulo de fricción)",
        unit: '°',
        min: 18,
        max: 42,
        step: 2,
        defaultValue: 28,
        description: 'Fricción intergranular de arenas/gravas'
      },
      {
        id: 'porePressureRatio',
        label: 'ru (Grado de Saturación por Lluvias)',
        unit: '%',
        min: 0,
        max: 0.8,
        step: 0.1,
        defaultValue: 0.4,
        description: 'Presión del agua subterránea. 0 = seco, >0.5 = lluvia torrencial extrema'
      },
      {
        id: 'seismicCoeff',
        label: 'kh (Coeficiente sísmico del talud)',
        unit: 'g',
        min: 0,
        max: 0.35,
        step: 0.05,
        defaultValue: 0.15,
        description: 'Aceleración horizontal durante un terremoto'
      }
    ],
    compute: (inputs) => {
      const { slopeAngle, cohesion, frictionAngle, porePressureRatio, seismicCoeff } = inputs;
      const thetaRad = (slopeAngle * Math.PI) / 180;
      const phiRad = (frictionAngle * Math.PI) / 180;
      
      const W = 100; // Bloque unitario de 100 kN
      const drivingForce = W * Math.sin(thetaRad) + seismicCoeff * W * Math.cos(thetaRad);
      const normalEffective = W * Math.cos(thetaRad) - porePressureRatio * W;
      const frictionalResist = Math.max(0, normalEffective) * Math.tan(phiRad);
      const cohesiveResist = (cohesion * 1.5);
      const resistingForce = cohesiveResist + frictionalResist;
      
      const FS = resistingForce / Math.max(0.1, drivingForce);
      const status = FS < 1.0 ? 'Falla Estructural' : FS < 1.3 ? 'Alerta' : 'Seguro';
      
      return {
        value: FS,
        formatted: `FS = ${FS.toFixed(2)} (${status})`,
        status,
        explanation: FS < 1.0
          ? '¡COLAPSO INMINENTE! Las fuerzas desestabilizadoras superan a la resistencia del suelo. Ocurrirá un deslizamiento de tierra.'
          : FS < 1.3
          ? 'ALERTA: Margen de seguridad reducido. Una lluvia prolongada o un sismo menor detonará la falla del talud.'
          : 'ESTABLE: Las fuerzas resistentes superan ampliamente las solicitaciones.',
        steps: [
          {
            step: '1. Fuerzas Desestabilizadoras (Gravedad + Sismo)',
            calculation: `F_d = W·sin(${slopeAngle}°) + k_h·W·cos(${slopeAngle}°) = ${drivingForce.toFixed(2)} kN`
          },
          {
            step: '2. Fuerzas Resistentes (Cohesión + Fricción Efectiva)',
            calculation: `F_r = Cohesión + N'·tan(${frictionAngle}°) = ${resistingForce.toFixed(2)} kN`
          },
          {
            step: '3. Factor de Seguridad FS',
            calculation: `FS = F_r / F_d = ${resistingForce.toFixed(2)} / ${drivingForce.toFixed(2)} = ${FS.toFixed(3)}`
          }
        ]
      };
    },
    codeSnippet: `// Algoritmo en TypeScript de estabilidad de taludes con presión de poros
export function evaluateSlopeStability(params: {
  slopeDeg: number;
  cohesionKpa: number;
  frictionDeg: number;
  porePressureRatioRu: number;
  khSeismic: number;
}): { factorOfSafety: number; failureTriggered: boolean } {
  const theta = (params.slopeDeg * Math.PI) / 180;
  const phi = (params.frictionDeg * Math.PI) / 180;

  const driving = Math.sin(theta) + params.khSeismic * Math.cos(theta);
  const effectiveNormal = Math.max(0, Math.cos(theta) - params.porePressureRatioRu);
  const resisting = (params.cohesionKpa / 65) + effectiveNormal * Math.tan(phi);

  const factorOfSafety = resisting / Math.max(0.05, driving);
  return {
    factorOfSafety,
    failureTriggered: factorOfSafety < 1.0,
  };
}`,
    codeExplanation:
      'Al programar simulaciones geotécnicas, convertimos los ángulos a radianes para `Math.sin` y `Math.cos`. La saturación por lluvia reduce la tensión efectiva normal, reduciendo la fricción a cero si los poros se presurizan.'
  },
  {
    id: 'mapbiomas-hidrologia',
    title: 'Impacto de la Deforestación MapBiomas en Aluviones (Método Racional)',
    category: 'MapBiomas e Hidrología',
    difficulty: 'Intermedio',
    summary:
      'Comprende cómo los cambios de cobertura del suelo de MapBiomas (pérdida de bosque y avance de construcciones) multiplican el caudal pico y la fuerza destructiva de deslaves.',
    formulaLatex: 'Q_p = 0.278 \\cdot C_{\\text{MapBiomas}} \\cdot I \\cdot A',
    formulaExplanation:
      'Donde:\n- Q_p = Caudal pico de la creciente torrencial (m³/s)\n- C_MapBiomas = Coeficiente de escorrentía ponderado (Bosque nativo = 0.15 - 0.25; Suelo deforestado = 0.60; Asentamiento urbano = 0.85 - 0.95)\n- I = Intensidad de la lluvia torrencial (mm/h)\n- A = Área de la cuenca hidrográfica (km²)\n- 0.278 = Factor de conversión métrico de unidades',
    practicalApplication:
      'Cuando un cerro pasa de cobertura forestal a zona urbana deforestada según MapBiomas, el caudal pico se multiplica por 3x a 5x, convirtiendo una quebrada mansa en un torrente mortal con rocas y escombros.',
    interactiveVariables: [
      {
        id: 'forestLossPercent',
        label: '% Deforestación / Urbanización MapBiomas',
        unit: '%',
        min: 0,
        max: 80,
        step: 5,
        defaultValue: 35,
        description: 'Pérdida de cobertura vegetal de la cuenca'
      },
      {
        id: 'rainfallIntensity',
        label: 'I (Intensidad de precipitación)',
        unit: 'mm/h',
        min: 20,
        max: 160,
        step: 10,
        defaultValue: 90,
        description: 'Lluvia extrema en cuenca de cabecera'
      },
      {
        id: 'basinArea',
        label: 'A (Área de la cuenca)',
        unit: 'km²',
        min: 2,
        max: 50,
        step: 2,
        defaultValue: 15,
        description: 'Superficie de drenaje aguas arriba'
      },
      {
        id: 'sedimentConcentration',
        label: 'Concentración de Sólidos (Detritos/Lodo)',
        unit: '%',
        min: 10,
        max: 65,
        step: 5,
        defaultValue: 45,
        description: '% en volumen de rocas, lodo y troncos arrastrados'
      }
    ],
    compute: (inputs) => {
      const { forestLossPercent, rainfallIntensity, basinArea, sedimentConcentration } = inputs;
      // C base = 0.25 en bosque virgen, escala hasta 0.85 con deforestación
      const C = 0.25 + (forestLossPercent / 100) * 0.60;
      const Q_water = 0.278 * C * rainfallIntensity * basinArea; // m3/s
      // Con detritos, el caudal aumenta por hiperconcentración
      const solidBulkingFactor = 1 / (1 - sedimentConcentration / 100);
      const Q_debris = Q_water * solidBulkingFactor;
      // Fuerza de empuje hidrodinámico aproximada en una estructura de 6m de ancho
      const velocity = Math.min(12, 2.5 * Math.pow(Q_debris / 15, 0.4));
      const density = 1000 + (sedimentConcentration / 100) * 1200; // kg/m3
      const impactForceKn = 0.5 * 1.5 * density * Math.pow(velocity, 2) * (6 * 1.8) / 1000;

      const status = impactForceKn > 250 ? 'Falla Estructural' : impactForceKn > 100 ? 'Alerta' : 'Seguro';
      return {
        value: Q_debris,
        formatted: `Caudal Pico: ${Q_debris.toFixed(1)} m³/s | Impacto: ${impactForceKn.toFixed(0)} kN`,
        status,
        explanation: `Con un C = ${C.toFixed(2)} inducido por la deforestación de MapBiomas, el caudal sólido se triplica hasta ${Q_debris.toFixed(1)} m³/s, generando un empuje violento de ${impactForceKn.toFixed(0)} kN que demolerá muros de bloque tradicionales.`,
        steps: [
          {
            step: '1. Calcular Coeficiente C según cobertura MapBiomas',
            calculation: `C = 0.25 + (${forestLossPercent}% × 0.60) = ${C.toFixed(2)}`
          },
          {
            step: '2. Caudal Líquido Racional Q = 0.278 × C × I × A',
            calculation: `Q_l = 0.278 × ${C.toFixed(2)} × ${rainfallIntensity} × ${basinArea} = ${Q_water.toFixed(1)} m³/s`
          },
          {
            step: '3. Corrección por Volumen Sólido (Bulking Factor)',
            calculation: `Factor = 1 / (1 - ${sedimentConcentration}%) = ${solidBulkingFactor.toFixed(2)} → Q_aluvión = ${Q_debris.toFixed(1)} m³/s`
          }
        ]
      };
    },
    codeSnippet: `// Conversión de clases de píxeles MapBiomas a parámetros hidrológicos
export function computeMapBiomasHydrology(pixelCoverages: {
  forestFraction: number;
  urbanFraction: number;
  informalSlopeFraction: number;
  rainfallMmH: number;
  basinAreaKm2: number;
}) {
  // Coeficientes C de cada clase MapBiomas
  const C_forest = 0.20;
  const C_urban = 0.85;
  const C_informalSlope = 0.90;

  const weightedC =
    pixelCoverages.forestFraction * C_forest +
    pixelCoverages.urbanFraction * C_urban +
    pixelCoverages.informalSlopeFraction * C_informalSlope;

  const peakDischargeM3s = 0.278 * weightedC * pixelCoverages.rainfallMmH * pixelCoverages.basinAreaKm2;
  return { weightedC, peakDischargeM3s };
}`,
    codeExplanation:
      'MapBiomas proporciona rásteres satelitales con códigos de cobertura anuales. Al promediar espacialmente los píxeles de una cuenca, obtenemos el coeficiente C de escorrentía para alimentar modelos hidrológicos y predecir aluviones.'
  },
  {
    id: 'derivas-entrepiso',
    title: 'Derivas de Entrepiso y Daño Estructural (Park-Ang y COVENIN 1756)',
    category: 'Código TypeScript y Métodos Numéricos',
    difficulty: 'Avanzado',
    summary:
      'Descubre cómo se programan el desplazamiento relativo entre pisos (deriva $\\Delta/H$), la formación de rótulas plásticas y el índice de daño de Park-Ang.',
    formulaLatex: '\\text{Deriva } (\\Delta / H) = \\frac{\\delta_{i} - \\delta_{i-1}}{h_i} \\le 0.018 \\quad | \\quad DI = \\frac{\\delta_m}{\\delta_u} + \\frac{\\beta}{Q_y \\cdot \\delta_u} \\int dE_h',
    formulaExplanation:
      'Donde:\n- δi - δi-1 = Desplazamiento lateral relativo entre el piso i y el piso inferior\n- hi = Altura del entrepiso (típicamente 2.8 a 3.2 m)\n- 0.018 = Límite reglamentario COVENIN 1756 (1.8% para pórticos de concreto)\n- DI (Park-Ang) = Índice de Daño: 0.0 (Sin daño) a 1.0 (Colapso total)\n- δm / δu = Deformación máxima elasto-plástica vs deformación última\n- ∫ dEh = Energía histerética disipada por daño cíclico en el concreto y acero',
    practicalApplication:
      'Si la deriva supera el 1.8%, los tabiques de bloque se revientan y las columnas sufren aplastamiento del núcleo confinado. En autoconstrucción sin vigas, derivas de apenas 0.8% provocan colapso catastrófico por falta de estribos.',
    interactiveVariables: [
      {
        id: 'storyHeightM',
        label: 'Altura de Entrepiso (h)',
        unit: 'm',
        min: 2.4,
        max: 4.5,
        step: 0.1,
        defaultValue: 3.0,
        description: 'Distancia entre losas'
      },
      {
        id: 'relativeDisplacementCm',
        label: 'Desplazamiento Relativo (Δ)',
        unit: 'cm',
        min: 0.5,
        max: 15.0,
        step: 0.5,
        defaultValue: 4.5,
        description: 'Deformación horizontal calculada bajo sismo'
      },
      {
        id: 'ductilityClass',
        label: 'Ductilidad del Sistema (1: Pobre, 3: ND3 Alta)',
        unit: 'nivel',
        min: 1,
        max: 3,
        step: 1,
        defaultValue: 2,
        description: '1 = Autoconstrucción / ND1; 2 = Mampostería; 3 = Pórticos sismorresistentes ND3'
      }
    ],
    compute: (inputs) => {
      const { storyHeightM, relativeDisplacementCm, ductilityClass } = inputs;
      const driftPercent = (relativeDisplacementCm / (storyHeightM * 100)) * 100;
      const coveninLimit = ductilityClass === 3 ? 1.8 : ductilityClass === 2 ? 1.2 : 0.8;
      const exceeds = driftPercent > coveninLimit;
      
      // Park-Ang aproximado
      const deltaU = ductilityClass === 3 ? 8.0 : ductilityClass === 2 ? 5.0 : 3.0; // cm admisible
      const parkAng = Math.min(1.3, relativeDisplacementCm / deltaU + (driftPercent > coveninLimit ? 0.25 : 0.05));
      
      const status = parkAng >= 1.0 ? 'Falla Estructural' : parkAng >= 0.5 ? 'Alerta' : 'Seguro';
      return {
        value: driftPercent,
        formatted: `Deriva: ${driftPercent.toFixed(2)}% (Límite: ${coveninLimit}%) | Park-Ang: ${parkAng.toFixed(2)}`,
        status,
        explanation: exceeds
          ? `¡EXCEDE LA NORMA! La deriva de ${driftPercent.toFixed(2)}% sobrepasa el límite normativo de ${coveninLimit}%. Se formarán grietas diagonales severas y rótulas plásticas en nudos.`
          : `CUMPLE NORMATIVA: La deriva de ${driftPercent.toFixed(2)}% se mantiene dentro del rango seguro (${coveninLimit}%). Daño controlado.`,
        steps: [
          {
            step: '1. Calcular Deriva de Entrepiso Δ / H',
            calculation: `Deriva = (${relativeDisplacementCm} cm / ${(storyHeightM * 100)} cm) × 100 = ${driftPercent.toFixed(2)}%`
          },
          {
            step: '2. Comparar con Límite COVENIN 1756',
            calculation: `${driftPercent.toFixed(2)}% vs Límite ${coveninLimit}% (${exceeds ? 'NO CUMPLE' : 'CUMPLE'})`
          },
          {
            step: '3. Estimar Índice de Daño de Park-Ang',
            calculation: `DI = ${parkAng.toFixed(2)} → ${parkAng < 0.25 ? 'Leve' : parkAng < 0.6 ? 'Moderado' : parkAng < 1.0 ? 'Severo' : 'Colapso Inminente'}`
          }
        ]
      };
    },
    codeSnippet: `// Cálculo matricial de derivas e Índice de Daño Park-Ang en TypeScript
export function calculateStoryDriftAndDamage(
  storyHeightsM: number[],
  lateralDisplacementsCm: number[],
  ductilityType: 'ND1' | 'ND2' | 'ND3'
) {
  const driftRatios: number[] = [];
  const limit = ductilityType === 'ND3' ? 0.018 : ductilityType === 'ND2' ? 0.012 : 0.008;

  for (let i = 1; i < lateralDisplacementsCm.length; i++) {
    const deltaDisplacement = Math.abs(lateralDisplacementsCm[i] - lateralDisplacementsCm[i - 1]);
    const storyHeightCm = storyHeightsM[i - 1] * 100;
    const drift = deltaDisplacement / storyHeightCm;
    driftRatios.push(drift);
  }

  const maxDrift = Math.max(...driftRatios);
  const parkAngIndex = Math.min(1.2, maxDrift / limit);

  return { maxDrift, parkAngIndex, isSafe: maxDrift <= limit };
}`,
    codeExplanation:
      'Iteramos piso por piso calculando la diferencia finita entre desplazamientos contiguos. Si la pendiente local (deriva) excede el umbral de ductilidad de la norma, marcamos el piso como zona de inicio de colapso progresivo.'
  }
];
