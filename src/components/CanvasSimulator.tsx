import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  Layers,
  ShieldAlert,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Info,
  DollarSign,
  Clock,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import {
  BuildingTypology,
  MultiHazardParameters,
  SimulationResult,
  SoilProfile,
  VenezuelaRegion
} from '../types';

const Structure3DView = lazy(() => import('./Structure3DView'));

interface CanvasSimulatorProps {
  region: VenezuelaRegion;
  typology: BuildingTypology;
  soilProfile: SoilProfile;
  scenario: MultiHazardParameters;
  simulationResult: SimulationResult;
  selectedYear: number;
}

export const CanvasSimulator: React.FC<CanvasSimulatorProps> = ({
  region,
  typology,
  soilProfile,
  scenario,
  simulationResult,
  selectedYear
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1.0);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<string | null>(null);
  const [showStressMesh, setShowStressMesh] = useState(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [resetKey, setResetKey] = useState(0);

  // Animation frame state refs
  const timeRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const debrisParticlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string }>>([]);

  // Initialize debris particles when debris flow is active
  useEffect(() => {
    if (scenario.debrisFlow.enabled) {
      const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string }> = [];
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * 200 - 250,
          y: 280 + Math.random() * 80,
          vx: 3 + Math.random() * (scenario.debrisFlow.debrisVelocityMs * 0.8),
          vy: 0.5 + Math.random() * 1.5,
          radius: 3 + Math.random() * (scenario.debrisFlow.boulderImpactSizeM * 8),
          color: Math.random() > 0.4 ? '#78350f' : '#451a03'
        });
      }
      debrisParticlesRef.current = particles;
    } else {
      debrisParticlesRef.current = [];
    }
  }, [scenario.debrisFlow]);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewMode !== '2d') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localTime = 0;

    const render = () => {
      if (isPlaying) {
        localTime += 0.025 * simulationSpeed;
        timeRef.current = localTime;
      }
      const t = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Sky & Atmosphere
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (scenario.debrisFlow.enabled || scenario.flood.enabled) {
        // Stormy overcast sky
        skyGrad.addColorStop(0, '#1e293b');
        skyGrad.addColorStop(0.5, '#334155');
        skyGrad.addColorStop(1, '#0f172a');
      } else {
        skyGrad.addColorStop(0, '#090d16');
        skyGrad.addColorStop(0.6, '#111827');
        skyGrad.addColorStop(1, '#030712');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Rain effect if storm active
      if (scenario.debrisFlow.enabled || scenario.flood.enabled) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 35; i++) {
          const rx = (i * 27 + t * 450) % width;
          const ry = (i * 33 + t * 650) % (height * 0.7);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 8, ry + 22);
          ctx.stroke();
        }
      }

      // Ground vibration calculation (seismic oscillation)
      let groundDeltaX = 0;
      let groundDeltaY = 0;
      if (scenario.earthquake.enabled) {
        const pga = scenario.earthquake.pgaG;
        // Ground motion harmonic superposition + noise
        groundDeltaX =
          Math.sin(t * 12) * (pga * 16) +
          Math.sin(t * 22) * (pga * 8) +
          Math.cos(t * 6.5) * (pga * 12);
        groundDeltaY = Math.sin(t * 16) * (pga * 4);
      }

      // 2. Mountain slope in background
      const mountainGrad = ctx.createLinearGradient(0, 50, 0, 360);
      mountainGrad.addColorStop(0, '#1e293b');
      mountainGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = mountainGrad;
      ctx.beginPath();
      ctx.moveTo(0, 160);
      ctx.lineTo(260, 240);
      ctx.lineTo( width, 290);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // 3. Soil Strata (COVENIN S1 - S4)
      const groundY = 320 + groundDeltaY;
      ctx.save();
      ctx.translate(groundDeltaX, 0);

      // Strata 1: Superficial alluvium / topsoil
      ctx.fillStyle =
        soilProfile.type === 'S4'
          ? '#292524'
          : soilProfile.type === 'S3'
          ? '#451a03'
          : soilProfile.type === 'S2'
          ? '#57534e'
          : '#334155';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      // Slope variation
      ctx.lineTo(width, groundY + (scenario.slope.enabled ? 30 : 0));
      ctx.lineTo(width, groundY + 90);
      ctx.lineTo(0, groundY + 90);
      ctx.closePath();
      ctx.fill();

      // Strata 2: Dense transition layer
      ctx.fillStyle = soilProfile.type === 'S1' ? '#475569' : '#292524';
      ctx.fillRect(0, groundY + 90, width, 80);

      // Strata 3: Bedrock (Basamento rocoso)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, groundY + 170, width, height - (groundY + 170));

      // Geological fault line indicator
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(180 + groundDeltaX * 0.5, groundY + 50);
      ctx.lineTo(240, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Water table line (Nivel Freático)
      const waterY = groundY + soilProfile.waterTableDepthM * 10;
      if (waterY < height) {
        ctx.strokeStyle = '#38bdf8';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, waterY);
        ctx.lineTo(width, waterY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText(`Nivel Freático (${soilProfile.waterTableDepthM}m)`, 20, waterY - 5);
      }

      // Soil liquefaction visual effect
      if (simulationResult.liquefactionOccurred) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          const sandBoilX = 140 + i * 65 + Math.sin(t * 8 + i) * 6;
          ctx.arc(sandBoilX, groundY + 4, 8 + Math.sin(t * 10 + i) * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // 4. Building Structure Simulation
      // Center building horizontally
      const bWidth = 240;
      const bLeft = (width - bWidth) / 2 + groundDeltaX;
      const stories = typology.stories;
      const storyH = Math.min(38, 220 / stories);
      const bHeight = stories * storyH;

      // Dynamic building lateral sway (deriva de entrepiso y modos de vibración)
      // T1 resonance factor
      const resonance = scenario.earthquake.enabled
        ? Math.sin(t * (2 * Math.PI / Math.max(0.2, simulationResult.fundamentalPeriodT1)))
        : 0;
      const topDriftPx =
        (simulationResult.maxStoryDriftPercent * 10) * resonance +
        (scenario.wind.enabled ? (scenario.wind.speedKmh / 20) : 0);

      // Foundation rendering
      ctx.save();
      ctx.translate(groundDeltaX, 0);

      if (typology.foundationType.includes('Pilotes')) {
        // Deep piles into bedrock
        ctx.fillStyle = '#64748b';
        ctx.fillRect(bLeft + 20 - groundDeltaX, groundY, 18, 140);
        ctx.fillRect(bLeft + bWidth / 2 - 9 - groundDeltaX, groundY, 18, 140);
        ctx.fillRect(bLeft + bWidth - 38 - groundDeltaX, groundY, 18, 140);
      }

      // Foundation Slab / Footings
      ctx.fillStyle = typology.foundationType.includes('Cimiento Superficial') ? '#78350f' : '#475569';
      ctx.fillRect(bLeft - 15 - groundDeltaX, groundY - 12, bWidth + 30, 16);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bLeft - 15 - groundDeltaX, groundY - 12, bWidth + 30, 16);

      ctx.restore();

      // Story-by-story deformation calculation
      const storyPoints: Array<{ leftX: number; rightX: number; y: number; drift: number }> = [];

      for (let s = 0; s <= stories; s++) {
        const floorFrac = s / stories;
        // Inelastic first-story concentration if soft story exists
        let modalFactor = Math.pow(floorFrac, 1.4);
        if (typology.softStoryVulnerability && s >= 1) {
          modalFactor += 0.35; // Soft-story amplified kink at bottom
        }

        const sway = topDriftPx * modalFactor;
        const fy = groundY - 12 - s * storyH;
        storyPoints.push({
          leftX: bLeft + sway,
          rightX: bLeft + bWidth + sway,
          y: fy,
          drift: modalFactor * simulationResult.maxStoryDriftPercent
        });
      }

      // Draw Beams and Floor Slabs
      for (let s = 1; s <= stories; s++) {
        const p = storyPoints[s];
        const prevP = storyPoints[s - 1];

        // Floor slab
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(p.leftX - 8, p.y);
        ctx.lineTo(p.rightX + 8, p.y);
        ctx.lineTo(p.rightX + 8, p.y + 6);
        ctx.lineTo(p.leftX - 8, p.y + 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Columns
        const columnsCount = typology.baysCount + 1;
        for (let c = 0; c < columnsCount; c++) {
          const colFrac = c / (columnsCount - 1);
          const topColX = p.leftX + (p.rightX - p.leftX) * colFrac;
          const botColX = prevP.leftX + (prevP.rightX - prevP.leftX) * colFrac;

          // Stress color based on Park-Ang and story height
          let stressColor = '#3b82f6'; // Safe blue
          if (simulationResult.parkAngDamageIndex >= 0.8) {
            stressColor = '#ef4444'; // Crushing / Failure red
          } else if (simulationResult.parkAngDamageIndex >= 0.45) {
            stressColor = '#f97316'; // Yielding orange
          } else if (simulationResult.parkAngDamageIndex >= 0.2) {
            stressColor = '#eab308'; // Microcracking yellow
          }

          // If soft story, emphasize bottom columns in red/orange
          if (typology.softStoryVulnerability && s === 1 && simulationResult.parkAngDamageIndex > 0.3) {
            stressColor = '#ef4444';
          }

          ctx.strokeStyle = showStressMesh ? stressColor : '#94a3b8';
          ctx.lineWidth = typology.structuralSystem.includes('Autoconstrucción') ? 3 : 5;
          ctx.beginPath();
          ctx.moveTo(botColX, prevP.y);
          ctx.lineTo(topColX, p.y);
          ctx.stroke();

          // Plastic Hinge indicator (Rótula Plástica en extremos de columna)
          if (simulationResult.parkAngDamageIndex >= 0.45 && (s === 1 || s === stories)) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(botColX, prevP.y - 4, 3.5, 0, Math.PI * 2);
            ctx.arc(topColX, p.y + 4, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Masonry infill walls (Tabiquería)
          if (c < columnsCount - 1) {
            const nextTopColX = p.leftX + (p.rightX - p.leftX) * ((c + 1) / (columnsCount - 1));
            const nextBotColX = prevP.leftX + (prevP.rightX - prevP.leftX) * ((c + 1) / (columnsCount - 1));

            // Don't draw walls on soft story ground floor if commercial/garage
            if (!(typology.softStoryVulnerability && s === 1)) {
              ctx.fillStyle = typology.structuralSystem.includes('Autoconstrucción')
                ? 'rgba(180, 83, 9, 0.4)'
                : 'rgba(71, 85, 105, 0.35)';
              ctx.beginPath();
              ctx.moveTo(botColX + 3, prevP.y);
              ctx.lineTo(nextBotColX - 3, prevP.y);
              ctx.lineTo(nextTopColX - 3, p.y + 6);
              ctx.lineTo(topColX + 3, p.y + 6);
              ctx.closePath();
              ctx.fill();

              // Diagonal shear cracks (Grietas en X por cortante sísmico)
              if (simulationResult.maxStoryDriftPercent > 1.0) {
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(botColX + 10, prevP.y - 4);
                ctx.lineTo(nextTopColX - 10, p.y + 8);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(nextBotColX - 10, prevP.y - 4);
                ctx.lineTo(topColX + 10, p.y + 8);
                ctx.stroke();
              }
            }
          }
        }
      }

      // 5. Debris Flow Simulation (Aluvión de barro y peñones)
      if (scenario.debrisFlow.enabled && debrisParticlesRef.current.length > 0) {
        ctx.save();
        const flowH = Math.min(100, scenario.debrisFlow.debrisDepthM * 25);
        const flowTopY = groundY - flowH;

        // Mud slurry layer
        const mudGrad = ctx.createLinearGradient(0, flowTopY, 0, groundY + 20);
        mudGrad.addColorStop(0, 'rgba(120, 53, 15, 0.85)');
        mudGrad.addColorStop(1, 'rgba(69, 26, 3, 0.95)');
        ctx.fillStyle = mudGrad;

        ctx.beginPath();
        ctx.moveTo(0, flowTopY + Math.sin(t * 10) * 4);
        for (let x = 0; x <= width; x += 30) {
          const wave = Math.sin(x * 0.04 + t * 8) * 5;
          ctx.lineTo(x, flowTopY + wave);
        }
        ctx.lineTo(width, groundY + 30);
        ctx.lineTo(0, groundY + 30);
        ctx.closePath();
        ctx.fill();

        // Animate particles (sedimentos y rocas)
        debrisParticlesRef.current.forEach((p) => {
          if (isPlaying) {
            p.x += p.vx * simulationSpeed;
            p.y += p.vy * Math.sin(t * 5) * 0.5;
            if (p.x > width + 40) {
              p.x = -40;
              p.y = flowTopY + Math.random() * flowH;
            }
          }

          // Boulder drawing
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#1c1917';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Splash impact on building base
        ctx.fillStyle = 'rgba(217, 119, 6, 0.7)';
        for (let k = 0; k < 6; k++) {
          const splashX = bLeft - 5 + Math.sin(t * 12 + k) * 10;
          const splashY = flowTopY - 10 + Math.cos(t * 15 + k) * 12;
          ctx.beginPath();
          ctx.arc(splashX, splashY, 4 + k, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 6. Flood Water Layer
      if (scenario.flood.enabled && scenario.flood.waterLevelM > 0) {
        const waterPx = Math.min(120, scenario.flood.waterLevelM * 30);
        const floodSurfaceY = groundY - waterPx;
        ctx.fillStyle = 'rgba(14, 116, 144, 0.55)';
        ctx.beginPath();
        ctx.moveTo(0, floodSurfaceY + Math.sin(t * 6) * 3);
        for (let x = 0; x <= width; x += 40) {
          ctx.lineTo(x, floodSurfaceY + Math.sin(x * 0.05 + t * 6) * 3);
        }
        ctx.lineTo(width, groundY + 20);
        ctx.lineTo(0, groundY + 20);
        ctx.closePath();
        ctx.fill();
      }

      // 7. Wind Gust Vectors
      if (scenario.wind.enabled) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const wy = 80 + i * 45;
          const wx = ((t * 220 + i * 90) % (width + 100)) - 50;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.lineTo(wx + 45, wy);
          ctx.lineTo(wx + 38, wy - 4);
          ctx.stroke();
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    isPlaying,
    simulationSpeed,
    showStressMesh,
    scenario,
    typology,
    soilProfile,
    simulationResult,
    viewMode
  ]);

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Simulation Header & Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-100 tracking-wide uppercase">
            Simulador Físico en Tiempo Real
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            {region.name} ({region.state})
          </span>
          <span className="text-slate-500">|</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono">
            {selectedYear}
          </span>
        </div>

        {/* Real-time KPI tags */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Período T₁:</span>
            <strong className="text-slate-100 font-mono">
              {simulationResult.fundamentalPeriodT1}s
            </strong>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800">
            <span>Cortante V₀:</span>
            <strong className="text-amber-400 font-mono">
              {simulationResult.designBaseShearKn} kN
            </strong>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800">
            <span>Deriva Δ/H:</span>
            <strong
              className={`font-mono ${
                simulationResult.exceedsDriftLimit ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {simulationResult.maxStoryDriftPercent}%
            </strong>
          </div>

          <div
            className={`px-2 py-1 rounded font-semibold border ${
              simulationResult.parkAngDamageIndex >= 0.8
                ? 'bg-red-950/80 border-red-700 text-red-300'
                : simulationResult.parkAngDamageIndex >= 0.45
                ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                : 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
            }`}
          >
            {simulationResult.ems98Grade.split(':')[0]} (DI: {simulationResult.parkAngDamageIndex})
          </div>
        </div>
      </div>

      {/* Main Canvas Canvas */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        <div className={`absolute inset-0 ${viewMode === '3d' ? '' : 'invisible pointer-events-none'}`}>
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center text-sky-300 text-xs font-mono">
                Cargando motor 3D...
              </div>
            }
          >
            <Structure3DView
              typology={typology}
              soilProfile={soilProfile}
              scenario={scenario}
              simulationResult={simulationResult}
              isPlaying={isPlaying && viewMode === '3d'}
              simulationSpeed={simulationSpeed}
              showStressMesh={showStressMesh}
              resetKey={resetKey}
              onSelect={setSelectedNodeInfo}
            />
          </Suspense>
        </div>
        <canvas
          ref={canvasRef}
          width={840}
          height={480}
          className={`w-full h-full object-contain cursor-crosshair ${viewMode === '2d' ? '' : 'invisible'}`}
          onClick={() => {
            setSelectedNodeInfo(
              `Nodo Estructural Planta Baja: Cortante local V = ${(
                simulationResult.designBaseShearKn * 0.4
              ).toFixed(1)} kN | Momento flector M = ${(
                simulationResult.designBaseShearKn * 0.4 * 2.8
              ).toFixed(1)} kN·m`
            );
          }}
        />

        {/* View mode switch */}
        <div className="absolute bottom-3 right-3 z-10 flex rounded-lg overflow-hidden border border-slate-700 bg-slate-950/90 text-[11px] font-mono">
          {(['3d', '2d'] as const).map((m) => (
            <button
              key={m}
              id={`view-mode-${m}`}
              onClick={() => setViewMode(m)}
              className={`px-3 py-1 transition ${
                viewMode === m ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        {viewMode === '3d' && (
          <>
            <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 bg-slate-950/70 px-2 py-1 rounded pointer-events-none">
              Arrastrar: orbitar · Rueda: zoom · Clic en columnas: auditar
            </div>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/85 border border-sky-700 text-sky-200 text-[10px] font-mono whitespace-nowrap pointer-events-none">
              {typology.stories} niv. · H = {(typology.stories * Math.max(2.4, typology.storyHeightM || 3)).toFixed(1)} m · T1 = {simulationResult.fundamentalPeriodT1}s
            </div>
          </>
        )}

        {/* Dynamic Hazard Status Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {scenario.earthquake.enabled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/85 border border-red-800 text-red-200 text-xs backdrop-blur-xs">
              <Activity className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>
                Sismo Activo: {scenario.earthquake.pgaG}g (Mw {scenario.earthquake.magnitudeMw})
              </span>
            </div>
          )}

          {scenario.debrisFlow.enabled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/85 border border-amber-800 text-amber-200 text-xs backdrop-blur-xs">
              <Mountain className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Aluvión: Ola {scenario.debrisFlow.debrisDepthM}m ({scenario.debrisFlow.debrisVelocityMs} m/s) | Empuje: {simulationResult.debrisImpactForceKn} kN
              </span>
            </div>
          )}

          {scenario.flood.enabled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/85 border border-cyan-800 text-cyan-200 text-xs backdrop-blur-xs">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inundación: +{scenario.flood.waterLevelM}m sobre rasante</span>
            </div>
          )}

          {scenario.wind.enabled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-950/85 border border-sky-800 text-sky-200 text-xs backdrop-blur-xs">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              <span>Viento: {scenario.wind.speedKmh} km/h (Presión {simulationResult.windPressureKpa} kPa)</span>
            </div>
          )}
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 bg-slate-950/85 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 backdrop-blur-xs pointer-events-none">
          <span className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1">
            Gradiente de Esfuerzos
          </span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 rounded-xs bg-blue-500" />
            <span>Elástico Admisible</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 rounded-xs bg-amber-400" />
            <span>Fluencia / Microfisuras</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 rounded-xs bg-orange-500" />
            <span>Rótula Plástica Formada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 rounded-xs bg-red-500" />
            <span>Aplastamiento / Falla</span>
          </div>
        </div>

        {/* Selected Node Inspector Toast */}
        {selectedNodeInfo && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 border border-sky-700/60 p-2.5 rounded-lg flex items-center justify-between text-xs text-sky-200 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{selectedNodeInfo}</span>
            </div>
            <button
              onClick={() => setSelectedNodeInfo(null)}
              className="text-slate-400 hover:text-slate-100 text-xs px-2 py-0.5 rounded bg-slate-800"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* Control Playback Footer */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-950 border-t border-slate-800 text-xs gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
          </button>

          <button
            onClick={() => {
              timeRef.current = 0;
              setResetKey((k) => k + 1);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Ciclo</span>
          </button>

          <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-800 text-slate-400">
            <span>Velocidad:</span>
            {[0.5, 1.0, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  simulationSpeed === speed
                    ? 'bg-sky-500/20 text-sky-400 font-bold border border-sky-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showStressMesh}
              onChange={(e) => setShowStressMesh(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-sky-500"
            />
            <span>Malla de Esfuerzos Von Mises</span>
          </label>

          <div className="text-slate-500 text-[11px]">
            Haga clic en la estructura para auditar nodos
          </div>
        </div>
      </div>

      {/* Advanced Engineering Evaluations Dashboard */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 flex flex-col gap-4 text-xs text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <span>Evaluación Estructural, Geotécnica y de Resiliencia en Funcionamiento</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800">
                  COVENIN 1756 & FEMA 356
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Auditoría multi-criterio de estabilidad elasto-plástica, efectos P-Delta, pérdidas económicas y desempeño post-desastre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-slate-400">Desempeño Sísmico:</span>
            <span
              className={`px-2.5 py-1 rounded-md font-bold border ${
                simulationResult.performanceLevel === 'Operacional (O)'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : simulationResult.performanceLevel === 'Ocupación Inmediata (IO)'
                  ? 'bg-sky-950 text-sky-300 border-sky-700'
                  : simulationResult.performanceLevel === 'Seguridad de Vida (LS)'
                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                  : simulationResult.performanceLevel === 'Prevención de Colapso (CP)'
                  ? 'bg-orange-950 text-orange-300 border-orange-700'
                  : 'bg-red-950 text-red-300 border-red-700'
              }`}
            >
              {simulationResult.performanceLevel}
            </span>
          </div>
        </div>

        {/* 4 Multi-Disciplinary Evaluation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: FEMA & P-Delta Stability */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              1. P-Delta & Rigidez (Art. 8.4)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-300">Coeficiente θ:</span>
              <strong
                className={`font-mono text-sm ${
                  simulationResult.pDeltaExceeded ? 'text-red-400' : 'text-slate-100'
                }`}
              >
                {simulationResult.pDeltaStabilityCoefficient}
              </strong>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Amplificación 1/(1-θ):</span>
              <span className="font-mono text-sky-300">{simulationResult.pDeltaAmplificationFactor}x</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Ductilidad Requerida:</span>
              <span className="font-mono text-amber-300">μ = {simulationResult.ductilityDemand}</span>
            </div>
            <div className="mt-1 pt-1.5 border-t border-slate-800 text-[10px] font-medium">
              {simulationResult.pDeltaExceeded ? (
                <span className="text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  Estructura inestable por efectos de 2do orden
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  Efectos P-Delta controlados dentro de norma
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Capacidad Residual & Daño */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-purple-400" />
              2. Capacidad Residual Post-Evento
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-300">Capacidad Remanente:</span>
              <strong
                className={`font-mono text-sm ${
                  simulationResult.residualCapacityPercent < 50 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {simulationResult.residualCapacityPercent}%
              </strong>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  simulationResult.residualCapacityPercent < 40
                    ? 'bg-red-500'
                    : simulationResult.residualCapacityPercent < 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${simulationResult.residualCapacityPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Índice Park-Ang (DI):</span>
              <span className="font-mono text-amber-300">{simulationResult.parkAngDamageIndex}</span>
            </div>
            <div className="mt-1 pt-1.5 border-t border-slate-800 text-[10px]">
              <span className="text-slate-300 truncate block">
                {simulationResult.ems98Grade}
              </span>
            </div>
          </div>

          {/* Card 3: Pérdida Económica & Downtime */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              3. Pérdida Económica & Cierre
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-300">Pérdida Estimada:</span>
              <strong className="font-mono text-sm text-amber-400">
                ${simulationResult.estimatedLossUsd.toLocaleString()} USD
              </strong>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Costo Reposición a Nuevo:</span>
              <span className="font-mono text-slate-300">
                ${simulationResult.replacementCostUsd.toLocaleString()} USD
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Downtime Funcional:</span>
              <span className="font-mono text-sky-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {simulationResult.estimatedDowntimeDays} días
              </span>
            </div>
            <div className="mt-1 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
              Clasificación: <span className="text-slate-200">{simulationResult.downtimeClassification}</span>
            </div>
          </div>

          {/* Card 4: Geotecnia, Talud e Hidráulica */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-amber-400" />
              4. Geotecnia, Ladera & Aluvión
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-300">Talud Bishop FS:</span>
              <strong
                className={`font-mono text-sm ${
                  simulationResult.slopeFactorOfSafety < 1.0
                    ? 'text-red-400'
                    : simulationResult.slopeFactorOfSafety < 1.3
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {simulationResult.slopeFactorOfSafety}
              </strong>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Desplazamiento Newmark:</span>
              <span className="font-mono text-slate-200">
                {simulationResult.newmarkDisplacementCm} cm
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Volcamiento Hidrodinámico:</span>
              <span className="font-mono text-cyan-300">
                {simulationResult.overturningMomentKnM} kN·m
              </span>
            </div>
            <div className="mt-1 pt-1.5 border-t border-slate-800 text-[10px]">
              <span className="text-slate-400">Capacidad Portante Cimientos: </span>
              <span className="font-mono text-slate-200">FS = {simulationResult.bearingCapacitySafetyFactor}</span>
            </div>
          </div>
        </div>

        {/* Primary Failure Mechanism and Critical Retrofit Banner */}
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 text-xs">Mecanismo Crítico Predicho:</span>
            <span className="text-xs font-bold text-red-300 font-mono">
              {simulationResult.primaryFailureMechanism}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">Habitabilidad Inmediata:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                simulationResult.safeForOccupancy
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {simulationResult.safeForOccupancy ? 'Habitable sin Peligro Inminente' : 'Inhabitable / Desalojo Requerido'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
