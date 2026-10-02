import React, { useState } from 'react';
import {
  FileCode,
  Terminal,
  Play,
  Copy,
  Check,
  Download,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Globe2,
  Code2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { StructuralSimulationEngine } from '../services/structuralEngine';
import { SOIL_PROFILES } from '../data/soilProfiles';

interface ApiEndpoint {
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  description: string;
  tags: string[];
  parameters?: Array<{ name: string; type: string; required: boolean; description: string }>;
  requestBodySample?: Record<string, any>;
  responseSample: Record<string, any>;
}

export const ApiSwaggerExplorer: React.FC = () => {
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState<number>(0);
  const [requestPayload, setRequestPayload] = useState<string>('');
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const endpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      path: '/api/simulate/structural',
      summary: 'Cálculo Sismorresistente COVENIN 1756:2019',
      description: 'Calcula el período fundamental T₁, la aceleración espectral Sa, el cortante basal V₀ y la deriva de entrepiso bajo espectro elástico e inelástico.',
      tags: ['Simulación Física'],
      requestBodySample: {
        a0: 0.30,
        soilProfileType: 'S3',
        periodT: 0.82,
        importanceFactorI: 1.0,
        ductilityFactorR: 6.0,
        totalWeightKn: 4500,
        stories: 8,
        storyHeightM: 3.0
      },
      responseSample: {
        status: 'success',
        standard: 'COVENIN 1756:2019',
        spectralAccelerationSaG: 0.12,
        elasticSaG: 0.72,
        baseShearKn: 540,
        seismicCoefficientCs: 0.12,
        maxStoryDriftPercent: 1.15,
        driftLimitPercent: 1.80,
        compliesWithCovenin: true
      }
    },
    {
      method: 'POST',
      path: '/api/simulate/slope',
      summary: 'Estabilidad de Taludes (Factor de Seguridad FS)',
      description: 'Calcula el Factor de Seguridad mediante formulación de talud infinito con saturación de poros y coeficiente sísmico horizontal.',
      tags: ['Geotecnia'],
      requestBodySample: {
        slopeAngleDeg: 35,
        soilCohesionKpa: 20,
        frictionAngleDeg: 28,
        soilSaturationPercent: 85,
        seismicCoeffKh: 0.15
      },
      responseSample: {
        status: 'success',
        factorOfSafety: 0.88,
        isStable: false,
        condition: 'Colapso Inminente por Deslizamiento',
        criticalPorePressureRu: 0.60
      }
    },
    {
      method: 'POST',
      path: '/api/simulate/debris',
      summary: 'Empuje Hidrodinámico de Aluvión (Deslave)',
      description: 'Modela la fuerza de arrastre hidrodinámico, empuje hidrostático y colisión de peñones transportados por flujos torrenciales.',
      tags: ['Hidrología & Aluviones'],
      requestBodySample: {
        debrisDepthM: 2.2,
        debrisVelocityMs: 9.0,
        densityKgM3: 2000,
        boulderImpactSizeM: 1.4,
        buildingWidthM: 20.0
      },
      responseSample: {
        status: 'success',
        totalImpactForceKn: 2840,
        hydrodynamicComponentKn: 2268,
        hydrostaticComponentKn: 950,
        boulderKineticImpactKn: 1250,
        severityLevel: 'Demolición Estructural Inminente'
      }
    },
    {
      method: 'POST',
      path: '/api/audit',
      summary: 'Auditoría Forense con Inferencia IA / Reglas COVENIN',
      description: 'Genera un dictamen pericial completo en lenguaje natural evaluando vulnerabilidades y recomendando refuerzos estructurales.',
      tags: ['Auditoría & IA'],
      requestBodySample: {
        region: 'San Juan de los Morros & UNERG (Guárico)',
        fault: 'Falla Frontal de la Serranía del Interior',
        typology: 'Pabellón de Ingeniería en Informática UNERG',
        stories: 4,
        system: 'Pórticos Concreto Armado Dúctil (ND3)',
        soil: 'S2: Suelo Firme o Compacto',
        pga: 0.25,
        debrisForce: 0,
        drift: 0.85,
        driftLimit: 1.80,
        emsGrade: 'Grado 1: Daño Leve',
        fsSlope: 1.45,
        year: 2023
      },
      responseSample: {
        auditSummary: 'DICTAMEN TÉCNICO DE PERITAJE SÍSMICO Y GEOTÉCNICO: La edificación universitaria cumple satisfactoriamente los controles de rigidez lateral y derivas admisibles según COVENIN 1756...'
      }
    },
    {
      method: 'GET',
      path: '/api/health',
      summary: 'Diagnóstico de Salud y Resiliencia del Sistema',
      description: 'Devuelve métricas de disponibilidad, memoria de proceso, versión de SIURPROV y estado de módulos.',
      tags: ['Sistema'],
      responseSample: {
        status: 'online',
        system: 'SIURPROV v1.2',
        author: 'Ing. Frank Sousa (UNERG 2025)',
        runtime: 'Node.js / Express + Vite',
        uptimeSeconds: 1420,
        memoryUsageMb: 42.5,
        offlineReady: true
      }
    },
    {
      method: 'GET',
      path: '/api/openapi.json',
      summary: 'Especificación OpenAPI 3.0.3 (Swagger JSON)',
      description: 'Devuelve la definición formal completa de la API para importación en Postman, Insomnia o Swagger UI.',
      tags: ['Especificación'],
      responseSample: {
        openapi: '3.0.3',
        info: {
          title: 'SIURPROV API',
          version: '1.2.0',
          description: 'API de Simulación Urbana y Proyección para Venezuela'
        },
        paths: {}
      }
    }
  ];

  const activeEndpoint = endpoints[selectedEndpointIndex];

  // Initialize payload sample when changing endpoint
  React.useEffect(() => {
    if (activeEndpoint.requestBodySample) {
      setRequestPayload(JSON.stringify(activeEndpoint.requestBodySample, null, 2));
    } else {
      setRequestPayload('');
    }
    setResponseOutput(null);
    setResponseStatus(null);
  }, [selectedEndpointIndex]);

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    const start = performance.now();

    try {
      if (activeEndpoint.path === '/api/audit') {
        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestPayload
        });
        const data = await res.json();
        setResponseStatus(res.status);
        setResponseOutput(JSON.stringify(data, null, 2));
      } else if (activeEndpoint.path === '/api/simulate/structural') {
        // Run deterministic calculation
        const parsed = JSON.parse(requestPayload);
        const soil = SOIL_PROFILES[parsed.soilProfileType as 'S1' | 'S2' | 'S3' | 'S4'] || SOIL_PROFILES.S3;
        const { Sa, alpha, elasticSa } = StructuralSimulationEngine.calculateSpectralAcceleration(
          parsed.a0,
          soil,
          parsed.periodT,
          parsed.importanceFactorI,
          parsed.ductilityFactorR
        );
        const baseShearKn = Math.round(Sa * parsed.totalWeightKn);
        const rawDrift = (Sa * 1.8 * (parsed.stories / 3)) / (parsed.ductilityFactorR * 0.4);
        const maxStoryDriftPercent = Number(Math.max(0.15, Math.min(5.5, rawDrift)).toFixed(2));

        const rawTheta = (parsed.totalWeightKn * (maxStoryDriftPercent / 100)) / (Math.max(50, baseShearKn));
        const pDeltaStabilityCoefficient = Number(Math.max(0.01, Math.min(0.40, rawTheta)).toFixed(3));
        const pDeltaExceeded = pDeltaStabilityCoefficient > 0.15;
        const pDeltaAmplificationFactor = pDeltaStabilityCoefficient <= 0.10
          ? 1.00
          : Number((1.0 / Math.max(0.15, 1.0 - pDeltaStabilityCoefficient)).toFixed(2));

        let performanceLevel = 'Operacional (O)';
        if (maxStoryDriftPercent > 3.0 || pDeltaExceeded) {
          performanceLevel = 'Colapso Inminente (C)';
        } else if (maxStoryDriftPercent > 1.8) {
          performanceLevel = 'Prevención de Colapso (CP)';
        } else if (maxStoryDriftPercent > 1.0) {
          performanceLevel = 'Seguridad de Vida (LS)';
        } else if (maxStoryDriftPercent > 0.4) {
          performanceLevel = 'Ocupación Inmediata (IO)';
        }

        const residualCapacityPercent = Math.max(0, Math.round(100 - (maxStoryDriftPercent / 1.8) * 60));
        const estimatedBuiltAreaM2 = (parsed.stories || 6) * 450;
        const replacementCostUsd = estimatedBuiltAreaM2 * 800;
        const estimatedRepairPercent = Math.min(100, Math.round((maxStoryDriftPercent / 1.8) * 55));
        const estimatedLossUsd = Math.round(replacementCostUsd * (estimatedRepairPercent / 100));
        const estimatedDowntimeDays = maxStoryDriftPercent > 2.5 ? 360 : maxStoryDriftPercent > 1.8 ? 120 : maxStoryDriftPercent > 1.0 ? 30 : 5;

        const result = {
          status: 'success',
          standard: 'COVENIN 1756:2019 & FEMA 356',
          spectralAccelerationSaG: Number(Sa.toFixed(3)),
          elasticSaG: Number(elasticSa.toFixed(3)),
          baseShearKn,
          seismicCoefficientCs: Number((baseShearKn / parsed.totalWeightKn).toFixed(3)),
          maxStoryDriftPercent,
          driftLimitPercent: 1.80,
          compliesWithCovenin: maxStoryDriftPercent <= 1.80 && !pDeltaExceeded,
          evaluations: {
            performanceLevel,
            pDeltaStabilityCoefficient,
            pDeltaExceeded,
            pDeltaAmplificationFactor,
            residualCapacityPercent,
            estimatedLossUsd,
            replacementCostUsd,
            estimatedDowntimeDays
          },
          computationDurationMs: Number((performance.now() - start).toFixed(2))
        };
        setResponseStatus(200);
        setResponseOutput(JSON.stringify(result, null, 2));
      } else if (activeEndpoint.path === '/api/simulate/slope') {
        const parsed = JSON.parse(requestPayload);
        const fs = StructuralSimulationEngine.calculateSlopeFactorOfSafety(
          parsed.slopeAngleDeg,
          parsed.soilCohesionKpa,
          parsed.frictionAngleDeg,
          parsed.soilSaturationPercent,
          parsed.seismicCoeffKh
        );
        const thetaRad = ((parsed.slopeAngleDeg || 30) * Math.PI) / 180;
        const kc = Number(Math.max(0.01, (Math.max(0.5, fs) - 0.95) * Math.sin(thetaRad)).toFixed(3));
        const kh = parsed.seismicCoeffKh || 0.15;
        let newmarkDisplacementCm = 0;
        if (kh > kc) {
          const ratio = kc / Math.max(0.05, kh);
          newmarkDisplacementCm = Number(Math.max(0, Math.min(120, Math.pow(10, 0.215 - 2.341 * ratio))).toFixed(1));
        }

        const result = {
          status: 'success',
          factorOfSafety: fs,
          isStable: fs >= 1.0,
          condition: fs < 1.0 ? 'Colapso Inminente por Deslizamiento' : fs < 1.3 ? 'Alerta Geotécnica' : 'Talud Estable',
          evaluations: {
            criticalYieldAccelerationKc: kc,
            newmarkDisplacementCm,
            seismicCoeffKh: kh
          },
          computationDurationMs: Number((performance.now() - start).toFixed(2))
        };
        setResponseStatus(200);
        setResponseOutput(JSON.stringify(result, null, 2));
      } else if (activeEndpoint.path === '/api/simulate/debris') {
        const parsed = JSON.parse(requestPayload);
        const forceKn = StructuralSimulationEngine.calculateDebrisImpact(
          parsed.debrisDepthM,
          parsed.debrisVelocityMs,
          parsed.densityKgM3,
          parsed.boulderImpactSizeM,
          parsed.buildingWidthM
        );
        const overturningMomentKnM = Math.round(forceKn * ((parsed.debrisDepthM || 2.0) * 0.6));
        const backwaterSurgeHeightM = Number(((Math.pow(parsed.debrisVelocityMs || 7.0, 2) / (2 * 9.81)) * 0.65).toFixed(2));

        const result = {
          status: 'success',
          totalImpactForceKn: forceKn,
          severityLevel: forceKn > 2000 ? 'Demolición Estructural Inminente' : forceKn > 500 ? 'Daño Severo en Planta Baja' : 'Impacto Leve',
          evaluations: {
            overturningMomentKnM,
            backwaterSurgeHeightM
          },
          computationDurationMs: Number((performance.now() - start).toFixed(2))
        };
        setResponseStatus(200);
        setResponseOutput(JSON.stringify(result, null, 2));
      } else if (activeEndpoint.path === '/api/health') {
        const result = {
          status: 'online',
          system: 'SIURPROV v1.2',
          author: 'Ing. Frank Sousa (UNERG 2025)',
          city: 'San Juan de los Morros, Guárico',
          runtime: 'Vite / Express Web GIS',
          uptimeSeconds: Math.round(performance.now() / 1000),
          offlineReady: true,
          timestamp: new Date().toISOString()
        };
        setResponseStatus(200);
        setResponseOutput(JSON.stringify(result, null, 2));
      } else {
        // OpenAPI spec download
        const spec = {
          openapi: '3.0.3',
          info: {
            title: 'SIURPROV - Simulador Urbano de Proyección para Venezuela API',
            version: '1.2.0',
            description: 'API REST para cálculo sismorresistente COVENIN 1756, estabilidad de taludes y análisis multi-amenaza con datos MapBiomas.',
            contact: {
              name: 'Ing. Frank Sousa',
              email: 'frankalfonso1988@gmail.com',
              institution: 'Universidad Rómulo Gallegos (UNERG 2025)'
            }
          },
          paths: endpoints.reduce((acc, ep) => {
            acc[ep.path] = {
              [ep.method.toLowerCase()]: {
                summary: ep.summary,
                description: ep.description,
                tags: ep.tags,
                responses: {
                  '200': {
                    description: 'Operación exitosa',
                    content: { 'application/json': { example: ep.responseSample } }
                  }
                }
              }
            };
            return acc;
          }, {} as Record<string, any>)
        };
        setResponseStatus(200);
        setResponseOutput(JSON.stringify(spec, null, 2));
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseOutput(JSON.stringify({ error: err?.message || 'Error en ejecución' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const generateCurlCommand = () => {
    if (activeEndpoint.method === 'GET') {
      return `curl -X GET "http://localhost:3000${activeEndpoint.path}" -H "Accept: application/json"`;
    }
    const escapedJson = requestPayload.replace(/"/g, '\\"').replace(/\n/g, '');
    return `curl -X POST "http://localhost:3000${activeEndpoint.path}" \\
  -H "Content-Type: application/json" \\
  -d "${escapedJson}"`;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(key);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadOpenApiJson = () => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'SIURPROV - Simulador Urbano de Proyección para Venezuela API',
        version: '1.2.0',
        description: 'API REST para cálculo sismorresistente COVENIN 1756, estabilidad de taludes y análisis multi-amenaza.',
        contact: {
          name: 'Ing. Frank Sousa',
          email: 'frankalfonso1988@gmail.com',
          institution: 'Universidad Rómulo Gallegos (UNERG 2025)'
        }
      }
    };
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'siurprov_openapi_swagger.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-100">
                Swagger / OpenAPI 3.0: Explorador Interactivo de API
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                OAS 3.0.3
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Contratos de servicios, endpoints numéricos y consola de pruebas en vivo para testing y frontend
            </p>
          </div>
        </div>

        <button
          onClick={downloadOpenApiJson}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 text-xs font-medium transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar openapi.json</span>
        </button>
      </div>

      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoints Menu (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Endpoints Disponibles ({endpoints.length})
          </span>

          <div className="flex flex-col gap-1.5 max-h-[520px] overflow-y-auto pr-1">
            {endpoints.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedEndpointIndex(idx)}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  selectedEndpointIndex === idx
                    ? 'bg-slate-850 border-purple-500 shadow-md ring-1 ring-purple-500/30'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      ep.method === 'GET'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-sky-950 text-sky-400 border border-sky-800'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                    {ep.path}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 line-clamp-1">{ep.summary}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Test Console & cURL (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Active Endpoint Info Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                    activeEndpoint.method === 'GET'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-sky-950 text-sky-300 border border-sky-800'
                  }`}
                >
                  {activeEndpoint.method}
                </span>
                <span className="font-mono text-sm font-bold text-slate-100">
                  {activeEndpoint.path}
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-purple-300 font-mono">
                {activeEndpoint.tags[0]}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{activeEndpoint.description}</p>
          </div>

          {/* Request Payload Editor (if POST) */}
          {activeEndpoint.method === 'POST' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-sky-400" />
                  Cuerpo de la Petición (JSON Payload Editable):
                </span>
                <span className="text-[11px] font-mono text-slate-500">application/json</span>
              </div>
              <textarea
                value={requestPayload}
                onChange={(e) => setRequestPayload(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-sky-300 focus:ring-2 focus:ring-purple-500 leading-relaxed"
              />
            </div>
          )}

          {/* Action Buttons: Execute & cURL */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleExecuteRequest}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isLoading ? 'Ejecutando servicio...' : 'Ejecutar Petición (Try It Out)'}</span>
            </button>

            <button
              onClick={() => copyToClipboard(generateCurlCommand(), 'curl')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1.5"
            >
              {copiedType === 'curl' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>cURL Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Comando cURL</span>
                </>
              )}
            </button>
          </div>

          {/* Live Response Panel */}
          {responseOutput && (
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Respuesta del Servidor / Motor Numérico:
                </span>
                <span
                  className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                    responseStatus === 200
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  HTTP {responseStatus} OK
                </span>
              </div>
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-60">
                <pre>{responseOutput}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
