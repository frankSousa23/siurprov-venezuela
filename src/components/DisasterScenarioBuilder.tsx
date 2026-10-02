import React from 'react';
import {
  Flame,
  Activity,
  Droplets,
  Mountain,
  Wind,
  Layers,
  Building,
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  BuildingTypology,
  MultiHazardParameters,
  SoilProfile,
  SoilProfileType,
  VenezuelaRegion
} from '../types';
import { BUILDING_TYPOLOGIES } from '../data/buildingTypologies';
import { SOIL_PROFILES } from '../data/soilProfiles';

interface DisasterScenarioBuilderProps {
  region: VenezuelaRegion;
  typology: BuildingTypology;
  onSelectTypology: (typology: BuildingTypology) => void;
  soilProfile: SoilProfile;
  onSelectSoilProfile: (soil: SoilProfile) => void;
  scenario: MultiHazardParameters;
  onUpdateScenario: (newScenario: MultiHazardParameters) => void;
  onLoadPreset: (presetKey: string) => void;
}

export const DisasterScenarioBuilder: React.FC<DisasterScenarioBuilderProps> = ({
  region,
  typology,
  onSelectTypology,
  soilProfile,
  onSelectSoilProfile,
  scenario,
  onUpdateScenario,
  onLoadPreset
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100">
              Configurador Estructural & Escenarios Multi-Amenaza
            </h3>
            <p className="text-xs text-slate-400">
              Parametrización de la edificación, geotecnia COVENIN 1756 y eventos naturales simultáneos
            </p>
          </div>
        </div>

        {/* Historical Disaster Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Escenarios Históricos:
          </span>
          <select
            onChange={(e) => {
              if (e.target.value) onLoadPreset(e.target.value);
            }}
            defaultValue=""
            className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-sky-500"
          >
            <option value="" disabled>
              Cargar Escenario Crítico...
            </option>
            <option value="vargas-1999">Tragedia de Vargas 1999 (Aluvión & Deslave)</option>
            <option value="cariaco-1997">Terremoto de Cariaco 1997 (Mw 6.9, Suelo S4)</option>
            <option value="tejerias-2022">Aluvión Las Tejerías 2022 (Quebrada Los Patos)</option>
            <option value="caracas-megasismo">Megasismo San Sebastián 7.2 (Gran Caracas)</option>
            <option value="zulia-subsidencia">Costa Oriental Zulia (Subsidencia & Licuefacción)</option>
          </select>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Structural Typology & Soil Profile (4 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Typology Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-sky-400" />
              Tipología Estructural de la Edificación
            </label>
            <select
              value={typology.id}
              onChange={(e) => {
                const found = BUILDING_TYPOLOGIES.find((t) => t.id === e.target.value);
                if (found) onSelectTypology(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-sky-500"
            >
              {BUILDING_TYPOLOGIES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.stories} pisos)
                </option>
              ))}
            </select>

            {/* Typology Details Card */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2 text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-medium text-slate-200">Sistema:</span>
                <span className="text-sky-400 font-mono">{typology.structuralSystem}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Ductilidad R:</span>{' '}
                  <strong className="text-slate-200 font-mono">{typology.ductilityReductionFactorR}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Importancia I:</span>{' '}
                  <strong className="text-slate-200 font-mono">{typology.importanceFactorI}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Pisos / Altura:</span>{' '}
                  <strong className="text-slate-200 font-mono">
                    {typology.stories} ({typology.stories * typology.storyHeightM}m)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Fundación:</span>{' '}
                  <span className="text-slate-300 truncate block">{typology.foundationType.split(' ')[0]}</span>
                </div>
              </div>

              {/* Vulnerability Warnings */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {typology.softStoryVulnerability && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950 text-red-300 border border-red-800">
                    Piso Blando
                  </span>
                )}
                {typology.shortColumnRisk && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                    Columna Corta
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                  Vulnerabilidad Base: {typology.baseVulnerabilityScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Soil Profile Selector (COVENIN 1756) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Perfil Geotécnico de Suelo (Norma COVENIN 1756)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['S1', 'S2', 'S3', 'S4'] as SoilProfileType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => onSelectSoilProfile(SOIL_PROFILES[type])}
                  className={`py-2 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                    soilProfile.type === type
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{type}</span>
                  <span className="text-[10px] font-normal opacity-80 font-mono">
                    Vs {SOIL_PROFILES[type].shearWaveVelocityVs} m/s
                  </span>
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-emerald-400">{soilProfile.name}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  T* = {soilProfile.coveninTStar}s | β = {soilProfile.coveninBeta}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{soilProfile.description}</p>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                <span>Capacidad portante: <strong className="text-slate-200">{soilProfile.allowableBearingCapacityQa} kg/cm²</strong></span>
                <span>Nivel freático: <strong className="text-sky-400">{soilProfile.waterTableDepthM} m</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Multi-Hazard Interactive Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <span className="text-xs font-semibold text-slate-200 flex items-center justify-between">
            <span>Parámetros de Amenaza Física (Simulación Simultánea)</span>
            <span className="text-[11px] text-slate-400 font-normal">Active o ajuste cada fenómeno</span>
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. Sismo / Terremoto */}
            <div
              className={`p-3.5 rounded-xl border transition flex flex-col gap-2.5 ${
                scenario.earthquake.enabled
                  ? 'bg-red-950/20 border-red-800/80 shadow-xs'
                  : 'bg-slate-950 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-red-300">
                  <input
                    type="checkbox"
                    checked={scenario.earthquake.enabled}
                    onChange={(e) =>
                      onUpdateScenario({
                        ...scenario,
                        earthquake: { ...scenario.earthquake, enabled: e.target.checked }
                      })
                    }
                    className="rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-red-500"
                  />
                  <Activity className="w-4 h-4 text-red-400" />
                  <span>Sismo / Acelerograma</span>
                </label>
                <span className="text-xs font-mono font-bold text-red-400">
                  {scenario.earthquake.pgaG}g
                </span>
              </div>

              {scenario.earthquake.enabled && (
                <div className="flex flex-col gap-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Aceleración Máxima (PGA):</span>
                      <span className="font-mono text-slate-200">{scenario.earthquake.pgaG}g</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.80"
                      step="0.05"
                      value={scenario.earthquake.pgaG}
                      onChange={(e) =>
                        onUpdateScenario({
                          ...scenario,
                          earthquake: {
                            ...scenario.earthquake,
                            pgaG: parseFloat(e.target.value)
                          }
                        })
                      }
                      className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Magnitud Mw:</span>
                      <input
                        type="number"
                        min="4.5"
                        max="8.2"
                        step="0.1"
                        value={scenario.earthquake.magnitudeMw}
                        onChange={(e) =>
                          onUpdateScenario({
                            ...scenario,
                            earthquake: {
                              ...scenario.earthquake,
                              magnitudeMw: parseFloat(e.target.value)
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400">Dist. Falla (km):</span>
                      <input
                        type="number"
                        min="1"
                        max="80"
                        step="1"
                        value={scenario.earthquake.distanceToFaultKm}
                        onChange={(e) =>
                          onUpdateScenario({
                            ...scenario,
                            earthquake: {
                              ...scenario.earthquake,
                              distanceToFaultKm: parseFloat(e.target.value)
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Aluvión / Flujo de Detritos */}
            <div
              className={`p-3.5 rounded-xl border transition flex flex-col gap-2.5 ${
                scenario.debrisFlow.enabled
                  ? 'bg-amber-950/20 border-amber-800/80 shadow-xs'
                  : 'bg-slate-950 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-amber-300">
                  <input
                    type="checkbox"
                    checked={scenario.debrisFlow.enabled}
                    onChange={(e) =>
                      onUpdateScenario({
                        ...scenario,
                        debrisFlow: { ...scenario.debrisFlow, enabled: e.target.checked }
                      })
                    }
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <Mountain className="w-4 h-4 text-amber-400" />
                  <span>Aluvión / Deslave</span>
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">
                  Ola {scenario.debrisFlow.debrisDepthM}m
                </span>
              </div>

              {scenario.debrisFlow.enabled && (
                <div className="flex flex-col gap-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Altura Ola de Lodo:</span>
                      <span className="font-mono text-slate-200">{scenario.debrisFlow.debrisDepthM} m</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="4.0"
                      step="0.2"
                      value={scenario.debrisFlow.debrisDepthM}
                      onChange={(e) =>
                        onUpdateScenario({
                          ...scenario,
                          debrisFlow: {
                            ...scenario.debrisFlow,
                            debrisDepthM: parseFloat(e.target.value)
                          }
                        })
                      }
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Velocidad (m/s):</span>
                      <input
                        type="number"
                        min="2"
                        max="18"
                        step="1"
                        value={scenario.debrisFlow.debrisVelocityMs}
                        onChange={(e) =>
                          onUpdateScenario({
                            ...scenario,
                            debrisFlow: {
                              ...scenario.debrisFlow,
                              debrisVelocityMs: parseFloat(e.target.value)
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400">Peñones (m):</span>
                      <input
                        type="number"
                        min="0.1"
                        max="2.5"
                        step="0.2"
                        value={scenario.debrisFlow.boulderImpactSizeM}
                        onChange={(e) =>
                          onUpdateScenario({
                            ...scenario,
                            debrisFlow: {
                              ...scenario.debrisFlow,
                              boulderImpactSizeM: parseFloat(e.target.value)
                            }
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Inundación */}
            <div
              className={`p-3.5 rounded-xl border transition flex flex-col gap-2.5 ${
                scenario.flood.enabled
                  ? 'bg-cyan-950/20 border-cyan-800/80 shadow-xs'
                  : 'bg-slate-950 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-cyan-300">
                  <input
                    type="checkbox"
                    checked={scenario.flood.enabled}
                    onChange={(e) =>
                      onUpdateScenario({
                        ...scenario,
                        flood: { ...scenario.flood, enabled: e.target.checked }
                      })
                    }
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>Inundación / Aniegos</span>
                </label>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  +{scenario.flood.waterLevelM}m
                </span>
              </div>

              {scenario.flood.enabled && (
                <div className="flex flex-col gap-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Nivel de Agua sobre Calle:</span>
                      <span className="font-mono text-slate-200">{scenario.flood.waterLevelM} m</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="3.5"
                      step="0.2"
                      value={scenario.flood.waterLevelM}
                      onChange={(e) =>
                        onUpdateScenario({
                          ...scenario,
                          flood: {
                            ...scenario.flood,
                            waterLevelM: parseFloat(e.target.value)
                          }
                        })
                      }
                      className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Viento Huracanado / Ráfagas */}
            <div
              className={`p-3.5 rounded-xl border transition flex flex-col gap-2.5 ${
                scenario.wind.enabled
                  ? 'bg-sky-950/20 border-sky-800/80 shadow-xs'
                  : 'bg-slate-950 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-sky-300">
                  <input
                    type="checkbox"
                    checked={scenario.wind.enabled}
                    onChange={(e) =>
                      onUpdateScenario({
                        ...scenario,
                        wind: { ...scenario.wind, enabled: e.target.checked }
                      })
                    }
                    className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500"
                  />
                  <Wind className="w-4 h-4 text-sky-400" />
                  <span>Viento Extremo / Ráfagas</span>
                </label>
                <span className="text-xs font-mono font-bold text-sky-400">
                  {scenario.wind.speedKmh} km/h
                </span>
              </div>

              {scenario.wind.enabled && (
                <div className="flex flex-col gap-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Velocidad de Ráfaga:</span>
                      <span className="font-mono text-slate-200">{scenario.wind.speedKmh} km/h</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="220"
                      step="10"
                      value={scenario.wind.speedKmh}
                      onChange={(e) =>
                        onUpdateScenario({
                          ...scenario,
                          wind: {
                            ...scenario.wind,
                            speedKmh: parseFloat(e.target.value)
                          }
                        })
                      }
                      className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
