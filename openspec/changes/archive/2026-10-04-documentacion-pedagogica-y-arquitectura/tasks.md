# Tasks

## 1. Manual Maestro de Arquitectura y Aprendizaje

- [x] 1.1 Redactar el documento central `docs/ARQUITECTURA_Y_APRENDIZAJE.md` con mapa del sistema en diagramas ASCII, desglose de las cuatro capas (UI React, Servicios de Ingeniería Puros, Backend Express y Batería de Pruebas CI/CD), patrones de diseño (Clean Architecture, State Lifting, Pure Functions, Defensive Offline-First) y glosario conceptual.
- [x] 1.2 Incorporar en `docs/ARQUITECTURA_Y_APRENDIZAJE.md` la sección de "Independencia Técnica y Desarrollo Autónomo": guía de lectura inversa de diffs en GitHub Desktop, depuración con `npx tsc --noEmit` y `npm test`, y configuración paso a paso de modelos locales gratuitos (Ollama con Qwen 2.5 Coder) sin costo alguno.
- [x] 1.3 Incorporar en `docs/ARQUITECTURA_Y_APRENDIZAJE.md` el banco de 10 preguntas y respuestas maestras para entrevistas laborales de programación basadas en las decisiones y desafíos resueltos en SIURPROV.

## 2. Comentarios Pedagógicos JSDoc en la Capa de Servicios y Dominio

- [x] 2.1 Enriquecer con comentarios JSDoc pedagógicos `src/services/structuralEngine.ts` y `src/services/shakeTableEngine.ts`, explicando normativas COVENIN 1756, FEMA 356, física de osciladores acoplados, resonancia, aislamiento basal y cómo escalar el motor.
- [x] 2.2 Enriquecer con comentarios JSDoc pedagógicos `src/services/studyStorage.ts` y `src/services/securitySanitizer.ts`, detallando la serialización, cálculo de hash criptográfico SHA-256 para integridad de archivos, sanitización de inputs y prevención de Prototype Pollution.

## 3. Comentarios Pedagógicos en Componentes UI y Backend

- [x] 3.1 Documentar en `src/App.tsx`, `src/components/CanvasSimulator.tsx` y `src/components/ShakeTableBench.tsx` el flujo de elevación de estado (State Lifting), los callbacks de sincronización intermodular y la gestión del loop de renderizado en Three.js / React Three Fiber.
- [x] 3.2 Documentar en `src/server/app.ts` y `server.ts` la arquitectura de Express, los middlewares de seguridad (Helmet, CORS restrictivo), rate limiting y la verificación cruzada de cálculo entre cliente y servidor.

## 4. Actualización del README y Verificación de Integridad

- [x] 4.1 Actualizar `README.md` integrando el enlace directo a `docs/ARQUITECTURA_Y_APRENDIZAJE.md` y un mapa mental rápido para que cualquier desarrollador que clone el repositorio entienda el flujo en 5 minutos.
- [x] 4.2 Ejecutar `npm run lint` (`tsc --noEmit`) y `npm test`, verificando que la totalidad de los archivos modificados compile con 0 errores y que las 23 pruebas de ingeniería y seguridad se mantengan 100% aprobadas.
