import React, { useState, useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  Activity,
  Shield,
  Zap,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Wind,
  Layers,
  HelpCircle,
  TrendingDown,
  Gauge,
  Flame,
  CheckCircle2,
  Box
} from 'lucide-react';
import {
  ShakeTableEngine,
  ShakeTableParameters,
  ActiveRetrofits,
  BenchTelemetry
} from '../services/shakeTableEngine';

// ==========================================
// 3D Scene Components (React Three Fiber)
// ==========================================

interface Bench3DSceneProps {
  params: ShakeTableParameters;
  retrofits: ActiveRetrofits;
  telemetry: BenchTelemetry;
  isPlaying: boolean;
}

const Bench3DScene: React.FC<Bench3DSceneProps> = ({
  params,
  retrofits,
  telemetry,
  isPlaying
}) => {
  const tableRef = useRef<THREE.Group>(null);
  const buildingRef = useRef<THREE.Group>(null);
  const pistonRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  // Dimensiones del pórtico 3D
  const stories = 3;
  const storyH = 2.4;
  const bayW = 3.2;
  const depthW = 2.6;
  const halfBay = bayW / 2;
  const halfDepth = depthW / 2;

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    const t = timeRef.current;

    // Calcular desplazamiento instantáneo
    const instantTelemetry = ShakeTableEngine.evaluateDynamicResponse(params, retrofits, t);

    // 1. Movimiento horizontal de la mesa sísmica (base)
    const baseOffsetX = instantTelemetry.baseDisplacementM * 8.0; // Escalado visual para apreciación didáctica
    if (tableRef.current) {
      tableRef.current.position.x = baseOffsetX;
    }

    // 2. Cilindro actuador hidráulico (pistón)
    if (pistonRef.current) {
      pistonRef.current.scale.x = Math.max(0.2, 1 + baseOffsetX * 0.4);
    }

    // 3. Movimiento de la superestructura respecto a la mesa
    if (buildingRef.current) {
      // Si tiene aisladores basales, la superestructura sufre un desplazamiento relativo opuesto que la estabiliza
      const buildingSwayX = instantTelemetry.topDisplacementM * 6.0;
      buildingRef.current.position.x = baseOffsetX + (retrofits.baseIsolators ? buildingSwayX * 0.25 : buildingSwayX);

      // Rotación modal por deriva
      const swayTilt = (instantTelemetry.interstoryDriftRatio * 1.5) * (baseOffsetX >= 0 ? -1 : 1);
      buildingRef.current.rotation.z = Math.max(-0.15, Math.min(0.15, swayTilt));

      // Efecto de cabeceo si hay licuefacción
      if (params.liquefactionRatio > 0) {
        buildingRef.current.rotation.z += Math.sin(t * 3) * (params.liquefactionRatio * 0.04);
        buildingRef.current.position.y = -params.liquefactionRatio * 0.25;
      } else {
        buildingRef.current.position.y = 0;
      }
    }
  });

  // Color de fatiga / agrietamiento según daño
  const structureColor = useMemo(() => {
    if (telemetry.performanceLevel === 'COLLAPSE') return '#ef4444'; // Rojo colapso
    if (telemetry.performanceLevel === 'CP') return '#f97316'; // Naranja daño severo
    if (telemetry.performanceLevel === 'LS') return '#eab308'; // Amarillo fluencia
    return '#94a3b8'; // Gris concreto elástico
  }, [telemetry.performanceLevel]);

  return (
    <group position={[0, -1.8, 0]}>
      {/* Luces y Entorno */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[12, 18, 10]} intensity={1.4} castShadow />
      <directionalLight position={[-10, 8, -10]} intensity={0.5} />
      <pointLight position={[0, 6, 4]} intensity={0.6} color="#60a5fa" />
      <Sky sunPosition={[100, 40, 100]} turbidity={2} rayleigh={0.6} />

      {/* Bancada fija de laboratorio (Hormigón de cimentación y rieles) */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[14, 0.6, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Rieles de deslizamiento de la mesa */}
      <mesh position={[0, -0.25, 2.2]}>
        <boxGeometry args={[12, 0.1, 0.3]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.25, -2.2]}>
        <boxGeometry args={[12, 0.1, 0.3]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Actuador hidráulico dinámico (Pistón lateral) */}
      <group position={[-5.8, 0.15, 0]}>
        <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 1.6, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh ref={pistonRef} position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 1.4, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Mesa Sísmica Vibratoria Móvil (Shake Table Plate) */}
      <group ref={tableRef}>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.4, 0.25, 4.8]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>

        {/* Textos y marcas de seguridad en la mesa */}
        <mesh position={[0, 0.18, 2.1]}>
          <boxGeometry args={[5.8, 0.01, 0.2]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.18, -2.1]}>
          <boxGeometry args={[5.8, 0.01, 0.2]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>

        {/* Aisladores elastoméricos en la base (LRB - Lead Rubber Bearings) */}
        {retrofits.baseIsolators && (
          <group position={[0, 0.3, 0]}>
            {[
              [-halfBay, -halfDepth],
              [halfBay, -halfDepth],
              [-halfBay, halfDepth],
              [halfBay, halfDepth]
            ].map(([x, z], i) => (
              <group key={i} position={[x, 0, z]}>
                {/* Cilindro de caucho vulcanizado negro */}
                <mesh position={[0, 0.15, 0]}>
                  <cylinderGeometry args={[0.35, 0.35, 0.32, 24]} />
                  <meshStandardMaterial color="#111827" roughness={0.9} />
                </mesh>
                {/* Núcleo de plomo y bridas de acero */}
                <mesh position={[0, 0.33, 0]}>
                  <cylinderGeometry args={[0.42, 0.42, 0.05, 24]} />
                  <meshStandardMaterial color="#64748b" metalness={0.9} />
                </mesh>
                <mesh position={[0, -0.01, 0]}>
                  <cylinderGeometry args={[0.42, 0.42, 0.05, 24]} />
                  <meshStandardMaterial color="#64748b" metalness={0.9} />
                </mesh>
              </group>
            ))}
          </group>
        )}
      </group>

      {/* Superestructura del Edificio (3 Niveles Pórtico) */}
      <group
        ref={buildingRef}
        position={[0, retrofits.baseIsolators ? 0.55 : 0.2, 0]}
      >
        {/* Losa de cimentación del edificio */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[4.8, 0.2, 3.6]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>

        {/* Columnas y Vigas por Nivel */}
        {Array.from({ length: stories }).map((_, s) => {
          const yBottom = 0.2 + s * storyH;
          const yTop = yBottom + storyH;
          const isTopStory = s === stories - 1;

          return (
            <group key={s}>
              {/* 4 Columnas principales */}
              {[
                [-halfBay, -halfDepth],
                [halfBay, -halfDepth],
                [-halfBay, halfDepth],
                [halfBay, halfDepth]
              ].map(([cx, cz], ci) => (
                <group key={ci} position={[cx, yBottom + storyH / 2, cz]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.3, storyH, 0.3]} />
                    <meshStandardMaterial
                      color={structureColor}
                      roughness={0.6}
                      metalness={0.1}
                    />
                  </mesh>

                  {/* Refuerzo: Encamisado CFRP en rótulas plásticas de columnas */}
                  {retrofits.cfrpWrap && (
                    <>
                      {/* Chaqueta superior */}
                      <mesh position={[0, storyH * 0.38, 0]}>
                        <boxGeometry args={[0.34, 0.45, 0.34]} />
                        <meshStandardMaterial
                          color="#09090b"
                          metalness={0.85}
                          roughness={0.2}
                        />
                      </mesh>
                      {/* Chaqueta inferior */}
                      <mesh position={[0, -storyH * 0.38, 0]}>
                        <boxGeometry args={[0.34, 0.45, 0.34]} />
                        <meshStandardMaterial
                          color="#09090b"
                          metalness={0.85}
                          roughness={0.2}
                        />
                      </mesh>
                    </>
                  )}
                </group>
              ))}

              {/* Losa de entrepiso / techo */}
              <mesh position={[0, yTop, 0]} castShadow>
                <boxGeometry args={[4.6, 0.18, 3.4]} />
                <meshStandardMaterial color="#64748b" roughness={0.7} />
              </mesh>

              {/* Vigas longitudinales y transversales perimetrales */}
              <mesh position={[0, yTop - 0.12, -halfDepth]} castShadow>
                <boxGeometry args={[bayW, 0.24, 0.25]} />
                <meshStandardMaterial color={structureColor} roughness={0.6} />
              </mesh>
              <mesh position={[0, yTop - 0.12, halfDepth]} castShadow>
                <boxGeometry args={[bayW, 0.24, 0.25]} />
                <meshStandardMaterial color={structureColor} roughness={0.6} />
              </mesh>
              <mesh position={[-halfBay, yTop - 0.12, 0]} castShadow>
                <boxGeometry args={[0.25, 0.24, depthW]} />
                <meshStandardMaterial color={structureColor} roughness={0.6} />
              </mesh>
              <mesh position={[halfBay, yTop - 0.12, 0]} castShadow>
                <boxGeometry args={[0.25, 0.24, depthW]} />
                <meshStandardMaterial color={structureColor} roughness={0.6} />
              </mesh>

              {/* Refuerzo: Muros de cortante de concreto armado (Fachada Posterior) */}
              {retrofits.shearWalls && (
                <mesh position={[0, yBottom + storyH / 2, -halfDepth]} castShadow>
                  <boxGeometry args={[bayW - 0.3, storyH - 0.1, 0.18]} />
                  <meshStandardMaterial
                    color="#475569"
                    roughness={0.8}
                    metalness={0.15}
                  />
                </mesh>
              )}

              {/* Refuerzo: Arriostramientos metálicos en cruz X (Fachada Frontal) */}
              {retrofits.xBracing && (
                <group position={[0, yBottom + storyH / 2, halfDepth]}>
                  {/* Diagonal 1 */}
                  <mesh rotation={[0, 0, Math.atan2(storyH, bayW)]}>
                    <cylinderGeometry
                      args={[0.06, 0.06, Math.hypot(bayW, storyH) - 0.3, 12]}
                    />
                    <meshStandardMaterial
                      color="#eab308"
                      metalness={0.8}
                      roughness={0.25}
                    />
                  </mesh>
                  {/* Diagonal 2 */}
                  <mesh rotation={[0, 0, -Math.atan2(storyH, bayW)]}>
                    <cylinderGeometry
                      args={[0.06, 0.06, Math.hypot(bayW, storyH) - 0.3, 12]}
                    />
                    <meshStandardMaterial
                      color="#eab308"
                      metalness={0.8}
                      roughness={0.25}
                    />
                  </mesh>
                  {/* Placa central de conexión */}
                  <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[0.26, 0.26, 0.12]} />
                    <meshStandardMaterial color="#ca8a04" metalness={0.9} />
                  </mesh>
                </group>
              )}

              {/* Indicador de piso */}
              <Text
                position={[halfBay + 0.3, yTop - 0.2, 0]}
                fontSize={0.28}
                color="#cbd5e1"
                rotation={[0, Math.PI / 2, 0]}
              >
                {isTopStory ? 'NIVEL 3 (TECHO)' : `NIVEL ${s + 1}`}
              </Text>
            </group>
          );
        })}

        {/* Sensor acelerómetro en el techo */}
        <mesh position={[0, 0.2 + stories * storyH + 0.15, 0]}>
          <boxGeometry args={[0.2, 0.12, 0.2]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} />
        </mesh>
      </group>

      <ContactShadows
        position={[0, -0.28, 0]}
        opacity={0.8}
        scale={16}
        blur={2.4}
        far={6}
      />
    </group>
  );
};

// ==========================================
// Main Bench Component
// ==========================================

export const ShakeTableBench: React.FC = () => {
  // Parámetros de la mesa sísmica y solicitaciones multi-amenaza
  const [params, setParams] = useState<ShakeTableParameters>({
    pgaG: 0.35,
    frequencyHz: 2.8,
    waveType: 'harmonic',
    windSpeedKmh: 40,
    liquefactionRatio: 0.0
  });

  // Catálogo de refuerzos conmutables
  const [retrofits, setRetrofits] = useState<ActiveRetrofits>({
    shearWalls: false,
    xBracing: false,
    cfrpWrap: false,
    baseIsolators: false
  });

  const [isPlaying, setIsPlaying] = useState(true);

  // Cálculo de telemetría dinámica reactiva
  const telemetry = useMemo(() => {
    return ShakeTableEngine.evaluateDynamicResponse(params, retrofits, 1.0);
  }, [params, retrofits]);

  // Manejo de Presets Destructivos & Didácticos
  const handleApplyPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'resonance': {
        // Busca resonancia sintonizando la frecuencia de la mesa a la propia del sistema
        const props = ShakeTableEngine.computeEffectiveProperties(retrofits, params.liquefactionRatio);
        setParams({
          pgaG: 0.40,
          frequencyHz: Number(props.naturalFrequencyHz.toFixed(1)),
          waveType: 'harmonic',
          windSpeedKmh: 20,
          liquefactionRatio: 0.0
        });
        break;
      }
      case 'near-fault-pulse': {
        setParams({
          pgaG: 0.75,
          frequencyHz: 1.5,
          waveType: 'impulse',
          windSpeedKmh: 30,
          liquefactionRatio: 0.0
        });
        break;
      }
      case 'caracas-1967': {
        setParams({
          pgaG: 0.52,
          frequencyHz: 3.2,
          waveType: 'harmonic',
          windSpeedKmh: 15,
          liquefactionRatio: 0.2
        });
        break;
      }
      case 'hurricane-liquefaction': {
        setParams({
          pgaG: 0.20,
          frequencyHz: 2.0,
          waveType: 'harmonic',
          windSpeedKmh: 175,
          liquefactionRatio: 0.8
        });
        break;
      }
      case 'safe-isolated': {
        setRetrofits({
          shearWalls: false,
          xBracing: false,
          cfrpWrap: true,
          baseIsolators: true
        });
        setParams({
          pgaG: 0.45,
          frequencyHz: 2.5,
          waveType: 'harmonic',
          windSpeedKmh: 45,
          liquefactionRatio: 0.0
        });
        break;
      }
      default:
        break;
    }
  };

  const toggleRetrofit = (key: keyof ActiveRetrofits) => {
    setRetrofits((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto pb-12">
      {/* Encabezado del Banco de Pruebas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">
                Banco de Pruebas Destructivo: Mesa Sísmica 3D & Refuerzos
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono font-bold">
                COVENIN 1756 / FEMA 356
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Experimentación física en tiempo real: someta pórticos a solicitaciones extremas y evalúe la mitigación por contramedidas estructurales.
            </p>
          </div>
        </div>

        {/* Botones de Presets Destructivos */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden lg:inline mr-1">
            Ensayos de Laboratorio:
          </span>
          <button
            onClick={() => handleApplyPreset('resonance')}
            className="px-2.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>Resonancia Crítica</span>
          </button>
          <button
            onClick={() => handleApplyPreset('near-fault-pulse')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-800 text-amber-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Pulso de Falla</span>
          </button>
          <button
            onClick={() => handleApplyPreset('hurricane-liquefaction')}
            className="px-2.5 py-1.5 rounded-lg bg-teal-950/70 hover:bg-teal-900 border border-teal-800 text-teal-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>Viento & Licuefacción</span>
          </button>
          <button
            onClick={() => handleApplyPreset('safe-isolated')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aislado (LRB)</span>
          </button>
        </div>
      </div>

      {/* Grid Central: Lienzo 3D (Col 8) + Telemetría & Controles (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Columna Izquierda: Visor 3D de la Mesa Sísmica (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative w-full h-[480px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Canvas Three.js */}
            <Suspense
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Activity className="w-8 h-8 animate-spin text-sky-400" />
                  <span className="text-sm font-medium">Iniciando Mesa Sísmica 3D...</span>
                </div>
              }
            >
              <Canvas
                shadows
                camera={{ position: [8, 5, 11], fov: 42 }}
                className="w-full h-full"
              >
                <Bench3DScene
                  params={params}
                  retrofits={retrofits}
                  telemetry={telemetry}
                  isPlaying={isPlaying}
                />
                <OrbitControls
                  makeDefault
                  minDistance={4}
                  maxDistance={22}
                  maxPolarAngle={Math.PI / 2 - 0.05}
                />
              </Canvas>
            </Suspense>

            {/* Banner Flotante de Estado en el Lienzo 3D */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full animate-ping bg-sky-400" />
                <span className="font-semibold text-slate-200">
                  Mesa Vibratoria: {params.frequencyHz.toFixed(1)} Hz | PGA {params.pgaG.toFixed(2)}g
                </span>
                {telemetry.isResonant && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800 animate-pulse">
                    ¡RESONANCIA! (fn ≈ {telemetry.naturalFrequencyHz} Hz)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition cursor-pointer border ${
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                  }`}
                >
                  {isPlaying ? 'Pausar Mesa' : 'Reanudar Mesa'}
                </button>
              </div>
            </div>

            {/* Alerta de Colapso Flotante */}
            {telemetry.isNearCollapse && (
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-rose-950/90 backdrop-blur-md border border-rose-600 text-rose-100 flex items-center justify-between gap-3 animate-bounce">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span className="text-xs font-bold">
                    ADVERTENCIA CRÍTICA: Deriva de entrepiso excede capacidad resistente ({ (telemetry.interstoryDriftRatio * 100).toFixed(2) }%). Rótulas plásticas activas.
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold bg-rose-900 px-2 py-1 rounded">
                  FEMA 356: COLAPSO
                </span>
              </div>
            )}
          </div>

          {/* Botonera de Refuerzos Estructurales Conmutables */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span>Catálogo de Refuerzos Estructurales Conmutables (Equipar en 3D)</span>
              </h3>
              {telemetry.reductionVsUnreinforcedPercent > 0 && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  Deriva mitigada en {telemetry.reductionVsUnreinforcedPercent}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* 1. Muros de Cortante */}
              <button
                onClick={() => toggleRetrofit('shearWalls')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                  retrofits.shearWalls
                    ? 'bg-sky-950/80 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">Muros de Cortante</span>
                  {retrofits.shearWalls ? (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Box className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Hormigón armado. Multiplica rigidez lateral ($k \times 2.85$). Reduce derivas.
                </p>
                <span className="text-[10px] font-mono text-sky-300">
                  {retrofits.shearWalls ? 'ACTIVO (Visualizado)' : 'Inactivo'}
                </span>
              </button>

              {/* 2. Arriostramientos en X */}
              <button
                onClick={() => toggleRetrofit('xBracing')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                  retrofits.xBracing
                    ? 'bg-amber-950/80 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">Arriostramientos en X</span>
                  {retrofits.xBracing ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Zap className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Diagonales de acero en cruz. Disipa energía histerética y restringe balanceo.
                </p>
                <span className="text-[10px] font-mono text-amber-300">
                  {retrofits.xBracing ? 'ACTIVO (Visualizado)' : 'Inactivo'}
                </span>
              </button>

              {/* 3. Encamisado CFRP */}
              <button
                onClick={() => toggleRetrofit('cfrpWrap')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                  retrofits.cfrpWrap
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">Encamisado CFRP</span>
                  {retrofits.cfrpWrap ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Layers className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Fibra de carbono en columnas. Incrementa ductilidad y capacidad última $+70\%$.
                </p>
                <span className="text-[10px] font-mono text-indigo-300">
                  {retrofits.cfrpWrap ? 'ACTIVO (Visualizado)' : 'Inactivo'}
                </span>
              </button>

              {/* 4. Aisladores Elastomericos LRB */}
              <button
                onClick={() => toggleRetrofit('baseIsolators')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                  retrofits.baseIsolators
                    ? 'bg-emerald-950/80 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">Aisladores de Base</span>
                  {retrofits.baseIsolators ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Shield className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Cilindros LRB (caucho/plomo). Desacopla el terreno reduciendo aceleración en más del 60%.
                </p>
                <span className="text-[10px] font-mono text-emerald-300">
                  {retrofits.baseIsolators ? 'ACTIVO (Visualizado)' : 'Inactivo'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Diales de Solicitación & Telemetría en Vivo (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Panel de Telemetría Dinámica en Vivo */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-sky-400" />
                <span>Telemetría de Daño en Tiempo Real</span>
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  telemetry.performanceLevel === 'COLLAPSE'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : telemetry.performanceLevel === 'CP'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : telemetry.performanceLevel === 'LS'
                    ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}
              >
                {telemetry.performanceLevel}
              </span>
            </div>

            {/* Deriva de Entrepiso y Barra Normativa COVENIN */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Deriva Máxima (Δ/h):</span>
                <span
                  className={`font-mono font-bold ${
                    telemetry.coveninDriftLimitExceeded ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {(telemetry.interstoryDriftRatio * 100).toFixed(2)}%{' '}
                  <span className="text-[10px] text-slate-500">
                    (Límite COVENIN: 1.20%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 relative">
                {/* Marcador de límite elástico 1.2% */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
                  style={{ left: '48%' }}
                  title="Límite COVENIN 1.2%"
                />
                <div
                  className={`h-full transition-all duration-150 ${
                    telemetry.interstoryDriftRatio > 0.022
                      ? 'bg-rose-500'
                      : telemetry.interstoryDriftRatio > 0.012
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (telemetry.interstoryDriftRatio / 0.025) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Métricas Físicas Cuantitativas */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Amplificación (DMF)</span>
                <span className="font-mono font-bold text-slate-200 mt-0.5">
                  {telemetry.dmf.toFixed(2)}x
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Aceleración Techo</span>
                <span className="font-mono font-bold text-sky-400 mt-0.5">
                  {telemetry.topAccelerationG.toFixed(2)}g
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Período Tn (f_n)</span>
                <span className="font-mono font-bold text-slate-200 mt-0.5">
                  {telemetry.naturalPeriodSec.toFixed(2)}s ({telemetry.naturalFrequencyHz} Hz)
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[11px]">Índice Park-Ang</span>
                <span
                  className={`font-mono font-bold mt-0.5 ${
                    telemetry.parkAngDamageIndex >= 0.8 ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {telemetry.parkAngDamageIndex.toFixed(2)} / 1.0
                </span>
              </div>
            </div>

            {/* Diagnóstico Cualitativo */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">
                  {telemetry.performanceLabel}
                </span>
                <span className="text-[11px] text-slate-400">
                  Rigidez lateral: {telemetry.effectiveStiffnessKnM.toLocaleString()} kN/m | Amortiguamiento: {(telemetry.dampingRatio * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Panel de Diales y Solicitaciones Físicas */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Diales de Solicitación Multi-Amenaza</span>
            </h3>

            {/* 1. Aceleración Sísmica PGA */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Aceleración Mesa (PGA):</span>
                <span className="font-mono font-bold text-sky-400">
                  {params.pgaG.toFixed(2)} g
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.20"
                step="0.05"
                value={params.pgaG}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, pgaG: parseFloat(e.target.value) }))
                }
                className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* 2. Frecuencia de Excitación Armónica */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Frecuencia Mesa:</span>
                <span className="font-mono font-bold text-sky-400">
                  {params.frequencyHz.toFixed(1)} Hz
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={params.frequencyHz}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, frequencyHz: parseFloat(e.target.value) }))
                }
                className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3. Régimen de Onda Sísmica */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-300 font-medium">Régimen de Onda:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setParams((prev) => ({ ...prev, waveType: 'harmonic' }))}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    params.waveType === 'harmonic'
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Armónica Continua
                </button>
                <button
                  onClick={() => setParams((prev) => ({ ...prev, waveType: 'impulse' }))}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    params.waveType === 'impulse'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Pulso de Falla
                </button>
              </div>
            </div>

            {/* 4. Viento Lateral Sostenido */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Viento Sostenido:</span>
                <span className="font-mono font-bold text-teal-400">
                  {params.windSpeedKmh} km/h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={params.windSpeedKmh}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, windSpeedKmh: parseInt(e.target.value) }))
                }
                className="w-full accent-teal-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* 5. Licuefacción / Pérdida de Apoyo */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Licuefacción del Suelo:</span>
                <span className="font-mono font-bold text-amber-400">
                  {Math.round(params.liquefactionRatio * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={params.liquefactionRatio}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, liquefactionRatio: parseFloat(e.target.value) }))
                }
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Restablecer Parámetros */}
            <button
              onClick={() => {
                setParams({
                  pgaG: 0.35,
                  frequencyHz: 2.8,
                  waveType: 'harmonic',
                  windSpeedKmh: 40,
                  liquefactionRatio: 0.0
                });
                setRetrofits({
                  shearWalls: false,
                  xBracing: false,
                  cfrpWrap: false,
                  baseIsolators: false
                });
              }}
              className="mt-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Diales y Refuerzos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShakeTableBench;
