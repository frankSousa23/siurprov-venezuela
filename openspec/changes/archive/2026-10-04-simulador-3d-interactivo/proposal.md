## Why

El simulador estructural era un canvas 2D lateral. Para docencia y gestión de riesgo, ver la estructura, el suelo en capas y las amenazas en 3D (orbitando la cámara) mejora la comprensión. Además la licencia incluía una cláusula de atribución obligatoria que se simplifica a MIT estándar.

## What Changes

- Nueva vista 3D interactiva (`Structure3DView`) con Three.js + React Three Fiber (MIT), con conmutador 3D/2D.
- Licencia: MIT estándar; la mención al autor pasa a ser una nota de cortesía (LICENSE, README, memoria técnica, modal, metadatos de estudios, pruebas).
- Corrección de dependencias (`esbuild` ^0.28 por conflicto peer con Vite 8).
- Integración de OpenSpec en el repositorio.

## Capabilities

### New Capabilities
- `structure-3d-view`: visualización 3D orbitable de edificio, suelo, nivel freático, inundación y detritos.

### Modified Capabilities
- `license-notice`: de atribución obligatoria a mención de cortesía.

## Impact

- `src/components/Structure3DView.tsx` (nuevo), `src/components/CanvasSimulator.tsx`.
- `package.json` (three, @react-three/fiber, @react-three/drei, @types/three).
- `LICENSE`, `README.md`, `docs/MEMORIA_TECNICA.md`, `MitLicenseModal.tsx`, `studyStorage.ts`, `systemAuditor.ts`.

## Non-goals

- Motor FEM real, GPU compute o servicios en la nube de pago.
