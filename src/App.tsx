import React, { useState, useMemo } from 'react';
import {
  Activity,
  MapPin,
  Layers,
  GraduationCap,
  ShieldAlert,
  FileText,
  Github,
  Award,
  Sparkles,
  Zap,
  Info,
  Building,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Menu,
  X,
  Cpu,
  BookOpen,
  FileCode2,
  FolderArchive,
  Terminal,
  Play
} from 'lucide-react';
import {
  BuildingTypology,
  MapBuilding,
  MultiHazardParameters,
  SoilProfile,
  VenezuelaRegion
} from './types';
import { VENEZUELA_REGIONS } from './data/venezuelaRegions';
import { BUILDING_TYPOLOGIES } from './data/buildingTypologies';
import { SOIL_PROFILES } from './data/soilProfiles';
import { StructuralSimulationEngine } from './services/structuralEngine';
import { CanvasSimulator } from './components/CanvasSimulator';
import { MapBiomasVenezuelaViewer } from './components/MapBiomasVenezuelaViewer';
import { DisasterScenarioBuilder } from './components/DisasterScenarioBuilder';
import { CivilEngineeringLab } from './components/CivilEngineeringLab';
import { EmergencyLogisticsPanel } from './components/EmergencyLogisticsPanel';
import { TechnicalReportModal } from './components/TechnicalReportModal';
import { MitLicenseModal } from './components/MitLicenseModal';
import { InteractiveTerritorialMap } from './components/InteractiveTerritorialMap';
import { SoftwareArchitecturePanel } from './components/SoftwareArchitecturePanel';
import { TechnicalMemoryModal } from './components/TechnicalMemoryModal';
import { GisArchitectureModal } from './components/GisArchitectureModal';
import { ApiSwaggerExplorer } from './components/ApiSwaggerExplorer';
import { StudyManagerModal } from './components/StudyManagerModal';
import { QuickStartLocalGuideModal } from './components/QuickStartLocalGuideModal';
import { SiurprovStudyPackage } from './services/studyStorage';

const ShakeTableBench = React.lazy(() => import('./components/ShakeTableBench'));

type ActiveView = 'maps' | 'simulator' | 'bench' | 'mapbiomas' | 'school' | 'emergency' | 'architecture' | 'swagger';

export default function App() {
  // Navigation View (Defaulting to the powerful Interactive Maps system)
  const [activeView, setActiveView] = useState<ActiveView>('maps');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simulation State
  const [selectedRegion, setSelectedRegion] = useState<VenezuelaRegion>(VENEZUELA_REGIONS[0]); // Gran Caracas & La Guaira
  const [selectedTypology, setSelectedTypology] = useState<BuildingTypology>(BUILDING_TYPOLOGIES[0]); // Autoconstrucción ladera
  const [selectedSoilProfile, setSelectedSoilProfile] = useState<SoilProfile>(
    SOIL_PROFILES[VENEZUELA_REGIONS[0].defaultSoilProfile]
  );
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [userPlacedBuildings, setUserPlacedBuildings] = useState<MapBuilding[]>(() => {
    try {
      const saved = localStorage.getItem('siurprov_user_buildings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleUserBuildingsChange = (buildings: MapBuilding[]) => {
    setUserPlacedBuildings(buildings);
    try {
      localStorage.setItem('siurprov_user_buildings', JSON.stringify(buildings));
    } catch {
      // ignore
    }
  };

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isGisArchitectureOpen, setIsGisArchitectureOpen] = useState(false);
  const [isStudyManagerOpen, setIsStudyManagerOpen] = useState(false);
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);

  // Multi-Hazard Scenario Parameters
  const [scenario, setScenario] = useState<MultiHazardParameters>({
    earthquake: {
      enabled: true,
      pgaG: 0.35,
      magnitudeMw: 6.8,
      depthKm: 15,
      durationSeconds: 35,
      distanceToFaultKm: 8
    },
    debrisFlow: {
      enabled: true,
      rainfallAccumulation24hMm: 180,
      soilSaturationPercent: 85,
      debrisVelocityMs: 7.5,
      debrisDepthM: 1.8,
      densityKgM3: 1950,
      boulderImpactSizeM: 1.2
    },
    flood: {
      enabled: false,
      waterLevelM: 1.2,
      flowVelocityMs: 2.0,
      durationHours: 6,
      soilSaturationIncrease: 35
    },
    wind: {
      enabled: false,
      speedKmh: 95,
      gustFactor: 1.25
    },
    slope: {
      enabled: true,
      angleDeg: 35,
      cohesionKpa: 18,
      internalFrictionAngleDeg: 26
    }
  });

  // Calculate simulation result dynamically
  const simulationResult = useMemo(() => {
    return StructuralSimulationEngine.runSimulation(
      selectedRegion,
      selectedTypology,
      selectedSoilProfile,
      scenario,
      selectedYear
    );
  }, [selectedRegion, selectedTypology, selectedSoilProfile, scenario, selectedYear]);

  // Carga e hidratación completa de un estudio .siurprov importado o de ejemplo
  const handleLoadStudy = (pkg: SiurprovStudyPackage) => {
    const data = pkg.studyData;
    const reg = VENEZUELA_REGIONS.find((r) => r.id === data.regionId) || VENEZUELA_REGIONS[0];
    const typ = BUILDING_TYPOLOGIES.find((t) => t.id === data.typologyId) || BUILDING_TYPOLOGIES[0];
    const soil = SOIL_PROFILES[data.soilProfileType] || SOIL_PROFILES.S3;

    setSelectedRegion(reg);
    setSelectedTypology(typ);
    setSelectedSoilProfile(soil);
    setSelectedYear(data.selectedYear || 2023);
    setScenario(data.scenario);
    if (data.userPlacedBuildings && Array.isArray(data.userPlacedBuildings)) {
      handleUserBuildingsChange(data.userPlacedBuildings);
    }
    setActiveView('maps');
  };

  // Load preset disasters
  const handleLoadPreset = (presetKey: string) => {
    if (presetKey === 'vargas-1999') {
      const reg = VENEZUELA_REGIONS.find((r) => r.id === 'caracas-vargas')!;
      const typ = BUILDING_TYPOLOGIES.find((t) => t.id === 'autoconstruccion-ladera')!;
      setSelectedRegion(reg);
      setSelectedTypology(typ);
      setSelectedSoilProfile(SOIL_PROFILES.S3);
      setSelectedYear(1995);
      setScenario({
        earthquake: { enabled: false, pgaG: 0.05, magnitudeMw: 4.5, depthKm: 20, durationSeconds: 15, distanceToFaultKm: 30 },
        debrisFlow: {
          enabled: true,
          rainfallAccumulation24hMm: 350,
          soilSaturationPercent: 98,
          debrisVelocityMs: 11.0,
          debrisDepthM: 2.8,
          densityKgM3: 2100,
          boulderImpactSizeM: 2.0
        },
        flood: { enabled: true, waterLevelM: 2.0, flowVelocityMs: 3.5, durationHours: 72, soilSaturationIncrease: 50 },
        wind: { enabled: false, speedKmh: 60, gustFactor: 1.1 },
        slope: { enabled: true, angleDeg: 38, cohesionKpa: 12, internalFrictionAngleDeg: 22 }
      });
    } else if (presetKey === 'cariaco-1997') {
      const reg = VENEZUELA_REGIONS.find((r) => r.id === 'sucre-cariaco')!;
      const typ = BUILDING_TYPOLOGIES.find((t) => t.id === 'porticos-pre1982-nd1')!;
      setSelectedRegion(reg);
      setSelectedTypology(typ);
      setSelectedSoilProfile(SOIL_PROFILES.S4);
      setSelectedYear(1995);
      setScenario({
        earthquake: { enabled: true, pgaG: 0.52, magnitudeMw: 6.9, depthKm: 9.4, durationSeconds: 40, distanceToFaultKm: 2 },
        debrisFlow: { enabled: false, rainfallAccumulation24hMm: 20, soilSaturationPercent: 30, debrisVelocityMs: 2, debrisDepthM: 0, densityKgM3: 1800, boulderImpactSizeM: 0.2 },
        flood: { enabled: false, waterLevelM: 0, flowVelocityMs: 0, durationHours: 0, soilSaturationIncrease: 0 },
        wind: { enabled: false, speedKmh: 30, gustFactor: 1.0 },
        slope: { enabled: false, angleDeg: 12, cohesionKpa: 25, internalFrictionAngleDeg: 30 }
      });
    } else if (presetKey === 'tejerias-2022') {
      const reg = VENEZUELA_REGIONS.find((r) => r.id === 'las-tejerias-aragua')!;
      const typ = BUILDING_TYPOLOGIES.find((t) => t.id === 'autoconstruccion-ladera')!;
      setSelectedRegion(reg);
      setSelectedTypology(typ);
      setSelectedSoilProfile(SOIL_PROFILES.S3);
      setSelectedYear(2023);
      setScenario({
        earthquake: { enabled: false, pgaG: 0.05, magnitudeMw: 4.0, depthKm: 15, durationSeconds: 10, distanceToFaultKm: 25 },
        debrisFlow: {
          enabled: true,
          rainfallAccumulation24hMm: 240,
          soilSaturationPercent: 95,
          debrisVelocityMs: 9.5,
          debrisDepthM: 2.2,
          densityKgM3: 2000,
          boulderImpactSizeM: 1.8
        },
        flood: { enabled: true, waterLevelM: 1.5, flowVelocityMs: 2.8, durationHours: 12, soilSaturationIncrease: 40 },
        wind: { enabled: false, speedKmh: 45, gustFactor: 1.1 },
        slope: { enabled: true, angleDeg: 36, cohesionKpa: 15, internalFrictionAngleDeg: 24 }
      });
    } else if (presetKey === 'caracas-megasismo') {
      const reg = VENEZUELA_REGIONS.find((r) => r.id === 'caracas-vargas')!;
      const typ = BUILDING_TYPOLOGIES.find((t) => t.id === 'porticos-pre1982-nd1')!;
      setSelectedRegion(reg);
      setSelectedTypology(typ);
      setSelectedSoilProfile(SOIL_PROFILES.S3);
      setSelectedYear(2023);
      setScenario({
        earthquake: { enabled: true, pgaG: 0.45, magnitudeMw: 7.2, depthKm: 12, durationSeconds: 55, distanceToFaultKm: 6 },
        debrisFlow: { enabled: false, rainfallAccumulation24hMm: 40, soilSaturationPercent: 40, debrisVelocityMs: 3, debrisDepthM: 0, densityKgM3: 1800, boulderImpactSizeM: 0.3 },
        flood: { enabled: false, waterLevelM: 0, flowVelocityMs: 0, durationHours: 0, soilSaturationIncrease: 0 },
        wind: { enabled: false, speedKmh: 30, gustFactor: 1.0 },
        slope: { enabled: true, angleDeg: 32, cohesionKpa: 22, internalFrictionAngleDeg: 28 }
      });
    } else if (presetKey === 'zulia-subsidencia') {
      const reg = VENEZUELA_REGIONS.find((r) => r.id === 'zulia-maracaibo')!;
      const typ = BUILDING_TYPOLOGIES.find((t) => t.id === 'mamposteria-confinada')!;
      setSelectedRegion(reg);
      setSelectedTypology(typ);
      setSelectedSoilProfile(SOIL_PROFILES.S4);
      setSelectedYear(2023);
      setScenario({
        earthquake: { enabled: true, pgaG: 0.22, magnitudeMw: 6.2, depthKm: 18, durationSeconds: 28, distanceToFaultKm: 14 },
        debrisFlow: { enabled: false, rainfallAccumulation24hMm: 15, soilSaturationPercent: 85, debrisVelocityMs: 1, debrisDepthM: 0, densityKgM3: 1700, boulderImpactSizeM: 0.1 },
        flood: { enabled: true, waterLevelM: 1.8, flowVelocityMs: 1.2, durationHours: 48, soilSaturationIncrease: 55 },
        wind: { enabled: false, speedKmh: 50, gustFactor: 1.2 },
        slope: { enabled: false, angleDeg: 4, cohesionKpa: 10, internalFrictionAngleDeg: 18 }
      });
    }
  };

  const handleInspectMapBuilding = (b: MapBuilding) => {
    const foundTyp = BUILDING_TYPOLOGIES.find((t) => t.id === b.typeId);
    if (foundTyp) setSelectedTypology(foundTyp);
    if (b.soilType) setSelectedSoilProfile(SOIL_PROFILES[b.soilType]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-linear-to-tr from-sky-600 via-emerald-600 to-amber-500 flex items-center justify-center p-0.5 shadow-lg shadow-sky-950 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-sky-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>SIURPROV</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800">
                  v1.2 MIT
                </span>
              </h1>
              <span className="text-slate-600 hidden md:inline">|</span>
              <span className="text-xs text-slate-300 font-medium hidden md:inline">
                Simulador Urbano de Proyección para Venezuela
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              Ing. Frank Sousa (UNERG 2025) • San Juan de los Morros, Guárico • Plataforma Geoespacial e Ingeniería Civil
            </p>
          </div>
        </div>

        {/* Action Tools & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {/* Quick Start Local Guide Button */}
          <button
            onClick={() => setIsQuickStartOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
            title="Guía de Instalación Rápida & Pruebas Locales (Paso a paso para personas sin conocimientos informáticos)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Probar en Local</span>
          </button>

          {/* Study Manager Button */}
          <button
            onClick={() => setIsStudyManagerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/90 hover:bg-sky-900 border border-sky-600/70 text-sky-200 text-xs font-bold shadow-md transition cursor-pointer"
            title="Gestor de Estudios Territoriales (.siurprov): Guardar, Cargar y Compartir"
          >
            <FolderArchive className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Estudios (.siurprov)</span>
          </button>

          <button
            onClick={() => setIsMemoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold shadow-md transition cursor-pointer"
            title="Memoria Técnica, Licencias, Ciclo Creativo y Suite de Auditoría"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Memoria Técnica</span>
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">Dictamen</span>
          </button>

          <button
            onClick={() => setIsLicenseOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-800/60 text-xs font-medium transition cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Licencia MIT & MapBiomas</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Navigation Sub-bar (Responsive with horizontal scrolling and mobile drawer) */}
      <div
        className={`${
          isMobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col md:flex-row bg-slate-900/80 border-b border-slate-800 px-3 sm:px-6 lg:px-8 py-2 md:items-center justify-between gap-3 text-xs`}
      >
        {/* Navigation Tabs */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => {
              setActiveView('maps');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeView === 'maps'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Mapas & Detección Urbana</span>
          </button>

          <button
            onClick={() => {
              setActiveView('simulator');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeView === 'simulator'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulador Físico 2D/3D</span>
          </button>

          <button
            onClick={() => {
              setActiveView('bench');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
              activeView === 'bench'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span className="flex items-center gap-1.5">
              <span>Banco de Pruebas 3D</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono font-bold">
                Mesa Sísmica
              </span>
            </span>
          </button>

          <button
            onClick={() => {
              setActiveView('mapbiomas');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeView === 'mapbiomas'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>MapBiomas Venezuela (1985-2050)</span>
          </button>

          <button
            onClick={() => {
              setActiveView('school');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeView === 'school'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Escuela SIURPROV & Código</span>
          </button>

          <button
            onClick={() => {
              setActiveView('emergency');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeView === 'emergency'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Centro de Emergencias COE</span>
          </button>

          <button
            onClick={() => {
              setActiveView('architecture');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
              activeView === 'architecture'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Arquitectura UNERG 2025</span>
          </button>

          <button
            onClick={() => {
              setActiveView('swagger');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
              activeView === 'swagger'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Swagger API & Tests</span>
          </button>
        </div>

        {/* Region & Live Status Badge */}
        <div className="flex items-center gap-2 text-slate-400 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-slate-300 font-semibold truncate">{selectedRegion.name.split('(')[0]}</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-sky-400 text-[11px]">{selectedYear}</span>
          <span className="text-slate-600">|</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded text-[10px] shrink-0 ${
              simulationResult.safeForOccupancy
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-red-950 text-red-400 border border-red-800'
            }`}
          >
            {simulationResult.safeForOccupancy ? 'Habitable' : 'Riesgo Crítico'}
          </span>
        </div>
      </div>

      {/* Main App Content Body */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* VIEW 0: Interactive Territorial Map (Macro/Micro GIS with Building Placement & Simulation) */}
        {activeView === 'maps' && (
          <InteractiveTerritorialMap
            selectedRegion={selectedRegion}
            onSelectRegion={(reg) => {
              setSelectedRegion(reg);
              setSelectedSoilProfile(SOIL_PROFILES[reg.defaultSoilProfile]);
            }}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            scenario={scenario}
            onInspectBuilding={handleInspectMapBuilding}
            externalUserBuildings={userPlacedBuildings}
            onUserBuildingsChange={handleUserBuildingsChange}
            onOpenStudyManager={() => setIsStudyManagerOpen(true)}
          />
        )}

        {/* VIEW 1: Multi-Hazard Physical Simulator (Cross-Section Elevation & Building Stresses) */}
        {activeView === 'simulator' && (
          <div className="flex flex-col gap-6">
            <CanvasSimulator
              region={selectedRegion}
              typology={selectedTypology}
              soilProfile={selectedSoilProfile}
              scenario={scenario}
              simulationResult={simulationResult}
              selectedYear={selectedYear}
            />

            <DisasterScenarioBuilder
              region={selectedRegion}
              typology={selectedTypology}
              onSelectTypology={setSelectedTypology}
              soilProfile={selectedSoilProfile}
              onSelectSoilProfile={setSelectedSoilProfile}
              scenario={scenario}
              onUpdateScenario={setScenario}
              onLoadPreset={handleLoadPreset}
            />
          </div>
        )}

        {/* VIEW 1.5: Interactive 3D Shake Table Bench (Destructive Multi-Hazard Testing) */}
        {activeView === 'bench' && (
          <React.Suspense
            fallback={
              <div className="w-full py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Activity className="w-8 h-8 animate-spin text-sky-400" />
                <span className="text-sm font-medium">Iniciando Banco de Pruebas Destructivo 3D...</span>
              </div>
            }
          >
            <ShakeTableBench />
          </React.Suspense>
        )}

        {/* VIEW 2: MapBiomas Venezuela Geospatial & Land Transition */}
        {activeView === 'mapbiomas' && (
          <div className="flex flex-col gap-6">
            <MapBiomasVenezuelaViewer
              selectedRegion={selectedRegion}
              onSelectRegion={(reg) => {
                setSelectedRegion(reg);
                setSelectedSoilProfile(SOIL_PROFILES[reg.defaultSoilProfile]);
              }}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
            />

            {/* Historical Events Timeline for the selected region */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Registro Histórico de Desastres & Lecciones de Ingeniería en {selectedRegion.name}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRegion.historicalEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400">
                        Año {evt.year} - {evt.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                        {evt.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Impacto:</strong> {evt.impact}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
                      <strong>Lección de Ingeniería Civil:</strong> {evt.engineeringLessons}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Escuela SIURPROV (Civil Engineering & TypeScript Lab) */}
        {activeView === 'school' && (
          <CivilEngineeringLab />
        )}

        {/* VIEW 4: Centro de Operaciones de Emergencia (COE Venezuela) */}
        {activeView === 'emergency' && (
          <EmergencyLogisticsPanel
            region={selectedRegion}
            simulationResult={simulationResult}
          />
        )}

        {/* VIEW 5: Arquitectura de Software & Escalabilidad UNERG 2025 */}
        {activeView === 'architecture' && (
          <SoftwareArchitecturePanel
            region={selectedRegion}
            simulationResult={simulationResult}
            onOpenSwagger={() => setActiveView('swagger')}
            onOpenMemory={() => setIsMemoryOpen(true)}
            onOpenGis={() => setIsGisArchitectureOpen(true)}
            onOpenStudyManager={() => setIsStudyManagerOpen(true)}
          />
        )}

        {/* VIEW 6: Swagger API & OpenAPI 3.0 Interactive Testing */}
        {activeView === 'swagger' && (
          <ApiSwaggerExplorer />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 px-4 lg:px-8 py-5 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-400">SIURPROV</span>
          <span>© 2026 Frank Sousa. Proyecto Libre y Abierto para Venezuela (MIT).</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-emerald-500 font-mono">
            Aporte Científico: MapBiomas Venezuela & RAISG
          </span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <button
            onClick={() => setIsQuickStartOpen(true)}
            className="hover:text-amber-300 text-amber-400 font-semibold underline cursor-pointer"
          >
            🚀 Guía Local Rápida
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setIsStudyManagerOpen(true)}
            className="hover:text-sky-300 text-sky-400 font-semibold underline cursor-pointer"
          >
            📂 Estudios .siurprov
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setIsMemoryOpen(true)}
            className="hover:text-emerald-300 text-slate-400 underline cursor-pointer"
          >
            Memoria Técnica
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setIsGisArchitectureOpen(true)}
            className="hover:text-amber-300 text-slate-400 underline cursor-pointer"
          >
            Ecosistema SIG
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => setIsLicenseOpen(true)}
            className="hover:text-slate-300 underline cursor-pointer"
          >
            Licencia MIT & Atribuciones
          </button>
        </div>
      </footer>

      {/* Modals */}
      <TechnicalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        region={selectedRegion}
        typology={selectedTypology}
        soilProfile={selectedSoilProfile}
        scenario={scenario}
        simulationResult={simulationResult}
        selectedYear={selectedYear}
      />

      <MitLicenseModal
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
      />

      <TechnicalMemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
      />

      <GisArchitectureModal
        isOpen={isGisArchitectureOpen}
        onClose={() => setIsGisArchitectureOpen(false)}
      />

      <StudyManagerModal
        isOpen={isStudyManagerOpen}
        onClose={() => setIsStudyManagerOpen(false)}
        currentRegion={selectedRegion}
        currentYear={selectedYear}
        currentTypology={selectedTypology}
        currentSoilProfile={selectedSoilProfile}
        currentScenario={scenario}
        currentUserBuildings={userPlacedBuildings}
        currentSimulationResult={simulationResult}
        onLoadStudy={handleLoadStudy}
      />

      <QuickStartLocalGuideModal
        isOpen={isQuickStartOpen}
        onClose={() => setIsQuickStartOpen(false)}
      />
    </div>
  );
}
