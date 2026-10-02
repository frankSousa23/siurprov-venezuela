import React from 'react';
import {
  MapPin,
  TrendingUp,
  TreePine,
  Building2,
  Calendar,
  Layers,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { VenezuelaRegion } from '../types';
import { VENEZUELA_REGIONS } from '../data/venezuelaRegions';

interface MapBiomasVenezuelaViewerProps {
  selectedRegion: VenezuelaRegion;
  onSelectRegion: (region: VenezuelaRegion) => void;
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

export const MapBiomasVenezuelaViewer: React.FC<MapBiomasVenezuelaViewerProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedYear,
  onSelectYear
}) => {
  const currentData =
    selectedRegion.mapBiomasTimeSeries.find((t) => t.year === selectedYear) ||
    selectedRegion.mapBiomasTimeSeries[selectedRegion.mapBiomasTimeSeries.length - 1];

  const availableYears = [1985, 1995, 2005, 2015, 2023, 2030, 2040, 2050];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Header with MapBiomas Attribution */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <span>MapBiomas Venezuela: Proyección Histórica y Futura</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono">
                RAISG Data
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Monitoreo multitemporal de coberturas de suelo, deforestación y avance urbano (1985 - 2050)
            </p>
          </div>
        </div>

        {/* Year Selector Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
          {availableYears.map((yr) => (
            <button
              key={yr}
              onClick={() => onSelectYear(yr)}
              className={`px-2 py-1 rounded text-xs font-mono transition ${
                selectedYear === yr
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {yr}
              {yr > 2023 ? '*' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Geographic Map Visualization (Left 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-4/3 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
            {/* SVG Venezuela Map representation */}
            <svg
              viewBox="0 0 700 500"
              className="w-full h-full object-contain filter drop-shadow-md select-none"
            >
              {/* Caribbean Sea Background */}
              <rect width="700" height="500" fill="#080e1a" />

              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.6" />
                </pattern>
                <radialGradient id="regionGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="700" height="500" fill="url(#grid)" />

              {/* Simplified Schematic Coastline & Venezuela Polygon */}
              <path
                d="M 120 120 
                   Q 150 110, 220 125 
                   T 310 135 
                   T 410 130 
                   T 490 145 
                   L 550 170 
                   L 600 240 
                   L 560 360 
                   L 460 440 
                   L 370 430 
                   L 300 370 
                   L 200 340 
                   L 140 280 
                   L 100 210 
                   Z"
                fill="#131c2e"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Lake Maracaibo */}
              <ellipse cx="160" cy="180" rx="35" ry="50" fill="#080e1a" stroke="#1e293b" strokeWidth="1.5" />

              {/* Mountain Ranges shaded (Cordillera de la Costa y de Mérida) */}
              {/* Los Andes */}
              <path
                d="M 120 270 Q 180 230, 250 190"
                stroke="#475569"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.4"
              />
              {/* Cordillera de la Costa */}
              <path
                d="M 270 145 Q 360 140, 480 148"
                stroke="#475569"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.4"
              />

              {/* Major Geological Fault Lines */}
              {/* Falla de Boconó (Red Dash) */}
              <path
                d="M 115 285 L 255 185"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />
              <text x="135" y="270" fill="#f87171" fontSize="10" fontWeight="bold">
                Falla de Boconó
              </text>

              {/* Falla San Sebastián - Ávila */}
              <path
                d="M 280 138 L 420 138"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />
              <text x="310" y="125" fill="#f87171" fontSize="10" fontWeight="bold">
                Falla San Sebastián
              </text>

              {/* Falla de El Pilar */}
              <path
                d="M 430 142 L 530 146"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />
              <text x="450" y="132" fill="#f87171" fontSize="10" fontWeight="bold">
                Falla El Pilar
              </text>

              {/* Falla de Oca-Ancón */}
              <path
                d="M 90 145 L 210 150"
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
              <text x="105" y="138" fill="#f87171" fontSize="9">
                Falla Oca-Ancón
              </text>

              {/* Venezuela Region Clickable Pins */}
              {VENEZUELA_REGIONS.map((r) => {
                // Coordinate projection to canvas coordinates
                // lat: ~8 to ~11, lng: ~ -72 to ~ -62
                const px = 100 + ((r.lng - -72) / 10) * 450;
                const py = 420 - ((r.lat - 8) / 3) * 320;
                const isSelected = selectedRegion.id === r.id;

                return (
                  <g
                    key={r.id}
                    onClick={() => onSelectRegion(r)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    {isSelected && (
                      <circle cx={px} cy={py} r="24" fill="url(#regionGlow)" />
                    )}
                    <circle
                      cx={px}
                      cy={py}
                      r={isSelected ? "9" : "6"}
                      fill={isSelected ? "#38bdf8" : "#94a3b8"}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <text
                      x={px}
                      y={py - 12}
                      textAnchor="middle"
                      fill={isSelected ? "#38bdf8" : "#e2e8f0"}
                      fontSize={isSelected ? "11" : "10"}
                      fontWeight={isSelected ? "bold" : "normal"}
                    >
                      {r.capitalCity.split('/')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-950/85 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 backdrop-blur-xs flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-red-500 border-dashed" />
                <span>Fallas Geológicas Activas (FUNVISIS)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span>Nodos Críticos de Simulación SIURPROV</span>
              </div>
            </div>
          </div>

          {/* Region Switcher Pills */}
          <div className="flex flex-wrap gap-2">
            {VENEZUELA_REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectRegion(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  selectedRegion.id === r.id
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{r.name.split('(')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MapBiomas Indicators & Civil Engineering Impacts (Right 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Active Region Summary Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-sky-400 font-semibold tracking-wider">
                  Zona Sísmica COVENIN {selectedRegion.seismicZoneCOVENIN} (A₀ = {selectedRegion.designAccelerationA0}g)
                </span>
                <h4 className="text-base font-bold text-slate-100 mt-0.5">
                  {selectedRegion.name}
                </h4>
              </div>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-red-950 text-red-300 border border-red-800">
                Falla: {selectedRegion.geologicalFault.maxExpectedMagnitudeMw} Mw
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedRegion.description}
            </p>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col gap-1">
              <strong className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Falla Activa: {selectedRegion.geologicalFault.name}
              </strong>
              <span>Tasa de deformación: {selectedRegion.geologicalFault.slipRateMmYear} mm/año</span>
              <span className="text-slate-400">{selectedRegion.geologicalFault.description}</span>
            </div>
          </div>

          {/* Temporal Evolution Metrics in selected year */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                Métricas de Suelo MapBiomas ({selectedYear})
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedYear > 2023 ? 'Modelo Predictivo' : 'Observación Satelital'}
              </span>
            </div>

            {/* Cobertura Forestal */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                  Cobertura Forestal Nativa
                </span>
                <strong className="text-slate-100 font-mono">
                  {currentData.forestCoverKm2} km²
                </strong>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (currentData.forestCoverKm2 /
                        (currentData.forestCoverKm2 + currentData.urbanCoverKm2 + currentData.informalSlopeCoverKm2)) *
                        100
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Mancha Urbana y Asentamientos en Laderas */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  Urbano e Informal en Ladera
                </span>
                <strong className="text-amber-400 font-mono">
                  {currentData.urbanCoverKm2 + currentData.informalSlopeCoverKm2} km²
                </strong>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((currentData.urbanCoverKm2 + currentData.informalSlopeCoverKm2) /
                        (currentData.forestCoverKm2 + currentData.urbanCoverKm2 + currentData.informalSlopeCoverKm2)) *
                        100
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Coeficiente C y Riesgo Hidrológico */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col">
                <span className="text-[11px] text-slate-400">Coeficiente Escorrentía C:</span>
                <span className="text-sm font-bold font-mono text-sky-400">
                  {currentData.meanRunoffCoefficient}
                </span>
                <span className="text-[10px] text-slate-500">
                  {currentData.meanRunoffCoefficient > 0.75
                    ? 'Infiltración casi nula (Muy Peligroso)'
                    : 'Capacidad de retención moderada'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col">
                <span className="text-[11px] text-slate-400">Deforestación Acumulada:</span>
                <span className="text-sm font-bold font-mono text-red-400">
                  +{currentData.deforestationAccumulatedPercent}%
                </span>
                <span className="text-[10px] text-slate-500">Desde la base 1985</span>
              </div>
            </div>

            {/* Direct Engineering Warning */}
            <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-xs text-sky-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong>Impacto en Ingeniería Civil:</strong> La pérdida de cobertura vegetal registrada por MapBiomas eleva el coeficiente C de 0.38 a {currentData.meanRunoffCoefficient}, triplicando el caudal de aluvión que golpea las fundaciones en las quebradas.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
