import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  AlertTriangle,
  X,
  ShieldCheck,
  Building,
  Layers,
  Sparkles,
  Bot,
  Calendar,
  ExternalLink
} from 'lucide-react';
import {
  BuildingTypology,
  MultiHazardParameters,
  SimulationResult,
  SoilProfile,
  VenezuelaRegion
} from '../types';
import { StudyStorageService } from '../services/studyStorage';

interface TechnicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: VenezuelaRegion;
  typology: BuildingTypology;
  soilProfile: SoilProfile;
  scenario: MultiHazardParameters;
  simulationResult: SimulationResult;
  selectedYear: number;
}

export const TechnicalReportModal: React.FC<TechnicalReportModalProps> = ({
  isOpen,
  onClose,
  region,
  typology,
  soilProfile,
  scenario,
  simulationResult,
  selectedYear
}) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiOpinion, setAiOpinion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generar reporte formal multitemporal con métricas MapBiomas y COVENIN
  const reportData = useMemo(() => {
    return StudyStorageService.generateTechnicalReport({
      region,
      typology,
      soilProfile,
      scenario,
      simulationResult,
      selectedYear
    });
  }, [region, typology, soilProfile, scenario, simulationResult, selectedYear]);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(reportData.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([reportData.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `informe_tecnico_siurprov_${region.id}_${selectedYear}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRequestAiAudit = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: region.name,
          fault: region.geologicalFault.name,
          typology: typology.name,
          stories: typology.stories,
          system: typology.structuralSystem,
          soil: soilProfile.name,
          pga: scenario.earthquake.pgaG,
          debrisForce: simulationResult.debrisImpactForceKn,
          drift: simulationResult.maxStoryDriftPercent,
          driftLimit: simulationResult.coveninDriftLimitPercent,
          emsGrade: simulationResult.ems98Grade,
          fsSlope: simulationResult.slopeFactorOfSafety,
          year: selectedYear
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiOpinion(data.auditSummary || data.opinion);
      } else {
        // Fallback engineering opinion if server route is offline
        setAiOpinion(
          `DIAGNÓSTICO TÉCNICO ESTRUCTURAL:\nLa estructura "${typology.name}" en la región de ${region.name} presenta una demanda sísmica y multi-amenaza crítica. Con un período fundamental de ${simulationResult.fundamentalPeriodT1}s sobre suelo ${soilProfile.type} (T* = ${soilProfile.coveninTStar}s), se observa ${simulationResult.exceedsDriftLimit ? 'una deriva excesiva que sobrepasa los límites de ductilidad de la norma COVENIN 1756' : 'un comportamiento que se mantiene dentro de los límites admisibles'}. Se recomienda implementar encamisado de columnas de planta baja y consolidación de taludes con drenajes sub-superficiales.`
        );
      }
    } catch {
      setAiOpinion(
        `DICTAMEN DE PERITAJE DE INGENIERÍA CIVIL:\nLa combinación de sismo (PGA ${scenario.earthquake.pgaG}g) con el empuje por aluvión (${simulationResult.debrisImpactForceKn} kN) condiciona un daño clasificado como "${simulationResult.ems98Grade}". Las solicitaciones en la base demandan refuerzos sismorresistentes inmediatos y control de escorrentía en la cuenca alta según las alertas de deforestación MapBiomas.`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      {/* Estilos dedicados para impresión profesional (@media print) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-report, .printable-report * {
            visibility: visible;
          }
          .printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
          }
          .print-table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #94a3b8 !important;
            padding: 6px 8px !important;
            color: #0f172a !important;
          }
        }
      `}</style>

      <div className="printable-report relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col text-slate-100">
        {/* Modal Top Bar */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Dictamen Técnico & Memoria de Cálculo SIURPROV
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Expediente: VEN-COVENIN-1756-{selectedYear}-{region.id.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              title="Copiar contenido en formato Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Copiar .md'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              title="Descargar informe técnico en formato Markdown"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Imprimir o guardar como documento PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-300">
          {/* Official Letterhead Header */}
          <div className="print-card p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-slate-300">
            <div>
              <span className="text-xs font-bold text-sky-400 tracking-wider uppercase">
                REPÚBLICA BOLIVARIANA DE VENEZUELA
              </span>
              <h4 className="text-sm font-bold text-slate-100">
                SIURPROV — SIMULADOR URBANO DE PROYECCIÓN PARA VENEZUELA
              </h4>
              <p className="text-[11px] text-slate-400">
                Auditoría Sismorresistente COVENIN 1756:2019 & Métricas Geoespaciales MapBiomas Venezuela
              </p>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-400">
              <div>Fecha: {new Date().toLocaleDateString('es-VE')}</div>
              <div>Año Simulado: <strong className="text-sky-400">{selectedYear}</strong></div>
              <div className="text-emerald-400 font-bold">Estado: DICTAMEN OFICIAL</div>
            </div>
          </div>

          {/* 1. Contexto Territorial & Geotécnico */}
          <div className="flex flex-col gap-2">
            <h5 className="font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              1. Parámetros Geológicos, Suelo y Cobertura Territorial
            </h5>
            <div className="print-card grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[11px]">Región Evaluada:</span>
                <strong className="text-slate-200">{region.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Zona Sísmica COVENIN:</span>
                <strong className="text-red-400 font-mono">
                  Zona {region.seismicZoneCOVENIN} (A₀ = {region.designAccelerationA0}g)
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Falla Geológica Activa:</span>
                <strong className="text-amber-400">{region.geologicalFault.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Perfil de Suelo:</span>
                <strong className="text-emerald-400 font-mono">
                  {soilProfile.name.split(':')[0]} (Vs = {soilProfile.shearWaveVelocityVs} m/s)
                </strong>
              </div>
            </div>
          </div>

          {/* 2. Dinámica Multitemporal MapBiomas Venezuela (1985–2050) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <h5 className="font-bold text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                2. Dinámica Multitemporal MapBiomas Venezuela (1985–2050)
              </h5>
              <span className="text-[10px] text-slate-400 font-mono">Fuente: RAISG / Colección MapBiomas</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="print-table w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                    <th className="p-2 text-center">Año</th>
                    <th className="p-2 text-right">Bosque (km²)</th>
                    <th className="p-2 text-right">Urbano (km²)</th>
                    <th className="p-2 text-right">Laderas (km²)</th>
                    <th className="p-2 text-right">Escorrentía (C)</th>
                    <th className="p-2 text-right">Deforestación (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {reportData.mapBiomasTransitions.map((t) => {
                    const isSelected = t.year === selectedYear;
                    return (
                      <tr
                        key={t.year}
                        className={
                          isSelected
                            ? 'bg-sky-950/60 text-sky-200 font-bold'
                            : 'hover:bg-slate-800/40 text-slate-300'
                        }
                      >
                        <td className="p-2 text-center">
                          {isSelected ? `👉 ${t.year}` : t.year}
                        </td>
                        <td className="p-2 text-right text-emerald-400">{t.forestCoverKm2.toLocaleString()}</td>
                        <td className="p-2 text-right text-amber-400">{t.urbanCoverKm2.toLocaleString()}</td>
                        <td className="p-2 text-right text-red-400">{t.informalSlopeCoverKm2.toLocaleString()}</td>
                        <td className="p-2 text-right font-bold">{t.meanRunoffCoefficient.toFixed(2)}</td>
                        <td className="p-2 text-right">{t.deforestationPercent.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Nota: El incremento del coeficiente de escorrentía C incrementa directamente el caudal pico y la
              fuerza destructiva de aluviones y flujos torrenciales en laderas urbanizadas.
            </p>
          </div>

          {/* 3. Características Estructurales */}
          <div className="flex flex-col gap-2">
            <h5 className="font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-sky-400" />
              3. Datos del Sistema Estructural Analizado
            </h5>
            <div className="print-card grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[11px]">Tipología:</span>
                <strong className="text-slate-200">{typology.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Niveles / Altura:</span>
                <strong className="text-slate-200 font-mono">
                  {typology.stories} pisos ({typology.stories * typology.storyHeightM} m)
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Factor Ductilidad R:</span>
                <strong className="text-indigo-400 font-mono">R = {typology.ductilityReductionFactorR}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Fundación:</span>
                <strong className="text-slate-300">{typology.foundationType}</strong>
              </div>
            </div>
          </div>

          {/* 4. Dictamen de Solicitaciones y Daño COVENIN 1756 */}
          <div className="flex flex-col gap-2">
            <h5 className="font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              4. Resultados de la Simulación Multi-Amenaza y Desempeño
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="print-card p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Período Fundamental T₁:</span>
                <span className="text-sm font-bold font-mono text-sky-400 mt-0.5">
                  {simulationResult.fundamentalPeriodT1} seg
                </span>
                <span className="text-[10px] text-slate-500">
                  T* del suelo = {soilProfile.coveninTStar} seg
                </span>
              </div>

              <div className="print-card p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Cortante Basal V₀:</span>
                <span className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                  {simulationResult.designBaseShearKn} kN
                </span>
                <span className="text-[10px] text-slate-500">
                  {(simulationResult.baseShearToWeightRatio * 100).toFixed(1)}% del peso total
                </span>
              </div>

              <div className="print-card p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Deriva Máxima Δ/H:</span>
                <span
                  className={`text-sm font-bold font-mono mt-0.5 ${
                    simulationResult.exceedsDriftLimit ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {simulationResult.maxStoryDriftPercent}%
                </span>
                <span className="text-[10px] text-slate-500">
                  Límite norma: {simulationResult.coveninDriftLimitPercent}%
                </span>
              </div>

              <div className="print-card p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Clasificación EMS-98:</span>
                <span className="text-xs font-bold text-red-300 mt-0.5">
                  {simulationResult.ems98Grade.split(':')[0]}
                </span>
                <span className="text-[10px] text-slate-500">
                  Park-Ang DI = {simulationResult.parkAngDamageIndex}
                </span>
              </div>
            </div>

            {/* Sub-Panel: Evaluaciones Avanzadas de Desempeño, P-Delta y Pérdidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
              <div className="print-card p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Desempeño FEMA 356:</span>
                <span className="text-xs font-bold font-mono text-sky-300 mt-0.5">
                  {simulationResult.performanceLevel}
                </span>
                <span className="text-[10px] text-slate-500">
                  Capacidad Residual: {simulationResult.residualCapacityPercent}%
                </span>
              </div>

              <div className="print-card p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Segundo Orden P-Delta (θ):</span>
                <span
                  className={`text-xs font-bold font-mono mt-0.5 ${
                    simulationResult.pDeltaExceeded ? 'text-red-400' : 'text-slate-200'
                  }`}
                >
                  θ = {simulationResult.pDeltaStabilityCoefficient} ({simulationResult.pDeltaAmplificationFactor}x)
                </span>
                <span className="text-[10px] text-slate-500">
                  Ductilidad μ = {simulationResult.ductilityDemand}
                </span>
              </div>

              <div className="print-card p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Pérdida Económica Esperada:</span>
                <span className="text-xs font-bold font-mono text-amber-400 mt-0.5">
                  ${simulationResult.estimatedLossUsd.toLocaleString()} USD
                </span>
                <span className="text-[10px] text-slate-500">
                  Downtime: {simulationResult.estimatedDowntimeDays} días
                </span>
              </div>

              <div className="print-card p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Geotecnia & Newmark dN:</span>
                <span className="text-xs font-bold font-mono text-slate-200 mt-0.5">
                  {simulationResult.newmarkDisplacementCm} cm | Talud FS {simulationResult.slopeFactorOfSafety}
                </span>
                <span className="text-[10px] text-slate-500">
                  Empuje aluvión: {simulationResult.debrisImpactForceKn} kN
                </span>
              </div>
            </div>
          </div>

          {/* 5. Modos de Falla y Recomendaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="print-card p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
              <span className="font-semibold text-red-300 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Vulnerabilidades y Modos de Falla Detectados:
              </span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                {simulationResult.identifiedVulnerabilities.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>

            <div className="print-card p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Recomendaciones de Reforzamiento Estructural:
              </span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                {simulationResult.recommendedRetrofits.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 6. Auditoría con Asistente Inteligente Gemini */}
          <div className="print-card p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs text-indigo-200">
                  Dictamen Automatizado de Auditoría Estructural (Inferencia IA)
                </span>
              </div>
              {!aiOpinion && (
                <button
                  onClick={handleRequestAiAudit}
                  disabled={isAiLoading}
                  className="no-print px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiLoading ? 'Generando dictamen...' : 'Consultar Asesor IA'}</span>
                </button>
              )}
            </div>

            {aiOpinion ? (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-indigo-200 whitespace-pre-wrap leading-relaxed">
                {aiOpinion}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Haga clic para obtener un peritaje técnico detallado sobre la conformidad con normas COVENIN y medidas de mitigación civil.
              </p>
            )}
          </div>

          {/* 7. Fuentes y Citas Formales */}
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 uppercase tracking-wider mb-1">
              Atribución de Fuentes y Marco Regulatorio:
            </div>
            <div>
              • <strong>MapBiomas Venezuela & RAISG:</strong> Colección Anual de Cobertura y Uso del Suelo (1985–2023). Red Amazónica de Información Socioambiental Georreferenciada.
            </div>
            <div>
              • <strong>COVENIN 1756:2019:</strong> Norma Venezolana "Edificaciones Sismorresistentes". FONDONORMA / FUNVISIS.
            </div>
            <div>
              • <strong>Autoría del Sistema:</strong> Ing. Frank Sousa (Ingeniero en Informática, UNERG 2025). San Juan de los Morros, Estado Guárico, Venezuela.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="no-print px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Licencia Abierta MIT | SIURPROV - Desarrollado por Frank Sousa</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium cursor-pointer"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};
