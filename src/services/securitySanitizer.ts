/**
 * SIURPROV - Módulo de Seguridad, Sanitización de Entradas y Validación de Integridad
 * Autor: Ing. Frank Sousa (UNERG 2025)
 * San Juan de los Morros, Estado Guárico, Venezuela.
 */

import { MapBuilding, MultiHazardParameters } from '../types';

export class SecuritySanitizer {
  /**
   * Sanitiza cadenas de texto para prevenir XSS, inyecciones de código y caracteres peligrosos
   */
  public static sanitizeString(input: string, maxLength: number = 200): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>'"&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
          '&': '&amp;'
        };
        return entities[char] || char;
      });
  }

  /**
   * Valida y restringe las coordenadas dentro del cuadrante territorial de Venezuela (WGS84)
   * Latitud: 0.5°N a 13.5°N | Longitud: -74.0°O a -59.0°O
   */
  public static validateVenezuelaCoords(lat: number, lng: number): boolean {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return false;
    }
    return lat >= 0.5 && lat <= 13.5 && lng >= -74.0 && lng <= -59.0;
  }

  /**
   * Sanitiza y asegura una edificación colocada por el usuario antes de procesarla o persistirla
   */
  public static sanitizeUserBuilding(building: Partial<MapBuilding>): MapBuilding | null {
    if (!building || typeof building !== 'object') return null;

    const id = this.sanitizeString(building.id || `build-${Date.now()}`, 50);
    const name = this.sanitizeString(building.name || 'Edificación Proyecto', 100);
    const typeId = this.sanitizeString(building.typeId || 'porticos-nd3-sismo', 50);

    const x = Math.max(0, Math.min(100, Number(building.x) || 50));
    const y = Math.max(0, Math.min(100, Number(building.y) || 50));
    const elevationM = Math.max(0, Math.min(5000, Number(building.elevationM) || 100));
    const slopeDeg = Math.max(0, Math.min(65, Number(building.slopeDeg) || 15));
    const distanceToFaultKm = Math.max(0.1, Math.min(200, Number(building.distanceToFaultKm) || 10));
    const distanceToStreamM = Math.max(0, Math.min(5000, Number(building.distanceToStreamM) || 150));
    const stories = Math.max(1, Math.min(40, Math.round(Number(building.stories) || 4)));

    const validSoils = ['S1', 'S2', 'S3', 'S4'] as const;
    const soilType = validSoils.includes(building.soilType as any) ? building.soilType! : 'S3';

    return {
      id,
      name,
      typeId,
      x,
      y,
      elevationM,
      slopeDeg,
      distanceToFaultKm,
      distanceToStreamM,
      stories,
      soilType,
      isUserPlaced: true,
      yearConstructed: new Date().getFullYear()
    };
  }

  /**
   * Sanitiza los parámetros de escenarios multi-amenaza para prevenir desbordamientos o valores NaN
   */
  public static sanitizeScenario(params: Partial<MultiHazardParameters>): MultiHazardParameters {
    return {
      earthquake: {
        enabled: Boolean(params.earthquake?.enabled),
        pgaG: Math.max(0.01, Math.min(1.50, Number(params.earthquake?.pgaG) || 0.30)),
        magnitudeMw: Math.max(3.0, Math.min(9.0, Number(params.earthquake?.magnitudeMw) || 6.5)),
        depthKm: Math.max(1, Math.min(200, Number(params.earthquake?.depthKm) || 15)),
        durationSeconds: Math.max(5, Math.min(120, Number(params.earthquake?.durationSeconds) || 30)),
        distanceToFaultKm: Math.max(0.1, Math.min(150, Number(params.earthquake?.distanceToFaultKm) || 10))
      },
      debrisFlow: {
        enabled: Boolean(params.debrisFlow?.enabled),
        rainfallAccumulation24hMm: Math.max(0, Math.min(800, Number(params.debrisFlow?.rainfallAccumulation24hMm) || 150)),
        soilSaturationPercent: Math.max(0, Math.min(100, Number(params.debrisFlow?.soilSaturationPercent) || 75)),
        debrisVelocityMs: Math.max(0, Math.min(25, Number(params.debrisFlow?.debrisVelocityMs) || 7.0)),
        debrisDepthM: Math.max(0, Math.min(8.0, Number(params.debrisFlow?.debrisDepthM) || 1.8)),
        densityKgM3: Math.max(1200, Math.min(2400, Number(params.debrisFlow?.densityKgM3) || 1950)),
        boulderImpactSizeM: Math.max(0, Math.min(4.0, Number(params.debrisFlow?.boulderImpactSizeM) || 1.0))
      },
      flood: {
        enabled: Boolean(params.flood?.enabled),
        waterLevelM: Math.max(0, Math.min(6.0, Number(params.flood?.waterLevelM) || 1.0)),
        flowVelocityMs: Math.max(0, Math.min(8.0, Number(params.flood?.flowVelocityMs) || 1.5)),
        durationHours: Math.max(0, Math.min(168, Number(params.flood?.durationHours) || 6)),
        soilSaturationIncrease: Math.max(0, Math.min(60, Number(params.flood?.soilSaturationIncrease) || 25))
      },
      wind: {
        enabled: Boolean(params.wind?.enabled),
        speedKmh: Math.max(0, Math.min(250, Number(params.wind?.speedKmh) || 80)),
        gustFactor: Math.max(1.0, Math.min(2.0, Number(params.wind?.gustFactor) || 1.2))
      },
      slope: {
        enabled: Boolean(params.slope?.enabled),
        angleDeg: Math.max(0, Math.min(65, Number(params.slope?.angleDeg) || 30)),
        cohesionKpa: Math.max(0, Math.min(150, Number(params.slope?.cohesionKpa) || 18)),
        internalFrictionAngleDeg: Math.max(5, Math.min(50, Number(params.slope?.internalFrictionAngleDeg) || 26))
      }
    };
  }

  /**
   * Calcula un Checksum determinístico para verificar la integridad de un archivo de estudio
   */
  public static computeChecksum(content: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < content.length; i++) {
      hash ^= content.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    const unsigned = (hash >>> 0).toString(16).padStart(8, '0');
    // Sal complementaria de verificación basada en longitud
    const lenPart = (content.length * 31).toString(16).slice(-4);
    return `SIUR-${unsigned.toUpperCase()}-${lenPart.toUpperCase()}`;
  }

  /**
   * Valida la integridad de un archivo de estudio exportado (.siurprov / JSON)
   * Soporta tanto estructuras planas como paquetes anidados con studyData
   */
  public static validateStudyPackage(json: any): { valid: boolean; error?: string; isClean?: boolean } {
    if (!json || typeof json !== 'object') {
      return { valid: false, error: 'El archivo no contiene un objeto JSON válido.' };
    }

    // Prevención de Prototype Pollution
    if (Object.prototype.hasOwnProperty.call(json, '__proto__') || Object.prototype.hasOwnProperty.call(json, 'constructor')) {
      return { valid: false, error: 'Alerta de seguridad: Objeto malicioso detectado (Prototype Pollution).' };
    }

    if (json.fileType !== 'SIURPROV_STUDY') {
      return { valid: false, error: 'Formato incompatible: no es un estudio generado por SIURPROV.' };
    }

    // Extraer datos ya sea de studyData (paquete v1.3+) o de la raíz (retrocompatibilidad)
    const data = json.studyData || json;

    if (!data.regionId || typeof data.regionId !== 'string') {
      return { valid: false, error: 'Estructura de estudio inválida: falta el identificador de región territorial.' };
    }

    if (!data.scenario || typeof data.scenario !== 'object') {
      return { valid: false, error: 'Faltan los parámetros del escenario multi-amenaza en el estudio.' };
    }

    // Verificar metadata si existe
    if (json.metadata && typeof json.metadata === 'object') {
      if (json.metadata.title && typeof json.metadata.title !== 'string') {
        return { valid: false, error: 'El título del estudio debe ser una cadena de texto válida.' };
      }
    }

    // Verificar edificaciones si existen
    if (data.userPlacedBuildings && !Array.isArray(data.userPlacedBuildings)) {
      return { valid: false, error: 'La lista de edificaciones del usuario debe ser un arreglo válido.' };
    }

    return { valid: true, isClean: true };
  }
}
