import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Award,
  ShieldCheck,
  CheckCircle2,
  X,
  Download,
  Copy,
  Check,
  Cpu,
  FileCode,
  GraduationCap,
  Sparkles,
  Play,
  Activity,
  Terminal
} from 'lucide-react';
import { SystemAuditorService, SystemAuditReport } from '../services/systemAuditor';

interface TechnicalMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalMemoryModal: React.FC<TechnicalMemoryModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'technologies' | 'licenses' | 'lifecycle' | 'audit'>('technologies');
  const [copied, setCopied] = useState(false);
  const [auditReport, setAuditReport] = useState<SystemAuditReport | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  if (!isOpen) return null;

  const handleRunAudit = () => {
    setIsRunningAudit(true);
    setTimeout(() => {
      const report = SystemAuditorService.runFullSystemAudit();
      setAuditReport(report);
      setIsRunningAudit(false);
    }, 250);
  };

  const handleDownloadMemory = () => {
    const content = `# MEMORIA TÉCNICA SIURPROV v1.2
Autor: Ing. Frank Sousa (UNERG 2025)
San Juan de los Morros, Estado Guárico, Venezuela.
Licencia MIT & CC BY-SA 4.0 (MapBiomas Venezuela / RAISG)

Consulte docs/MEMORIA_TECNICA.md en el repositorio para el texto completo.`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MEMORIA_TECNICA_SIURPROV.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Memoria Técnica & Matriz de Licencias SIURPROV
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  UNERG 2025
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Documentación formal, marco normativo COVENIN, ciclo de escalabilidad y auditoría de resiliencia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMemory}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar .md</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('technologies')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'technologies'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tecnologías Implementadas
          </button>
          <button
            onClick={() => setActiveTab('licenses')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'licenses'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Matriz Legal de Licencias
          </button>
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'lifecycle'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ciclo Creativo en 4 Fases
          </button>
          <button
            onClick={() => {
              setActiveTab('audit');
              if (!auditReport) handleRunAudit();
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Auditoría de Resiliencia en Vivo</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5 text-xs text-slate-300">
          {/* TAB 1: Technologies Matrix */}
          {activeTab === 'technologies' && (
            <div className="flex flex-col gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-100">
                    Stack Tecnológico Soberano y Autónomo
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Arquitectura desacoplada, sin dependencias de servicios externos privativos o pagos
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Full-Stack TypeScript
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                  <strong className="text-sky-300 font-semibold text-xs flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-sky-400" />
                    Frontend & Motor Gráfico React 19 + Canvas 2D
                  </strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Renderizado dinámico a 60 FPS sin ralentizaciones en dispositivos móviles. Integra deformación elasto-plástica piso por piso y partículas de detritos.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                  <strong className="text-emerald-300 font-semibold text-xs flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    Motor Físico StructuralSimulationEngine
                  </strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Implementación determinista pura en TypeScript de las ecuaciones COVENIN 1756:2019, cortante basal, derivas, factor de seguridad de talud Bishop e índice Park-Ang.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                  <strong className="text-purple-300 font-semibold text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-400" />
                    Cartografía SVG & Estándar GeoJSON WGS84
                  </strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Cartografía vectorial ligera que no requiere licencias de ArcGIS ni consumo de ancho de banda satelital excesivo. Exportable directamente a QGIS.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                  <strong className="text-amber-300 font-semibold text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Caché Offline-First en localStorage
                  </strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Protege el trabajo del usuario ante cortes eléctricos imprevistos serializando los urbanismos colocados en el navegador.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Legal Licenses Matrix */}
          {activeTab === 'licenses' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
                <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Marco de Licenciamiento y Permisos de Uso
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  SIURPROV se distribuye como software libre para garantizar la soberanía tecnológica nacional y la formación de futuras generaciones de ingenieros en Venezuela:
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-emerald-400 text-xs">Licencia MIT (Código Fuente SIURPROV)</strong>
                    <span className="text-[10px] font-mono text-slate-400">Open Source</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Copyright (c) 2026 Frank Sousa (frankalfonso1988@gmail.com). Permite uso comercial, educativo y de investigación con la única condición de preservar el aviso de derechos de autor.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-sky-400 text-xs">Creative Commons CC BY-SA 4.0 (Datos MapBiomas Venezuela & RAISG)</strong>
                    <span className="text-[10px] font-mono text-slate-400">Atribución Científica</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Los datos de cobertura del suelo, deforestación y transiciones históricas 1985-2023 pertenecen a la red científica MapBiomas Venezuela y RAISG, compartidos bajo términos de acceso abierto.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-400 text-xs">Normas Técnicas COVENIN / FONDONORMA</strong>
                    <span className="text-[10px] font-mono text-slate-400">Uso Regulatorio</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Las fórmulas matemáticas implementadas corresponden a los estándares oficiales de sismorresistencia de la República Bolivariana de Venezuela, de consulta pública para la protección de vidas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Creative Lifecycle in 4 Phases */}
          {activeTab === 'lifecycle' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
                <span className="font-bold text-sm text-indigo-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  Ciclo de Desarrollo y Escalabilidad para Ingenieros UNERG
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Metodología de evolución continua planteada por el Ing. Frank Sousa para el escalamiento a 1 año del proyecto:
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-100 text-xs">Fase 1: Modelado Numérico COVENIN & Estabilidad de Laderas</strong>
                    <p className="text-[11px] text-slate-400">
                      Implementación de períodos fundamentales, espectros Sa, derivas y método simplificado de Bishop para estabilidad de taludes.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-100 text-xs">Fase 2: Cartografía Multi-Escala y Detección de Urbanismos</strong>
                    <p className="text-[11px] text-slate-400">
                      Desarrollo del visor macro/micro con cuadrícula territorial, detección de estructuras reales (hospitales, campus UNERG, laderas) y sondeo de parcelas.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-100 text-xs">Fase 3: Emplazamiento Dinámico "Construir Aquí" & Proyección Temporal</strong>
                    <p className="text-[11px] text-slate-400">
                      Cálculo en tiempo real de solicitaciones para cualquier construcción proyectada sobre el terreno entre 1985 y 2050.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <div>
                    <strong className="text-slate-100 text-xs">Fase 4: Consola OpenAPI/Swagger, Testing y Resiliencia Offline</strong>
                    <p className="text-[11px] text-slate-400">
                      Estandarización de contratos de servicios REST, suite de auditoría automatizada y almacenamiento resiliente ante cortes eléctricos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Live Resilience & System Audit */}
          {activeTab === 'audit' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-100">
                      Batería Automatizada de Pruebas & Diagnóstico de Resiliencia
                    </h4>
                    {auditReport && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                          auditReport.overallHealth === 'EXCELENTE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        ESTADO: {auditReport.overallHealth} ({auditReport.passRatePercent}%)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Evalúa fórmulas de ingeniería civil, límites matemáticos y tolerancia ante fallos eléctricos
                  </p>
                </div>

                <button
                  onClick={handleRunAudit}
                  disabled={isRunningAudit}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunningAudit ? 'Auditando...' : 'Re-ejecutar Pruebas'}</span>
                </button>
              </div>

              {auditReport && (
                <div className="flex flex-col gap-3">
                  {/* KPI Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Total Pruebas:</span>
                      <strong className="text-slate-100 font-mono text-sm">{auditReport.totalTests}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Aprobadas:</span>
                      <strong className="text-emerald-400 font-mono text-sm">{auditReport.passedTests}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Tiempo de Ejecución:</span>
                      <strong className="text-sky-400 font-mono text-sm">{auditReport.executionTimeMs} ms</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Puntaje Resiliencia:</span>
                      <strong className="text-indigo-400 font-mono text-sm">{auditReport.resilienceScore}/100</strong>
                    </div>
                  </div>

                  {/* Test list */}
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                    {auditReport.tests.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                                t.status === 'PASSED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {t.status}
                            </span>
                            <span className="font-semibold text-slate-200">{t.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{t.durationMs} ms</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-400 pt-1">
                          <div>
                            <span>Medido: </span>
                            <strong className="text-sky-300 font-mono">{t.measuredValue}</strong>
                          </div>
                          <div>
                            <span>Rango Esperado: </span>
                            <span className="font-mono text-slate-300">{t.expectedRange}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 italic pt-0.5">{t.technicalNote}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Ing. Frank Sousa • San Juan de los Morros, Estado Guárico</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
          >
            Cerrar Memoria
          </button>
        </div>
      </div>
    </div>
  );
};
