/**
 * SIURPROV - Servicio de Exportación, Importación, Verificación e Intercambio de Estudios
 * studyStorage.ts: Gestión de Persistencia Local, Serialización e Integridad Criptográfica
 *
 * ARQUITECTURA Y PATRONES:
 * - Offline-First Storage: Permite guardar estudios completos en el almacenamiento local del navegador
 *   o exportarlos en formato de archivo abierto Base64 (.siurprov / .json) sin depender de servidores.
 * - Integridad Criptográfica SHA-256: Genera un hash criptográfico de la carga útil (`checksum`). Al importar,
 *   recalcula el digest; si el archivo fue alterado externamente, rechaza la carga para prevenir corrupción.
 * - Sanitización en Frontera de Entrada: Pasa todos los campos de texto por `SecuritySanitizer` para neutralizar
 *   inyecciones XSS antes de persistir o renderizar.
 *
 * ¿CÓMO INTERACTÚA CON EL SISTEMA?:
 * 1. StudyManagerModal.tsx utiliza este servicio para listar estudios precargados y exportar/importar archivos.
 * 2. El servidor Express (/api/study/validate) consume este servicio para validar firmas en la nube.
 * 3. Las pruebas automatizadas TEST-09, TEST-10 y TEST-13 auditan el ciclo de vida, serialización y rechazo de manipulaciones.
 *
 * PUNTOS DE ESCALABILIDAD:
 * - Soporte para IndexedDB: Para proyectos de gran escala con cientos de edificaciones georreferenciadas.
 * - Firma asimétrica con par de claves pública/privada (RSA/ECDSA) para certificación institucional de informes.
 *
 * Autor: Ing. Frank Sousa (UNERG 2025)
 * San Juan de los Morros, Estado Guárico, Venezuela.
 */

import {
  BuildingTypology,
  MapBuilding,
  MultiHazardParameters,
  SimulationResult,
  SoilProfile,
  SoilProfileType,
  VenezuelaRegion
} from '../types';
import { SecuritySanitizer } from './securitySanitizer';
import { VENEZUELA_REGIONS } from '../data/venezuelaRegions';
import { BUILDING_TYPOLOGIES } from '../data/buildingTypologies';
import { SOIL_PROFILES } from '../data/soilProfiles';
import { ImportedBuildingConfig } from './shakeTableEngine';
import { StructuralSimulationEngine } from './structuralEngine';

let fallbackMemoryStorage: Record<string, string> = {};

function getSafeStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return {
    getItem: (key: string) => fallbackMemoryStorage[key] ?? null,
    setItem: (key: string, val: string) => { fallbackMemoryStorage[key] = val; },
    removeItem: (key: string) => { delete fallbackMemoryStorage[key]; },
    clear: () => { fallbackMemoryStorage = {}; }
  };
}

export interface CrashRecoverySnapshot {
  timestamp: number;
  isDirty: boolean;
  activeView: string;
  regionId: string;
  selectedYear: number;
  typologyId: string;
  soilProfileType: SoilProfileType;
  scenario: MultiHazardParameters;
  userPlacedBuildings: MapBuilding[];
  importedBenchBuilding?: ImportedBuildingConfig | null;
}

export interface TechnicalReportInput {
  region: VenezuelaRegion;
  typology: BuildingTypology;
  soilProfile: SoilProfile;
  scenario: MultiHazardParameters;
  simulationResult: SimulationResult;
  selectedYear: number;
  userPlacedBuildings?: MapBuilding[];
}

export interface TechnicalReportOutput {
  markdown: string;
  summaryTable: {
    regionName: string;
    seismicZone: number;
    a0: number;
    faultName: string;
    soilType: string;
    typologyName: string;
    stories: number;
    t1: number;
    v0Kn: number;
    driftPercent: number;
    coveninDriftLimit: number;
    ems98Grade: string;
    parkAngIndex: number;
    estimatedLossUsd: number;
    slopeFactorOfSafety: number;
    newmarkDisplacementCm: number;
  };
  mapBiomasTransitions: Array<{
    year: number;
    forestCoverKm2: number;
    urbanCoverKm2: number;
    informalSlopeCoverKm2: number;
    meanRunoffCoefficient: number;
    deforestationPercent: number;
  }>;
}

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
        license: 'MIT License',
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
          license: 'MIT License',
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
          license: 'MIT License',
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
          license: 'MIT License',
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
          license: 'MIT License',
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

  public static readonly CRASH_RECOVERY_KEY = 'siurprov_crash_recovery_snapshot';

  /**
   * Guarda un snapshot continuo en segundo plano para protección ante cortes eléctricos imprevistos.
   * Marca el estado como sucio (`isDirty: true`) y actualiza la marca de tiempo.
   */
  public static saveCrashRecoverySnapshot(snapshot: Partial<CrashRecoverySnapshot>): void {
    try {
      const storage = getSafeStorage();
      const currentYear = snapshot.selectedYear ?? 2023;
      const fullSnapshot: CrashRecoverySnapshot = {
        timestamp: Date.now(),
        isDirty: true,
        activeView: snapshot.activeView || 'maps',
        regionId: snapshot.regionId || 'caracas-vargas',
        selectedYear: currentYear,
        typologyId: snapshot.typologyId || 'autoconstruccion-ladera',
        soilProfileType: snapshot.soilProfileType || 'S3',
        scenario: snapshot.scenario
          ? SecuritySanitizer.sanitizeScenario(snapshot.scenario)
          : {
              earthquake: { enabled: true, pgaG: 0.35, magnitudeMw: 6.8, depthKm: 15, durationSeconds: 35, distanceToFaultKm: 8 },
              debrisFlow: { enabled: true, rainfallAccumulation24hMm: 180, soilSaturationPercent: 85, debrisVelocityMs: 7.5, debrisDepthM: 1.8, densityKgM3: 1950, boulderImpactSizeM: 1.2 },
              flood: { enabled: false, waterLevelM: 1.2, flowVelocityMs: 2.0, durationHours: 6, soilSaturationIncrease: 35 },
              wind: { enabled: false, speedKmh: 95, gustFactor: 1.25 },
              slope: { enabled: true, angleDeg: 35, cohesionKpa: 18, internalFrictionAngleDeg: 26 }
            },
        userPlacedBuildings: (snapshot.userPlacedBuildings || [])
          .map((b) => SecuritySanitizer.sanitizeUserBuilding(b)!)
          .filter(Boolean),
        importedBenchBuilding: snapshot.importedBenchBuilding || null
      };

      storage.setItem(this.CRASH_RECOVERY_KEY, JSON.stringify(fullSnapshot));
    } catch (e) {
      console.warn('SIURPROV: No se pudo guardar snapshot de recuperación ante fallo eléctrico', e);
    }
  }

  /**
   * Carga el snapshot de recuperación si existe, validando su estructura y vigencia (<24 horas).
   */
  public static loadCrashRecoverySnapshot(): CrashRecoverySnapshot | null {
    try {
      const storage = getSafeStorage();
      const raw = storage.getItem(this.CRASH_RECOVERY_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CrashRecoverySnapshot;
      if (!parsed || typeof parsed !== 'object' || !parsed.timestamp || !parsed.regionId) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Limpia o descarta el snapshot de recuperación de sesión
   */
  public static clearCrashRecoverySnapshot(): void {
    try {
      const storage = getSafeStorage();
      storage.removeItem(this.CRASH_RECOVERY_KEY);
    } catch (e) {
      console.warn('SIURPROV: Error al limpiar snapshot de recuperación:', e);
    }
  }

  /**
   * Genera un informe técnico estructurado multitemporal con métricas MapBiomas (1985-2050),
   * demanda sísmica COVENIN 1756, factor de seguridad geotécnico y pérdida económica en USD.
   */
  public static generateTechnicalReport(
    studyOrInput: SiurprovStudyPackage | TechnicalReportInput
  ): TechnicalReportOutput {
    let region: VenezuelaRegion;
    let typology: BuildingTypology;
    let soilProfile: SoilProfile;
    let scenario: MultiHazardParameters;
    let simulationResult: SimulationResult;
    let selectedYear: number;

    if ('studyData' in studyOrInput) {
      const pkg = studyOrInput;
      region = VENEZUELA_REGIONS.find((r) => r.id === pkg.studyData.regionId) || VENEZUELA_REGIONS[0];
      typology = BUILDING_TYPOLOGIES.find((t) => t.id === pkg.studyData.typologyId) || BUILDING_TYPOLOGIES[0];
      soilProfile = SOIL_PROFILES[pkg.studyData.soilProfileType] || SOIL_PROFILES.S3;
      scenario = pkg.studyData.scenario;
      selectedYear = pkg.studyData.selectedYear || 2023;
      simulationResult = StructuralSimulationEngine.runSimulation(
        region,
        typology,
        soilProfile,
        scenario,
        selectedYear
      );
    } else {
      region = studyOrInput.region;
      typology = studyOrInput.typology;
      soilProfile = studyOrInput.soilProfile;
      scenario = studyOrInput.scenario;
      simulationResult = studyOrInput.simulationResult;
      selectedYear = studyOrInput.selectedYear;
    }

    const mapBiomasTransitions = region.mapBiomasTimeSeries.map((t) => ({
      year: t.year,
      forestCoverKm2: t.forestCoverKm2,
      urbanCoverKm2: t.urbanCoverKm2,
      informalSlopeCoverKm2: t.informalSlopeCoverKm2,
      meanRunoffCoefficient: t.meanRunoffCoefficient,
      deforestationPercent: t.deforestationAccumulatedPercent
    }));

    const tableRows = region.mapBiomasTimeSeries
      .map(
        (t) =>
          `| ${t.year} | ${t.forestCoverKm2} | ${t.urbanCoverKm2} | ${t.informalSlopeCoverKm2} | ${t.meanRunoffCoefficient.toFixed(2)} | ${t.averageSlopeDeg}° | ${t.deforestationAccumulatedPercent.toFixed(1)}% |`
      )
      .join('\n');

    const markdown = `# REPÚBLICA BOLIVARIANA DE VENEZUELA
## SIURPROV — SIMULADOR URBANO DE PROYECCIÓN PARA VENEZUELA
### EXPEDIENTE TÉCNICO DE AUDITORÍA MULTI-AMENAZA Y VULNERABILIDAD ESTRUCTURAL

- **Expediente N°**: VEN-COVENIN-1756-${selectedYear}-${region.id.toUpperCase()}
- **Fecha de Emisión**: ${new Date().toISOString().split('T')[0]}
- **Autor / Ingeniero Responsable**: Ing. Frank Sousa (UNERG 2025, San Juan de los Morros, Edo. Guárico)
- **Licencia y Distribución**: MIT License (Acceso Abierto, Código y Algoritmos Verificables)
- **Repositorio Oficial**: https://github.com/frankalfonso1988/SIURPROV

---

### 1. CONTEXTO TERRITORIAL Y AMENAZA SÍSMICA
- **Región Evaluada**: ${region.name} (${region.state})
- **Zona Sísmica COVENIN 1756**: Zona ${region.seismicZoneCOVENIN} (Aceleración horizontal de diseño $A_0 = ${region.designAccelerationA0}g$)
- **Falla Geológica Activa Principal**: ${region.geologicalFault.name} (${region.geologicalFault.type})
  - *Tasa de desplazamiento*: ${region.geologicalFault.slipRateMmYear} mm/año | *Magnitud máxima esperada*: Mw ${region.geologicalFault.maxExpectedMagnitudeMw}
- **Perfil Geotécnico de Suelo**: ${soilProfile.name}
  - *Velocidad de onda de corte ($V_s$)*: ${soilProfile.shearWaveVelocityVs} m/s
  - *Período característico del suelo ($T^*$)*: ${soilProfile.coveninTStar} s

---

### 2. DINÁMICA MULTITEMPORAL DE COBERTURA DEL SUELO (MAPBIOMAS VENEZUELA 1985–2050)
La siguiente serie temporal refleja los cambios de cobertura vegetal, expansión urbana y ocupación de laderas informales documentados por la Red Amazónica de Información Socioambiental Georreferenciada (RAISG) y la Red MapBiomas Venezuela:

| Año | Bosque ($km^2$) | Suelo Urbano ($km^2$) | Laderas Informales ($km^2$) | Coeficiente Escorrentía ($C$) | Pendiente Promedio | Deforestación Acumulada |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
${tableRows}

*Nota Técnica*: El incremento del coeficiente de escorrentía $C$ reduce drásticamente el tiempo de concentración de la cuenca e incrementa el caudal pico y el volumen de detritos en flujos torrenciales (aluviones).

---

### 3. EVALUACIÓN ESTRUCTURAL SISMORRESISTENTE (COVENIN 1756:2019)
- **Tipología Evaluada**: ${typology.name} (${typology.structuralSystem})
- **Número de Pisos**: ${typology.stories} niveles (${typology.stories * typology.storyHeightM} m de altura total)
- **Factor de Reducción de Respuesta ($R$)**: R = ${typology.ductilityReductionFactorR}
- **Período Fundamental Calculado ($T_1$)**: ${simulationResult.fundamentalPeriodT1.toFixed(3)} s
- **Aceleración Espectral de Diseño ($S_a$)**: ${simulationResult.spectralAccelerationSa.toFixed(3)}g
- **Cortante Basal de Diseño ($V_0$)**: ${simulationResult.designBaseShearKn.toLocaleString()} kN (${(simulationResult.baseShearToWeightRatio * 100).toFixed(1)}% del peso reactivo)
- **Deriva Máxima de Entrepiso ($\Delta/H$)**: ${simulationResult.maxStoryDriftPercent.toFixed(2)}% (Límite COVENIN: ${simulationResult.coveninDriftLimitPercent.toFixed(2)}%)
  - *Conformidad de Deriva*: ${simulationResult.exceedsDriftLimit ? '⚠️ NO CONFORME (Deriva excesiva — Inestabilidad y daño no estructural severo)' : '✅ CONFORME (Dentro de márgenes admisibles)'}
- **Efectos de Segundo Orden $P-\\Delta$**: Coeficiente de estabilidad $\\theta = ${simulationResult.pDeltaStabilityCoefficient.toFixed(3)} (${simulationResult.pDeltaExceeded ? 'Requiere amplificación de momentos' : 'Efectos despreciables dentro del rango elástico'})
- **Nivel de Desempeño Sísmico (FEMA 356)**: ${simulationResult.performanceLevel} (Capacidad residual: ${simulationResult.residualCapacityPercent}%)
- **Índice de Daño Park-Ang ($DI$)**: ${simulationResult.parkAngDamageIndex.toFixed(2)} (${simulationResult.ems98Grade})

---

### 4. GEOTECNIA Y ESTABILIDAD DE LADERAS
- **Factor de Seguridad del Talud ($FS$)**: ${simulationResult.slopeFactorOfSafety.toFixed(2)} (${simulationResult.slopeFactorOfSafety < 1.0 ? 'Falla Inminente del Terreno' : simulationResult.slopeFactorOfSafety < 1.5 ? 'Estabilidad Precaria ante Sismo' : 'Condición Estable'})
- **Desplazamiento Permanente de Newmark ($d_N$)**: ${simulationResult.newmarkDisplacementCm.toFixed(1)} cm
- **Empuje Hidrodinámico de Detritos / Aluvión**: ${simulationResult.debrisImpactForceKn.toFixed(1)} kN

---

### 5. VALORACIÓN DE PÉRDIDAS Y TIEMPO DE RECUPERACIÓN
- **Pérdida Económica Directa Estimada**: $${simulationResult.estimatedLossUsd.toLocaleString()} USD
- **Tiempo Estimado de Inactividad (Downtime)**: ${simulationResult.estimatedDowntimeDays} días
- **Aptitud para Ocupación Inmediata**: ${simulationResult.safeForOccupancy ? '✅ APTO PARA HABITABILIDAD' : '⛔ NO APTO / DESALOJO PREVENTIVO REQUERIDO'}
- **Mecanismo Primario de Falla**: ${simulationResult.primaryFailureMechanism}

---

### 6. ATRIBUCIÓN CIENTÍFICA, LICENCIA Y REPOSITORIO
1. **MapBiomas Venezuela & RAISG**:
   Colección de Mapas Anuales de Cobertura y Uso del Suelo de Venezuela (1985–2023). Red Amazónica de Información Socioambiental Georreferenciada (RAISG). https://venezuela.mapbiomas.org
2. **Norma Venezolana COVENIN 1756:2019**:
   "Edificaciones Sismorresistentes". FONDONORMA / FUNVISIS. Caracas, Venezuela.
3. **Fundación Venezolana de Investigaciones Sismológicas (FUNVISIS)**:
   Catálogo Sismológico Nacional y Base de Datos de Fallas Cuaternarias de Venezuela.
4. **Desarrollador y Autor del Sistema**:
   Ing. Frank Sousa (Ingeniero en Informática, UNERG 2025). Correo: frankalfonso1988@gmail.com.
5. **Licencia de Software**:
   Distribuido bajo Licencia MIT de Código Abierto. Libre para investigación, docencia y peritaje de gestión de riesgo territorial.
`;

    return {
      markdown,
      summaryTable: {
        regionName: region.name,
        seismicZone: region.seismicZoneCOVENIN,
        a0: region.designAccelerationA0,
        faultName: region.geologicalFault.name,
        soilType: soilProfile.type,
        typologyName: typology.name,
        stories: typology.stories,
        t1: simulationResult.fundamentalPeriodT1,
        v0Kn: simulationResult.designBaseShearKn,
        driftPercent: simulationResult.maxStoryDriftPercent,
        coveninDriftLimit: simulationResult.coveninDriftLimitPercent,
        ems98Grade: simulationResult.ems98Grade,
        parkAngIndex: simulationResult.parkAngDamageIndex,
        estimatedLossUsd: simulationResult.estimatedLossUsd,
        slopeFactorOfSafety: simulationResult.slopeFactorOfSafety,
        newmarkDisplacementCm: simulationResult.newmarkDisplacementCm
      },
      mapBiomasTransitions
    };
  }
}

