# Proposición: Arquitectura Modular y Suite de Pruebas de Flujo Integral

## Why

El sistema SIURPROV poseía una arquitectura fuertemente acoplada en `server.ts`, donde el servidor Express y el middleware de desarrollo de Vite estaban entrelazados. Esto impedía testear las rutas HTTP y la consistencia de datos de forma aislada sin levantar el bundler o colisionar en puertos fijos de red.
Asimismo, existían cálculos visuales (colores de esfuerzo Park-Ang, geometría de niveles y perfiles de suelo) acoplados al DOM/Three.js, y la suite de pruebas se limitaba a pruebas unitarias aisladas sin validar el flujo completo de datos entre el almacenamiento criptográfico, la API Express y el motor sismorresistente.

## What Changes

1. **Desacoplamiento de Servidor Express (`src/server/app.ts`)**:
   - Creación de la factoría `createApp(options)` para instanciar la aplicación Express con cabeceras de seguridad (CSP, nosniff, frame-options), rate-limiting configurable, y rutas desacopladas de Vite.
   - Simplificación de `server.ts` como punto de entrada de ejecución del servidor en producción y desarrollo local.
2. **Endpoint de Simulación Completa (`/api/simulate/full`) y Catálogo (`/api/catalog`)**:
   - Exposición unificada del motor `StructuralSimulationEngine` a través de la API para garantizar que tanto la web como cualquier integración externa utilicen la misma fuente de verdad (Single Source of Truth).
3. **Servicio de Visualización Desacoplado (`src/services/visualization.ts`)**:
   - Funciones puras independientes del DOM para el mapeo de índice de daño Park-Ang a bandas de color, tipologías a geometría volumétrica 3D y suelos S1-S4 a estratos visuales.
4. **Suite Integral de Pruebas Asíncronas End-to-End (`src/tests/runAllTests.ts`)**:
   - Soporte asíncrono para el ejecutor de pruebas.
   - 6 nuevas pruebas de flujo completo (TEST-12 a TEST-17) cubriendo lógica 3D, ciclo de vida de archivos `.siurprov` con detección de adulteración (tamper detection), auditoría HTTP de seguridad, validación contra Prototype Pollution, consistencia exacta API vs Motor, y defensa ante payloads maliciosos.

## Capabilities

### New Capabilities
- `server-modular-app`: Factoría `createApp` independiente de Vite para testing y despliegue modular.
- `api-simulation-flow`: Endpoint `/api/simulate/full` que ejecuta el pipeline multi-amenaza garantizando coherencia con el motor local.
- `visualization-pure-logic`: Transformación matemática pura de resultados estructurales a parámetros geométricos y cromáticos 3D.
- `e2e-dataflow-testing`: Suite de pruebas automatizadas que levanta servidores efímeros y valida el flujo completo de datos sin dependencias externas.

## Impact

- `src/server/app.ts` (nuevo)
- `server.ts` (refactorizado a lanzador ligero)
- `src/services/visualization.ts` (nuevo)
- `src/components/Structure3DView.tsx` (consumo de helpers puros)
- `src/tests/runAllTests.ts` (ampliado de 11 a 17 pruebas exhaustivas)
- `package.json` / CI/CD scripts
