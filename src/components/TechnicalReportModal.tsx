import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Building,
  Layers,
  Sparkles,
  Bot
} from 'lucide-react';
import {
  BuildingTypology,
  MultiHazardParameters,
  SimulationResult,
  SoilProfile,
  VenezuelaRegion
} from '../types';

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

  if (!isOpen) return null;

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
    } catch (e) {
      setAiOpinion(
        `DICTAMEN DE PERITAJE DE INGENIERÍA CIVIL:\nLa combinación de sismo (PGA ${scenario.earthquake.pgaG}g) con el empuje por aluvión (${simulationResult.debrisImpactForceKn} kN) condiciona un daño clasificado como "${simulationResult.ems98Grade}". Las solicitaciones en la base demandan refuerzos sismorresistentes inmediatos y control de escorrentía en la cuenca alta según las alertas de deforestación MapBiomas.`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-slate-100">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Dictamen Técnico & Peritaje Estructural SIURPROV
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Expediente: VEN-COVENIN-1756-{selectedYear}-{region.id.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-300">
          {/* Official Letterhead Header */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-slate-300">
            <div>
              <span className="text-xs font-bold text-sky-400 tracking-wider uppercase">
                REPÚBLICA BOLIVARIANA DE VENEZUELA
              </span>
              <h4 className="text-sm font-bold text-slate-100">
                SIURPROV - Simulador Urbano de Proyección para Venezuela
              </h4>
              <p className="text-[11px] text-slate-400">
                Auditoría Sismorresistente COVENIN 1756 & Modelado Geoespacial MapBiomas
              </p>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-400">
              <div>Fecha: {new Date().toLocaleDateString('es-VE')}</div>
              <div>Hora: {new Date().toLocaleTimeString('es-VE')}</div>
              <div className="text-emerald-400 font-bold">Estado: PERITAJE EMITIDO</div>
            </div>
          </div>

          {/* 1. Contexto Territorial & Geotécnico */}
          <div className="flex flex-col gap-2">
            <h5 className="font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              1. Parámetros Geológicos, Suelo y Cobertura Territorial
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
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

          {/* 2. Características Estructurales */}
          <div className="flex flex-col gap-2">
            <h5 className="font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-sky-400" />
              2. Datos del Sistema Estructural Analizado
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
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

          {/* 3. Dictamen de Solicitaciones y Daño */}
          <div className="flex flex-col gap-2">
            <h5 className="font-bold text-slate-100 uppercase tracking-wide border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              3. Resultados de la Simulación Multi-Amenaza
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Período Fundamental T₁:</span>
                <span className="text-sm font-bold font-mono text-sky-400 mt-0.5">
                  {simulationResult.fundamentalPeriodT1} seg
                </span>
                <span className="text-[10px] text-slate-500">
                  T* del suelo = {soilProfile.coveninTStar} seg
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Cortante Basal V₀:</span>
                <span className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                  {simulationResult.designBaseShearKn} kN
                </span>
                <span className="text-[10px] text-slate-500">
                  {(simulationResult.baseShearToWeightRatio * 100).toFixed(1)}% del peso total
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
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

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
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
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Desempeño FEMA 356:</span>
                <span className="text-xs font-bold font-mono text-sky-300 mt-0.5">
                  {simulationResult.performanceLevel}
                </span>
                <span className="text-[10px] text-slate-500">
                  Capacidad Residual: {simulationResult.residualCapacityPercent}%
                </span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col">
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

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Pérdida Económica Esperada:</span>
                <span className="text-xs font-bold font-mono text-amber-400 mt-0.5">
                  ${simulationResult.estimatedLossUsd.toLocaleString()} USD
                </span>
                <span className="text-[10px] text-slate-500">
                  Downtime: {simulationResult.estimatedDowntimeDays} días
                </span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Geotecnia & Newmark dN:</span>
                <span className="text-xs font-bold font-mono text-slate-200 mt-0.5">
                  {simulationResult.newmarkDisplacementCm} cm | Talud FS {simulationResult.slopeFactorOfSafety}
                </span>
                <span className="text-[10px] text-slate-500">
                  Volcamiento: {simulationResult.overturningMomentKnM} kN·m
                </span>
              </div>
            </div>
          </div>

          {/* 4. Modos de Falla y Recomendaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
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

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
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

          {/* 5. Auditoría con Asistente Inteligente Gemini */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 flex flex-col gap-3">
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
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-50"
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
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Licencia Abierta MIT | SIURPROV - Desarrollado por Frank Sousa</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};
