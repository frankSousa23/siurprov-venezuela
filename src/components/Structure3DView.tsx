import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import {
  BuildingTypology,
  MultiHazardParameters,
  SimulationResult,
  SoilProfile
} from '../types';
import { buildingGeometry, soilColor, stressColor } from '../services/visualization';

interface Structure3DViewProps {
  typology: BuildingTypology;
  soilProfile: SoilProfile;
  scenario: MultiHazardParameters;
  simulationResult: SimulationResult;
  isPlaying: boolean;
  simulationSpeed: number;
  showStressMesh: boolean;
  resetKey: number;
  onSelect: (info: string) => void;
}

interface SceneProps extends Structure3DViewProps {}

/** Escena 3D: suelo en capas, edificio deformable, agua y flujo de detritos. */
const Scene: React.FC<SceneProps> = ({
  typology,
  soilProfile,
  scenario,
  simulationResult,
  isPlaying,
  simulationSpeed,
  showStressMesh,
  resetKey,
  onSelect
}) => {
  const groundRef = useRef<THREE.Group>(null);
  const storyRefs = useRef<Array<THREE.Group | null>>([]);
  const waterRef = useRef<THREE.Mesh>(null);
  const debrisRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const lastReset = useRef(resetKey);

  const { stories, storyH, bays, bayW, width, depth, totalH } = buildingGeometry(
    typology.stories,
    typology.storyHeightM,
    typology.baysCount,
    typology.bayWidthM
  );
  const depthBays = 2;
  const isInformal = typology.structuralSystem.includes('Autoconstrucción');
  const di = simulationResult.parkAngDamageIndex;
  const color = showStressMesh ? stressColor(di) : '#94a3b8';
  const hasDeepPiles = typology.foundationType.includes('Pilotes');

  const debris = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        x: -45 - Math.random() * 40,
        y: 0.5 + Math.random() * 2,
        z: (Math.random() - 0.5) * 22,
        r: 0.3 + Math.random() * (scenario.debrisFlow.boulderImpactSizeM * 0.9 + 0.2),
        v: 6 + Math.random() * scenario.debrisFlow.debrisVelocityMs,
        key: i
      })),
    [scenario.debrisFlow.boulderImpactSizeM, scenario.debrisFlow.debrisVelocityMs]
  );

  useFrame((state, delta) => {
    if (lastReset.current !== resetKey) {
      lastReset.current = resetKey;
      timeRef.current = 0;
    }
    if (isPlaying) timeRef.current += delta * simulationSpeed;
    const t = timeRef.current;

    // Vibración del terreno
    let gx = 0;
    let gz = 0;
    if (scenario.earthquake.enabled) {
      const pga = scenario.earthquake.pgaG;
      gx = (Math.sin(t * 12) * 0.6 + Math.sin(t * 22) * 0.3 + Math.cos(t * 6.5) * 0.45) * pga * 0.9;
      gz = Math.sin(t * 16) * pga * 0.35;
    }
    if (groundRef.current) groundRef.current.position.set(gx, 0, gz);

    // Balanceo modal del edificio
    const resonance = scenario.earthquake.enabled
      ? Math.sin(t * ((2 * Math.PI) / Math.max(0.2, simulationResult.fundamentalPeriodT1)))
      : 0;
    const windSway = scenario.wind.enabled ? scenario.wind.speedKmh / 400 : 0;
    const topDrift =
      (simulationResult.maxStoryDriftPercent / 100) * totalH * 1.4 * resonance + windSway;
    storyRefs.current.forEach((g, s) => {
      if (!g) return;
      const frac = (s + 1) / stories;
      let modal = Math.pow(frac, 1.4);
      if (typology.softStoryVulnerability) modal += 0.35 * (frac > 0 ? 1 : 0);
      g.position.x = topDrift * modal;
      g.rotation.z = -topDrift * modal * 0.01;
    });

    // Agua
    if (waterRef.current) {
      waterRef.current.position.y =
        0.05 + (scenario.flood.enabled ? scenario.flood.waterLevelM : 0) + Math.sin(t * 2) * 0.05;
    }

    // Detritos
    if (debrisRef.current) {
      debrisRef.current.children.forEach((m, i) => {
        const d = debris[i];
        if (!d) return;
        const x = ((d.x + t * d.v * 2 + 90) % 130) - 90;
        m.position.set(x, d.y + Math.abs(Math.sin(t * 3 + i)) * 0.4, d.z);
        m.rotation.x = t * 2 + i;
        m.rotation.y = t * 1.5 + i;
      });
    }
  });

  const columnX = Array.from({ length: bays + 1 }, (_, i) => -width / 2 + i * bayW);
  const columnZ = Array.from({ length: depthBays + 1 }, (_, i) => -depth / 2 + i * bayW);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[30, 50, 20]} intensity={1.4} castShadow />
      <Sky
        sunPosition={scenario.debrisFlow.enabled || scenario.flood.enabled ? [0, 2, -10] : [40, 25, 20]}
        turbidity={scenario.debrisFlow.enabled || scenario.flood.enabled ? 14 : 4}
      />

      {/* Suelo en capas (COVENIN S1-S4) */}
      <group ref={groundRef}>
        <mesh position={[0, -1.5, 0]} receiveShadow>
          <boxGeometry args={[70, 3, 50]} />
          <meshStandardMaterial color={soilColor(soilProfile.type)} />
        </mesh>
        <mesh position={[0, -5, 0]}>
          <boxGeometry args={[70, 4, 50]} />
          <meshStandardMaterial color="#44403c" />
        </mesh>
        <mesh position={[0, -10, 0]}>
          <boxGeometry args={[70, 6, 50]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Nivel freático */}
        <mesh position={[0, -Math.min(14, soilProfile.waterTableDepthM), 0]}>
          <boxGeometry args={[70.2, 0.08, 50.2]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.45} />
        </mesh>

        {/* Licuefacción */}
        {simulationResult.liquefactionOccurred &&
          Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} position={[-20 + i * 4.4, 0.1, (i % 3) * 5 - 5]}>
              <sphereGeometry args={[0.9, 12, 12]} />
              <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} />
            </mesh>
          ))}

        {/* Pilotes */}
        {hasDeepPiles &&
          columnX.flatMap((x) =>
            columnZ.map((z) => (
              <mesh key={`p-${x}-${z}`} position={[x, -6, z]}>
                <cylinderGeometry args={[0.45, 0.45, 12, 12]} />
                <meshStandardMaterial color="#94a3b8" />
              </mesh>
            ))
          )}

        {/* Fundación */}
        <mesh
          position={[0, 0.2, 0]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelect(
              `Fundación (${typology.foundationType}): Cortante basal V0 = ${simulationResult.designBaseShearKn.toFixed(
                1
              )} kN | V0/W = ${simulationResult.baseShearToWeightRatio}`
            );
          }}
        >
          <boxGeometry args={[width + 2, 0.5, depth + 2]} />
          <meshStandardMaterial color={isInformal ? '#78350f' : '#475569'} />
        </mesh>

        {/* Edificio */}
        {Array.from({ length: stories }, (_, s) => {
          const y0 = 0.45 + s * storyH;
          const isSoft = typology.softStoryVulnerability && s === 0;
          const colColor = isSoft && di > 0.3 ? '#ef4444' : color;
          return (
            <group
              key={s}
              position={[0, y0, 0]}
              ref={(g) => {
                storyRefs.current[s] = g;
              }}
            >
              {columnX.flatMap((x) =>
                columnZ.map((z) => (
                  <mesh
                    key={`c-${x}-${z}`}
                    position={[x, storyH / 2, z]}
                    castShadow
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(
                        `Columna nivel ${s + 1}: deriva ${(
                          ((s + 1) / stories) *
                          simulationResult.maxStoryDriftPercent
                        ).toFixed(2)}% | Índice Park-Ang ${di}${
                          isSoft ? ' | PLANTA BAJA DÉBIL' : ''
                        }`
                      );
                    }}
                  >
                    <boxGeometry
                      args={[isInformal ? 0.25 : 0.45, storyH, isInformal ? 0.25 : 0.45]}
                    />
                    <meshStandardMaterial
                      color={colColor}
                      emissive={colColor}
                      emissiveIntensity={showStressMesh && di >= 0.45 ? 0.35 : 0}
                    />
                  </mesh>
                ))
              )}

              {/* Losa */}
              <mesh position={[0, storyH, 0]} castShadow receiveShadow>
                <boxGeometry args={[width + 0.8, 0.3, depth + 0.8]} />
                <meshStandardMaterial color="#cbd5e1" />
              </mesh>

              {/* Tabiquería (omitida en planta baja débil) */}
              {!isSoft && (
                <>
                  <mesh position={[0, storyH / 2, depth / 2]}>
                    <boxGeometry args={[width, storyH - 0.3, 0.15]} />
                    <meshStandardMaterial
                      color={isInformal ? '#b45309' : '#94a3b8'}
                      transparent
                      opacity={0.55}
                    />
                  </mesh>
                  <mesh position={[0, storyH / 2, -depth / 2]}>
                    <boxGeometry args={[width, storyH - 0.3, 0.15]} />
                    <meshStandardMaterial
                      color={isInformal ? '#b45309' : '#94a3b8'}
                      transparent
                      opacity={0.55}
                    />
                  </mesh>
                  {simulationResult.maxStoryDriftPercent > 1 && (
                    <mesh position={[0, storyH / 2, depth / 2 + 0.1]} rotation={[0, 0, 0.75]}>
                      <boxGeometry args={[storyH * 1.3, 0.05, 0.02]} />
                      <meshBasicMaterial color="#ef4444" />
                    </mesh>
                  )}
                </>
              )}

              {/* Rótulas plásticas */}
              {di >= 0.45 &&
                (s === 0 || s === stories - 1) &&
                columnX.map((x) => (
                  <mesh key={`h-${x}`} position={[x, s === 0 ? 0.3 : storyH - 0.3, depth / 2]}>
                    <sphereGeometry args={[0.35, 12, 12]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
                  </mesh>
                ))}
            </group>
          );
        })}

      </group>

      {/* Agua de inundación */}
      <mesh ref={waterRef} position={[0, 0.05, 0]} visible={scenario.flood.enabled}>
        <boxGeometry args={[70, 0.1, 50]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.55} />
      </mesh>

      {/* Flujo de detritos */}
      <group ref={debrisRef} visible={scenario.debrisFlow.enabled}>
        {debris.map((d) => (
          <mesh key={d.key} castShadow>
            <icosahedronGeometry args={[d.r, 0]} />
            <meshStandardMaterial color={d.key % 2 ? '#78350f' : '#451a03'} roughness={1} />
          </mesh>
        ))}
      </group>

      <ContactShadows position={[0, 0.02, 0]} opacity={0.5} scale={60} blur={2.5} far={20} />
      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2.05}
        minDistance={10}
        maxDistance={120}
        target={[0, totalH / 3, 0]}
      />
    </>
  );
};

export const Structure3DView: React.FC<Structure3DViewProps> = (props) => {
  const totalH = Math.max(1, props.typology.stories) * Math.max(2.4, props.typology.storyHeightM || 3);
  const dist = Math.max(35, totalH * 1.8 + props.typology.baysCount * 4);
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [dist, totalH * 0.8 + 8, dist], fov: 45, near: 0.1, far: 600 }}
      className="w-full h-full"
    >
      <Scene {...props} />
    </Canvas>
  );
};

export default Structure3DView;
