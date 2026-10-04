# Diseño Técnico: Arquitectura Modular y Suite de Pruebas de Flujo Integral

## Context

SIURPROV es un sistema interactivo de simulación sismorresistente (COVENIN 1756), geotécnica y multi-amenaza para Venezuela. La aplicación debe operar de manera offline-first y garantizar que todos los cálculos ejecutados localmente en el navegador produzcan los mismos resultados que el backend HTTP. Asimismo, los estudios `.siurprov` intercambiados entre usuarios deben contar con garantías de integridad criptográfica y sanitización estricta.

## Architecture & Decisions

### 1. Factoría de Aplicación Express (`createApp`)
- **Problema**: `server.ts` contenía middleware de Vite, configuración de puerto 3000 fijo y lógica de rutas mezcladas.
- **Decisión**: Extraer la aplicación a `src/server/app.ts` exportando `createApp(options: { rateLimitMax?: number })`.
- **Beneficio**: Permite ejecutar pruebas automatizadas levantando instancias en puertos efímeros (`server.listen(0)`), evitando colisiones y garantizando aislamiento entre ejecuciones.

### 2. Capa de Visualización Desacoplada (`visualization.ts`)
- **Problema**: El visor 3D calculaba geometría y asignaba colores internamente en componentes de React/Three.
- **Decisión**: Mover funciones puras (`stressColor`, `soilColor`, `damageBand`, `buildingGeometry`) a un servicio dedicado.
- **Beneficio**: Pruebas unitarias directas sobre el modelo de representación sin requerir emulación de WebGL o Canvas en Node.js.

### 3. Pipeline de Pruebas de Flujo Integral en `runAllTests.ts`
- **Flujo Criptográfico**:
  - `createStudyPackage` -> cálculo de checksum determinístico SHA-like -> `exportToShareableString` (Base64) -> `importFromShareableString` -> verificación `VERIFIED`.
  - Mutación intencional de datos (`tampering`) -> re-evaluación -> verificación `INVALID`.
- **Flujo de API HTTP**:
  - Peticiones reales mediante `fetch` nativo de Node.js a un servidor efímero.
  - Verificación de cabeceras defensivas (`nosniff`, `SAMEORIGIN`, CSP) y Rate Limiting.
  - Comparación de valores numéricos de respuesta (`designBaseShearKn`, `maxStoryDriftPercent`) con la ejecución directa de `StructuralSimulationEngine.runSimulation`.
  - Inyección de JSON inválido y objetos maliciosos con `__proto__` para comprobar la respuesta 400 y el bloqueo preventivo.

## Testing Strategy
- El test runner se adapta para aceptar funciones síncronas o promesas asíncronas (`Promise<void>`).
- Se mantiene cero dependencias adicionales de testing (sin jest/vitest pesado innecesario), utilizando TypeScript + Node.js nativo con `tsx`.
- Salida formateada con colores, categorías, tiempos de respuesta por milisegundos y resumen porcentual.
