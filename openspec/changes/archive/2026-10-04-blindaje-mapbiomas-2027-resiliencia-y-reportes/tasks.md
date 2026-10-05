# Tasks

## 1. Resiliencia ante Cortes Eléctricos y Recuperación de Sesión

- [x] 1.1 Implementar en `src/services/studyStorage.ts` los métodos `saveCrashRecoverySnapshot()`, `loadCrashRecoverySnapshot()` y `clearCrashRecoverySnapshot()`, gestionando serialización segura, timestamp y bandera de estado sucio (`isDirty`).
- [x] 1.2 Conectar en `src/App.tsx` el guardado reactivo en segundo plano ante modificaciones de estudio, mapa o amenazas, y desplegar el banner interactivo de recuperación al detectar una sesión previa interrumpida por corte eléctrico.

## 2. Generador de Reportes Técnicos MapBiomas / COVENIN

- [x] 2.1 Desarrollar en `src/services/studyStorage.ts` la función generadora `generateTechnicalReport()`, ensamblando tablas multitemporales MapBiomas (1985–2050), evolución del coeficiente $C$, cortante basal $V_0$, derivas, índice Park-Ang, pérdidas en USD y citas formales a RAISG.
- [x] 2.2 Actualizar `src/components/TechnicalReportModal.tsx` para presentar el reporte formateado con estilos de impresión profesional (`@media print`), visualización de tablas comparativas y botones para copiar o descargar el informe en Markdown.

## 3. Catálogo Ampliado de Regiones Emblemáticas de Venezuela

- [x] 3.1 Incorporar en `src/data/venezuelaRegions.ts` las cuatro regiones de alto impacto con sus series multitemporales MapBiomas (1985–2050), fallas activas y parámetros sísmicos COVENIN: Los Andes (Mérida/Táchira), Macizo Oriental (Sucre/Monagas), Costa Oriental del Lago (Zulia) y Cuenca del Río Caroní (Bolívar).

## 4. Pruebas Automatizadas y Certificación

- [x] 4.1 Incorporar TEST-24 (Persistencia reactiva y recuperación tras fallo eléctrico) y TEST-25 (Generación de memorias técnicas e integridad de series multitemporales MapBiomas) en `src/tests/runAllTests.ts`.
- [x] 4.2 Ejecutar `npm run lint` (`tsc --noEmit`) y `npm test`, validando que el 100% de las 25 pruebas apruebe exitosamente y la compilación de TypeScript no presente advertencias ni errores.
