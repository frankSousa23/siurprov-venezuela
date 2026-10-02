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

interface TestItem {
  id: string;
  name: string;
  category: 'COVENIN 1756' | 'Geotecnia' | 'Seguridad' | 'Estudios e Integridad' | 'Atribución y Licencia';
  run: () => boolean | void;
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
    name: 'Verificación de Atribución Obligatoria al Autor (Ing. Frank Sousa) y Repositorio',
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
  }
];

// Ejecución
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
    t.run();
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
