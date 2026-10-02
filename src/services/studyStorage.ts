/**
 * SIURPROV - Servicio de Exportación, Importación, Verificación e Intercambio de Estudios
 * Permite guardar, empaquetar, compartir y cargar estudios completos en formato abierto (.siurprov / JSON)
 * Compatible entre entornos locales (PC/móvil) y despliegues en la nube.
 * Autor: Ing. Frank Sousa (UNERG 2025)
 * San Juan de los Morros, Estado Guárico, Venezuela.
 */

import { MapBuilding, MultiHazardParameters, SimulationResult, SoilProfileType, VenezuelaRegion } from '../types';
import { SecuritySanitizer } from './securitySanitizer';
import { VENEZUELA_REGIONS } from '../data/venezuelaRegions';
import { BUILDING_TYPOLOGIES } from '../data/buildingTypologies';
import { SOIL_PROFILES } from '../data/soilProfiles';

export interface SiurprovStudyPackage {
  fileType: 'SIURPROV_STUDY';
  version: '1.3';
  metadata: {
    title: string;
    description: string;
    author: string;
    institution: string;
    location: string;
    officialRepo: string;
    license: string;
    createdAt: string;
    systemVersion: string;
    checksum?: string;
  };
  studyData: {
    regionId: string;
    regionName: string;
    selectedYear: number;
    typologyId: string;
    soilProfileType: SoilProfileType;
    scenario: MultiHazardParameters;
    userPlacedBuildings: MapBuilding[];
    computedEvaluationSummary?: {
      ems98Grade: string;
      performanceLevel: string;
      parkAngIndex: number;
      estimatedLossUsd: number;
      estimatedDowntimeDays: number;
      slopeFactorOfSafety: number;
      safeForOccupancy: boolean;
      pDeltaExceeded?: boolean;
      primaryRisk?: string;
    };
  };
}

export class StudyStorageService {
  private static STORAGE_KEY = 'siurprov_saved_studies_library';

  /**
   * Crea un paquete de estudio completo con atribución formal, telemetría y suma de comprobación criptográfica
   */
  public static createStudyPackage(
    title: string,
    description: string,
    region: VenezuelaRegion,
    selectedYear: number,
    typologyId: string,
    soilProfileType: SoilProfileType,
    scenario: MultiHazardParameters,
    userPlacedBuildings: MapBuilding[],
    simulationResult?: SimulationResult
  ): SiurprovStudyPackage {
    const sanitizedTitle = SecuritySanitizer.sanitizeString(title || `Estudio Territorial - ${region.name}`, 120);
    const sanitizedDesc = SecuritySanitizer.sanitizeString(
      description || `Simulación multi-amenaza y vulnerabilidad física para ${region.name} (${selectedYear}) procesada con SIURPROV.`,
      300
    );

    const studyData = {
      regionId: region.id,
      regionName: region.name,
      selectedYear,
      typologyId,
      soilProfileType,
      scenario: SecuritySanitizer.sanitizeScenario(scenario),
      userPlacedBuildings: userPlacedBuildings.map((b) => SecuritySanitizer.sanitizeUserBuilding(b)!),
      computedEvaluationSummary: simulationResult
        ? {
            ems98Grade: simulationResult.ems98Grade,
            performanceLevel: simulationResult.performanceLevel,
            parkAngIndex: simulationResult.parkAngDamageIndex,
            estimatedLossUsd: simulationResult.estimatedLossUsd,
            estimatedDowntimeDays: simulationResult.estimatedDowntimeDays,
            slopeFactorOfSafety: simulationResult.slopeFactorOfSafety,
            safeForOccupancy: simulationResult.safeForOccupancy,
            pDeltaExceeded: simulationResult.pDeltaExceeded,
            primaryRisk: simulationResult.primaryFailureMechanism
          }
        : undefined
    };

    // Calcular checksum sobre los datos esenciales del estudio para garantizar no-repudio e integridad
    const contentToHash = JSON.stringify({ studyData, title: sanitizedTitle });
    const checksum = SecuritySanitizer.computeChecksum(contentToHash);

    return {
      fileType: 'SIURPROV_STUDY',
      version: '1.3',
      metadata: {
        title: sanitizedTitle,
        description: sanitizedDesc,
        author: 'Ing. Frank Sousa (frankalfonso1988@gmail.com)',
        institution: 'Universidad Nacional Experimental Rómulo Gallegos (UNERG 2025)',
        location: 'San Juan de los Morros, Estado Guárico, Venezuela',
        officialRepo: 'https://github.com/frankalfonso1988/SIURPROV',
        license: 'MIT License with Mandatory Author & Repository Attribution Requirement',
        createdAt: new Date().toISOString(),
        systemVersion: 'SIURPROV v1.3',
        checksum
      },
      studyData
    };
  }

  /**
   * Descarga el paquete de estudio como archivo .siurprov (JSON)
   */
  public static downloadStudyFile(pkg: SiurprovStudyPackage): void {
    const jsonString = JSON.stringify(pkg, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const safeTitle = pkg.metadata.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 30);
    const fileName = `estudio_${safeTitle}_${Date.now()}.siurprov`;

    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Genera un fragmento codificado en Base64 o URL para compartir directamente
   */
  public static exportToShareableString(pkg: SiurprovStudyPackage): string {
    const jsonString = JSON.stringify(pkg);
    return btoa(unescape(encodeURIComponent(jsonString)));
  }

  /**
   * Restaura un estudio a partir de una cadena Base64
   */
  public static importFromShareableString(encoded: string): {
    success: boolean;
    package?: SiurprovStudyPackage;
    error?: string;
    checksumStatus?: 'VERIFIED' | 'MISSING' | 'INVALID';
  } {
    try {
      const decodedJson = decodeURIComponent(escape(atob(encoded.trim())));
      return this.parseStudyFile(decodedJson);
    } catch {
      return { success: false, error: 'Cadena de estudio corrupta o formato Base64 inválido.' };
    }
  }

  /**
   * Parsea y valida el contenido de un archivo .siurprov subido por el usuario
   */
  public static parseStudyFile(fileContent: string): {
    success: boolean;
    package?: SiurprovStudyPackage;
    error?: string;
    checksumStatus?: 'VERIFIED' | 'MISSING' | 'INVALID';
  } {
    try {
      const parsed = JSON.parse(fileContent);
      const validation = SecuritySanitizer.validateStudyPackage(parsed);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const pkg = parsed as SiurprovStudyPackage;

      // Normalizar estructura si venía en formato v1.1 / v1.2 plano
      if (!pkg.studyData && (pkg as any).regionId) {
        const raw = pkg as any;
        pkg.studyData = {
          regionId: raw.regionId,
          regionName: raw.regionName || 'Región Importada',
          selectedYear: raw.selectedYear || 2023,
          typologyId: raw.typologyId || 'autoconstruccion-ladera',
          soilProfileType: raw.soilProfileType || 'S3',
          scenario: raw.scenario,
          userPlacedBuildings: raw.userPlacedBuildings || [],
          computedEvaluationSummary: raw.computedEvaluationSummary
        };
      }

      // Verificación de checksum
      let checksumStatus: 'VERIFIED' | 'MISSING' | 'INVALID' = 'MISSING';
      if (pkg.metadata?.checksum) {
        const contentToHash = JSON.stringify({ studyData: pkg.studyData, title: pkg.metadata.title });
        const calculated = SecuritySanitizer.computeChecksum(contentToHash);
        checksumStatus = calculated === pkg.metadata.checksum ? 'VERIFIED' : 'INVALID';
      }

      return {
        success: true,
        package: pkg,
        checksumStatus
      };
    } catch {
      return { success: false, error: 'El archivo seleccionado no contiene un formato JSON válido.' };
    }
  }

  /**
   * Guarda un estudio en la biblioteca local del navegador (localStorage)
   */
  public static saveStudyToLocalLibrary(pkg: SiurprovStudyPackage): void {
    try {
      const existing = this.getLocalLibrary();
      const updated = [pkg, ...existing.filter((s) => s.metadata.title !== pkg.metadata.title)].slice(0, 20);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Manejo silencioso si localStorage está restringido en modo incógnito
    }
  }

  /**
   * Obtiene la biblioteca de estudios guardados localmente
   */
  public static getLocalLibrary(): SiurprovStudyPackage[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  /**
   * Elimina un estudio de la biblioteca local
   */
  public static deleteStudyFromLocalLibrary(title: string): void {
    try {
      const existing = this.getLocalLibrary();
      const filtered = existing.filter((s) => s.metadata.title !== title);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // Ignorar
    }
  }

  /**
   * Catálogo de Estudios Precargados Emblemáticos de Venezuela
   * Permite probar el sistema de inmediato tanto en local como en la nube
   */
  public static getPreloadedStudies(): SiurprovStudyPackage[] {
    return [
      {
        fileType: 'SIURPROV_STUDY',
        version: '1.3',
        metadata: {
          title: 'Tragedia de Vargas 1999 (Macuto - Caraballeda)',
          description: 'Modelado retrospectivo y prospectivo del alud torrencial y deslizamientos en la Cordillera de la Costa sobre autoconstrucciones en ladera.',
          author: 'Ing. Frank Sousa (frankalfonso1988@gmail.com)',
          institution: 'UNERG 2025 - San Juan de los Morros, Estado Guárico',
          location: 'Macuto & Caraballeda, Estado La Guaira',
          officialRepo: 'https://github.com/frankalfonso1988/SIURPROV',
          license: 'MIT License (Attribution to Frank Sousa & Repo Required)',
          createdAt: '1999-12-16T00:00:00.000Z',
          systemVersion: 'SIURPROV v1.3',
          checksum: 'SIUR-VARGAS-1999'
        },
        studyData: {
          regionId: 'caracas-vargas',
          regionName: 'Gran Caracas & La Guaira (Cordillera de la Costa)',
          selectedYear: 1999,
          typologyId: 'autoconstruccion-ladera',
          soilProfileType: 'S3',
          scenario: {
            earthquake: { enabled: false, pgaG: 0.05, magnitudeMw: 4.5, depthKm: 20, durationSeconds: 15, distanceToFaultKm: 25 },
            debrisFlow: {
              enabled: true,
              rainfallAccumulation24hMm: 380,
              soilSaturationPercent: 98,
              debrisVelocityMs: 11.5,
              debrisDepthM: 3.2,
              densityKgM3: 2150,
              boulderImpactSizeM: 2.2
            },
            flood: { enabled: true, waterLevelM: 2.5, flowVelocityMs: 3.8, durationHours: 72, soilSaturationIncrease: 55 },
            wind: { enabled: false, speedKmh: 60, gustFactor: 1.1 },
            slope: { enabled: true, angleDeg: 42, cohesionKpa: 10, internalFrictionAngleDeg: 20 }
          },
          userPlacedBuildings: [
            {
              id: 'vargas-demo-01',
              name: 'Vivienda Autoconstruida Quebrada San Julián',
              typeId: 'autoconstruccion-ladera',
              x: 48,
              y: 52,
              elevationM: 140,
              slopeDeg: 38,
              distanceToFaultKm: 4.5,
              distanceToStreamM: 25,
              stories: 3,
              soilType: 'S3',
              isUserPlaced: true,
              yearConstructed: 1994
            },
            {
              id: 'vargas-demo-02',
              name: 'Residencias Costeras Macuto',
              typeId: 'porticos-pre1982-nd1',
              x: 52,
              y: 60,
              elevationM: 18,
              slopeDeg: 8,
              distanceToFaultKm: 5.2,
              distanceToStreamM: 120,
              stories: 10,
              soilType: 'S3',
              isUserPlaced: true,
              yearConstructed: 1978
            }
          ],
          computedEvaluationSummary: {
            ems98Grade: 'Grado 4: Muy Severo / Falla Parcial de Columnas',
            performanceLevel: 'Colapso Inminente (C)',
            parkAngIndex: 0.92,
            estimatedLossUsd: 1850000,
            estimatedDowntimeDays: 360,
            slopeFactorOfSafety: 0.78,
            safeForOccupancy: false,
            pDeltaExceeded: true,
            primaryRisk: 'Impacto Dinámico por Bloques de Detritos y Deslizamiento de Ladera'
          }
        }
      },
      {
        fileType: 'SIURPROV_STUDY',
        version: '1.3',
        metadata: {
          title: 'Megasismo Falla San Sebastián - Caracas 1967 vs 2026',
          description: 'Evaluación del impacto de un sismo Mw 7.2 en la Falla San Sebastián sobre pórticos de concreto armado en la cuenca sedimentaria de Caracas.',
          author: 'Ing. Frank Sousa (frankalfonso1988@gmail.com)',
          institution: 'UNERG 2025 - San Juan de los Morros, Estado Guárico',
          location: 'Valle de Caracas (Los Palos Grandes - Altamira)',
          officialRepo: 'https://github.com/frankalfonso1988/SIURPROV',
          license: 'MIT License (Attribution to Frank Sousa & Repo Required)',
          createdAt: '2026-03-15T00:00:00.000Z',
          systemVersion: 'SIURPROV v1.3',
          checksum: 'SIUR-CCS-2026'
        },
        studyData: {
          regionId: 'caracas-vargas',
          regionName: 'Gran Caracas & La Guaira (Cordillera de la Costa)',
          selectedYear: 2026,
          typologyId: 'porticos-pre1982-nd1',
          soilProfileType: 'S4',
          scenario: {
            earthquake: { enabled: true, pgaG: 0.45, magnitudeMw: 7.2, depthKm: 12, durationSeconds: 55, distanceToFaultKm: 6 },
            debrisFlow: { enabled: false, rainfallAccumulation24hMm: 30, soilSaturationPercent: 35, debrisVelocityMs: 2, debrisDepthM: 0, densityKgM3: 1800, boulderImpactSizeM: 0.3 },
            flood: { enabled: false, waterLevelM: 0, flowVelocityMs: 0, durationHours: 0, soilSaturationIncrease: 0 },
            wind: { enabled: false, speedKmh: 30, gustFactor: 1.0 },
            slope: { enabled: true, angleDeg: 15, cohesionKpa: 22, internalFrictionAngleDeg: 28 }
          },
          userPlacedBuildings: [
            {
              id: 'ccs-demo-01',
              name: 'Edificio Residencial Los Palos Grandes (1965)',
              typeId: 'porticos-pre1982-nd1',
              x: 55,
              y: 45,
              elevationM: 920,
              slopeDeg: 6,
              distanceToFaultKm: 5.8,
              distanceToStreamM: 400,
              stories: 12,
              soilType: 'S4',
              isUserPlaced: true,
              yearConstructed: 1965
            }
          ],
          computedEvaluationSummary: {
            ems98Grade: 'Grado 4: Muy Severo / Falla Parcial de Columnas',
            performanceLevel: 'Prevención de Colapso (CP)',
            parkAngIndex: 0.78,
            estimatedLossUsd: 2400000,
            estimatedDowntimeDays: 240,
            slopeFactorOfSafety: 1.45,
            safeForOccupancy: false,
            pDeltaExceeded: true,
            primaryRisk: 'Falla Frágil por Cortante en Columnas y Piso Blando'
          }
        }
      },
      {
        fileType: 'SIURPROV_STUDY',
        version: '1.3',
        metadata: {
          title: 'Microzonificación San Juan de los Morros (UNERG 2025)',
          description: 'Análisis geomecánico y sismorresistente en zona de piedemonte llanero, calizas arrecifales y arcillas expansivas del Estado Guárico.',
          author: 'Ing. Frank Sousa (frankalfonso1988@gmail.com)',
          institution: 'Universidad Rómulo Gallegos (UNERG 2025)',
          location: 'San Juan de los Morros, Estado Guárico',
          officialRepo: 'https://github.com/frankalfonso1988/SIURPROV',
          license: 'MIT License (Attribution to Frank Sousa & Repo Required)',
          createdAt: '2025-10-18T00:00:00.000Z',
          systemVersion: 'SIURPROV v1.3',
          checksum: 'SIUR-UNERG-2025'
        },
        studyData: {
          regionId: 'guarico-sanjuan',
          regionName: 'San Juan de los Morros (Guárico - UNERG)',
          selectedYear: 2025,
          typologyId: 'porticos-nd3-sismo',
          soilProfileType: 'S2',
          scenario: {
            earthquake: { enabled: true, pgaG: 0.25, magnitudeMw: 6.0, depthKm: 18, durationSeconds: 25, distanceToFaultKm: 14 },
            debrisFlow: { enabled: false, rainfallAccumulation24hMm: 60, soilSaturationPercent: 50, debrisVelocityMs: 3, debrisDepthM: 0, densityKgM3: 1800, boulderImpactSizeM: 0.4 },
            flood: { enabled: false, waterLevelM: 0, flowVelocityMs: 0, durationHours: 0, soilSaturationIncrease: 0 },
            wind: { enabled: false, speedKmh: 45, gustFactor: 1.1 },
            slope: { enabled: true, angleDeg: 28, cohesionKpa: 30, internalFrictionAngleDeg: 32 }
          },
          userPlacedBuildings: [
            {
              id: 'unerg-demo-01',
              name: 'Pabellón Académico Área de Ingeniería UNERG',
              typeId: 'porticos-nd3-sismo',
              x: 50,
              y: 50,
              elevationM: 460,
              slopeDeg: 14,
              distanceToFaultKm: 12,
              distanceToStreamM: 350,
              stories: 4,
              soilType: 'S2',
              isUserPlaced: true,
              yearConstructed: 2012
            }
          ],
          computedEvaluationSummary: {
            ems98Grade: 'Grado 1: Daño Leve / Fisuras Cosméticas',
            performanceLevel: 'Ocupación Inmediata (IO)',
            parkAngIndex: 0.15,
            estimatedLossUsd: 45000,
            estimatedDowntimeDays: 7,
            slopeFactorOfSafety: 1.82,
            safeForOccupancy: true,
            pDeltaExceeded: false,
            primaryRisk: 'Comportamiento Dúctil Satisfactorio Conforme a COVENIN 1756'
          }
        }
      },
      {
        fileType: 'SIURPROV_STUDY',
        version: '1.3',
        metadata: {
          title: 'Terremoto de Cariaco 1997 (Falla El Pilar - Sucre)',
          description: 'Sismo Mw 6.9 en Falla El Pilar con amplificación en suelos blandos costeros S4 y colapso de centros educativos.',
          author: 'Ing. Frank Sousa (frankalfonso1988@gmail.com)',
          institution: 'UNERG 2025 - San Juan de los Morros, Estado Guárico',
          location: 'Cariaco y Cumaná, Estado Sucre',
          officialRepo: 'https://github.com/frankalfonso1988/SIURPROV',
          license: 'MIT License (Attribution to Frank Sousa & Repo Required)',
          createdAt: '1997-07-09T00:00:00.000Z',
          systemVersion: 'SIURPROV v1.3',
          checksum: 'SIUR-CARIACO-1997'
        },
        studyData: {
          regionId: 'sucre-cariaco',
          regionName: 'Cariaco & Cumaná (Falla El Pilar - Sucre)',
          selectedYear: 1997,
          typologyId: 'porticos-pre1982-nd1',
          soilProfileType: 'S4',
          scenario: {
            earthquake: { enabled: true, pgaG: 0.52, magnitudeMw: 6.9, depthKm: 9.4, durationSeconds: 40, distanceToFaultKm: 2 },
            debrisFlow: { enabled: false, rainfallAccumulation24hMm: 20, soilSaturationPercent: 30, debrisVelocityMs: 2, debrisDepthM: 0, densityKgM3: 1800, boulderImpactSizeM: 0.2 },
            flood: { enabled: false, waterLevelM: 0, flowVelocityMs: 0, durationHours: 0, soilSaturationIncrease: 0 },
            wind: { enabled: false, speedKmh: 30, gustFactor: 1.0 },
            slope: { enabled: false, angleDeg: 10, cohesionKpa: 20, internalFrictionAngleDeg: 28 }
          },
          userPlacedBuildings: [
            {
              id: 'cariaco-demo-01',
              name: 'Liceo Raimundo Martínez Centeno (1975)',
              typeId: 'porticos-pre1982-nd1',
              x: 50,
              y: 52,
              elevationM: 25,
              slopeDeg: 4,
              distanceToFaultKm: 1.8,
              distanceToStreamM: 180,
              stories: 3,
              soilType: 'S4',
              isUserPlaced: true,
              yearConstructed: 1975
            }
          ],
          computedEvaluationSummary: {
            ems98Grade: 'Grado 5: Colapso Total / Inhabitable',
            performanceLevel: 'Colapso Inminente (C)',
            parkAngIndex: 1.05,
            estimatedLossUsd: 1200000,
            estimatedDowntimeDays: 365,
            slopeFactorOfSafety: 1.6,
            safeForOccupancy: false,
            pDeltaExceeded: true,
            primaryRisk: 'Falla Frágil por Columna Corta y Resonancia en Suelo Blando S4'
          }
        }
      }
    ];
  }
}
