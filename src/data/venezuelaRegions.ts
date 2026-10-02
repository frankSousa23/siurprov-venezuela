import { VenezuelaRegion } from '../types';

export const VENEZUELA_REGIONS: VenezuelaRegion[] = [
  {
    id: 'caracas-vargas',
    name: 'Gran Caracas & Litoral Central (La Guaira)',
    state: 'Distrito Capital / La Guaira / Miranda',
    capitalCity: 'Caracas / Maiquetía',
    lat: 10.5000,
    lng: -66.9167,
    elevationM: 920,
    seismicZoneCOVENIN: 5, // A0 = 0.30g
    designAccelerationA0: 0.30,
    geologicalFault: {
      name: 'Sistema de Fallas San Sebastián - Ávila',
      system: 'Límite Transcurrente Placa Caribe - Placa Suramericana',
      type: 'Rumbo Dextral con componente normal en el frente montañoso',
      slipRateMmYear: 12.0,
      maxExpectedMagnitudeMw: 7.2,
      description:
        'Falla activa sismogénica que originó el devastador Terremoto de Caracas de 1967 (Mw 6.6) y los sismos históricos de 1812 y 1900. El valle de Caracas posee sedimentos aluviales profundos (>200m en Los Palos Grandes) con fuerte efecto de cuenca y amplificación espectral.'
    },
    defaultSoilProfile: 'S3',
    basinTorrencialRisk: 'Crítico',
    slopeRiskIndex: 'Crítico',
    description:
      'Cuenca intramontana densamente poblada flanqueada por la vertiente sur del Parque Nacional Waraira Repano y la vertiente norte que cae abruptamente al Mar Caribe en La Guaira. Alta concentración de asentamientos informales en laderas inestables y cuencas torrenciales de pendientes > 40°.',
    mapBiomasTimeSeries: [
      {
        year: 1985,
        forestCoverKm2: 780,
        urbanCoverKm2: 240,
        informalSlopeCoverKm2: 45,
        waterBodiesKm2: 15,
        agricultureKm2: 120,
        meanRunoffCoefficient: 0.38,
        averageSlopeDeg: 28,
        deforestationAccumulatedPercent: 0,
        urbanImperviousRatePercent: 24
      },
      {
        year: 1995,
        forestCoverKm2: 710,
        urbanCoverKm2: 320,
        informalSlopeCoverKm2: 95,
        waterBodiesKm2: 14,
        agricultureKm2: 85,
        meanRunoffCoefficient: 0.49,
        averageSlopeDeg: 29,
        deforestationAccumulatedPercent: 8.9,
        urbanImperviousRatePercent: 36
      },
      {
        year: 2005,
        forestCoverKm2: 660,
        urbanCoverKm2: 380,
        informalSlopeCoverKm2: 150,
        waterBodiesKm2: 12,
        agricultureKm2: 60,
        meanRunoffCoefficient: 0.58,
        averageSlopeDeg: 31,
        deforestationAccumulatedPercent: 15.4,
        urbanImperviousRatePercent: 47
      },
      {
        year: 2015,
        forestCoverKm2: 610,
        urbanCoverKm2: 430,
        informalSlopeCoverKm2: 195,
        waterBodiesKm2: 11,
        agricultureKm2: 45,
        meanRunoffCoefficient: 0.65,
        averageSlopeDeg: 33,
        deforestationAccumulatedPercent: 21.8,
        urbanImperviousRatePercent: 56
      },
      {
        year: 2023,
        forestCoverKm2: 565,
        urbanCoverKm2: 475,
        informalSlopeCoverKm2: 235,
        waterBodiesKm2: 10,
        agricultureKm2: 32,
        meanRunoffCoefficient: 0.72,
        averageSlopeDeg: 34,
        deforestationAccumulatedPercent: 27.6,
        urbanImperviousRatePercent: 64
      },
      {
        year: 2030,
        forestCoverKm2: 510,
        urbanCoverKm2: 515,
        informalSlopeCoverKm2: 270,
        waterBodiesKm2: 9,
        agricultureKm2: 22,
        meanRunoffCoefficient: 0.78,
        averageSlopeDeg: 35,
        deforestationAccumulatedPercent: 34.6,
        urbanImperviousRatePercent: 71
      },
      {
        year: 2040,
        forestCoverKm2: 440,
        urbanCoverKm2: 570,
        informalSlopeCoverKm2: 315,
        waterBodiesKm2: 8,
        agricultureKm2: 14,
        meanRunoffCoefficient: 0.84,
        averageSlopeDeg: 36,
        deforestationAccumulatedPercent: 43.6,
        urbanImperviousRatePercent: 79
      },
      {
        year: 2050,
        forestCoverKm2: 380,
        urbanCoverKm2: 620,
        informalSlopeCoverKm2: 355,
        waterBodiesKm2: 7,
        agricultureKm2: 8,
        meanRunoffCoefficient: 0.89,
        averageSlopeDeg: 37,
        deforestationAccumulatedPercent: 51.3,
        urbanImperviousRatePercent: 86
      }
    ],
    urbanSectors: [
      {
        id: 'sector-los-palos-grandes',
        name: 'Sector Valle Central (Chacao / Los Palos Grandes)',
        description: 'Zona de sedimentos aluvionales de gran espesor (180-240m). Alta densidad de torres residenciales y corporativas.',
        centerCoords: [10.496, -66.848],
        zoomLevel: 15,
        terrainType: 'Valle Aluvial',
        detectedBuildings: [
          {
            id: 'b-lpg-01',
            name: 'Torre Residencial Parque del Este',
            typeId: 'porticos-pre1982-nd1',
            x: 28,
            y: 42,
            elevationM: 885,
            slopeDeg: 4,
            distanceToFaultKm: 4.2,
            distanceToStreamM: 320,
            stories: 14,
            soilType: 'S3'
          },
          {
            id: 'b-lpg-02',
            name: 'Clínica Quirúrgica Metropolitana',
            typeId: 'hospital-infraestructura',
            x: 52,
            y: 35,
            elevationM: 890,
            slopeDeg: 5,
            distanceToFaultKm: 3.8,
            distanceToStreamM: 450,
            stories: 8,
            soilType: 'S3'
          },
          {
            id: 'b-lpg-03',
            name: 'Edificio San Francisco (Pórticos Dúctiles)',
            typeId: 'porticos-nd3-sismo',
            x: 68,
            y: 60,
            elevationM: 880,
            slopeDeg: 3,
            distanceToFaultKm: 4.5,
            distanceToStreamM: 180,
            stories: 10,
            soilType: 'S3'
          },
          {
            id: 'b-lpg-04',
            name: 'Puente Distribuidor Altamira',
            typeId: 'puente-vial',
            x: 45,
            y: 75,
            elevationM: 875,
            slopeDeg: 2,
            distanceToFaultKm: 5.0,
            distanceToStreamM: 30,
            stories: 1,
            soilType: 'S3'
          }
        ],
        suggestions: [
          {
            id: 'sug-car-01',
            level: 'Macro',
            title: 'Control Estricto de Altura por Resonancia con Suelo S3',
            category: 'Zonificación',
            description: 'En el sector Los Palos Grandes, el espesor de sedimentos aluvionales (período Ts = 0.9s - 1.2s) entra en resonancia con edificios de 10 a 16 pisos. Toda nueva construcción en esta franja debe requerir análisis modal espectral riguroso y aislamiento de base.',
            priority: 'Crítica',
            affectedArea: 'Valle de Caracas entre Chacao y Sucre',
            estimatedCostBenefit: 'Evita pérdidas de vidas masivas ante sismo de foco superficial'
          },
          {
            id: 'sug-car-02',
            level: 'Micro',
            title: 'Rigidización de Plantas Bajas Libres de Estacionamiento',
            category: 'Ingeniería Civil',
            description: 'Insertar diagonales concéntricas de acero o muros de cortante en los edificios pre-1982 del sector para neutralizar la vulnerabilidad de piso blando.',
            priority: 'Alta',
            affectedArea: 'Edificaciones residenciales construidas antes de 1982',
            estimatedCostBenefit: 'Costo ~8% del valor del inmueble, aumenta 300% la resistencia sísmica'
          }
        ]
      },
      {
        id: 'sector-petare-avila',
        name: 'Sector Ladera Norte / Petare & Macarao',
        description: 'Laderas de alta pendiente (28° - 45°) con predominio de autoconstrucción informal sobre lechos torrenciales y rellenos no confinados.',
        centerCoords: [10.485, -66.812],
        zoomLevel: 15,
        terrainType: 'Ladra Escarpada',
        detectedBuildings: [
          {
            id: 'b-pet-01',
            name: 'Manzana Popular 12 (Cerro La Cruz)',
            typeId: 'autoconstruccion-ladera',
            x: 35,
            y: 30,
            elevationM: 1040,
            slopeDeg: 38,
            distanceToFaultKm: 2.1,
            distanceToStreamM: 40,
            stories: 4,
            soilType: 'S2'
          },
          {
            id: 'b-pet-02',
            name: 'Escuela Comunitaria Fe y Alegría',
            typeId: 'mamposteria-confinada',
            x: 60,
            y: 45,
            elevationM: 980,
            slopeDeg: 18,
            distanceToFaultKm: 2.8,
            distanceToStreamM: 120,
            stories: 3,
            soilType: 'S2'
          },
          {
            id: 'b-pet-03',
            name: 'Asentamiento Espontáneo Quebrada Bote',
            typeId: 'autoconstruccion-ladera',
            x: 22,
            y: 65,
            elevationM: 950,
            slopeDeg: 42,
            distanceToFaultKm: 2.5,
            distanceToStreamM: 15,
            stories: 5,
            soilType: 'S3'
          }
        ],
        suggestions: [
          {
            id: 'sug-pet-01',
            level: 'Macro',
            title: 'Delimitación de Franja No-Edificable en Cauces Torrenciales',
            category: 'Zonificación',
            description: 'Declarar faja de protección absoluta de 30 metros a cada margen de las quebradas de drenaje del Ávila para evitar tragedias por aluvión tipo 1999.',
            priority: 'Crítica',
            affectedArea: 'Cuencas torrenciales de la vertiente sur del Ávila',
            estimatedCostBenefit: 'Mitigación de riesgo de aluvión para más de 12.000 habitantes'
          },
          {
            id: 'sug-pet-02',
            level: 'Micro',
            title: 'Muros de Gaviones y Anclajes en Taludes Habitados',
            category: 'Mitigación Hidráulica',
            description: 'Instalar pantallas escalonadas de gaviones con lloraderos para drenar la presión intersticial de agua generada por lluvias intensas.',
            priority: 'Alta',
            affectedArea: 'Laderas con pendientes mayores a 30°',
            estimatedCostBenefit: 'Evita deslizamientos masivos en temporada de lluvias'
          }
        ]
      }
    ],
    historicalEvents: [
      {
        year: 1999,
        title: 'Tragedia de Vargas (Aluvión & Deslaves Masivos)',
        type: 'Aluvión / Deslave',
        impact: 'Más de 10.000 fallecidos, colapso de 8.000 viviendas y destrucción de infraestructura costera.',
        engineeringLessons:
          'Inadecuado uso de la tierra en conos de deyección y abanicos aluviales; la deforestación y ocupación no planificada eliminaron la retención natural. Se demostró la imperiosa necesidad de obras de control de torrentes (presas de retención de sedimentos) y restricción legal de fajas de protección de quebradas.'
      },
      {
        year: 1967,
        title: 'Terremoto Cuatricentenario de Caracas (Mw 6.6)',
        type: 'Sismo',
        impact: 'Colapso de 4 edificios de más de 10 pisos en Los Palos Grandes (Neverí, Palace Corvin, San José, Mijagual), 236 fallecidos.',
        engineeringLessons:
          'Demostró el efecto de resonancia y amplificación dinámica por espesor de sedimentos aluviales (S3/S4) coincidiendo con períodos fundamentales de edificios altos. Impulsó la creación de FUNVISIS y la renovación integral de la norma COVENIN 1756.'
      }
    ],
    criticalInfrastructure: {
      hospitals: 24,
      civilProtectionStations: 18,
      fireStations: 22,
      mainEvacuationArteries: [
        'Autopista Regional del Centro (ARC)',
        'Autopista Caracas - La Guaira',
        'Distribuidor Boyacá (Cota Mil)',
        'Autopista Gran Cacique Guaicaipuro (Francisco Fajardo)'
      ]
    }
  },
  {
    id: 'merida-andes',
    name: 'Cordillera de Los Andes (Mérida & Táchira)',
    state: 'Mérida / Táchira',
    capitalCity: 'Mérida / San Cristóbal',
    lat: 8.5983,
    lng: -71.1450,
    elevationM: 1630,
    seismicZoneCOVENIN: 6, // A0 = 0.35g
    designAccelerationA0: 0.35,
    geologicalFault: {
      name: 'Falla Transcurrente de Boconó',
      system: 'Mega-falla tectónica de rumbo suroeste-noreste',
      type: 'Rumbo Dextral transpresivo con levantamiento orogénico',
      slipRateMmYear: 9.0,
      maxExpectedMagnitudeMw: 7.6,
      description:
        'Eje sismogénico principal del occidente venezolano que atraviesa longitudinalmente toda la cordillera andina. Produce valles de trinchera estrechos donde se asientan las principales ciudades andinas.'
    },
    defaultSoilProfile: 'S2',
    basinTorrencialRisk: 'Alto',
    slopeRiskIndex: 'Crítico',
    description:
      'Topografía de vertientes escarpadas (25° a 50°), terrazas aluvionales escalonadas por fallamiento activo y ríos torrenciales (Río Chama, Albarregas, Mucujún). Marcada susceptibilidad a sismos de foco superficial y movimientos en masa disparados por saturación.',
    mapBiomasTimeSeries: [
      {
        year: 1985,
        forestCoverKm2: 950,
        urbanCoverKm2: 60,
        informalSlopeCoverKm2: 12,
        waterBodiesKm2: 25,
        agricultureKm2: 240,
        meanRunoffCoefficient: 0.32,
        averageSlopeDeg: 34,
        deforestationAccumulatedPercent: 0,
        urbanImperviousRatePercent: 12
      },
      {
        year: 2005,
        forestCoverKm2: 830,
        urbanCoverKm2: 125,
        informalSlopeCoverKm2: 42,
        waterBodiesKm2: 22,
        agricultureKm2: 210,
        meanRunoffCoefficient: 0.46,
        averageSlopeDeg: 36,
        deforestationAccumulatedPercent: 12.6,
        urbanImperviousRatePercent: 28
      },
      {
        year: 2023,
        forestCoverKm2: 720,
        urbanCoverKm2: 185,
        informalSlopeCoverKm2: 78,
        waterBodiesKm2: 18,
        agricultureKm2: 175,
        meanRunoffCoefficient: 0.59,
        averageSlopeDeg: 38,
        deforestationAccumulatedPercent: 24.2,
        urbanImperviousRatePercent: 44
      },
      {
        year: 2035,
        forestCoverKm2: 630,
        urbanCoverKm2: 230,
        informalSlopeCoverKm2: 110,
        waterBodiesKm2: 16,
        agricultureKm2: 145,
        meanRunoffCoefficient: 0.69,
        averageSlopeDeg: 40,
        deforestationAccumulatedPercent: 33.7,
        urbanImperviousRatePercent: 57
      },
      {
        year: 2050,
        forestCoverKm2: 520,
        urbanCoverKm2: 290,
        informalSlopeCoverKm2: 155,
        waterBodiesKm2: 14,
        agricultureKm2: 110,
        meanRunoffCoefficient: 0.81,
        averageSlopeDeg: 42,
        deforestationAccumulatedPercent: 45.3,
        urbanImperviousRatePercent: 72
      }
    ],
    urbanSectors: [
      {
        id: 'sector-chama-terrazas',
        name: 'Sector Meseta de Mérida & Cañón del Chama',
        description: 'Terraza aluvial colgada sobre el cañón del río Chama flanqueada por la traza activa de la Falla de Boconó.',
        centerCoords: [8.595, -71.140],
        zoomLevel: 15,
        terrainType: 'Terraza Tectónica',
        detectedBuildings: [
          {
            id: 'b-mer-01',
            name: 'Hospital Universitario de Los Andes (HULA)',
            typeId: 'hospital-infraestructura',
            x: 40,
            y: 35,
            elevationM: 1620,
            slopeDeg: 8,
            distanceToFaultKm: 1.5,
            distanceToStreamM: 600,
            stories: 9,
            soilType: 'S2'
          },
          {
            id: 'b-mer-02',
            name: 'Edificio Residencial Las Américas',
            typeId: 'porticos-nd3-sismo',
            x: 65,
            y: 50,
            elevationM: 1640,
            slopeDeg: 12,
            distanceToFaultKm: 2.2,
            distanceToStreamM: 350,
            stories: 7,
            soilType: 'S2'
          },
          {
            id: 'b-mer-03',
            name: 'Puente La Pedregosa (Cruce Torrencial)',
            typeId: 'puente-vial',
            x: 30,
            y: 70,
            elevationM: 1590,
            slopeDeg: 15,
            distanceToFaultKm: 1.8,
            distanceToStreamM: 0,
            stories: 1,
            soilType: 'S2'
          }
        ],
        suggestions: [
          {
            id: 'sug-mer-01',
            level: 'Macro',
            title: 'Prohibición de Edificación sobre Traza Superficial Falla de Boconó',
            category: 'Zonificación',
            description: 'Establecer buffer geotécnico de 100 metros a cada lado de la traza de ruptura superficial activa de la falla para evitar cortante directo en fundaciones.',
            priority: 'Crítica',
            affectedArea: 'Corredor longitudinal del valle del Chama',
            estimatedCostBenefit: 'Impediría el colapso instantáneo de infraestructura clave'
          },
          {
            id: 'sug-mer-02',
            level: 'Micro',
            title: 'Sistemas de Drenaje Subterráneo en Terrazas de Tovar',
            category: 'MapBiomas & Reforestación',
            description: 'Recuperar cobertura boscosa en cabeceras de cuenca para reducir el volumen sólido de aluvión que alimenta el Valle del Mocotíes.',
            priority: 'Alta',
            affectedArea: 'Cuencas altas de Tovar y Zea',
            estimatedCostBenefit: 'Reduce 45% la fuerza hidrodinámica de deslaves'
          }
        ]
      }
    ],
    historicalEvents: [
      {
        year: 1894,
        title: 'El Gran Sismo de Los Andes (Mw 7.3)',
        type: 'Sismo',
        impact: 'Destrucción casi total de Santa Cruz de Mora, Zea, Mérida y Tovar. Ruptura superficial en la falla de Boconó.',
        engineeringLessons:
          'Puso en evidencia la total fragilidad de edificaciones de tapia pisada y adobe ante aceleraciones sísmicas horizontales superiores a 0.35g sin arriostramiento perimetral.'
      },
      {
        year: 2021,
        title: 'Deslave del Valle del Mocotíes (Tovar)',
        type: 'Aluvión / Deslave',
        impact: '20 fallecidos, desbordamiento de ríos tributarios, enterramiento de viviendas con 3 metros de lodo.',
        engineeringLessons:
          'Deforestación de cabeceras para agricultura de ladera sin terrazas incrementa en un 300% el volumen sólido transportado por avenidas torrenciales.'
      }
    ],
    criticalInfrastructure: {
      hospitals: 8,
      civilProtectionStations: 9,
      fireStations: 7,
      mainEvacuationArteries: [
        'Troncal 007 (Carretera Trasandina)',
        'Troncal 001 (Panamericana)',
        'Avenida Las Américas',
        'Avenida Los Próceres'
      ]
    }
  },
  {
    id: 'las-tejerias-aragua',
    name: 'Las Tejerías & Eje Central (Aragua)',
    state: 'Aragua',
    capitalCity: 'Las Tejerías / Maracay',
    lat: 10.2522,
    lng: -67.1736,
    elevationM: 520,
    seismicZoneCOVENIN: 5,
    designAccelerationA0: 0.30,
    geologicalFault: {
      name: 'Falla de La Victoria',
      system: 'Falla de Rumbo Este-Oeste del Sistema de la Cordillera de la Costa',
      type: 'Transcurrente Dextral',
      slipRateMmYear: 4.5,
      maxExpectedMagnitudeMw: 6.8,
      description:
        'Falla activa que delimita la fosa tectónica de La Victoria y el río Aragua. Condiciona estrechos cañones de descarga hacia el fondo del valle.'
    },
    defaultSoilProfile: 'S3',
    basinTorrencialRisk: 'Crítico',
    slopeRiskIndex: 'Crítico',
    description:
      'Gargantas estrechas de drenaje torrencial con nacientes en el Parque Nacional Henri Pittier y cerros de Aragua. Cuencas de rápida respuesta hidrológica (tiempo de concentración menor a 40 minutos) con pendientes superiores al 45% en cabeceras.',
    mapBiomasTimeSeries: [
      {
        year: 1985,
        forestCoverKm2: 420,
        urbanCoverKm2: 35,
        informalSlopeCoverKm2: 6,
        waterBodiesKm2: 8,
        agricultureKm2: 95,
        meanRunoffCoefficient: 0.30,
        averageSlopeDeg: 30,
        deforestationAccumulatedPercent: 0,
        urbanImperviousRatePercent: 14
      },
      {
        year: 2005,
        forestCoverKm2: 340,
        urbanCoverKm2: 78,
        informalSlopeCoverKm2: 28,
        waterBodiesKm2: 7,
        agricultureKm2: 82,
        meanRunoffCoefficient: 0.52,
        averageSlopeDeg: 32,
        deforestationAccumulatedPercent: 19.0,
        urbanImperviousRatePercent: 38
      },
      {
        year: 2023,
        forestCoverKm2: 260,
        urbanCoverKm2: 120,
        informalSlopeCoverKm2: 64,
        waterBodiesKm2: 6,
        agricultureKm2: 65,
        meanRunoffCoefficient: 0.74,
        averageSlopeDeg: 35,
        deforestationAccumulatedPercent: 38.1,
        urbanImperviousRatePercent: 62
      },
      {
        year: 2040,
        forestCoverKm2: 185,
        urbanCoverKm2: 165,
        informalSlopeCoverKm2: 98,
        waterBodiesKm2: 5,
        agricultureKm2: 45,
        meanRunoffCoefficient: 0.86,
        averageSlopeDeg: 38,
        deforestationAccumulatedPercent: 55.9,
        urbanImperviousRatePercent: 78
      },
      {
        year: 2050,
        forestCoverKm2: 130,
        urbanCoverKm2: 195,
        informalSlopeCoverKm2: 125,
        waterBodiesKm2: 4,
        agricultureKm2: 28,
        meanRunoffCoefficient: 0.91,
        averageSlopeDeg: 40,
        deforestationAccumulatedPercent: 69.0,
        urbanImperviousRatePercent: 88
      }
    ],
    urbanSectors: [
      {
        id: 'sector-quebrada-los-patos',
        name: 'Sector Casco Urbano & Quebrada Los Patos',
        description: 'Cono de deyección torrencial densamente urbanizado con galpones y viviendas sobre el curso de descarga.',
        centerCoords: [10.250, -67.170],
        zoomLevel: 16,
        terrainType: 'Ladra Escarpada',
        detectedBuildings: [
          {
            id: 'b-tej-01',
            name: 'Complejo Industrial y Galpones Tejerías',
            typeId: 'porticos-nd3-sismo',
            x: 50,
            y: 55,
            elevationM: 510,
            slopeDeg: 12,
            distanceToFaultKm: 1.2,
            distanceToStreamM: 25,
            stories: 2,
            soilType: 'S3'
          },
          {
            id: 'b-tej-02',
            name: 'Viviendas Sector El Béisbol',
            typeId: 'autoconstruccion-ladera',
            x: 25,
            y: 40,
            elevationM: 540,
            slopeDeg: 35,
            distanceToFaultKm: 0.8,
            distanceToStreamM: 10,
            stories: 3,
            soilType: 'S3'
          },
          {
            id: 'b-tej-03',
            name: 'Liceo Nacional Sergio Medina',
            typeId: 'mamposteria-confinada',
            x: 72,
            y: 35,
            elevationM: 525,
            slopeDeg: 10,
            distanceToFaultKm: 1.5,
            distanceToStreamM: 180,
            stories: 2,
            soilType: 'S3'
          }
        ],
        suggestions: [
          {
            id: 'sug-tej-01',
            level: 'Macro',
            title: 'Ampliación de Sección Hidráulica de Puentes en la ARC',
            category: 'Mitigación Hidráulica',
            description: 'Rediseñar las luces de paso bajo la Autopista Regional del Centro para admitir avenidas de detritos de 250 m³/s con bloques de hasta 2 metros de diámetro.',
            priority: 'Crítica',
            affectedArea: 'Pasos de quebradas sobre la ARC',
            estimatedCostBenefit: 'Evita represamientos y desbordamientos catastróficos'
          },
          {
            id: 'sug-tej-02',
            level: 'Micro',
            title: 'Construcción de Presas Filtrantes Tipo Sabo en Cabecera',
            category: 'Ingeniería Civil',
            description: 'Implantar presas ranuradas de acero y concreto armado aguas arriba para frenar peñones antes de alcanzar el área urbana.',
            priority: 'Crítica',
            affectedArea: 'Garganta de la Quebrada Los Patos',
            estimatedCostBenefit: 'Retiene el 70% del material grueso transportado'
          }
        ]
      }
    ],
    historicalEvents: [
      {
        year: 2022,
        title: 'Aluvión de Las Tejerías (Quebrada Los Patos)',
        type: 'Aluvión / Deslave',
        impact: '54 víctimas mortales, arrastre masivo de rocas de hasta 3 metros de diámetro y colapso de la zona industrial y comercial.',
        engineeringLessons:
          'Saturación previa del suelo por lluvias continuas de días anteriores provocó que un evento de 100 mm detonara el colapso en cadena de 5 microcuencas. El caudal pico superó 10 veces la sección hidráulica de los cajones de paso de la vía principal.'
      }
    ],
    criticalInfrastructure: {
      hospitals: 4,
      civilProtectionStations: 5,
      fireStations: 4,
      mainEvacuationArteries: [
        'Autopista Regional del Centro (ARC)',
        'Carretera Panamericana Tramo Aragua',
        'Avenida Bolívar de Tejerías'
      ]
    }
  },
  {
    id: 'zulia-maracaibo',
    name: 'Costa Oriental del Lago & Maracaibo (Zulia)',
    state: 'Zulia',
    capitalCity: 'Maracaibo / Cabimas / Lagunillas',
    lat: 10.6544,
    lng: -71.6078,
    elevationM: 6,
    seismicZoneCOVENIN: 3, // A0 = 0.20g
    designAccelerationA0: 0.20,
    geologicalFault: {
      name: 'Sistema de Fallas Oca-Ancón & Icotea',
      system: 'Falla Transcurrente de Oca-Ancón (Extremo Noroccidental)',
      type: 'Rumbo Dextral de alto ángulo',
      slipRateMmYear: 2.0,
      maxExpectedMagnitudeMw: 6.5,
      description:
        'Estructura que atraviesa el norte del estado Zulia. En la Costa Oriental (Tía Juana, Lagunillas, Bachaquero), el principal fenómeno es la subsidencia del terreno por compactación de sedimentos y extracción de hidrocarburos, creando una depresión bajo el nivel del lago de hasta -5 metros.'
    },
    defaultSoilProfile: 'S4',
    basinTorrencialRisk: 'Medio',
    slopeRiskIndex: 'Bajo',
    description:
      'Planicie costera lacustre y suelos aluviales saturados con nivel freático a flor de tierra (0.5 a 1.5 m). Existencia de diques costeros de protección para contener el Lago de Maracaibo. Suelos arcillosos altamente compresibles y arenas finas con altísimo potencial de licuefacción sísmica.',
    mapBiomasTimeSeries: [
      {
        year: 1985,
        forestCoverKm2: 850,
        urbanCoverKm2: 310,
        informalSlopeCoverKm2: 15,
        waterBodiesKm2: 450,
        agricultureKm2: 600,
        meanRunoffCoefficient: 0.40,
        averageSlopeDeg: 4,
        deforestationAccumulatedPercent: 0,
        urbanImperviousRatePercent: 28
      },
      {
        year: 2005,
        forestCoverKm2: 520,
        urbanCoverKm2: 520,
        informalSlopeCoverKm2: 55,
        waterBodiesKm2: 440,
        agricultureKm2: 710,
        meanRunoffCoefficient: 0.58,
        averageSlopeDeg: 4,
        deforestationAccumulatedPercent: 38.8,
        urbanImperviousRatePercent: 52
      },
      {
        year: 2023,
        forestCoverKm2: 340,
        urbanCoverKm2: 690,
        informalSlopeCoverKm2: 95,
        waterBodiesKm2: 430,
        agricultureKm2: 780,
        meanRunoffCoefficient: 0.75,
        averageSlopeDeg: 4,
        deforestationAccumulatedPercent: 60.0,
        urbanImperviousRatePercent: 68
      },
      {
        year: 2040,
        forestCoverKm2: 210,
        urbanCoverKm2: 840,
        informalSlopeCoverKm2: 130,
        waterBodiesKm2: 420,
        agricultureKm2: 810,
        meanRunoffCoefficient: 0.85,
        averageSlopeDeg: 4,
        deforestationAccumulatedPercent: 75.3,
        urbanImperviousRatePercent: 81
      }
    ],
    urbanSectors: [
      {
        id: 'sector-costa-oriental-dique',
        name: 'Sector Lagunillas & Franja del Dique Costero',
        description: 'Terrenos ubicados hasta 5 metros por debajo del nivel del Lago de Maracaibo, resguardados por diques de tierra compactada.',
        centerCoords: [10.13, -71.25],
        zoomLevel: 15,
        terrainType: 'Llanura Costera',
        detectedBuildings: [
          {
            id: 'b-zul-01',
            name: 'Hospital Pedro García Clara (Ciudad Ojeda)',
            typeId: 'hospital-infraestructura',
            x: 60,
            y: 40,
            elevationM: 4,
            slopeDeg: 1,
            distanceToFaultKm: 8.5,
            distanceToStreamM: 800,
            stories: 6,
            soilType: 'S4'
          },
          {
            id: 'b-zul-02',
            name: 'Dique Costero de Contención (Muro de Tierra)',
            typeId: 'puente-vial',
            x: 20,
            y: 50,
            elevationM: 2,
            slopeDeg: 5,
            distanceToFaultKm: 9.0,
            distanceToStreamM: 0,
            stories: 1,
            soilType: 'S4'
          },
          {
            id: 'b-zul-03',
            name: 'Urbanismo Residencial Tasajeras',
            typeId: 'mamposteria-confinada',
            x: 45,
            y: 65,
            elevationM: -2,
            slopeDeg: 0,
            distanceToFaultKm: 7.2,
            distanceToStreamM: 1200,
            stories: 2,
            soilType: 'S4'
          }
        ],
        suggestions: [
          {
            id: 'sug-zul-01',
            level: 'Macro',
            title: 'Control Permanente de Subsidencia por InSAR Satelital',
            category: 'Zonificación',
            description: 'Monitorear la tasa de hundimiento anual (-2 a -6 cm/año) para sobreelevar oportunamente los diques y recalcular estaciones de bombeo de aguas de lluvia.',
            priority: 'Crítica',
            affectedArea: 'Tía Juana, Lagunillas y Bachaquero',
            estimatedCostBenefit: 'Evita la inundación permanente de más de 80 km² urbanizados'
          },
          {
            id: 'sug-zul-02',
            level: 'Micro',
            title: 'Cimentaciones con Pilotes Profundos contra Licuefacción',
            category: 'Ingeniería Civil',
            description: 'Prohibir zapatas aisladas en suelos S4 saturados; toda edificación debe apoyar en estratos competentes a más de 18 metros.',
            priority: 'Alta',
            affectedArea: 'Todo el sector costero lacustre',
            estimatedCostBenefit: 'Evita vuelco y asentamientos diferenciales catastróficos'
          }
        ]
      }
    ],
    historicalEvents: [
      {
        year: 1939,
        title: 'Incendio y Subsidencia de Lagunillas de Agua',
        type: 'Subsidencia',
        impact: 'Colapso de estructuras palafíticas lacustres y necesidad de construcción del dique costero de protección.',
        engineeringLessons:
          'La subsidencia del terreno por compactación de estratos arcillosos blandos (S4) exige monitoreo continuo por radar interferométrico (InSAR) y sistemas redundantes de bombeo de drenaje para evitar inundación permanente del área urbana.'
      }
    ],
    criticalInfrastructure: {
      hospitals: 16,
      civilProtectionStations: 12,
      fireStations: 14,
      mainEvacuationArteries: [
        'Puente General Rafael Urdaneta (Puente sobre el Lago)',
        'Carretera Lara - Zulia',
        'Troncal 006 (Machiques - Colón)',
        'Avenida Intercomunal de la Costa Oriental'
      ]
    }
  },
  {
    id: 'sucre-cariaco',
    name: 'Golfo de Cariaco & Cumaná (Sucre)',
    state: 'Sucre',
    capitalCity: 'Cumaná / Cariaco',
    lat: 10.4539,
    lng: -64.1826,
    elevationM: 12,
    seismicZoneCOVENIN: 7, // A0 = 0.40g (Máxima sismicidad en Venezuela)
    designAccelerationA0: 0.40,
    geologicalFault: {
      name: 'Falla Sismogénica de El Pilar',
      system: 'Falla Transcurrente de Rumbo Este-Oeste',
      type: 'Dextral pura con traza subaérea y submarina en el Golfo de Cariaco',
      slipRateMmYear: 14.0,
      maxExpectedMagnitudeMw: 7.7,
      description:
        'La falla con mayor tasa de deformación de Venezuela. Concentra la mayor sismicidad histórica documentada (sismos de 1530, 1853, 1929 y 1997). Cruza directamente poblados urbanos.'
    },
    defaultSoilProfile: 'S4',
    basinTorrencialRisk: 'Medio',
    slopeRiskIndex: 'Medio',
    description:
      'Llanura aluvial costera y deltaica del río Manzanares y llanura de Cariaco. Sedimentos saturados no consolidados con altísima propensión a la licuefacción de suelos, oscilación de agua subterránea y tsunamis locales en el golfo.',
    mapBiomasTimeSeries: [
      {
        year: 1985,
        forestCoverKm2: 600,
        urbanCoverKm2: 80,
        informalSlopeCoverKm2: 10,
        waterBodiesKm2: 120,
        agricultureKm2: 180,
        meanRunoffCoefficient: 0.35,
        averageSlopeDeg: 12,
        deforestationAccumulatedPercent: 0,
        urbanImperviousRatePercent: 18
      },
      {
        year: 2005,
        forestCoverKm2: 490,
        urbanCoverKm2: 140,
        informalSlopeCoverKm2: 35,
        waterBodiesKm2: 115,
        agricultureKm2: 190,
        meanRunoffCoefficient: 0.50,
        averageSlopeDeg: 14,
        deforestationAccumulatedPercent: 18.3,
        urbanImperviousRatePercent: 35
      },
      {
        year: 2023,
        forestCoverKm2: 380,
        urbanCoverKm2: 210,
        informalSlopeCoverKm2: 65,
        waterBodiesKm2: 110,
        agricultureKm2: 195,
        meanRunoffCoefficient: 0.66,
        averageSlopeDeg: 16,
        deforestationAccumulatedPercent: 36.6,
        urbanImperviousRatePercent: 54
      },
      {
        year: 2040,
        forestCoverKm2: 280,
        urbanCoverKm2: 275,
        informalSlopeCoverKm2: 95,
        waterBodiesKm2: 105,
        agricultureKm2: 185,
        meanRunoffCoefficient: 0.79,
        averageSlopeDeg: 18,
        deforestationAccumulatedPercent: 53.3,
        urbanImperviousRatePercent: 68
      }
    ],
    urbanSectors: [
      {
        id: 'sector-cariaco-centro',
        name: 'Sector Casco Urbano de Cariaco & Franja de Falla',
        description: 'Población atravesada de este a oeste por la traza superficial de la Falla de El Pilar sobre sedimentos marinos y aluviales blandos.',
        centerCoords: [10.495, -63.550],
        zoomLevel: 16,
        terrainType: 'Valle Aluvial',
        detectedBuildings: [
          {
            id: 'b-car-01',
            name: 'Liceo Raimundo Martínez Centeno (Reconstruido ND3)',
            typeId: 'hospital-infraestructura',
            x: 35,
            y: 40,
            elevationM: 15,
            slopeDeg: 2,
            distanceToFaultKm: 0.3,
            distanceToStreamM: 400,
            stories: 3,
            soilType: 'S4'
          },
          {
            id: 'b-car-02',
            name: 'Viviendas Tradicionales Calle Comercio',
            typeId: 'mamposteria-confinada',
            x: 58,
            y: 50,
            elevationM: 14,
            slopeDeg: 1,
            distanceToFaultKm: 0.1,
            distanceToStreamM: 600,
            stories: 1,
            soilType: 'S4'
          }
        ],
        suggestions: [
          {
            id: 'sug-car-01',
            level: 'Macro',
            title: 'Zona Sísmica 7: Nivel de Diseño 3 (ND3) Obligatorio',
            category: 'Ingeniería Civil',
            description: 'En el estado Sucre rige la aceleración horizontal más alta del país (A0 = 0.40g). Todo proyecto debe cumplir diseño por capacidad y confinamiento estricto.',
            priority: 'Crítica',
            affectedArea: 'Cariaco, Cumaná, Casanay y Carúpano',
            estimatedCostBenefit: 'Evita fallas catastróficas por cortante en columnas'
          },
          {
            id: 'sug-car-02',
            level: 'Micro',
            title: 'Erradicación del Efecto Columna Corta en Escuelas',
            category: 'Ingeniería Civil',
            description: 'Separar paredes de mampostería de las columnas estructurales mediante juntas elásticas de poliestireno para evitar la concentración frágil de cortante que colapsó las escuelas en 1997.',
            priority: 'Crítica',
            affectedArea: 'Infraestructura educativa de todo el estado Sucre',
            estimatedCostBenefit: 'Costo marginal en construcción nueva, salva cientos de vidas'
          }
        ]
      }
    ],
    historicalEvents: [
      {
        year: 1997,
        title: 'Terremoto de Cariaco (Mw 6.9)',
        type: 'Sismo',
        impact: 'Colapso de 2 escuelas públicas (Liceo Raimundo Martínez Centeno y Escuela Valentín Valiente), 73 fallecidos.',
        engineeringLessons:
          'Efecto catastrófico de la columna corta producida por paredes de antepecho adosadas a las columnas sin junta de dilatación sísmica. La rotura frágil por cortante en columnas causó el aplastamiento tipo panqueca de varios niveles educativos.'
      }
    ],
    criticalInfrastructure: {
      hospitals: 6,
      civilProtectionStations: 7,
      fireStations: 6,
      mainEvacuationArteries: [
        'Troncal 009 (Cumaná - Puerto La Cruz / Carúpano)',
        'Troncal 010 (Cariaco - Casanay)',
        'Avenida Universidad de Cumaná'
      ]
    }
  },
  {
    id: 'carabobo-valencia',
    name: 'Región Central & Litoral (Valencia / Puerto Cabello)',
    state: 'Carabobo',
    capitalCity: 'Valencia / Puerto Cabello',
    lat: 10.1620,
    lng: -68.0077,
    elevationM: 490,
    seismicZoneCOVENIN: 5,
    designAccelerationA0: 0.30,
    geologicalFault: {
      name: 'Sistema de Fallas de Morón & La Victoria',
      system: 'Falla Transcurrente de Morón (Litoral de Carabobo)',
      type: 'Rumbo Dextral y Falla Inversa en estribaciones',
      slipRateMmYear: 6.0,
      maxExpectedMagnitudeMw: 7.0,
      description:
        'Falla activa costera que delimita la cuenca de Puerto Cabello y se conecta con la Falla de La Victoria. Influye en la cuenca endorreica del Lago de Valencia.'
    },
    defaultSoilProfile: 'S3',
    basinTorrencialRisk: 'Alto',
    slopeRiskIndex: 'Alto',
    description:
      'Gran centro industrial del país flanqueado por la Sierra de San Ildefonso y la cuenca del Lago de Valencia. Zonas de suelos aluviales compresibles y áreas industriales costeras susceptibles a licuefacción y anegamiento.',
    mapBiomasTimeSeries: [
      {
        year: 1985,
        forestCoverKm2: 680,
        urbanCoverKm2: 210,
        informalSlopeCoverKm2: 25,
        waterBodiesKm2: 280,
        agricultureKm2: 320,
        meanRunoffCoefficient: 0.36,
        averageSlopeDeg: 22,
        deforestationAccumulatedPercent: 0,
        urbanImperviousRatePercent: 26
      },
      {
        year: 2005,
        forestCoverKm2: 540,
        urbanCoverKm2: 350,
        informalSlopeCoverKm2: 85,
        waterBodiesKm2: 290,
        agricultureKm2: 250,
        meanRunoffCoefficient: 0.55,
        averageSlopeDeg: 24,
        deforestationAccumulatedPercent: 20.5,
        urbanImperviousRatePercent: 48
      },
      {
        year: 2023,
        forestCoverKm2: 410,
        urbanCoverKm2: 490,
        informalSlopeCoverKm2: 160,
        waterBodiesKm2: 300,
        agricultureKm2: 160,
        meanRunoffCoefficient: 0.73,
        averageSlopeDeg: 26,
        deforestationAccumulatedPercent: 39.7,
        urbanImperviousRatePercent: 68
      },
      {
        year: 2040,
        forestCoverKm2: 300,
        urbanCoverKm2: 610,
        informalSlopeCoverKm2: 230,
        waterBodiesKm2: 310,
        agricultureKm2: 70,
        meanRunoffCoefficient: 0.86,
        averageSlopeDeg: 28,
        deforestationAccumulatedPercent: 55.8,
        urbanImperviousRatePercent: 82
      }
    ],
    urbanSectors: [
      {
        id: 'sector-valencia-norte',
        name: 'Sector Zona Industrial & Valle de Valencia',
        description: 'Concentración de plantas industriales, almacenes y urbanismos sobre sedimentos lacustres aluviales del Lago de Valencia.',
        centerCoords: [10.18, -67.98],
        zoomLevel: 15,
        terrainType: 'Valle Aluvial',
        detectedBuildings: [
          {
            id: 'b-val-01',
            name: 'Complejo Industrial Metalmecánico Guacara',
            typeId: 'porticos-nd3-sismo',
            x: 45,
            y: 50,
            elevationM: 450,
            slopeDeg: 3,
            distanceToFaultKm: 5.5,
            distanceToStreamM: 300,
            stories: 2,
            soilType: 'S3'
          },
          {
            id: 'b-val-02',
            name: 'Ciudad Hospitalaria Dr. Enrique Tejera (CHET)',
            typeId: 'hospital-infraestructura',
            x: 65,
            y: 35,
            elevationM: 480,
            slopeDeg: 5,
            distanceToFaultKm: 4.2,
            distanceToStreamM: 500,
            stories: 7,
            soilType: 'S3'
          }
        ],
        suggestions: [
          {
            id: 'sug-val-01',
            level: 'Macro',
            title: 'Manejo de Cota Máxima del Lago de Valencia',
            category: 'Mitigación Hidráulica',
            description: 'Restringir nuevas construcciones por debajo de la cota 412 msnm para prevenir anegamientos recurrentes en el sur de Valencia y Maracay.',
            priority: 'Crítica',
            affectedArea: 'Ribera sur del Lago de Valencia',
            estimatedCostBenefit: 'Protege a más de 35.000 residentes'
          }
        ]
      }
    ],
    historicalEvents: [
      {
        year: 2012,
        title: 'Crecida Extrema del Lago de Valencia',
        type: 'Inundación',
        impact: 'Anegamiento de urbanismos consolidados (La Punta, Mata Redonda), evacuación de 4.000 familias.',
        engineeringLessons:
          'La naturaleza endorreica de la cuenca exige control estricto de aportes de aguas servidas y prohibición de construcción en cotas bajas.'
      }
    ],
    criticalInfrastructure: {
      hospitals: 14,
      civilProtectionStations: 10,
      fireStations: 11,
      mainEvacuationArteries: [
        'Autopista Regional del Centro (Tramo Carabobo)',
        'Autopista Valencia - Puerto Cabello',
        'Avenida Bolívar Norte'
      ]
    }
  },
  {
    id: 'lara-barquisimeto',
    name: 'Región Centro-Occidental (Barquisimeto / Carora)',
    state: 'Lara',
    capitalCity: 'Barquisimeto',
    lat: 10.0647,
    lng: -69.3570,
    elevationM: 560,
    seismicZoneCOVENIN: 5,
    designAccelerationA0: 0.30,
    geologicalFault: {
      name: 'Falla de Boconó (Ramal Norte) & Falla de Curarigua',
      system: 'Fallas Transcurrentes del Sistema Andino-Costero',
      type: 'Rumbo Dextral y fallamiento normal en la meseta',
      slipRateMmYear: 4.0,
      maxExpectedMagnitudeMw: 6.9,
      description:
        'Sistemas sismogénicos que delimitan la gran meseta de Barquisimeto y la depresión de Quíbor. Suelos arcillosos expansivos y colapsables.'
    },
    defaultSoilProfile: 'S2',
    basinTorrencialRisk: 'Medio',
    slopeRiskIndex: 'Alto',
    description:
      'Meseta árida y semiárida con laderas arcillosas susceptibles a la cárcava y desprendimientos. Suelos con comportamiento expansivo que demandan diseño geotécnico especial en cimentaciones.',
    mapBiomasTimeSeries: [
      {
        year: 1985,
        forestCoverKm2: 510,
        urbanCoverKm2: 120,
        informalSlopeCoverKm2: 15,
        waterBodiesKm2: 20,
        agricultureKm2: 380,
        meanRunoffCoefficient: 0.34,
        averageSlopeDeg: 14,
        deforestationAccumulatedPercent: 0,
        urbanImperviousRatePercent: 20
      },
      {
        year: 2023,
        forestCoverKm2: 320,
        urbanCoverKm2: 280,
        informalSlopeCoverKm2: 85,
        waterBodiesKm2: 16,
        agricultureKm2: 340,
        meanRunoffCoefficient: 0.65,
        averageSlopeDeg: 16,
        deforestationAccumulatedPercent: 37.2,
        urbanImperviousRatePercent: 55
      }
    ],
    urbanSectors: [
      {
        id: 'sector-barquisimeto-meseta',
        name: 'Sector Meseta Central & Río Turbio',
        description: 'Escarpe tectónico del Turbio con pendientes pronunciadas habitadas por asentamientos informales.',
        centerCoords: [10.06, -69.32],
        zoomLevel: 15,
        terrainType: 'Ladra Escarpada',
        detectedBuildings: [
          {
            id: 'b-lar-01',
            name: 'Hospital Central Universitario Antonio María Pineda',
            typeId: 'hospital-infraestructura',
            x: 55,
            y: 40,
            elevationM: 580,
            slopeDeg: 4,
            distanceToFaultKm: 6.2,
            distanceToStreamM: 800,
            stories: 8,
            soilType: 'S2'
          },
          {
            id: 'b-lar-02',
            name: 'Viviendas en Escarpe del Valle del Turbio',
            typeId: 'autoconstruccion-ladera',
            x: 30,
            y: 65,
            elevationM: 510,
            slopeDeg: 32,
            distanceToFaultKm: 4.8,
            distanceToStreamM: 150,
            stories: 3,
            soilType: 'S3'
          }
        ],
        suggestions: [
          {
            id: 'sug-lar-01',
            level: 'Macro',
            title: 'Control de Expansión sobre Suelos Arcillosos Expansivos',
            category: 'Ingeniería Civil',
            description: 'En Barquisimeto y Cabudare, el suelo arcilloso sufre cambios volumétricos severos por humedad. Exigir losas macizas nervadas y vigas de riostra sobredimensionadas.',
            priority: 'Alta',
            affectedArea: 'Valle del Turbio y Cabudare',
            estimatedCostBenefit: 'Evita fisuración estructural por asentamientos'
          }
        ]
      }
    ],
    historicalEvents: [
      {
        year: 1950,
        title: 'Sismo de El Tocuyo (Mw 6.2)',
        type: 'Sismo',
        impact: 'Destrucción de construcciones coloniales de tapia pisada en El Tocuyo, Guárico y Chabasquén.',
        engineeringLessons:
          'Las construcciones de adobe y tapia sin confinamiento son trampas mortales ante sismos superficiales moderados.'
      }
    ],
    criticalInfrastructure: {
      hospitals: 10,
      civilProtectionStations: 8,
      fireStations: 8,
      mainEvacuationArteries: [
        'Autopista Cimarrón Andresote',
        'Avenida Circunvalación Norte',
        'Avenida Venezuela'
      ]
    }
  },
  {
    id: 'guarico-sanjuan',
    name: 'San Juan de los Morros & UNERG (Guárico)',
    state: 'Guárico',
    capitalCity: 'San Juan de los Morros',
    lat: 9.9115,
    lng: -67.3538,
    elevationM: 428,
    seismicZoneCOVENIN: 4, // A0 = 0.25g
    designAccelerationA0: 0.25,
    geologicalFault: {
      name: 'Falla Frontal de la Serranía del Interior (Guárico)',
      system: 'Límite Tectónico Cordillera de la Costa - Cuenca de los Llanos',
      type: 'Corrimiento Inverso con buzamiento hacia el norte',
      slipRateMmYear: 3.5,
      maxExpectedMagnitudeMw: 6.7,
      description:
        'Estructura geológica que conditioned el levantamiento de los Morros de San Juan (Monumento Natural Arístides Rojas, formación caliza arrecifal cretácica) y marca el contacto entre la roca metamórfica y los sedimentos arcillosos coluvio-aluviales del piedemonte llanero.'
    },
    defaultSoilProfile: 'S2',
    basinTorrencialRisk: 'Alto',
    slopeRiskIndex: 'Alto',
    description:
      'Capital del estado Guárico y sede central de la Universidad Rómulo Gallegos (UNERG). Terreno de piedemonte caracterizado por escarpes calizos de alta pendiente, valles aluviales del Río San Juan y suelos arcillosos expansivos propensos a asentamientos diferenciales y crecidas torrenciales estacionales.',
    mapBiomasTimeSeries: [
      {
        year: 1985,
        forestCoverKm2: 480,
        urbanCoverKm2: 45,
        informalSlopeCoverKm2: 8,
        waterBodiesKm2: 18,
        agricultureKm2: 410,
        meanRunoffCoefficient: 0.32,
        averageSlopeDeg: 18,
        deforestationAccumulatedPercent: 0,
        urbanImperviousRatePercent: 12
      },
      {
        year: 2005,
        forestCoverKm2: 390,
        urbanCoverKm2: 95,
        informalSlopeCoverKm2: 24,
        waterBodiesKm2: 17,
        agricultureKm2: 440,
        meanRunoffCoefficient: 0.48,
        averageSlopeDeg: 20,
        deforestationAccumulatedPercent: 18.7,
        urbanImperviousRatePercent: 28
      },
      {
        year: 2023,
        forestCoverKm2: 310,
        urbanCoverKm2: 145,
        informalSlopeCoverKm2: 52,
        waterBodiesKm2: 15,
        agricultureKm2: 445,
        meanRunoffCoefficient: 0.64,
        averageSlopeDeg: 22,
        deforestationAccumulatedPercent: 35.4,
        urbanImperviousRatePercent: 46
      },
      {
        year: 2035,
        forestCoverKm2: 240,
        urbanCoverKm2: 180,
        informalSlopeCoverKm2: 78,
        waterBodiesKm2: 14,
        agricultureKm2: 455,
        meanRunoffCoefficient: 0.76,
        averageSlopeDeg: 23,
        deforestationAccumulatedPercent: 50.0,
        urbanImperviousRatePercent: 60
      },
      {
        year: 2050,
        forestCoverKm2: 180,
        urbanCoverKm2: 225,
        informalSlopeCoverKm2: 105,
        waterBodiesKm2: 12,
        agricultureKm2: 445,
        meanRunoffCoefficient: 0.85,
        averageSlopeDeg: 25,
        deforestationAccumulatedPercent: 62.5,
        urbanImperviousRatePercent: 74
      }
    ],
    urbanSectors: [
      {
        id: 'sector-unerg-morros',
        name: 'Sector Campus Central UNERG & Los Morros',
        description: 'Sede universitaria que alberga las Facultades de Ingeniería en Informática, Medicina y Odontología, adyacente a los escarpes del Monumento Natural Los Morros.',
        centerCoords: [9.920, -67.360],
        zoomLevel: 15,
        terrainType: 'Ladra Escarpada',
        detectedBuildings: [
          {
            id: 'b-unerg-01',
            name: 'Pabellón de Ingeniería en Informática y Sistemas UNERG',
            typeId: 'porticos-nd3-sismo',
            x: 48,
            y: 45,
            elevationM: 445,
            slopeDeg: 12,
            distanceToFaultKm: 2.1,
            distanceToStreamM: 350,
            stories: 4,
            soilType: 'S2'
          },
          {
            id: 'b-unerg-02',
            name: 'Hospital General Dr. Israel Ranuárez Balza',
            typeId: 'hospital-infraestructura',
            x: 65,
            y: 35,
            elevationM: 430,
            slopeDeg: 6,
            distanceToFaultKm: 2.8,
            distanceToStreamM: 420,
            stories: 6,
            soilType: 'S2'
          },
          {
            id: 'b-unerg-03',
            name: 'Edificio Rectorado y Biblioteca Central UNERG',
            typeId: 'porticos-nd3-sismo',
            x: 52,
            y: 55,
            elevationM: 440,
            slopeDeg: 8,
            distanceToFaultKm: 2.3,
            distanceToStreamM: 280,
            stories: 3,
            soilType: 'S2'
          },
          {
            id: 'b-unerg-04',
            name: 'Urbanismo Espontáneo Pariapán / El Morro',
            typeId: 'autoconstruccion-ladera',
            x: 25,
            y: 30,
            elevationM: 495,
            slopeDeg: 34,
            distanceToFaultKm: 1.2,
            distanceToStreamM: 80,
            stories: 3,
            soilType: 'S3'
          },
          {
            id: 'b-unerg-05',
            name: 'Puente de la Avenida Los Llanos (Paso Río San Juan)',
            typeId: 'puente-vial',
            x: 35,
            y: 70,
            elevationM: 415,
            slopeDeg: 4,
            distanceToFaultKm: 3.0,
            distanceToStreamM: 0,
            stories: 1,
            soilType: 'S3'
          }
        ],
        suggestions: [
          {
            id: 'sug-sjm-01',
            level: 'Macro',
            title: 'Protección Geotécnica del Frente Calizo Los Morros',
            category: 'Zonificación',
            description: 'Establecer una franja de exclusión de 150m en la base de los farallones calizos de Los Morros para prevenir riesgos por desprendimiento de bloques rocosos disparados por sismos en la Serranía del Interior.',
            priority: 'Crítica',
            affectedArea: 'Piedemonte del Monumento Natural Arístides Rojas',
            estimatedCostBenefit: 'Protege a comunidades universitarias y residenciales de Pariapán'
          },
          {
            id: 'sug-sjm-02',
            level: 'Micro',
            title: 'Control de Suelos Arcillosos Expansivos en el Campus UNERG',
            category: 'Ingeniería Civil',
            description: 'En el piedemonte de San Juan, los suelos arcillosos presentan alta plasticidad (IP > 30%). Toda nueva ampliación de la UNERG debe contemplar cimentaciones con vigas de riostra rigidizadoras y drenajes perimetrales para evitar grietas por hinchamiento.',
            priority: 'Alta',
            affectedArea: 'Edificaciones del Área de Ingeniería y Ciencias de la Salud UNERG',
            estimatedCostBenefit: 'Evita costosas reparaciones por asentamientos diferenciales'
          }
        ]
      },
      {
        id: 'sector-sjm-centro',
        name: 'Sector Casco Histórico & Valle del Río San Juan',
        description: 'Zona fundacional de San Juan de los Morros ubicada en la llanura de inundación del Río San Juan.',
        centerCoords: [9.905, -67.350],
        zoomLevel: 15,
        terrainType: 'Valle Aluvial',
        detectedBuildings: [
          {
            id: 'b-sjm-06',
            name: 'Liceo Juan Germán Roscio',
            typeId: 'mamposteria-confinada',
            x: 50,
            y: 45,
            elevationM: 425,
            slopeDeg: 3,
            distanceToFaultKm: 3.2,
            distanceToStreamM: 200,
            stories: 2,
            soilType: 'S3'
          },
          {
            id: 'b-sjm-07',
            name: 'Centro Comercial Vía Los Llanos',
            typeId: 'porticos-nd3-sismo',
            x: 68,
            y: 55,
            elevationM: 422,
            slopeDeg: 2,
            distanceToFaultKm: 3.6,
            distanceToStreamM: 120,
            stories: 2,
            soilType: 'S3'
          }
        ],
        suggestions: [
          {
            id: 'sug-sjm-03',
            level: 'Micro',
            title: 'Canalización Hidráulica de Alivio en el Río San Juan',
            category: 'Mitigación Hidráulica',
            description: 'Dragado y refuerzo de taludes con muros de gaviones en el tramo urbano del Río San Juan para evitar desbordamientos durante lluvias pico en la cabecera montañosa.',
            priority: 'Alta',
            affectedArea: 'Casco Central de San Juan de los Morros',
            estimatedCostBenefit: 'Reduce 60% el riesgo de inundación estacional'
          }
        ]
      }
    ],
    historicalEvents: [
      {
        year: 1900,
        title: 'Gran Sismo de la Serranía del Interior (Mw 7.0)',
        type: 'Sismo',
        impact: 'Fuerte sacudida en San Juan de los Morros, Villa de Cura y Cagua; agrietamiento del terreno y desprendimiento de rocas en Los Morros.',
        engineeringLessons:
          'El contacto geológico entre la roca dura de la Serranía y los sedimentos del piedemonte amplifica localmente las aceleraciones de baja frecuencia.'
      },
      {
        year: 1993,
        title: 'Crecida Torrencial por Tormenta Bret',
        type: 'Inundación',
        impact: 'Desbordamiento del Río San Juan y quebradas tributarias, colapso de accesos viales hacia los llanos.',
        engineeringLessons:
          'Se evidenció la imperiosa necesidad de dimensionar puentes con revancha hidráulica superior a 2.5 metros en cuencas de piedemonte.'
      }
    ],
    criticalInfrastructure: {
      hospitals: 7,
      civilProtectionStations: 6,
      fireStations: 5,
      mainEvacuationArteries: [
        'Carretera Nacional San Juan - Villa de Cura (Troncal 002)',
        'Carretera San Juan - Calabozo (Ruta hacia los Llanos)',
        'Avenida Los Llanos / Avenida Fermín Toro',
        'Avenida Bolívar de San Juan'
      ]
    }
  }
];
