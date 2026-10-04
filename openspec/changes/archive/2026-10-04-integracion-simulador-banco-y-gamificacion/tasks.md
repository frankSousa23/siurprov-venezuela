# Tasks

## 1. Motor de Sismos Históricos y Gamificación

- [x] 1.1 Definir el catálogo de eventos sísmicos históricos venezolanos (Cariaco 1997, Caracas 1967, El Tocuyo 1950) en `src/services/shakeTableEngine.ts` con PGA calibrado, frecuencias dominantes y duraciones de pulso, y verificar que los datos se exporten correctamente.
- [x] 1.2 Implementar en `src/services/shakeTableEngine.ts` la lógica de gamificación: presupuesto virtual disponible, costos de instalación por refuerzo (LRB, Muros, Arriostramientos, CFRP), cálculo de vidas protegidas y asignación de calificación técnica (A+, A, B, C, Colapso).

## 2. Integración Intermodular Simulador ➔ Banco de Pruebas

- [x] 2.1 Incorporar el botón `[🚀 Probar en Banco Sísmico]` en los controles del Simulador 2D/3D (`src/components/Structure3DView.tsx`) para empaquetar número de pisos, masa, rigidez y suelo COVENIN en un objeto estandarizado.
- [x] 2.2 Conectar la navegación reactiva en `src/App.tsx` para transferir la estructura empaquetada al Banco de Pruebas, sincronizar el almacenamiento local en `localStorage` y conmutar fluidamente a la pestaña `shake-table`.
- [x] 2.3 Actualizar `src/components/ShakeTableBench.tsx` para detectar y cargar automáticamente la estructura recibida del simulador, adaptando el número de pisos renderizados en Three.js y notificando al usuario.

## 3. Interfaz de Retos Sísmicos y Drawer Responsive Móvil

- [x] 3.1 Integrar en `src/components/ShakeTableBench.tsx` el panel de control del "Modo Desafío Histórico", mostrando selector de eventos, barra de presupuesto en tiempo real, desglose de costos y pantalla de resultados con puntaje al concluir la prueba.
- [x] 3.2 Refactorizar la disposición de controles en `src/components/ShakeTableBench.tsx` para viewports móviles (< 640px) mediante un Bottom Sheet Drawer colapsable con tirador táctil, garantizando visualización despejada del lienzo 3D.

## 4. Pruebas Automatizadas y Certificación

- [x] 4.1 Incorporar TEST-22 (Integridad de transferencia intermodular y consistencia de geometría) y TEST-23 (Cálculo espectral de sismos históricos y reglas de puntuación/presupuesto de gamificación) en `src/tests/runAllTests.ts`.
- [x] 4.2 Ejecutar `npm test` y `npm run lint`, verificando que todas las pruebas pasen al 100% y que la compilación de TypeScript no presente advertencias ni errores.
