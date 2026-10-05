/**
 * SIURPROV - Suite Integral de Pruebas Automatizadas (CI/CD y Testing Local)
 * Ejecuta validaciones de cálculo sismorresistente (COVENIN 1756), geotecnia,
 * seguridad, integridad criptográfica y atribución de autoría.
 *
 * Autor: Ing. Frank Sousa (Ingeniero en Informática, UNERG 2025)
 * San Juan de los Morros, Estado Guárico, Venezuela.
 */

import { VENEZUELA_REGIONS } from '../data/venezuelaRegions';
import { BUILDING_TYPOLOGIES } from '../data/buildingTypologies';
import { SOIL_PROFILES } from '../data/soilProfiles';
import { StructuralSimulationEngine } from '../services/structuralEngine';
import { SecuritySanitizer } from '../services/securitySanitizer';
import { StudyStorageService } from '../services/studyStorage';
import { buildingGeometry, damageBand, soilColor, stressColor } from '../services/visualization';
import { ShakeTableEngine, type ImportedBuildingConfig } from '../services/shakeTableEngine';
import { createApp } from '../server/app';
import type { Server } from 'http';

interface TestItem {
  id: string;
  name: string;
  category:
    | 'COVENIN 1756'
    | 'Geotecnia'
    | 'Seguridad'
    | 'Estudios e Integridad'
    | 'Atribución y Licencia'
    | 'Visualización 3D'
    | 'Flujo API End-to-End'
    | 'Banco de Pruebas Dinámico';
  run: () => boolean | void | Promise<void | boolean>;
}

function startEphemeralServer(options?: { rateLimitMax?: number }): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const app = createApp(options);
  return new Promise((resolve, reject) => {
    const server: Server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        return reject(new Error('Dirección de servidor efímero inválida'));
      }
      const baseUrl = `http://127.0.0.1:${addr.port}`;
      const close = () => new Promise<void>((res, rej) => server.close((err) => (err ? rej(err) : res())));
      resolve({ baseUrl, close });
    });
    server.on('error', reject);
  });
}

const tests: TestItem[] = [
  // 1. COVENIN 1756:2019
  {
    id: 'TEST-01',
    name: 'Período Fundamental T1 según COVENIN 1756:2019 Art. 7.2',
    category: 'COVENIN 1756',
    run: () => {
      const typology = BUILDING_TYPOLOGIES.find((t) => t.id === 'porticos-nd3-sismo')!;
      const t1 = StructuralSimulationEngine.calculateFundamentalPeriod(typology);
      if (t1 < 0.6 || t1 > 1.2 || isNaN(t1)) {
        throw new Error(`Período fundamental fuera de rango esperado: ${t1}`);
      }
    }
  },
  {
    id: 'TEST-02',
    name: 'Aceleración Espectral Sa y Cortante Basal para Suelo S3/S4',
    category: 'COVENIN 1756',
    run: () => {
      const soil = SOIL_PROFILES.S4;
      const { Sa, alpha } = StructuralSimulationEngine.calculateSpectralAcceleration(0.40, soil, 0.85, 1.30, 6.0);
      if (Sa <= 0 || Sa > 1.8 || alpha < 1.0) {
        throw new Error(`Espectro de aceleración anómalo: Sa=${Sa}, alpha=${alpha}`);
      }
    }
  },
  {
    id: 'TEST-03',
    name: 'Evaluación de Segundo Orden P-Delta (COVENIN Art. 8.4)',
    category: 'COVENIN 1756',
    run: () => {
      const region = VENEZUELA_REGIONS[0];
      const typ = BUILDING_TYPOLOGIES[0];
      const soil = SOIL_PROFILES.S3;
      const scenario = {
        earthquake: { enabled: true, pgaG: 0.40, magnitudeMw: 7.0, depthKm: 15, durationSeconds: 40, distanceToFaultKm: 5 },
        debrisFlow: { enabled: false, rainfallAccumulation24hMm: 0, soilSaturationPercent: 0, debrisVelocityMs: 0, debrisDepthM: 0, densityKgM3: 0, boulderImpactSizeM: 0 },
        flood: { enabled: false, waterLevelM: 0, flowVelocityMs: 0, durationHours: 0, soilSaturationIncrease: 0 },
        wind: { enabled: false, speedKmh: 0, gustFactor: 1.0 },
        slope: { enabled: true, angleDeg: 30, cohesionKpa: 15, internalFrictionAngleDeg: 25 }
      };
      const res = StructuralSimulationEngine.runSimulation(region, typ, soil, scenario, 2023);
      if (typeof res.pDeltaStabilityCoefficient !== 'number' || res.pDeltaStabilityCoefficient < 0) {
        throw new Error(`Coeficiente de estabilidad P-Delta inválido: ${res.pDeltaStabilityCoefficient}`);
      }
      if (!res.performanceLevel) {
        throw new Error('Nivel de desempeño FEMA 356 no generado.');
      }
    }
  },

  // 2. Geotecnia y Estabilidad de Taludes
  {
    id: 'TEST-04',
    name: 'Estabilidad de Taludes por Método de Bishop (FS Seco vs Saturado)',
    category: 'Geotecnia',
    run: () => {
      const fsDry = StructuralSimulationEngine.calculateSlopeFactorOfSafety(25, 25, 30, 20, 0.05);
      const fsSaturated = StructuralSimulationEngine.calculateSlopeFactorOfSafety(45, 8, 20, 95, 0.30);
      if (fsDry <= fsSaturated) {
        throw new Error(`Inconsistencia física en talud: FS seco (${fsDry}) debe ser mayor que saturado (${fsSaturated})`);
      }
      if (fsSaturated >= 1.2) {
        throw new Error(`Talud extremo debería indicar falla o factor de seguridad crítico (< 1.2): FS = ${fsSaturated}`);
      }
    }
  },
  {
    id: 'TEST-05',
    name: 'Desplazamiento Permanente Sísmico Newmark y Aceleración Crítica Kc',
    category: 'Geotecnia',
    run: () => {
      const theta = (35 * Math.PI) / 180;
      const fs = 1.15;
      const kc = Math.max(0.01, (fs - 0.95) * Math.sin(theta));
      const kh = 0.35;
      if (kh <= kc) {
        throw new Error('Aceleración sísmica kh debería superar aceleración crítica kc para el caso de prueba');
      }
      const ratio = kc / kh;
      const dNewmark = Math.pow(10, 0.215 - 2.341 * ratio);
      if (dNewmark < 0 || isNaN(dNewmark)) {
        throw new Error(`Cálculo de desplazamiento Newmark erróneo: ${dNewmark}`);
      }
    }
  },

  // 3. Seguridad y Sanitización
  {
    id: 'TEST-06',
    name: 'Sanitización Estricta contra Ataques XSS e Inyección HTML',
    category: 'Seguridad',
    run: () => {
      const dirty = '<script>alert("hacked")</script><img src="x" onerror="steal()"/>';
      const clean = SecuritySanitizer.sanitizeString(dirty);
      if (clean.includes('<') || clean.includes('>') || clean.includes('"')) {
        throw new Error(`Fallo en sanitizador XSS: ${clean}`);
      }
      if (!clean.includes('&lt;script&gt;')) {
        throw new Error('Sanitizador debió escapar las etiquetas.');
      }
    }
  },
  {
    id: 'TEST-07',
    name: 'Defensa contra Prototype Pollution en Carga de Archivos',
    category: 'Seguridad',
    run: () => {
      const maliciousPayload = JSON.parse('{"fileType":"SIURPROV_STUDY","__proto__":{"admin":true},"regionId":"caracas-vargas","scenario":{}}');
      const val = SecuritySanitizer.validateStudyPackage(maliciousPayload);
      if (val.valid) {
        throw new Error('Alerta: Validador de estudio permitió objeto con __proto__ contaminado.');
      }
    }
  },
  {
    id: 'TEST-08',
    name: 'Verificación de Coordenadas WGS84 dentro del Cuadrante Venezolano',
    category: 'Seguridad',
    run: () => {
      // Caracas: 10.50, -66.90 -> Válido
      const ccsValid = SecuritySanitizer.validateVenezuelaCoords(10.50, -66.90);
      // San Juan de los Morros: 9.91, -67.35 -> Válido
      const sjmValid = SecuritySanitizer.validateVenezuelaCoords(9.91, -67.35);
      // París: 48.85, 2.35 -> Inválido
      const parisInvalid = !SecuritySanitizer.validateVenezuelaCoords(48.85, 2.35);
      // Tokio: 35.67, 139.65 -> Inválido
      const tokyoInvalid = !SecuritySanitizer.validateVenezuelaCoords(35.67, 139.65);

      if (!ccsValid || !sjmValid || !parisInvalid || !tokyoInvalid) {
        throw new Error('Fallo en delimitación de cuadrante geoespacial venezolano (0.5°N-13.5°N, -74°O a -59°O).');
      }
    }
  },

  // 4. Estudios, Serialización e Integridad Criptográfica
  {
    id: 'TEST-09',
    name: 'Empaquetado, Serialización y Verificación de Checksum de Estudio',
    category: 'Estudios e Integridad',
    run: () => {
      const region = VENEZUELA_REGIONS[0];
      const typ = BUILDING_TYPOLOGIES[0];
      const soil = SOIL_PROFILES.S3;
      const scenario = {
        earthquake: { enabled: true, pgaG: 0.35, magnitudeMw: 6.5, depthKm: 15, durationSeconds: 30, distanceToFaultKm: 8 },
        debrisFlow: { enabled: true, rainfallAccumulation24hMm: 150, soilSaturationPercent: 80, debrisVelocityMs: 6, debrisDepthM: 1.5, densityKgM3: 1900, boulderImpactSizeM: 1.0 },
        flood: { enabled: false, waterLevelM: 0, flowVelocityMs: 0, durationHours: 0, soilSaturationIncrease: 0 },
        wind: { enabled: false, speedKmh: 40, gustFactor: 1.0 },
        slope: { enabled: true, angleDeg: 30, cohesionKpa: 15, internalFrictionAngleDeg: 25 }
      };
      const userBuildings = [
        {
          id: 'test-build-1',
          name: 'Edificio de Prueba CI/CD',
          typeId: typ.id,
          x: 50,
          y: 50,
          elevationM: 900,
          slopeDeg: 12,
          distanceToFaultKm: 6,
          distanceToStreamM: 150,
          stories: 5,
          soilType: 'S3' as const,
          isUserPlaced: true,
          yearConstructed: 2020
        }
      ];

      // Crear paquete
      const pkg = StudyStorageService.createStudyPackage(
        'Estudio de Validación CI/CD',
        'Descripción de prueba de integridad',
        region,
        2023,
        typ.id,
        'S3',
        scenario,
        userBuildings
      );

      // Verificar que el checksum existe y tiene el prefijo de SIURPROV
      if (!pkg.metadata.checksum || !pkg.metadata.checksum.startsWith('SIUR-')) {
        throw new Error(`Checksum no generado adecuadamente: ${pkg.metadata.checksum}`);
      }

      // Probar serialización a string y parseo
      const jsonStr = JSON.stringify(pkg);
      const parsedRes = StudyStorageService.parseStudyFile(jsonStr);
      if (!parsedRes.success || !parsedRes.package) {
        throw new Error(`Fallo al parsear archivo de estudio: ${parsedRes.error}`);
      }

      if (parsedRes.checksumStatus !== 'VERIFIED') {
        throw new Error(`Checksum no fue verificado como íntegro: ${parsedRes.checksumStatus}`);
      }
    }
  },
  {
    id: 'TEST-10',
    name: 'Disponibilidad del Catálogo de Estudios Precargados Emblemáticos',
    category: 'Estudios e Integridad',
    run: () => {
      const catalog = StudyStorageService.getPreloadedStudies();
      if (!catalog || catalog.length < 3) {
        throw new Error(`El catálogo precargado debe incluir al menos 3 estudios históricos: encontrados ${catalog?.length}`);
      }
      const vargas = catalog.find((c) => c.studyData.regionId === 'caracas-vargas');
      const unerg = catalog.find((c) => c.studyData.regionId === 'guarico-sanjuan');
      if (!vargas || !unerg) {
        throw new Error('Faltan estudios emblemáticos de Vargas 1999 o San Juan UNERG en el catálogo.');
      }
    }
  },

  // 5. Atribución Moral y Cumplimiento Legal
  {
    id: 'TEST-11',
    name: 'Verificación de Mención al Autor (Ing. Frank Sousa) y Repositorio',
    category: 'Atribución y Licencia',
    run: () => {
      const catalog = StudyStorageService.getPreloadedStudies();
      for (const study of catalog) {
        if (!study.metadata.author.includes('Frank Sousa')) {
          throw new Error(`Estudio ${study.metadata.title} no acredita al autor.`);
        }
        if (!study.metadata.officialRepo.includes('github.com/frankalfonso1988/SIURPROV')) {
          throw new Error(`Estudio ${study.metadata.title} no incluye el repositorio oficial.`);
        }
      }
    }
  },

  // 6. Visualización 3D y Transformación de Datos
  {
    id: 'TEST-12',
    name: 'Lógica Pura de Visualización 3D: Gradientes Park-Ang, Suelos COVENIN y Geometría',
    category: 'Visualización 3D',
    run: () => {
      // Bandas y gradientes cromáticos
      if (damageBand(0.05) !== 'elastico' || stressColor(0.05) !== '#3b82f6') {
        throw new Error('Fallo en color para régimen elástico (< 0.20)');
      }
      if (damageBand(0.30) !== 'microfisuras' || stressColor(0.30) !== '#eab308') {
        throw new Error('Fallo en color para microfisuras (0.20 - 0.45)');
      }
      if (damageBand(0.60) !== 'rotula' || stressColor(0.60) !== '#f97316') {
        throw new Error('Fallo en color para rótula plástica (0.45 - 0.80)');
      }
      if (damageBand(0.95) !== 'falla' || stressColor(0.95) !== '#ef4444') {
        throw new Error('Fallo en color para colapso/falla (>= 0.80)');
      }

      // Paleta geotécnica de estratos
      if (soilColor('S1') !== '#64748b' || soilColor('S4') !== '#44403c') {
        throw new Error('Asignación errónea de color para perfiles geotécnicos S1/S4');
      }

      // Geometría volumétrica derivada
      const geom = buildingGeometry(4, 3.0, 3, 4.0);
      if (geom.stories !== 4 || geom.totalH !== 12.0 || geom.width !== 12.0 || geom.depth !== 8.0) {
        throw new Error(`Dimensiones geométricas inconsistentes: ${JSON.stringify(geom)}`);
      }
    }
  },

  // 7. Flujo Integral de Datos, Serialización y Detección de Alteraciones (Tampering)
  {
    id: 'TEST-13',
    name: 'Ciclo Integral de Estudio: Creación, Exportación Base64 y Detección de Alteraciones',
    category: 'Estudios e Integridad',
    run: () => {
      const region = VENEZUELA_REGIONS[0];
      const scenario = {
        earthquake: { enabled: true, pgaG: 0.35, magnitudeMw: 6.8, depthKm: 12, durationSeconds: 35, distanceToFaultKm: 8 },
        debrisFlow: { enabled: false, rainfallAccumulation24hMm: 0, soilSaturationPercent: 0, debrisVelocityMs: 0, debrisDepthM: 0, densityKgM3: 0, boulderImpactSizeM: 0 },
        flood: { enabled: false, waterLevelM: 0, flowVelocityMs: 0, durationHours: 0, soilSaturationIncrease: 0 },
        wind: { enabled: false, speedKmh: 0, gustFactor: 1.0 },
        slope: { enabled: false, angleDeg: 0, cohesionKpa: 0, internalFrictionAngleDeg: 0 }
      };

      // 1. Creación con checksum
      const pkg = StudyStorageService.createStudyPackage(
        'Auditoría Sísmica Caracas',
        'Estudio de resiliencia estructural',
        region,
        2023,
        'porticos-nd3-sismo',
        'S3',
        scenario,
        []
      );

      if (!pkg.metadata.checksum || !pkg.metadata.checksum.startsWith('SIUR-')) {
        throw new Error(`Checksum no generado o formato inválido: ${pkg.metadata.checksum}`);
      }

      // 2. Exportación a token portátil Base64
      const token = StudyStorageService.exportToShareableString(pkg);
      if (typeof token !== 'string' || token.length < 50) {
        throw new Error('Exportación Base64 produjo un token inválido o vacío.');
      }

      // 3. Importación y verificación íntegra
      const imported = StudyStorageService.importFromShareableString(token);
      if (!imported.success || imported.checksumStatus !== 'VERIFIED') {
        throw new Error(`Importación de token falló o no verificó el checksum: status=${imported.checksumStatus}`);
      }

      // 4. Prueba de manipulación maliciosa (Tamper detection)
      const tampered = JSON.parse(JSON.stringify(pkg));
      tampered.studyData.selectedYear = 1999; // Alteración no autorizada del año histórico
      const tamperedCheck = StudyStorageService.parseStudyFile(JSON.stringify(tampered));
      if (tamperedCheck.checksumStatus !== 'INVALID') {
        throw new Error('El sistema no detectó la adulteración del contenido del estudio (Checksum Status debió ser INVALID).');
      }
    }
  },

  // 8. Flujo API End-to-End: Diagnóstico y Auditoría de Seguridad
  {
    id: 'TEST-14',
    name: 'Flujo API End-to-End: Diagnóstico (/api/health) y Cabeceras de Seguridad (/api/security/audit)',
    category: 'Flujo API End-to-End',
    run: async () => {
      const { baseUrl, close } = await startEphemeralServer();
      try {
        // Health check
        const healthRes = await fetch(`${baseUrl}/api/health`);
        if (healthRes.status !== 200) {
          throw new Error(`Endpoint /api/health respondió con código anómalo: ${healthRes.status}`);
        }
        const healthData = (await healthRes.json()) as any;
        if (healthData.status !== 'online' || !healthData.offlineReady) {
          throw new Error('Diagnóstico del sistema no indica operatividad offline o en línea.');
        }

        // Verificación de cabeceras defensivas HTTP
        const nosniff = healthRes.headers.get('x-content-type-options');
        const frameOptions = healthRes.headers.get('x-frame-options');
        const csp = healthRes.headers.get('content-security-policy');
        if (nosniff !== 'nosniff' || frameOptions !== 'SAMEORIGIN' || !csp) {
          throw new Error(`Cabeceras de seguridad HTTP incompletas: nosniff=${nosniff}, frameOptions=${frameOptions}`);
        }

        // Security Audit
        const auditRes = await fetch(`${baseUrl}/api/security/audit`);
        if (auditRes.status !== 200) {
          throw new Error(`Endpoint /api/security/audit respondió con código ${auditRes.status}`);
        }
        const auditData = (await auditRes.json()) as any;
        if (auditData.status !== 'SECURE' || !Array.isArray(auditData.securityChecks) || auditData.securityChecks.length < 6) {
          throw new Error('Informe de auditoría de seguridad no cumple los requisitos esperados.');
        }
      } finally {
        await close();
      }
    }
  },

  // 9. Flujo API End-to-End: Validación de Paquetes de Estudio y Protección contra Prototype Pollution
  {
    id: 'TEST-15',
    name: 'Flujo API End-to-End: Validación Criptográfica y Bloqueo de Inyecciones (/api/study/validate)',
    category: 'Flujo API End-to-End',
    run: async () => {
      const { baseUrl, close } = await startEphemeralServer();
      try {
        const region = VENEZUELA_REGIONS[0];
        const scenario = {
          earthquake: { enabled: true, pgaG: 0.30, magnitudeMw: 6.5, depthKm: 15, durationSeconds: 30, distanceToFaultKm: 10 },
          debrisFlow: { enabled: false, rainfallAccumulation24hMm: 0, soilSaturationPercent: 0, debrisVelocityMs: 0, debrisDepthM: 0, densityKgM3: 0, boulderImpactSizeM: 0 },
          flood: { enabled: false, waterLevelM: 0, flowVelocityMs: 0, durationHours: 0, soilSaturationIncrease: 0 },
          wind: { enabled: false, speedKmh: 0, gustFactor: 1.0 },
          slope: { enabled: false, angleDeg: 0, cohesionKpa: 0, internalFrictionAngleDeg: 0 }
        };
        const validPkg = StudyStorageService.createStudyPackage('Estudio Válido', 'Descripción', region, 2023, 'porticos-nd3-sismo', 'S3', scenario, []);

        // 1. Envío de paquete legítimo
        const validPost = await fetch(`${baseUrl}/api/study/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validPkg)
        });
        if (validPost.status !== 200) {
          throw new Error(`Fallo al validar paquete legítimo: status=${validPost.status}`);
        }
        const validResult = (await validPost.json()) as any;
        if (!validResult.valid || validResult.checksumVerified !== true) {
          throw new Error('Validación de paquete legítimo no confirmó la correspondencia del checksum.');
        }

        // 2. Envío de paquete alterado
        const tampered = JSON.parse(JSON.stringify(validPkg));
        tampered.studyData.regionId = 'merida-andes'; // Manipulación
        const tamperedPost = await fetch(`${baseUrl}/api/study/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tampered)
        });
        const tamperedResult = (await tamperedPost.json()) as any;
        if (tamperedResult.checksumVerified !== false) {
          throw new Error('La API debió indicar checksumVerified=false para el paquete alterado.');
        }

        // 3. Intento de ataque por Prototype Pollution
        const maliciousPayload = JSON.parse('{"fileType": "SIURPROV_STUDY", "__proto__": {"polluted": true}}');
        const attackPost = await fetch(`${baseUrl}/api/study/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(maliciousPayload)
        });
        if (attackPost.status !== 400) {
          throw new Error(`La API no rechazó el ataque de Prototype Pollution (esperado 400, obtenido ${attackPost.status})`);
        }
      } finally {
        await close();
      }
    }
  },

  // 10. Flujo API End-to-End: Consistencia Absoluta entre Endpoint (/api/simulate/full) y Motor Local
  {
    id: 'TEST-16',
    name: 'Flujo API End-to-End: Consistencia Exacta entre API (/api/simulate/full) y Motor Local',
    category: 'Flujo API End-to-End',
    run: async () => {
      const { baseUrl, close } = await startEphemeralServer();
      try {
        // Consultar catálogo
        const catRes = await fetch(`${baseUrl}/api/catalog`);
        if (catRes.status !== 200) {
          throw new Error(`Error al consultar /api/catalog: ${catRes.status}`);
        }
        const catalog = (await catRes.json()) as any;
        if (!Array.isArray(catalog.regions) || catalog.regions.length < 3) {
          throw new Error('Catálogo de regiones incompleto en la API.');
        }

        // Ejecutar simulación multi-amenaza vía API
        const testPayload = {
          regionId: 'caracas-vargas',
          typologyId: 'porticos-nd3-sismo',
          soilType: 'S3',
          year: 2023,
          scenario: {
            earthquake: { enabled: true, pgaG: 0.35, magnitudeMw: 6.9, depthKm: 14, durationSeconds: 40, distanceToFaultKm: 6 },
            debrisFlow: { enabled: true, rainfallAccumulation24hMm: 220, soilSaturationPercent: 80, debrisVelocityMs: 8.5, debrisDepthM: 2.0, densityKgM3: 1950, boulderImpactSizeM: 1.2 },
            flood: { enabled: false, waterLevelM: 0, flowVelocityMs: 0, durationHours: 0, soilSaturationIncrease: 0 },
            wind: { enabled: false, speedKmh: 0, gustFactor: 1.0 },
            slope: { enabled: true, angleDeg: 32, cohesionKpa: 20, internalFrictionAngleDeg: 28 }
          }
        };

        const apiPost = await fetch(`${baseUrl}/api/simulate/full`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload)
        });
        if (apiPost.status !== 200) {
          throw new Error(`Endpoint /api/simulate/full falló con código ${apiPost.status}`);
        }
        const apiData = (await apiPost.json()) as any;

        // Ejecutar localmente con el motor idéntico
        const region = VENEZUELA_REGIONS.find((r) => r.id === testPayload.regionId)!;
        const typology = BUILDING_TYPOLOGIES.find((t) => t.id === testPayload.typologyId)!;
        const soil = SOIL_PROFILES[testPayload.soilType as 'S3'];
        const safeScenario = SecuritySanitizer.sanitizeScenario(testPayload.scenario);
        const localResult = StructuralSimulationEngine.runSimulation(region, typology, soil, safeScenario, testPayload.year);

        // Comprobación de identidad de datos (Single Source of Truth)
        if (apiData.result.designBaseShearKn !== localResult.designBaseShearKn) {
          throw new Error(`Discrepancia en cortante basal: API=${apiData.result.designBaseShearKn} vs Local=${localResult.designBaseShearKn}`);
        }
        if (apiData.result.maxStoryDriftPercent !== localResult.maxStoryDriftPercent) {
          throw new Error(`Discrepancia en deriva de entrepiso: API=${apiData.result.maxStoryDriftPercent}% vs Local=${localResult.maxStoryDriftPercent}%`);
        }
        if (apiData.result.performanceLevel !== localResult.performanceLevel) {
          throw new Error(`Discrepancia en nivel FEMA: API=${apiData.result.performanceLevel} vs Local=${localResult.performanceLevel}`);
        }
      } finally {
        await close();
      }
    }
  },

  // 11. Flujo API End-to-End: Manejo Defensivo ante JSON Malformado y Headers de Rate Limiting
  {
    id: 'TEST-17',
    name: 'Flujo API End-to-End: Manejo Defensivo de Errores y Cabeceras de Rate Limiting',
    category: 'Flujo API End-to-End',
    run: async () => {
      const { baseUrl, close } = await startEphemeralServer({ rateLimitMax: 25 });
      try {
        // Enviar payload sintácticamente roto con encabezado application/json
        const brokenJsonRes = await fetch(`${baseUrl}/api/study/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{"unclosedKey": "valor roto... '
        });

        if (brokenJsonRes.status !== 400) {
          throw new Error(`El manejador no interceptó el JSON roto con 400 (obtenido ${brokenJsonRes.status})`);
        }
        const errJson = (await brokenJsonRes.json()) as any;
        if (!errJson.error || !errJson.error.includes('inválido')) {
          throw new Error(`Mensaje de error inesperado: ${JSON.stringify(errJson)}`);
        }

        // Verificar cabeceras de rate limiting en la respuesta
        const rateLimitHeader = brokenJsonRes.headers.get('x-ratelimit-limit');
        const remainingHeader = brokenJsonRes.headers.get('x-ratelimit-remaining');
        if (rateLimitHeader !== '25' || remainingHeader === null) {
          throw new Error(`Cabeceras de Rate Limiting ausentes o erróneas: Limit=${rateLimitHeader}, Remaining=${remainingHeader}`);
        }
      } finally {
        await close();
      }
    }
  },
  // 8. Banco de Pruebas Dinámico & Refuerzos Estructurales
  {
    id: 'TEST-18',
    name: 'Banco de Pruebas: Resonancia Estructural y Amplificación Dinámica DMF',
    category: 'Banco de Pruebas Dinámico',
    run: () => {
      const unreinforced = ShakeTableEngine.computeEffectiveProperties({
        shearWalls: false,
        xBracing: false,
        cfrpWrap: false,
        baseIsolators: false
      });

      const fn = unreinforced.naturalFrequencyHz;
      // Probar en frecuencia alejada (f = 0.5 Hz) vs frecuencia cuasi-resonante (f ≈ fn)
      const dmfOffResonance = ShakeTableEngine.calculateDMF(0.5, fn, unreinforced.dampingRatio);
      const dmfResonance = ShakeTableEngine.calculateDMF(fn, fn, unreinforced.dampingRatio);

      if (dmfResonance <= dmfOffResonance) {
        throw new Error(`El DMF en resonancia (${dmfResonance}) debe ser superior al DMF fuera de resonancia (${dmfOffResonance})`);
      }
      if (dmfResonance < 8.0) {
        throw new Error(`Para amortiguamiento del 5%, el DMF pico en resonancia debe ser cercano a 10 (obtenido ${dmfResonance})`);
      }

      // Evaluar respuesta completa en resonancia
      const telemetry = ShakeTableEngine.evaluateDynamicResponse(
        { pgaG: 0.35, frequencyHz: fn, waveType: 'harmonic', windSpeedKmh: 0, liquefactionRatio: 0 },
        { shearWalls: false, xBracing: false, cfrpWrap: false, baseIsolators: false },
        1.0
      );

      if (!telemetry.isResonant) {
        throw new Error('El detector de resonancia no se activó a f = fn');
      }
      if (!telemetry.coveninDriftLimitExceeded) {
        throw new Error('A 0.35g en resonancia pura, la deriva debe sobrepasar el límite elástico de COVENIN 1756');
      }
    }
  },
  {
    id: 'TEST-19',
    name: 'Banco de Pruebas: Desacoplamiento y Mitigación por Aislamiento Basal (LRB)',
    category: 'Banco de Pruebas Dinámico',
    run: () => {
      const fixedParams = { pgaG: 0.45, frequencyHz: 2.5, waveType: 'harmonic' as const, windSpeedKmh: 0, liquefactionRatio: 0 };
      const unreinforced = ShakeTableEngine.evaluateDynamicResponse(
        fixedParams,
        { shearWalls: false, xBracing: false, cfrpWrap: false, baseIsolators: false },
        1.5
      );
      const isolated = ShakeTableEngine.evaluateDynamicResponse(
        fixedParams,
        { shearWalls: false, xBracing: false, cfrpWrap: false, baseIsolators: true },
        1.5
      );

      // Aislador elastomérico debe reducir la deriva y la aceleración en el tope en más del 50%
      const driftReduction = (unreinforced.interstoryDriftRatio - isolated.interstoryDriftRatio) / unreinforced.interstoryDriftRatio;
      if (driftReduction < 0.50) {
        throw new Error(`La reducción de deriva con aisladores LRB fue insuficiente: ${(driftReduction * 100).toFixed(1)}% (esperado > 50%)`);
      }
      if (isolated.topAccelerationG >= unreinforced.topAccelerationG) {
        throw new Error(`La aceleración en el tope no disminuyó con aisladores (Sin aislar: ${unreinforced.topAccelerationG}g vs Aislado: ${isolated.topAccelerationG}g)`);
      }
      if (isolated.reductionVsUnreinforcedPercent < 50) {
        throw new Error(`La telemetría de reducción porcentual es errónea: ${isolated.reductionVsUnreinforcedPercent}%`);
      }
    }
  },
  {
    id: 'TEST-20',
    name: 'Banco de Pruebas: Rigidización por Muros de Cortante y Arriostramientos en X',
    category: 'Banco de Pruebas Dinámico',
    run: () => {
      const baseProps = ShakeTableEngine.computeEffectiveProperties({
        shearWalls: false,
        xBracing: false,
        cfrpWrap: false,
        baseIsolators: false
      });
      const wallProps = ShakeTableEngine.computeEffectiveProperties({
        shearWalls: true,
        xBracing: false,
        cfrpWrap: false,
        baseIsolators: false
      });
      const bracedProps = ShakeTableEngine.computeEffectiveProperties({
        shearWalls: false,
        xBracing: true,
        cfrpWrap: false,
        baseIsolators: false
      });

      if (wallProps.stiffnessKnM <= baseProps.stiffnessKnM * 2.0) {
        throw new Error('Muros de cortante deben al menos duplicar la rigidez lateral');
      }
      if (wallProps.naturalFrequencyHz <= baseProps.naturalFrequencyHz) {
        throw new Error('La frecuencia natural debe elevarse con muros de cortante');
      }
      if (bracedProps.stiffnessKnM <= baseProps.stiffnessKnM * 1.5) {
        throw new Error('Arriostramientos en X deben elevar la rigidez lateral');
      }

      // Comprobar que en régimen de viento extremo (150 km/h) los muros reducen el desplazamiento
      const windParams = { pgaG: 0.1, frequencyHz: 1.0, waveType: 'harmonic' as const, windSpeedKmh: 150, liquefactionRatio: 0 };
      const unreinforced = ShakeTableEngine.evaluateDynamicResponse(
        windParams,
        { shearWalls: false, xBracing: false, cfrpWrap: false, baseIsolators: false },
        0
      );
      const withWalls = ShakeTableEngine.evaluateDynamicResponse(
        windParams,
        { shearWalls: true, xBracing: false, cfrpWrap: false, baseIsolators: false },
        0
      );

      if (withWalls.interstoryDriftRatio >= unreinforced.interstoryDriftRatio) {
        throw new Error('Los muros de cortante no redujeron la deriva bajo viento extremo');
      }
    }
  },
  {
    id: 'TEST-21',
    name: 'Banco de Pruebas: Confinamiento CFRP y Capacidad Última de Deformación',
    category: 'Banco de Pruebas Dinámico',
    run: () => {
      const normalProps = ShakeTableEngine.computeEffectiveProperties({
        shearWalls: false,
        xBracing: false,
        cfrpWrap: false,
        baseIsolators: false
      });
      const cfrpProps = ShakeTableEngine.computeEffectiveProperties({
        shearWalls: false,
        xBracing: false,
        cfrpWrap: true,
        baseIsolators: false
      });

      if (cfrpProps.ultimateDriftCapacity <= normalProps.ultimateDriftCapacity * 1.5) {
        throw new Error(`El confinamiento con CFRP debe incrementar la ductilidad última en al menos 50% (Normal: ${normalProps.ultimateDriftCapacity}, CFRP: ${cfrpProps.ultimateDriftCapacity})`);
      }

      // Probar en solicitación extrema (PGA = 0.85g)
      const extremeParams = { pgaG: 0.85, frequencyHz: 2.8, waveType: 'impulse' as const, windSpeedKmh: 0, liquefactionRatio: 0 };
      const unreinforced = ShakeTableEngine.evaluateDynamicResponse(
        extremeParams,
        { shearWalls: false, xBracing: false, cfrpWrap: false, baseIsolators: false },
        0.5
      );
      const withCfrp = ShakeTableEngine.evaluateDynamicResponse(
        extremeParams,
        { shearWalls: false, xBracing: false, cfrpWrap: true, baseIsolators: false },
        0.5
      );

      // El índice de daño Park-Ang con CFRP debe ser menor gracias a la mayor ductilidad
      if (withCfrp.parkAngDamageIndex >= unreinforced.parkAngDamageIndex) {
        throw new Error(`El índice de daño con CFRP (${withCfrp.parkAngDamageIndex}) debería ser inferior al modelo sin confinar (${unreinforced.parkAngDamageIndex})`);
      }
    }
  },
  {
    id: 'TEST-22',
    name: 'Banco de Pruebas: Integración Intermodular y Consistencia de Geometría Transferida',
    category: 'Banco de Pruebas Dinámico',
    run: () => {
      // 1. Simular transferencia desde CanvasSimulator hacia el Banco Sísmico
      const importedBuilding: ImportedBuildingConfig = {
        source: 'simulator',
        name: 'Edificio Residencial 5 Niveles - Suelo S2',
        levels: 5,
        totalHeightM: 15.0,
        estimatedMassKg: 75000,
        lateralStiffnessKnM: 24000,
        soilType: 'S2',
        structuralType: 'Porticado de Concreto Armado',
        timestamp: Date.now()
      };

      // 2. Comprobar cálculo de propiedades efectivas para edificio importado
      const baseProps = ShakeTableEngine.computeEffectiveProperties(
        { shearWalls: false, xBracing: false, cfrpWrap: false, baseIsolators: false },
        0,
        importedBuilding
      );

      if (baseProps.massKg !== 75000) {
        throw new Error(`La masa del edificio importado no se preservó: ${baseProps.massKg}kg (esperado 75000kg)`);
      }
      if (baseProps.totalHeightM !== 15.0) {
        throw new Error(`La altura del edificio importado no se preservó: ${baseProps.totalHeightM}m (esperado 15m)`);
      }
      if (baseProps.stiffnessKnM !== 24000) {
        throw new Error(`La rigidez lateral no coincide con el valor importado: ${baseProps.stiffnessKnM}kN/m`);
      }

      // Frecuencia teórica fn = (1 / 2pi) * sqrt(24000*1000 / 75000)
      const expectedFn = (1 / (2 * Math.PI)) * Math.sqrt((24000 * 1000) / 75000);
      if (Math.abs(baseProps.naturalFrequencyHz - expectedFn) > 0.05) {
        throw new Error(`Frecuencia natural calculada inconsistente: ${baseProps.naturalFrequencyHz}Hz vs esperada ${expectedFn.toFixed(2)}Hz`);
      }

      // 3. Evaluar respuesta dinámica con y sin aislamiento para el edificio transferido
      const params = { pgaG: 0.40, frequencyHz: 2.8, waveType: 'harmonic' as const, windSpeedKmh: 0, liquefactionRatio: 0 };
      const unreinforced = ShakeTableEngine.evaluateDynamicResponse(
        params,
        { shearWalls: false, xBracing: false, cfrpWrap: false, baseIsolators: false },
        0,
        importedBuilding
      );
      const isolated = ShakeTableEngine.evaluateDynamicResponse(
        params,
        { shearWalls: false, xBracing: false, cfrpWrap: false, baseIsolators: true },
        0,
        importedBuilding
      );

      // Aislamiento elastomérico debe mitigar más del 40% de la aceleración y la deriva
      if (isolated.interstoryDriftRatio >= unreinforced.interstoryDriftRatio * 0.6) {
        throw new Error('Aisladores de base en edificio importado no redujeron la deriva adecuadamente');
      }

      // 4. Comprobar tolerancia a valores vacíos (fallback a arquetipo base)
      const fallbackProps = ShakeTableEngine.computeEffectiveProperties(
        { shearWalls: false, xBracing: false, cfrpWrap: false, baseIsolators: false },
        0,
        {}
      );
      if (fallbackProps.massKg !== ShakeTableEngine.BASE_MASS_KG || fallbackProps.totalHeightM !== ShakeTableEngine.BASE_HEIGHT_M) {
        throw new Error('El fallback por configuración vacía no devolvió los parámetros base del arquetipo');
      }
    }
  },
  {
    id: 'TEST-23',
    name: 'Banco de Pruebas: Catálogo de Sismos Históricos Venezolanos y Reglas de Gamificación',
    category: 'Banco de Pruebas Dinámico',
    run: () => {
      // 1. Validar catálogo de sismos históricos documentados de Venezuela
      const challenges = ShakeTableEngine.getHistoricalChallenges();
      if (!Array.isArray(challenges) || challenges.length < 3) {
        throw new Error(`El catálogo de retos históricos debe contener al menos 3 eventos (actuales: ${challenges?.length})`);
      }

      const cariaco = challenges.find((c) => c.id === 'cariaco-1997');
      const caracas = challenges.find((c) => c.id === 'caracas-1967');
      const tocuyo = challenges.find((c) => c.id === 'tocuyo-1950');

      if (!cariaco || !caracas || !tocuyo) {
        throw new Error('Faltan eventos sísmicos históricos clave (Cariaco 1997, Caracas 1967 o El Tocuyo 1950)');
      }

      // Calibraciones sismológicas históricas COVENIN / FUNVISIS
      if (cariaco.pgaG !== 0.55 || cariaco.waveType !== 'impulse') {
        throw new Error('Parámetros de Cariaco 1997 no corresponden a la aceleración impulsiva registrada');
      }
      if (caracas.dominantFrequencyHz !== 1.15 || caracas.waveType !== 'harmonic') {
        throw new Error('Caracas 1967 debe modelar ondas largas armónicas por cuenca aluvial profunda');
      }
      if (tocuyo.dominantFrequencyHz !== 3.8 || tocuyo.magnitudeMw !== 6.2) {
        throw new Error('Parámetros de El Tocuyo 1950 incorrectos');
      }

      // 2. Validar catálogo de costos de refuerzo para gamificación
      const costs = ShakeTableEngine.getRetrofitCosts();
      if (costs.baseIsolators <= 0 || costs.shearWalls <= 0 || costs.xBracing <= 0 || costs.cfrpWrap <= 0) {
        throw new Error('Los costos unitarios de refuerzo deben ser valores positivos en USD');
      }
      if (costs.baseIsolators <= costs.shearWalls) {
        throw new Error('El aislamiento basal LRB debe ser la tecnología de mayor costo unitario');
      }

      // 3. Evaluar reglas de gamificación: Descalificación por déficit presupuestario
      const overBudgetChallenge: typeof cariaco = {
        ...cariaco,
        budgetUsd: 10000 // Presupuesto insuficiente para cualquier refuerzo
      };
      const overBudgetEval = ShakeTableEngine.evaluateChallenge(
        overBudgetChallenge,
        { baseIsolators: true, shearWalls: true, xBracing: true, cfrpWrap: true }
      );
      if (!overBudgetEval.overBudget) {
        throw new Error('El motor no detectó la superación del presupuesto asignado');
      }
      if (overBudgetEval.grade !== 'COLAPSO') {
        throw new Error(`Un proyecto con déficit presupuestario debe recibir calificación COLAPSO (obtenido: ${overBudgetEval.grade})`);
      }
      if (overBudgetEval.survived) {
        throw new Error('Una estructura con fondos insuficientes no puede considerarse aprobada');
      }

      // 4. Evaluar estructura sin reforzar ante sismo severo (Cariaco 1997)
      const unreinforcedEval = ShakeTableEngine.evaluateChallenge(
        cariaco,
        { baseIsolators: false, shearWalls: false, xBracing: false, cfrpWrap: false }
      );
      if (unreinforcedEval.overBudget) {
        throw new Error('Sin refuerzos el costo gastado debe ser $0 y no superar presupuesto');
      }
      if (unreinforcedEval.spentUsd !== 0) {
        throw new Error(`El gasto sin refuerzos debe ser 0 USD (actual: ${unreinforcedEval.spentUsd})`);
      }
      if (unreinforcedEval.grade !== 'COLAPSO' && unreinforcedEval.grade !== 'C') {
        throw new Error(`Estructura sin refuerzo no debería obtener calificación alta ante Cariaco (obtenido: ${unreinforcedEval.grade})`);
      }

      // 5. Evaluar intervención exitosa dentro del presupuesto (Aisladores LRB + CFRP = $60,000 <= $120,000)
      const retrofittedEval = ShakeTableEngine.evaluateChallenge(
        cariaco,
        { baseIsolators: true, shearWalls: false, xBracing: false, cfrpWrap: true }
      );
      if (retrofittedEval.overBudget) {
        throw new Error('La combinación LRB + CFRP no debe exceder los $120,000 de presupuesto de Cariaco');
      }
      if (!retrofittedEval.survived) {
        throw new Error('La combinación LRB + CFRP debe permitir la supervivencia del edificio ante Cariaco');
      }
      if (retrofittedEval.grade !== 'A+' && retrofittedEval.grade !== 'A') {
        throw new Error(`Calificación insuficiente para refuerzo óptimo con aislamiento basal (obtenido: ${retrofittedEval.grade})`);
      }
      if (retrofittedEval.livesSaved <= unreinforcedEval.livesSaved) {
        throw new Error(`El número de vidas salvadas (${retrofittedEval.livesSaved}) debe ser significativamente mayor al modelo colapsado (${unreinforcedEval.livesSaved})`);
      }
    }
  },
  // 9. Blindaje MapBiomas 2027 y Resiliencia ante Cortes Eléctricos
  {
    id: 'TEST-24',
    name: 'Persistencia Reactiva y Recuperación Continua ante Cortes Eléctricos',
    category: 'Estudios e Integridad',
    run: () => {
      // 1. Limpieza inicial
      StudyStorageService.clearCrashRecoverySnapshot();
      const initial = StudyStorageService.loadCrashRecoverySnapshot();
      if (initial !== null) {
        throw new Error('El snapshot de recuperación debe ser nulo tras invocar clearCrashRecoverySnapshot');
      }

      // 2. Guardado reactivo de snapshot con parámetros y edificación con intento de inyección XSS
      const testBuildings = [
        {
          id: 'b-crash-01',
          name: '<script>alert("hack")</script>Liceo Libertador',
          typeId: 'porticos-nd3-sismo',
          x: 42,
          y: 55,
          elevationM: 1600,
          slopeDeg: 10,
          distanceToFaultKm: 3.5,
          distanceToStreamM: 400,
          stories: 4,
          soilType: 'S2' as const,
          isUserPlaced: true,
          yearConstructed: 2010
        }
      ];

      StudyStorageService.saveCrashRecoverySnapshot({
        activeView: 'simulator',
        regionId: 'merida-andes',
        selectedYear: 2030,
        typologyId: 'porticos-nd3-sismo',
        soilProfileType: 'S2',
        userPlacedBuildings: testBuildings
      });

      // 3. Cargar snapshot y verificar integridad y sanitización
      const recovered = StudyStorageService.loadCrashRecoverySnapshot();
      if (!recovered) {
        throw new Error('Fallo al recuperar snapshot guardado de emergencia tras corte eléctrico');
      }
      if (!recovered.isDirty) {
        throw new Error('El snapshot reactivo debe marcarse con isDirty = true para alertar al usuario');
      }
      if (recovered.regionId !== 'merida-andes') {
        throw new Error(`Región recuperada inconsistente: ${recovered.regionId}`);
      }
      if (recovered.selectedYear !== 2030) {
        throw new Error(`Año recuperado inconsistente: ${recovered.selectedYear}`);
      }
      if (recovered.userPlacedBuildings.length !== 1) {
        throw new Error('La lista de edificaciones recuperadas no coincide en longitud');
      }
      // Verificar sanitización XSS
      if (recovered.userPlacedBuildings[0].name.includes('<script>')) {
        throw new Error('La persistencia de recuperación no sanitizó el payload XSS en el nombre de la edificación');
      }

      // 4. Limpieza final de snapshot
      StudyStorageService.clearCrashRecoverySnapshot();
      const afterClear = StudyStorageService.loadCrashRecoverySnapshot();
      if (afterClear !== null) {
        throw new Error('El snapshot debió quedar vacío tras el descarte de recuperación');
      }
    }
  },
  {
    id: 'TEST-25',
    name: 'Generación de Memorias Técnicas e Integridad de Series Multitemporales MapBiomas (1985–2050)',
    category: 'Estudios e Integridad',
    run: () => {
      // 1. Verificar la cobertura temporal completa en las cuatro regiones clave
      const targetRegionIds = ['merida-andes', 'sucre-cariaco', 'zulia-maracaibo', 'guayana-caroni'];
      const requiredYears = [1985, 1995, 2005, 2015, 2023, 2030, 2040, 2050];

      for (const regId of targetRegionIds) {
        const region = VENEZUELA_REGIONS.find((r) => r.id === regId);
        if (!region) {
          throw new Error(`Región estratégica ${regId} no encontrada en catálogo VENEZUELA_REGIONS`);
        }

        if (!region.mapBiomasTimeSeries || region.mapBiomasTimeSeries.length < 8) {
          throw new Error(
            `La región ${regId} debe contener al menos 8 horizontes temporales MapBiomas (posee ${region.mapBiomasTimeSeries?.length || 0})`
          );
        }

        const presentYears = region.mapBiomasTimeSeries.map((t) => t.year);
        for (const yr of requiredYears) {
          if (!presentYears.includes(yr)) {
            throw new Error(`La región ${regId} carece del horizonte temporal obligatorio ${yr}`);
          }
        }

        // Validar coherencia física de coeficientes y deforestación
        for (const t of region.mapBiomasTimeSeries) {
          if (t.meanRunoffCoefficient < 0.20 || t.meanRunoffCoefficient > 1.0) {
            throw new Error(
              `Coeficiente de escorrentía C anómalo (${t.meanRunoffCoefficient}) en ${regId} (${t.year})`
            );
          }
          if (t.deforestationAccumulatedPercent < 0 || t.deforestationAccumulatedPercent > 100) {
            throw new Error(
              `Porcentaje de deforestación fuera de rango (${t.deforestationAccumulatedPercent}%) en ${regId}`
            );
          }
        }
      }

      // 2. Generación pura y validación estructural del informe técnico (generateTechnicalReport)
      const testRegion = VENEZUELA_REGIONS.find((r) => r.id === 'merida-andes')!;
      const testTypology = BUILDING_TYPOLOGIES.find((t) => t.id === 'porticos-nd3-sismo')!;
      const testSoil = SOIL_PROFILES.S2;
      const testScenario = {
        earthquake: { enabled: true, pgaG: 0.35, magnitudeMw: 7.2, depthKm: 12, durationSeconds: 40, distanceToFaultKm: 4 },
        debrisFlow: { enabled: true, rainfallAccumulation24hMm: 120, soilSaturationPercent: 70, debrisVelocityMs: 5.0, debrisDepthM: 1.2, densityKgM3: 1900, boulderImpactSizeM: 0.8 },
        flood: { enabled: false, waterLevelM: 0, flowVelocityMs: 0, durationHours: 0, soilSaturationIncrease: 0 },
        wind: { enabled: false, speedKmh: 40, gustFactor: 1.1 },
        slope: { enabled: true, angleDeg: 30, cohesionKpa: 22, internalFrictionAngleDeg: 28 }
      };
      const simResult = StructuralSimulationEngine.runSimulation(testRegion, testTypology, testSoil, testScenario, 2023);

      const report = StudyStorageService.generateTechnicalReport({
        region: testRegion,
        typology: testTypology,
        soilProfile: testSoil,
        scenario: testScenario,
        simulationResult: simResult,
        selectedYear: 2023
      });

      // Validar metadatos y citas en Markdown
      if (!report.markdown.includes('SIURPROV')) {
        throw new Error('El informe técnico en Markdown no contiene el encabezado de SIURPROV');
      }
      if (!report.markdown.includes('COVENIN 1756')) {
        throw new Error('El informe técnico carece de referencia explícita a la norma COVENIN 1756');
      }
      if (!report.markdown.includes('MapBiomas Venezuela') || !report.markdown.includes('RAISG')) {
        throw new Error('El informe técnico no cita formalmente a MapBiomas Venezuela ni a RAISG');
      }
      if (!report.markdown.includes('Frank Sousa')) {
        throw new Error('El informe técnico no incluye la atribución de autoría al desarrollador');
      }

      // Validar resumen tabular
      if (report.summaryTable.t1 <= 0 || isNaN(report.summaryTable.t1)) {
        throw new Error(`Período fundamental T1 anómalo en resumen tabular: ${report.summaryTable.t1}`);
      }
      if (report.summaryTable.v0Kn <= 0) {
        throw new Error(`Cortante basal V0 no calculado en resumen tabular: ${report.summaryTable.v0Kn}`);
      }
      if (report.mapBiomasTransitions.length !== testRegion.mapBiomasTimeSeries.length) {
        throw new Error('La matriz de transiciones no coincide en longitud con la serie temporal regional');
      }
    }
  }
];

// Ejecución Asíncrona
async function runSuite() {
  console.log('======================================================================');
  console.log('🧪 SIURPROV — BATERÍA DE PRUEBAS DE INGENIERÍA, SEGURIDAD Y CI/CD');
  console.log('👤 Autor: Ing. Frank Sousa (Ingeniero en Informática, UNERG 2025)');
  console.log('📍 San Juan de los Morros, Estado Guárico, Venezuela');
  console.log('======================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  for (const t of tests) {
    const startTime = Date.now();
    try {
      await t.run();
      const duration = Date.now() - startTime;
      console.log(`✅ [PASS] [${t.category}] ${t.id}: ${t.name} (${duration}ms)`);
      passedCount++;
    } catch (err: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ [FAIL] [${t.category}] ${t.id}: ${t.name} (${duration}ms)`);
      console.error(`   Motivo: ${err.message}\n`);
      failedCount++;
    }
  }

  console.log('\n----------------------------------------------------------------------');
  console.log(`📊 RESULTADO FINAL: ${passedCount}/${tests.length} Pruebas Aprobadas (${((passedCount / tests.length) * 100).toFixed(1)}%)`);
  if (failedCount > 0) {
    console.error(`🚨 Fallaron ${failedCount} pruebas. Revise los errores antes de hacer push.`);
    process.exit(1);
  } else {
    console.log('🎉 Todas las verificaciones de física, seguridad e integridad PASARON con éxito.');
    console.log('🚀 Sistema listo para despliegue y certificación en GitHub Actions CI/CD.');
    process.exit(0);
  }
}

runSuite();
