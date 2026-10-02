import React, { useState } from 'react';
import {
  ShieldAlert,
  Ambulance,
  HeartPulse,
  Route,
  Truck,
  Users,
  AlertOctagon,
  Building,
  CheckCircle,
  Clock,
  Radio,
  Share2
} from 'lucide-react';
import { SimulationResult, VenezuelaRegion } from '../types';

interface EmergencyLogisticsPanelProps {
  region: VenezuelaRegion;
  simulationResult: SimulationResult;
}

export const EmergencyLogisticsPanel: React.FC<EmergencyLogisticsPanelProps> = ({
  region,
  simulationResult
}) => {
  const [activeTab, setActiveTab] = useState<'routes' | 'triage' | 'crews'>('routes');

  // Estimate casualties and hospital demand from EMS-98 Grade and damage
  const severityMultiplier =
    simulationResult.parkAngDamageIndex >= 1.0
      ? 1.0
      : simulationResult.parkAngDamageIndex >= 0.75
      ? 0.65
      : simulationResult.parkAngDamageIndex >= 0.45
      ? 0.35
      : 0.1;

  const estimatedInjured = Math.round(severityMultiplier * 320);
  const criticalTriageRed = Math.round(estimatedInjured * 0.25);
  const moderateTriageYellow = Math.round(estimatedInjured * 0.45);
  const minorTriageGreen = Math.round(estimatedInjured * 0.30);
  const sheltersRequired = Math.round(severityMultiplier * 850);

  // Evaluate route viability
  const routeStatus = region.criticalInfrastructure.mainEvacuationArteries.map((artery, idx) => {
    let status: 'Operativa' | 'Comprometida' | 'Bloqueada por Colapso' = 'Operativa';
    let reason = 'Tránsito fluido garantizado';

    if (simulationResult.debrisImpactForceKn > 200 && idx === 1) {
      status = 'Bloqueada por Colapso';
      reason = 'Derrumbe de talud y arrastre de sedimentos en calzada';
    } else if (simulationResult.parkAngDamageIndex > 0.65 && idx === 0) {
      status = 'Comprometida';
      reason = 'Fisuración en estribos de puente y deformación de pavimento';
    } else if (simulationResult.liquefactionOccurred && idx === 2) {
      status = 'Comprometida';
      reason = 'Hundimiento diferencial de calzada por licuefacción';
    }

    return { artery, status, reason };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <span>Centro de Operaciones de Emergencia (COE Venezuela)</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  simulationResult.evacuationPriority.includes('Rojo')
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                Alerta: {simulationResult.evacuationPriority}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Coordinación de Protección Civil, Bomberos y rutas de evacuación ante impacto estructural
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3 py-1 rounded transition ${
              activeTab === 'routes'
                ? 'bg-amber-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Arterias Viales
          </button>
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-3 py-1 rounded transition ${
              activeTab === 'triage'
                ? 'bg-amber-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Triaje Hospitalario
          </button>
          <button
            onClick={() => setActiveTab('crews')}
            className={`px-3 py-1 rounded transition ${
              activeTab === 'crews'
                ? 'bg-amber-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Despliegue USAR
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Rapid Status Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-red-400" />
              Heridos Estimados
            </span>
            <span className="text-lg font-bold font-mono text-red-400 mt-1">
              {estimatedInjured} pers.
            </span>
            <span className="text-[10px] text-slate-500">Según Park-Ang DI {simulationResult.parkAngDamageIndex}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-sky-400" />
              Hospitales en Región
            </span>
            <span className="text-lg font-bold font-mono text-sky-400 mt-1">
              {region.criticalInfrastructure.hospitals} Centros
            </span>
            <span className="text-[10px] text-slate-500">Capacidad hospitalaria activa</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Demanda de Albergue
            </span>
            <span className="text-lg font-bold font-mono text-amber-400 mt-1">
              {sheltersRequired} plazas
            </span>
            <span className="text-[10px] text-slate-500">Damnificados potenciales</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              Unidades PC / Bomberos
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-1">
              {region.criticalInfrastructure.civilProtectionStations +
                region.criticalInfrastructure.fireStations}{' '}
              Bases
            </span>
            <span className="text-[10px] text-slate-500">Equipos de respuesta rápida</span>
          </div>
        </div>

        {/* Tab 1: Evacuation Arteries */}
        {activeTab === 'routes' && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-slate-200">
              Evaluación de Corredores Viales y Rutas de Escape ({region.name})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {routeStatus.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border flex flex-col gap-1.5 ${
                    r.status === 'Bloqueada por Colapso'
                      ? 'bg-red-950/30 border-red-800/80 text-red-200'
                      : r.status === 'Comprometida'
                      ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs flex items-center gap-1.5">
                      <Route className="w-3.5 h-3.5 text-sky-400" />
                      {r.artery}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.status === 'Bloqueada por Colapso'
                          ? 'bg-red-900/60 text-red-300'
                          : r.status === 'Comprometida'
                          ? 'bg-amber-900/60 text-amber-300'
                          : 'bg-emerald-900/60 text-emerald-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{r.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Hospital Triage */}
        {activeTab === 'triage' && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-slate-200">
              Clasificación de Víctimas según Protocolo START (Triage)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-red-950/30 border border-red-800 rounded-lg flex flex-col">
                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  Rojo (Prioridad 1 - Crítico)
                </span>
                <span className="text-xl font-mono font-bold text-red-300 mt-1">
                  {criticalTriageRed}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Atención quirúrgica de emergencia (trauma por aplastamiento de losas)
                </span>
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-800 rounded-lg flex flex-col">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Amarillo (Prioridad 2 - Demorado)
                </span>
                <span className="text-xl font-mono font-bold text-amber-300 mt-1">
                  {moderateTriageYellow}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Fracturas cerradas y lesiones sin compromiso vital inmediato
                </span>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800 rounded-lg flex flex-col">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Verde (Prioridad 3 - Leve)
                </span>
                <span className="text-xl font-mono font-bold text-emerald-300 mt-1">
                  {minorTriageGreen}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Contusiones y laceraciones ambulatorias
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Rescue Crews Deployment */}
        {activeTab === 'crews' && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-slate-200">
              Despliegue Operativo de Búsqueda y Rescate Urbano (USAR)
            </span>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 flex flex-col gap-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-semibold text-slate-200">Comando de Incidente:</span>
                <span className="text-emerald-400 font-mono">Protección Civil & Bomberos Urbanos</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li>
                  Despliegue de equipos con cámaras térmicas y geófonos para detección de sobrevivientes bajo escombros.
                </li>
                <li>
                  Apuntalamiento de emergencia en estructuras contiguas con riesgo de colapso progresivo.
                </li>
                <li>
                  Instalación de tanques flexibles de agua potable y plantas eléctricas en áreas de triaje avanzado.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
