## Context

El simulador 2D (`CanvasSimulator`) calcula todo en `StructuralSimulationEngine`; la vista solo representa resultados. El 3D reutiliza exactamente los mismos props (typology, soilProfile, scenario, simulationResult).

## Goals / Non-Goals

**Goals:** vista 3D orbitable, animación sísmica/viento/inundación/aluvión, coloreado por índice Park-Ang, inspección por clic, sin romper el 2D.
**Non-Goals:** análisis estructural en el cliente 3D; nuevos servicios externos.

## Decisions

- **Three.js + R3F + drei** (MIT): estándar abierto, declarativo con React 19.
- **Lazy loading** del módulo 3D para no inflar el bundle inicial.
- **Ambas vistas permanecen montadas** (la inactiva se oculta): evita errores de desmontaje de la raíz R3F y conserva el estado.
- Sin `drei <Html>`: causó errores de desmontaje; las etiquetas son overlays DOM.

## Risks / Trade-offs

- Dispositivos sin WebGL: el conmutador permite volver al 2D.
- Bundle más pesado al activar 3D (mitigado con lazy).

## Roadmap recomendado (código libre)

1. Terreno 3D real con mapa de elevación (Terrarium/SRTM abiertos) bajo `InteractiveTerritorialMap` (MapLibre GL + deck.gl, ambos de código abierto).
2. Modos de deformación modal (formas modales del edificio) con `three` + datos del motor.
3. Aluvión/inundación con partículas GPU (three-nebula / shaders propios) y SPH simplificado.
4. Física rígida de colapso con Rapier (`@dimforge/rapier3d-compat`, Apache-2.0).
5. Exportar escenas a glTF y vista AR/VR con WebXR.
