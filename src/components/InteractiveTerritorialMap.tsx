import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  Building,
  PlusCircle,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Droplets,
  Mountain,
  Compass,
  Sparkles,
  Info,
  ChevronRight,
  ChevronDown,
  Filter,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  Download,
  FolderArchive
} from 'lucide-react';
import { GisArchitectureModal } from './GisArchitectureModal';
import {
  BuildingDamageStatus,
  BuildingTypology,
  MapBuilding,
  MultiHazardParameters,
  PlanningSuggestion,
  SimulationResult,
  SoilProfileType,
  UrbanSector,
  VenezuelaRegion
} from '../types';
import { VENEZUELA_REGIONS } from '../data/venezuelaRegions';
import { BUILDING_TYPOLOGIES } from '../data/buildingTypologies';
import { SOIL_PROFILES } from '../data/soilProfiles';
import { StructuralSimulationEngine } from '../services/structuralEngine';

interface InteractiveTerritorialMapProps {
  selectedRegion: VenezuelaRegion;
  onSelectRegion: (region: VenezuelaRegion) => void;
  selectedYear: number;
  onSelectYear: (year: number) => void;
  scenario: MultiHazardParameters;
  onInspectBuilding?: (building: MapBuilding) => void;
  externalUserBuildings?: MapBuilding[];
  onUserBuildingsChange?: (buildings: MapBuilding[]) => void;
  onOpenStudyManager?: () => void;
}

type MapMode = 'macro' | 'micro';
type LayerType = 'mapbiomas' | 'topography' | 'seismic' | 'hazard';

export const InteractiveTerritorialMap: React.FC<InteractiveTerritorialMapProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedYear,
  onSelectYear,
  scenario,
  onInspectBuilding,
  externalUserBuildings,
  onUserBuildingsChange,
  onOpenStudyManager
}) => {
  const [mapMode, setMapMode] = useState<MapMode>('micro');
  const [activeLayer, setActiveLayer] = useState<LayerType>('mapbiomas');
  const [selectedSector, setSelectedSector] = useState<UrbanSector>(
    selectedRegion.urbanSectors[0] || {
      id: 'default',
      name: 'Sector General',
      description: 'Área urbana general',
      centerCoords: [selectedRegion.lat, selectedRegion.lng],
      zoomLevel: 15,
      terrainType: 'Valle Aluvial',
      detectedBuildings: [],
      suggestions: []
    }
  );

  // User placed buildings: controlled if externalUserBuildings is passed, otherwise fallback to local
  const [localUserBuildings, setLocalUserBuildings] = useState<MapBuilding[]>(() => {
    try {
      const saved = localStorage.getItem('siurprov_user_buildings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const userBuildings = externalUserBuildings !== undefined ? externalUserBuildings : localUserBuildings;

  const updateUserBuildings = (updater: (prev: MapBuilding[]) => MapBuilding[]) => {
    const updated = updater(userBuildings);
    if (onUserBuildingsChange) {
      onUserBuildingsChange(updated);
    } else {
      setLocalUserBuildings(updated);
      try {
        localStorage.setItem('siurprov_user_buildings', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const [selectedBuildingType, setSelectedBuildingType] = useState<string>(BUILDING_TYPOLOGIES[0].id);
  const [isPlacingMode, setIsPlacingMode] = useState<boolean>(false);
  const [selectedBuildingForAudit, setSelectedBuildingForAudit] = useState<MapBuilding | null>(null);
  const [isGisModalOpen, setIsGisModalOpen] = useState<boolean>(false);

  // Filter & UI drawer state
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [showDetectedBuildings, setShowDetectedBuildings] = useState<boolean>(true);
  const [activeSuggestionLevel, setActiveSuggestionLevel] = useState<'All' | 'Macro' | 'Micro'>('All');

  // When region changes, switch selected sector
  useEffect(() => {
    if (selectedRegion.urbanSectors.length > 0) {
      setSelectedSector(selectedRegion.urbanSectors[0]);
    }
  }, [selectedRegion]);

  // Combine detected buildings from the active sector with user placed buildings
  const allBuildings = useMemo(() => {
    const existing = showDetectedBuildings ? selectedSector.detectedBuildings : [];
    return [...existing, ...userBuildings];
  }, [selectedSector, userBuildings, showDetectedBuildings]);

  // Compute dynamic damage for every building on the map based on current scenario and year
  const buildingsWithCalculatedDamage = useMemo(() => {
    return allBuildings.map((b) => {
      const typology =
        BUILDING_TYPOLOGIES.find((t) => t.id === b.typeId) || BUILDING_TYPOLOGIES[0];
      const soil = SOIL_PROFILES[b.soilType] || SOIL_PROFILES.S3;

      // Adjust scenario parameters for local coordinates (distance to fault, slope, distance to stream)
      const localScenario: MultiHazardParameters = {
        ...scenario,
        earthquake: {
          ...scenario.earthquake,
          distanceToFaultKm: b.distanceToFaultKm
        },
        slope: {
          ...scenario.slope,
          angleDeg: b.slopeDeg
        },
        debrisFlow: {
          ...scenario.debrisFlow,
          debrisDepthM:
            scenario.debrisFlow.enabled && b.distanceToStreamM < 100
              ? Math.max(0.5, scenario.debrisFlow.debrisDepthM * (1 - b.distanceToStreamM / 200))
              : 0
        }
      };

      const result: SimulationResult = StructuralSimulationEngine.runSimulation(
        selectedRegion,
        typology,
        soil,
        localScenario,
        selectedYear
      );

      let status: BuildingDamageStatus = 'Seguro';
      if (result.parkAngDamageIndex >= 0.85 || result.slopeFactorOfSafety < 0.95) {
        status = 'Colapso Inminente';
      } else if (result.parkAngDamageIndex >= 0.55) {
        status = 'Daño Severo';
      } else if (result.parkAngDamageIndex >= 0.25) {
        status = 'Daño Moderado';
      } else if (result.parkAngDamageIndex > 0.1) {
        status = 'Fisuras Leves';
      }

      return {
        ...b,
        damageState: {
          driftPercent: result.maxStoryDriftPercent,
          parkAngIndex: result.parkAngDamageIndex,
          emsGrade: result.ems98Grade,
          stressRatio: result.structuralStressRatio,
          status,
          primaryRisk: result.primaryFailureMechanism,
          performanceLevel: result.performanceLevel,
          pDeltaStabilityCoefficient: result.pDeltaStabilityCoefficient,
          residualCapacityPercent: result.residualCapacityPercent,
          estimatedLossUsd: result.estimatedLossUsd,
          estimatedDowntimeDays: result.estimatedDowntimeDays
        }
      };
    });
  }, [allBuildings, scenario, selectedRegion, selectedYear]);

  // Handle clicking on micro map to place a new building
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPlacingMode) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Probe terrain characteristics at coordinates
    // y < 35 = mountain slope, y > 70 = river valley/depression
    let elevation = selectedRegion.elevationM;
    let slope = 6;
    let soil: SoilProfileType = selectedRegion.defaultSoilProfile;
    let streamDistance = 400;

    if (clickY < 35) {
      // Upper slope / mountain
      elevation += Math.round((35 - clickY) * 18);
      slope = Math.round(18 + (35 - clickY) * 0.8);
      soil = 'S1';
      streamDistance = 600;
    } else if (clickY > 65) {
      // Lower ravine / stream
      elevation -= Math.round((clickY - 65) * 8);
      slope = Math.round(10 + Math.random() * 8);
      soil = 'S4';
      streamDistance = Math.round(Math.abs(clickX - 50) * 4);
    } else {
      // Alluvial terrace
      slope = Math.round(3 + Math.random() * 6);
      soil = 'S3';
      streamDistance = 250;
    }

    const typology =
      BUILDING_TYPOLOGIES.find((t) => t.id === selectedBuildingType) || BUILDING_TYPOLOGIES[0];

    const newBuilding: MapBuilding = {
      id: `user-bldg-${Date.now()}`,
      name: `${typology.name} (Proyectada)`,
      typeId: typology.id,
      x: Number(clickX.toFixed(1)),
      y: Number(clickY.toFixed(1)),
      elevationM: elevation,
      slopeDeg: slope,
      distanceToFaultKm: Number((1.5 + Math.random() * 3).toFixed(1)),
      distanceToStreamM: streamDistance,
      stories: typology.stories,
      isUserPlaced: true,
      yearConstructed: selectedYear,
      soilType: soil
    };

    updateUserBuildings((prev) => [...prev, newBuilding]);
    setSelectedBuildingForAudit(newBuilding);
    setIsPlacingMode(false);
  };

  const handleRemoveBuilding = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateUserBuildings((prev) => prev.filter((b) => b.id !== id));
    if (selectedBuildingForAudit?.id === id) {
      setSelectedBuildingForAudit(null);
    }
  };

  const handleExportGeoJson = () => {
    const geoJson = {
      type: 'FeatureCollection',
      metadata: {
        generator: 'SIURPROV - Simulador Urbano de Proyección para Venezuela',
        region: selectedRegion.name,
        sector: selectedSector.name,
        year: selectedYear,
        author: 'Frank Sousa (frankalfonso1988@gmail.com)',
        timestamp: new Date().toISOString()
      },
      features: buildingsWithCalculatedDamage.map((b) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            Number((selectedRegion.lng + (b.x - 50) * 0.002).toFixed(6)),
            Number((selectedRegion.lat + (50 - b.y) * 0.002).toFixed(6)),
            b.elevationM
          ]
        },
        properties: {
          id: b.id,
          name: b.name,
          stories: b.stories,
          soilType: b.soilType,
          slopeDeg: b.slopeDeg,
          distanceToFaultKm: b.distanceToFaultKm,
          distanceToStreamM: b.distanceToStreamM,
          isUserPlaced: !!b.isUserPlaced,
          status: b.damageState?.status,
          driftPercent: b.damageState?.driftPercent,
          emsGrade: b.damageState?.emsGrade,
          parkAngIndex: b.damageState?.parkAngIndex,
          primaryRisk: b.damageState?.primaryRisk
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geoJson, null, 2)], {
      type: 'application/geo+json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `siurprov_${selectedRegion.id}_${selectedYear}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentLandCover =
    selectedRegion.mapBiomasTimeSeries.find((t) => t.year === selectedYear) ||
    selectedRegion.mapBiomasTimeSeries[selectedRegion.mapBiomasTimeSeries.length - 1];

  const filteredSuggestions = selectedSector.suggestions.filter((s) => {
    if (activeSuggestionLevel === 'All') return true;
    return s.level === activeSuggestionLevel;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all">
      {/* Top Header Bar */}
      <div className="px-4 lg:px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Title and Macro/Micro Toggle */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm lg:text-base text-slate-100">
                Sistema Geoespacial SIURPROV: Análisis Territorial Multi-Escala
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800">
                {mapMode === 'macro' ? 'Escala Nacional' : 'Escala Micro-Parcela'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Detección de urbanismos, emplazamiento de construcciones y proyección física en el tiempo (1985-2050)
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* GeoJSON Export & GIS Guide Buttons */}
          <button
            onClick={handleExportGeoJson}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 text-xs font-medium transition"
            title="Exportar parcelas y urbanismos en formato GeoJSON para QGIS o Google Earth"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar GeoJSON</span>
          </button>

          <button
            onClick={() => setIsGisModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-xs font-medium transition"
            title="Comparativa técnica: Open Source vs GEE vs ArcGIS"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guía SIG</span>
          </button>

          {onOpenStudyManager && (
            <button
              onClick={onOpenStudyManager}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 text-xs font-medium transition cursor-pointer"
              title="Guardar, exportar, importar o compartir estudios territoriales .siurprov"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Estudios (.siurprov)</span>
            </button>
          )}

          {/* Macro / Micro Switch */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setMapMode('macro')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                mapMode === 'macro'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Macro (Venezuela)
            </button>
            <button
              onClick={() => setMapMode('micro')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                mapMode === 'micro'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Micro (Sector & Parcelas)
            </button>
          </div>

          {/* Year Time-lapse buttons */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {[1985, 2005, 2023, 2035, 2050].map((yr) => (
              <button
                key={yr}
                onClick={() => onSelectYear(yr)}
                className={`px-2 py-1 rounded text-xs font-mono transition ${
                  selectedYear === yr
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layer Selector & Sector Switcher Bar */}
      <div className="px-4 lg:px-6 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Layer Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 mr-1 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Capa:
          </span>
          <button
            onClick={() => setActiveLayer('mapbiomas')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeLayer === 'mapbiomas'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            MapBiomas (Suelos & Bosques)
          </button>
          <button
            onClick={() => setActiveLayer('topography')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeLayer === 'topography'
                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Curvas de Nivel & Pendientes
          </button>
          <button
            onClick={() => setActiveLayer('seismic')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeLayer === 'seismic'
                ? 'bg-red-950 text-red-300 border border-red-700'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Fallas & Geotecnia COVENIN
          </button>
          <button
            onClick={() => setActiveLayer('hazard')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeLayer === 'hazard'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Mapa de Riesgo Combinado
          </button>
        </div>

        {/* Sector Switcher (when in Micro Mode) */}
        {mapMode === 'micro' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sector Urbano:</span>
            <select
              value={selectedSector.id}
              onChange={(e) => {
                const s = selectedRegion.urbanSectors.find((sec) => sec.id === e.target.value);
                if (s) setSelectedSector(s);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-medium focus:ring-1 focus:ring-sky-500"
            >
              {selectedRegion.urbanSectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Map Workstation Grid */}
      <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Map Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Construction Tool Toolbar */}
          {mapMode === 'micro' && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-sky-400" />
                  Herramienta "Construir Aquí":
                </span>

                <select
                  value={selectedBuildingType}
                  onChange={(e) => setSelectedBuildingType(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs"
                >
                  {BUILDING_TYPOLOGIES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.stories}p)
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsPlacingMode(!isPlacingMode)}
                  className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    isPlacingMode
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{isPlacingMode ? 'Haga Clic en el Terreno...' : 'Emplazar en Mapa'}</span>
                </button>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <button
                  onClick={() => setShowDetectedBuildings(!showDetectedBuildings)}
                  className="flex items-center gap-1 hover:text-slate-200"
                >
                  {showDetectedBuildings ? (
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>Urbanismos Existentes ({selectedSector.detectedBuildings.length})</span>
                </button>

                {userBuildings.length > 0 && (
                  <button
                    onClick={() => updateUserBuildings(() => [])}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar Proyecciones ({userBuildings.length})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Interactive Vector GIS Canvas */}
          <div className="relative aspect-4/3 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
            {/* MODE 1: MACRO MAP (Venezuela Comprehensive Vector) */}
            {mapMode === 'macro' && (
              <svg
                viewBox="0 0 700 500"
                className="w-full h-full object-contain filter drop-shadow-md select-none"
              >
                {/* Caribbean Sea Background */}
                <rect width="700" height="500" fill="#080e1a" />

                {/* Grid */}
                <defs>
                  <pattern id="macro-grid" width="35" height="35" patternUnits="userSpaceOnUse">
                    <path d="M 35 0 L 0 0 0 35" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="700" height="500" fill="url(#macro-grid)" />

                {/* Continental Polygon Venezuela */}
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

                {/* Fault Systems */}
                <path d="M 115 285 L 255 185" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,4" />
                <path d="M 280 138 L 420 138" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,4" />
                <path d="M 430 142 L 530 146" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,4" />
                <path d="M 90 145 L 210 150" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,4" />

                {/* Region Nodes */}
                {VENEZUELA_REGIONS.map((r) => {
                  const px = 100 + ((r.lng - -72) / 10) * 450;
                  const py = 420 - ((r.lat - 8) / 3) * 320;
                  const isSelected = selectedRegion.id === r.id;

                  return (
                    <g
                      key={r.id}
                      onClick={() => {
                        onSelectRegion(r);
                        setMapMode('micro');
                      }}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      {isSelected && (
                        <circle cx={px} cy={py} r="28" fill="#38bdf8" opacity="0.25" />
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
            )}

            {/* MODE 2: MICRO MAP (Sector, Parcel & Building Interactive Simulator) */}
            {mapMode === 'micro' && (
              <svg
                viewBox="0 0 800 600"
                onClick={handleMapClick}
                className={`w-full h-full object-cover select-none ${
                  isPlacingMode ? 'cursor-crosshair' : 'cursor-default'
                }`}
              >
                {/* Terrain Backdrop Gradient based on Active Layer */}
                <defs>
                  {/* Topographic elevation gradient */}
                  <linearGradient id="topoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" /> {/* Upper mountain */}
                    <stop offset="40%" stopColor="#334155" /> {/* Mid-slope */}
                    <stop offset="70%" stopColor="#1e293b" /> {/* Valley floor */}
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  {/* MapBiomas vegetation gradient according to selected year */}
                  <linearGradient id="mapbiomasGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop
                      offset="0%"
                      stopColor={selectedYear > 2030 ? '#3f3f46' : '#064e3b'}
                    />
                    <stop
                      offset="45%"
                      stopColor={selectedYear > 2023 ? '#713f12' : '#047857'}
                    />
                    <stop offset="75%" stopColor="#18181b" />
                    <stop offset="100%" stopColor="#09090b" />
                  </linearGradient>

                  {/* Hazard Heatmap Gradient */}
                  <radialGradient id="hazardPulse" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Base Terrain Fill */}
                <rect
                  width="800"
                  height="600"
                  fill={
                    activeLayer === 'mapbiomas'
                      ? 'url(#mapbiomasGradient)'
                      : activeLayer === 'hazard'
                      ? 'url(#hazardPulse)'
                      : 'url(#topoGradient)'
                  }
                />

                {/* Contour Lines (Curvas de Nivel) */}
                <g opacity={activeLayer === 'topography' ? 0.7 : 0.25} stroke="#94a3b8" strokeWidth="1" fill="none">
                  <path d="M 0 100 Q 250 80, 500 110 T 800 90" />
                  <path d="M 0 170 Q 300 150, 550 180 T 800 160" />
                  <path d="M 0 250 Q 280 230, 520 260 T 800 240" />
                  <path d="M 0 340 Q 320 320, 580 350 T 800 330" />
                  <path d="M 0 430 Q 350 410, 600 440 T 800 420" />
                  <path d="M 0 520 Q 380 500, 620 530 T 800 510" />
                </g>

                {/* Active Geological Fault Zone (Red Dashed Line) */}
                <g>
                  <path
                    d="M 50 220 Q 400 210, 750 230"
                    stroke="#ef4444"
                    strokeWidth="3.5"
                    strokeDasharray="8,6"
                    opacity={activeLayer === 'seismic' ? 0.9 : 0.5}
                  />
                  <text x="70" y="205" fill="#f87171" fontSize="12" fontWeight="bold">
                    Falla Geológica Activa ({selectedRegion.geologicalFault.name})
                  </text>
                </g>

                {/* Torrental River / Quebrada Stream Channel */}
                <g>
                  <path
                    d="M 420 0 Q 380 200, 460 380 T 390 600"
                    stroke="#0284c7"
                    strokeWidth={scenario.debrisFlow.enabled ? 16 : 8}
                    fill="none"
                    opacity="0.75"
                  />
                  <text x="475" y="390" fill="#38bdf8" fontSize="11" fontWeight="semibold">
                    Cauce Torrencial (Drenaje de Cuenca)
                  </text>
                </g>

                {/* Debris Flow Hazard Cone if active */}
                {scenario.debrisFlow.enabled && (
                  <path
                    d="M 420 50 L 250 480 Q 400 520, 650 450 Z"
                    fill="rgba(180, 83, 9, 0.35)"
                    stroke="#b45309"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                )}

                {/* Render Buildings (Both detected and user-placed) */}
                {buildingsWithCalculatedDamage.map((b) => {
                  const bx = (b.x / 100) * 800;
                  const by = (b.y / 100) * 600;
                  const isSelected = selectedBuildingForAudit?.id === b.id;

                  // Status badge color
                  const status = b.damageState?.status || 'Seguro';
                  const badgeColor =
                    status === 'Colapso Inminente'
                      ? '#ef4444'
                      : status === 'Daño Severo'
                      ? '#f97316'
                      : status === 'Daño Moderado'
                      ? '#eab308'
                      : status === 'Fisuras Leves'
                      ? '#38bdf8'
                      : '#10b981';

                  return (
                    <g
                      key={b.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBuildingForAudit(b);
                        if (onInspectBuilding) onInspectBuilding(b);
                      }}
                      className="cursor-pointer transition-transform hover:scale-125"
                    >
                      {/* Selection Aura */}
                      {isSelected && (
                        <circle cx={bx} cy={by} r="26" fill={badgeColor} opacity="0.3" />
                      )}

                      {/* Building base footprint */}
                      <rect
                        x={bx - 12}
                        y={by - 12}
                        width="24"
                        height="24"
                        rx="4"
                        fill={badgeColor}
                        stroke="#0f172a"
                        strokeWidth="2"
                      />

                      {/* Icon inside footprint */}
                      <circle cx={bx} cy={by} r="4" fill="#ffffff" />

                      {/* Building Tag */}
                      <rect
                        x={bx - 60}
                        y={by - 32}
                        width="120"
                        height="18"
                        rx="4"
                        fill="#020617"
                        stroke={isSelected ? badgeColor : '#334155'}
                        strokeWidth="1"
                        opacity="0.9"
                      />
                      <text
                        x={bx}
                        y={by - 20}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="9"
                        fontWeight="semibold"
                      >
                        {b.name.length > 20 ? b.name.substring(0, 18) + '...' : b.name}
                      </text>

                      {/* Delete button icon for user placed buildings */}
                      {b.isUserPlaced && (
                        <g onClick={(e) => handleRemoveBuilding(b.id, e)}>
                          <circle cx={bx + 14} cy={by - 14} r="7" fill="#ef4444" />
                          <text
                            x={bx + 14}
                            y={by - 11}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="bold"
                          >
                            ×
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Mode Indicator Overlay */}
            <div className="absolute top-3 left-3 bg-slate-950/85 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 backdrop-blur-xs flex flex-col gap-1 pointer-events-none">
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                {mapMode === 'macro' ? selectedRegion.name : selectedSector.name}
              </span>
              <span className="text-slate-400 text-[10px]">
                {mapMode === 'macro'
                  ? 'Haga clic en cualquier ciudad para entrar al nivel micro'
                  : isPlacingMode
                  ? 'Modo Edificación Activo: Haga clic en cualquier parcela'
                  : 'Haga clic en una edificación para auditar su vulnerabilidad'}
              </span>
            </div>

            {/* Quick Status Pill */}
            <div className="absolute bottom-3 right-3 bg-slate-950/90 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 backdrop-blur-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Edificaciones en Mapa:{' '}
                <strong className="text-sky-400 font-mono">
                  {buildingsWithCalculatedDamage.length}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Building Inspector & Planning Suggestions (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Inspected Building Card */}
          {selectedBuildingForAudit ? (
            <div className="p-4 bg-slate-950 rounded-xl border border-sky-800/60 flex flex-col gap-3 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                    {selectedBuildingForAudit.isUserPlaced ? 'Proyección Nueva' : 'Urbanismo Detectado'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                    {selectedBuildingForAudit.name}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedBuildingForAudit(null)}
                  className="text-slate-500 hover:text-slate-200 text-xs"
                >
                  Cerrar
                </button>
              </div>

              {/* Geographic Parameters Detected */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[11px] block">Elevación:</span>
                  <strong className="text-slate-200 font-mono">{selectedBuildingForAudit.elevationM} m</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Pendiente Talud:</span>
                  <strong className="text-amber-400 font-mono">{selectedBuildingForAudit.slopeDeg}°</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Perfil Suelo:</span>
                  <strong className="text-emerald-400 font-mono">{selectedBuildingForAudit.soilType}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Dist. Falla:</span>
                  <strong className="text-red-400 font-mono">{selectedBuildingForAudit.distanceToFaultKm} km</strong>
                </div>
              </div>

              {/* Dynamic Damage Status Readout */}
              {selectedBuildingForAudit.damageState && (
                <div
                  className={`p-3 rounded-lg border flex flex-col gap-1.5 text-xs ${
                    selectedBuildingForAudit.damageState.status === 'Colapso Inminente'
                      ? 'bg-red-950/40 border-red-800 text-red-200'
                      : selectedBuildingForAudit.damageState.status === 'Daño Severo'
                      ? 'bg-orange-950/40 border-orange-800 text-orange-200'
                      : selectedBuildingForAudit.damageState.status === 'Daño Moderado'
                      ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                      : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span>Estado Estructural:</span>
                    <span>{selectedBuildingForAudit.damageState.status}</span>
                  </div>
                  {selectedBuildingForAudit.damageState.performanceLevel && (
                    <div className="flex justify-between text-[11px]">
                      <span>Desempeño FEMA:</span>
                      <span className="font-mono font-bold text-sky-300">
                        {selectedBuildingForAudit.damageState.performanceLevel}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px]">
                    <span>Deriva de Entrepiso:</span>
                    <span className="font-mono font-bold">
                      {selectedBuildingForAudit.damageState.driftPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Índice Park-Ang:</span>
                    <span className="font-mono font-bold">
                      {selectedBuildingForAudit.damageState.parkAngIndex}
                    </span>
                  </div>
                  {selectedBuildingForAudit.damageState.residualCapacityPercent !== undefined && (
                    <div className="flex justify-between text-[11px]">
                      <span>Capacidad Residual:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {selectedBuildingForAudit.damageState.residualCapacityPercent}%
                      </span>
                    </div>
                  )}
                  {selectedBuildingForAudit.damageState.estimatedLossUsd !== undefined && (
                    <div className="flex justify-between text-[11px]">
                      <span>Pérdida Estimada:</span>
                      <span className="font-mono font-bold text-amber-400">
                        ${selectedBuildingForAudit.damageState.estimatedLossUsd.toLocaleString()} USD
                      </span>
                    </div>
                  )}
                  {selectedBuildingForAudit.damageState.estimatedDowntimeDays !== undefined && (
                    <div className="flex justify-between text-[11px]">
                      <span>Downtime Cierre:</span>
                      <span className="font-mono text-slate-300">
                        {selectedBuildingForAudit.damageState.estimatedDowntimeDays} días
                      </span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-300 pt-1 border-t border-slate-800/60">
                    Riesgo Principal: {selectedBuildingForAudit.damageState.primaryRisk}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Seleccione cualquier edificación en el mapa o use <strong>"Emplazar en Mapa"</strong> para probar la construcción de un nuevo edificio sobre este terreno.
              </span>
            </div>
          )}

          {/* Macro & Micro Urban Planning Suggestions Panel */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Sugerencias de Planificación Territorial
              </span>
              {/* Level Filter */}
              <div className="flex items-center gap-1 text-[10px]">
                {(['All', 'Macro', 'Micro'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setActiveSuggestionLevel(lvl)}
                    className={`px-1.5 py-0.5 rounded transition ${
                      activeSuggestionLevel === lvl
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Suggestions */}
            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredSuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col gap-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-[11px]">{sug.title}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        sug.level === 'Macro'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {sug.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{sug.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Área: {sug.affectedArea}</span>
                    <span className="text-amber-400 font-medium">{sug.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GIS Architecture Open Source Guide Modal */}
      <GisArchitectureModal
        isOpen={isGisModalOpen}
        onClose={() => setIsGisModalOpen(false)}
      />
    </div>
  );
};
