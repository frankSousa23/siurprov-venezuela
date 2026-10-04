# server-modular-app Specification

## Purpose
TBD - created by archiving change flujo-datos-testing-y-arquitectura. Update Purpose after archive.

## Requirements

### Requirement: Factoría de aplicación Express modular
El sistema SHALL proveer una factoría `createApp` en `src/server/app.ts` que configure middleware defensivo, rate limiting configurable y rutas de simulación sin acoplamiento a Vite.

#### Scenario: Creación de aplicación para testing o producción
- **WHEN** se invoca `createApp()` con opciones de configuración
- **THEN** retorna una instancia de Express lista para escuchar peticiones o integrarse con middlewares

### Requirement: Endpoint de simulación integral coherente
El sistema SHALL exponer `/api/simulate/full` que reciba parámetros de región, tipología, suelo y escenario, ejecutando el mismo motor `StructuralSimulationEngine` que el frontend.

#### Scenario: Simulación sismorresistente vía API
- **WHEN** un cliente envía un POST a `/api/simulate/full` con `regionId`, `typologyId`, `soilType` y `scenario`
- **THEN** responde con status 200 y el objeto de resultados de ingeniería civil idéntico al motor local
