# Proposal

## Why

El proyecto SIURPROV ha alcanzado un alto nivel de sofisticación técnica (ingeniería sismorresistente COVENIN 1756, dinámica estructural FEMA 356, visualización 3D en Three.js, API REST con Express y batería de 23 pruebas CI/CD), pero carece de una guía de arquitectura y comentarios contextuales en el código fuente. Esto dificulta que el desarrollador comprenda el flujo íntimo del sistema, audite diffs en GitHub Desktop para aprender de los cambios, mantenga la autosuficiencia técnica sin depender de suscripciones pagas a modelos de lenguaje y defienda el proyecto con solvencia en entrevistas laborales.

## What Changes

- Creación del documento maestro `docs/ARQUITECTURA_Y_APRENDIZAJE.md`, estructurado como un manual de ingeniería de software que explica los patrones arquitectónicos empleados (Clean Architecture, State Lifting, Motores Puros de Física, Persistencia Defensiva Offline-First), mapas de flujo de datos y preparación de preguntas técnicas de entrevista basadas en el proyecto.
- Incorporación exhaustiva de documentación JSDoc y comentarios pedagógicos en los módulos y bloques neurálgicos del código (`src/services/`, `src/server/app.ts`, `src/App.tsx`, `src/components/CanvasSimulator.tsx`, `src/components/ShakeTableBench.tsx`), explicando el qué, el porqué, la interacción intermodular y cómo escalar cada sección.
- Actualización del archivo `README.md` para incluir el mapa conceptual del sistema, el flujo de desarrollo autosuficiente y la guía de lectura inversa en GitHub Desktop.

## Capabilities

### New Capabilities
<!-- No se introducen nuevas capacidades de comportamiento runtime en este cambio documental/pedagógico -->

### Modified Capabilities
<!-- No se modifican requisitos de especificaciones previas; skip_specs: true declarado -->

## Impact

- **Documentación**: Nuevo archivo `docs/ARQUITECTURA_Y_APRENDIZAJE.md` y actualización de `README.md`.
- **Código Fuente**: Adición de comentarios JSDoc y notas pedagógicas en archivos de `src/services/`, `src/server/` y `src/components/` sin modificar la lógica operativa.
- **Riesgo**: Nulo. Cero impacto en tiempo de ejecución o contratos de API. Las 23 pruebas de `npm test` y el chequeo de tipos `npm run lint` continuarán pasando al 100%.
