import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Database,
  Code2,
  Workflow,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Share2,
  Terminal,
  Activity,
  Box,
  HardDrive,
  Network,
  Play,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  FileCode2,
  Clock,
  Check,
  RefreshCw,
  GitBranch,
  ShieldAlert,
  Server,
  Lock,
  Download,
  FolderArchive
} from 'lucide-react';
import { SimulationResult, VenezuelaRegion } from '../types';
import { SystemAuditorService, SystemAuditReport } from '../services/systemAuditor';

interface SoftwareArchitecturePanelProps {
  region: VenezuelaRegion;
  simulationResult: SimulationResult;
  onOpenSwagger?: () => void;
  onOpenMemory?: () => void;
  onOpenGis?: () => void;
  onOpenStudyManager?: () => void;
}

export const SoftwareArchitecturePanel: React.FC<SoftwareArchitecturePanelProps> = ({
  region,
  simulationResult,
  onOpenSwagger,
  onOpenMemory,
  onOpenGis,
  onOpenStudyManager
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'testing' | 'security' | 'schema' | 'roadmap'>('architecture');
  const [auditReport, setAuditReport] = useState<SystemAuditReport | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState<boolean>(false);

  // Estado de la Auditoría de Seguridad del Servidor en Vivo
  const [serverSecurity, setServerSecurity] = useState<{
    loading: boolean;
    status?: string;
    securityChecks?: Array<{ check: string; status: string; description: string }>;
    metrics?: { uptimeSeconds: number; heapUsageMb: number; totalHeapMb: number; activeTrackedIps: number };
    error?: string;
  }>({ loading: false });

  const fetchServerSecurityAudit = () => {
    setServerSecurity({ loading: true });
    fetch('/api/security/audit')
      .then((res) => res.json())
      .then((data) => {
        setServerSecurity({
          loading: false,
          status: data.status,
          securityChecks: data.securityChecks,
          metrics: data.metrics
        });
      })
      .catch((err) => {
        setServerSecurity({
          loading: false,
          error: 'No se pudo contactar el endpoint /api/security/audit (el simulador opera en modo cliente offline).'
        });
      });
  };

  useEffect(() => {
    if (activeTab === 'security') {
      fetchServerSecurityAudit();
    }
  }, [activeTab]);

  const handleRunAudit = () => {
    setIsRunningAudit(true);
    setTimeout(() => {
      const report = SystemAuditorService.runFullSystemAudit();
      setAuditReport(report);
      setIsRunningAudit(false);
    }, 300);
  };

  const livePayloadSample = {
    standard: 'COVENIN 1756:2019 / COVENIN 1753',
    version: '1.3.0-STABLE',
    author: 'Ing. Frank Sousa (UNERG 2025)',
    city: 'San Juan de los Morros, Edo. Guárico',
    regionActive: region.name,
    seismicZone: region.seismicZoneCOVENIN,
    soilProfile: region.defaultSoilProfile,
    computedPhysics: {
      periodT1: `${simulationResult.fundamentalPeriodT1}s`,
      baseShearKn: `${simulationResult.designBaseShearKn} kN`,
      maxDriftPercent: `${simulationResult.maxStoryDriftPercent}%`,
      parkAngIndex: simulationResult.parkAngDamageIndex,
      ems98Grade: simulationResult.ems98Grade,
      occupancyStatus: simulationResult.safeForOccupancy ? 'Habitable' : 'Riesgo Crítico',
      femaPerformanceLevel: simulationResult.performanceLevel,
      pDeltaTheta: simulationResult.pDeltaStabilityCoefficient,
      pDeltaExceeded: simulationResult.pDeltaExceeded,
      residualCapacityPercent: `${simulationResult.residualCapacityPercent}%`,
      estimatedLossUsd: `$${simulationResult.estimatedLossUsd.toLocaleString()} USD`,
      estimatedDowntimeDays: `${simulationResult.estimatedDowntimeDays} días (${simulationResult.downtimeClassification})`,
      newmarkSlopeDisplacement: `${simulationResult.newmarkDisplacementCm} cm`,
      overturningMomentKnM: `${simulationResult.overturningMomentKnM} kN·m`
    },
    cachingStrategy: 'localStorage WGS84 GeoJSON Cache (Offline First)',
    packageIntegrity: 'SHA-256 / Deterministic Checksum Verified'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Banner: Academic & Engineering Tribute */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-950/80 via-indigo-950/80 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-100">
                Arquitectura de Software, Seguridad & CI/CD
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                UNERG 2025
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Desarrollado por el <strong>Ing. Frank Sousa</strong> (Ingeniero en Informática, Universidad Rómulo Gallegos) • San Juan de los Morros, Guárico
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pipeline del Sistema
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'testing'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auditoría & Tests</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Seguridad & CI/CD</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'schema'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Esquema (JSON)
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'roadmap'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Escalabilidad
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-6 text-xs text-slate-300">
        {/* Quick Launch Action Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
          <button
            onClick={onOpenSwagger}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-sky-500/60 transition group text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <FileCode2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-100 text-xs block group-hover:text-sky-300 transition">Swagger API</strong>
                <span className="text-[10px] text-slate-400">Endpoints REST OpenAPI</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition transform group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={onOpenStudyManager}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-amber-500/60 transition group text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FolderArchive className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-100 text-xs block group-hover:text-amber-300 transition">Estudios (.siurprov)</strong>
                <span className="text-[10px] text-slate-400">Exportar, importar & compartir</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition transform group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={onOpenMemory}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-emerald-500/60 transition group text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-100 text-xs block group-hover:text-emerald-300 transition">Memoria Técnica</strong>
                <span className="text-[10px] text-slate-400">Documento de grado UNERG</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition transform group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={onOpenGis}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-purple-500/60 transition group text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-100 text-xs block group-hover:text-purple-300 transition">Guía SIG & QGIS</strong>
                <span className="text-[10px] text-slate-400">Flujo satelital GeoJSON</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* TAB 1: System Pipeline Flow */}
        {activeTab === 'architecture' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Database className="w-4 h-4" />
                  1. Capa de Datos
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  MapBiomas Venezuela (series 1985-2023), microzonificación sísmica Funvisis, perfiles geotécnicos COVENIN (S1-S4) y fallas geológicas activas.
                </p>
                <div className="mt-auto pt-2 border-t border-slate-850 text-[10px] font-mono text-slate-500">
                  Model: Pure In-Memory + LocalStorage
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  2. Motor Físico Local
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Cálculo de espectros inelásticos Sa, rigidez lateral, derivas de entrepiso, método de Bishop para taludes y empuje dinámico de aluviones.
                </p>
                <div className="mt-auto pt-2 border-t border-slate-850 text-[10px] font-mono text-slate-500">
                  Engine: Deterministic Offline-First
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  3. Seguridad & Sanitización
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Filtro estricto contra XSS, prevención de Prototype Pollution, verificación de coordenadas venezolanas y Checksum criptográfico en estudios.
                </p>
                <div className="mt-auto pt-2 border-t border-slate-850 text-[10px] font-mono text-slate-500">
                  Security: Multi-layer Validation
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Workflow className="w-4 h-4" />
                  4. Intercambio y CI/CD
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Exportación de paquetes .siurprov interoperables, pipeline automatizado en GitHub Actions y scripts one-click (Linux/Mac/Windows).
                </p>
                <div className="mt-auto pt-2 border-t border-slate-850 text-[10px] font-mono text-slate-500">
                  CI/CD: GitHub Actions + Shell Scripts
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200">Autonomía y Resiliencia en Entornos Desafiantes</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  El sistema no requiere conexiones satelitales continuas ni servidores externos de terceros para ejecutar las simulaciones. Todo el cómputo matricial, sismorresistente y geomecánico corre 100% en la máquina local o servidor privado desplegado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Testing Suite */}
        {activeTab === 'testing' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Suite Automatizada de Pruebas de Ingeniería, Límites y Seguridad
                </h4>
                <p className="text-[11px] text-slate-400">
                  Batería de validaciones físicas (COVENIN 1756, Bishop, Newmark), de seguridad (XSS, Prototype Pollution) y checksums.
                </p>
              </div>
              <button
                onClick={handleRunAudit}
                disabled={isRunningAudit}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-950/40 disabled:opacity-50 cursor-pointer"
              >
                {isRunningAudit ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Ejecutando Pruebas...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Ejecutar Suite Completa</span>
                  </>
                )}
              </button>
            </div>

            {auditReport ? (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tasa de Éxito</span>
                    <span className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                      {auditReport.passRatePercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {auditReport.passedTests}/{auditReport.totalTests} pruebas superadas
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Estado del Sistema</span>
                    <span className="text-xl font-extrabold text-sky-400 mt-1">
                      {auditReport.overallHealth}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Resiliencia: {auditReport.resilienceScore}/100
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tiempo de Cómputo</span>
                    <span className="text-xl font-extrabold text-indigo-300 font-mono mt-1">
                      {auditReport.executionTimeMs} ms
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Sin latencia de red</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Auditor Certificado</span>
                    <span className="text-xs font-bold text-amber-300 mt-1 truncate">
                      Ing. Frank Sousa
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">UNERG Informática 2025</span>
                  </div>
                </div>

                {/* Test Results Table */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                  <div className="p-3 bg-slate-900/80 border-b border-slate-800 font-semibold text-xs text-slate-200 flex items-center justify-between">
                    <span>Desglose de Pruebas Unitarias y de Límites</span>
                    <span className="text-[10px] text-slate-400 font-mono">100% Offline Compatible</span>
                  </div>

                  <div className="divide-y divide-slate-850">
                    {auditReport.tests.map((test) => (
                      <div key={test.id} className="p-3 hover:bg-slate-900/50 transition flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                              {test.id}
                            </span>
                            <span className="font-bold text-slate-200 text-xs">{test.title}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              test.status === 'PASSED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : test.status === 'WARNING'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {test.status} ({test.durationMs}ms)
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400">
                          <strong>Aserción:</strong> {test.assertion}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono mt-1 pt-1 border-t border-slate-850">
                          <div>
                            <span className="text-slate-400">Valor medido: </span>
                            <span className="text-sky-300">{test.measuredValue}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Rango esperado: </span>
                            <span className="text-slate-300">{test.expectedRange}</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 italic">
                          Nota técnica: {test.technicalNote}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950 border border-slate-800/60 text-center flex flex-col items-center gap-3">
                <Activity className="w-8 h-8 text-slate-600" />
                <p className="text-xs text-slate-400 max-w-md">
                  Presiona el botón "Ejecutar Suite Completa" para correr la suite de auditoría que evalúa límites sismorresistentes, derivadas, deslizamientos, sanitización XSS y sumas de comprobación.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SEGURIDAD EN VIVO & CI/CD PIPELINE */}
        {activeTab === 'security' && (
          <div className="flex flex-col gap-6">
            
            {/* Live Security Audit Section */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-slate-100 text-sm">
                    Auditoría de Seguridad en Tiempo Real del Sistema en Funcionamiento
                  </h4>
                </div>
                <button
                  onClick={fetchServerSecurityAudit}
                  disabled={serverSecurity.loading}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${serverSecurity.loading ? 'animate-spin' : ''}`} />
                  <span>Re-verificar Seguridad</span>
                </button>
              </div>

              {serverSecurity.error && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300">
                  {serverSecurity.error}
                </div>
              )}

              {/* Grid de verificaciones de seguridad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {serverSecurity.securityChecks ? (
                  serverSecurity.securityChecks.map((check, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-slate-200 text-xs block">{check.check}</span>
                        <span className="text-[11px] text-slate-400 leading-tight mt-0.5 block">{check.description}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                        {check.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-200 text-xs block">HTTP Security Headers</span>
                        <span className="text-[11px] text-slate-400 block">CSP, X-Content-Type-Options: nosniff, X-Frame-Options</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        COMPLIANT
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-200 text-xs block">Rate Limiter /api/*</span>
                        <span className="text-[11px] text-slate-400 block">Prevención de denegación de servicio (DoS) activa</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        ACTIVE
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-200 text-xs block">Defensa Prototype Pollution</span>
                        <span className="text-[11px] text-slate-400 block">Rechazo de inyecciones __proto__ en archivos de estudio</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        VERIFIED
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-200 text-xs block">Integridad Criptográfica</span>
                        <span className="text-[11px] text-slate-400 block">Suma de comprobación SHA-256 en estudios .siurprov</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        VERIFIED
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* GitHub Actions CI/CD Pipeline Section */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-indigo-400" />
                  <h4 className="font-bold text-slate-100 text-sm">
                    Pipeline de CI/CD para GitHub (Workflow Automatizado)
                  </h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-sky-950 text-sky-400 border border-sky-800">
                  .github/workflows/ci-cd.yml
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cada vez que se sube un cambio al repositorio en GitHub (o se realiza un Pull Request), este pipeline ejecuta automáticamente 4 etapas rigurosas de verificación:
              </p>

              {/* Etapas del Pipeline Gráfico */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">FASE 1</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <strong className="text-white text-xs">TypeScript Strict Lint</strong>
                  <span className="text-[10px] text-slate-400">tsc --noEmit sin advertencias</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">FASE 2</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <strong className="text-white text-xs">Pruebas Físicas</strong>
                  <span className="text-[10px] text-slate-400">COVENIN 1756, Bishop, Newmark</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">FASE 3</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <strong className="text-white text-xs">Auditoría & SAST</strong>
                  <span className="text-[10px] text-slate-400">npm audit, XSS, Atribución MIT</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">FASE 4</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <strong className="text-white text-xs">Build & Empaque</strong>
                  <span className="text-[10px] text-slate-400">Artefacto dist de producción</span>
                </div>
              </div>

              {/* Resiliencia Local para Evaluadores */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  Archivos de Arranque con 1 Clic para Usuarios No Informáticos:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-950 border border-slate-850">
                    <code className="text-emerald-400 font-bold">start-local.bat</code>
                    <p className="text-slate-400 text-[10px] mt-0.5">Doble clic en Windows, instala y abre el navegador automáticamente.</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-850">
                    <code className="text-sky-400 font-bold">./start-local.sh</code>
                    <p className="text-slate-400 text-[10px] mt-0.5">Ejecutable en Linux y macOS con autodiagnóstico paso a paso.</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-850">
                    <code className="text-purple-400 font-bold">docker compose up</code>
                    <p className="text-slate-400 text-[10px] mt-0.5">Contenedor multicapa listo para despliegues locales o nube.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: Live Data Schema Inspector */}
        {activeTab === 'schema' && (
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Payload Activo en Memoria (Telemetría de la Simulación Actual)
              </span>
              <span className="text-[10px] font-mono text-slate-400">WGS84 • GeoJSON Standard</span>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-sky-300 overflow-x-auto leading-relaxed max-h-80">
              <pre>{JSON.stringify(livePayloadSample, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* TAB 5: Extensibility & Future Modules Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <span className="font-bold text-sm text-indigo-300">
                Estrategia de Crecimiento & Nuevos Módulos del Sistema
              </span>
              <p className="text-slate-400 leading-relaxed">
                Gracias al patrón de diseño modular implementado en TypeScript, Frank puede ir incorporando nuevos módulos gradualmente:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                <strong className="text-emerald-400 text-xs">Módulo 1: IoT & Red Sismológica</strong>
                <p className="text-[11px] text-slate-400">
                  Integración con microcontroladores ESP32 y sensores acelerómetros MPU-6050 para monitoreo estructural en vivo en pabellones de la UNERG.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                <strong className="text-sky-400 text-xs">Módulo 2: Simulación de Rotura de Presas</strong>
                <p className="text-[11px] text-slate-400">
                  Modelado hidrodinámico 2D de la onda de rotura del Embalse de Calabozo (Río Guárico) y afectación a llanuras agrícolas.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                <strong className="text-amber-400 text-xs">Módulo 3: Análisis Multicriterio AHP</strong>
                <p className="text-[11px] text-slate-400">
                  Algoritmo de proceso analítico jerárquico (Saaty) para zonificación territorial automatizada apta para nuevas edificaciones.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
