# Proposal

## Why

Los simuladores actuales de SIURPROV permiten visualizar edificios estáticos o con animaciones reactivas básicas a parámetros predefinidos, pero carecen de una herramienta interactiva de gamificación ingenieril y experimentación física en tiempo real ("banco de pruebas destructivo"). Los ingenieros, estudiantes y tomadores de decisiones necesitan someter estructuras arquetípicas venezolanas a solicitaciones extremas controladas (frecuencia, aceleración armónica sísmica, sintonización de resonancia, empuje de viento y socavación por licuefacción) y aplicar contramedidas y refuerzos estructurales interactivos (muros de corte, disipadores/arriostramientos, fibra de carbono CFRP, aisladores de base) para evaluar la reducción de daño y derivas según normas COVENIN 1756 y FEMA 356.

## What Changes

- **Nuevo módulo de Banco de Pruebas Destructivo Interactivo (Shake Table & Multi-Hazard Bench)**:
  - Mesa sísmica interactiva 3D con accionamiento dinámico continuo (frecuencia regulable de 0.5 a 10 Hz, aceleración pico de 0.05g a 1.20g, forma de onda armónica o pulso impulsivo de falla cercana).
  - Diales y deslizadores interactivos en tiempo real para solicitaciones multi-amenaza: sismo (PGA, frecuencia, amortiguamiento), viento huracanado / ráfaga, y degradación del apoyo (saturación y pérdida de rigidez de soporte por licuefacción).
  - Catálogo de refuerzos estructurales interactivos equipables y conmutables:
    1. **Muros de cortante de concreto armado** (Shear Walls): incrementa rigidez lateral y reduce derivas globales.
    2. **Arriostramientos metálicos en cruz / diagonal** (Steel X-Bracing): reduce desplazamiento horizontal y disipa energía por fluencia.
    3. **Encamisado de columnas con polímero reforzado con fibra de carbono (CFRP)**: aumenta ductilidad y confinamiento de nodos críticos sin modificar drásticamente el peso.
    4. **Aisladores sísmicos elastoméricos en la base (Lead-Rubber Bearings / LRB)**: desacopla el movimiento del suelo reduciendo drásticamente la aceleración transmitida a la superestructura.
  - Telemetría en vivo del estado de daño y colapso: indicador de deriva máxima de entrepiso ($\Delta / h$), índice de daño de Park-Ang, aceleración en el tope y advertencia visual de colapso plástico (rótulas plásticas en columnas/vigas).
  - Integración en la navegación principal mediante una vista dedicada en la barra superior ("Banco de Pruebas") y enrutamiento en `App.tsx`.
  - Motor de cálculo y física acoplada (`src/services/shakeTableEngine.ts`) con fórmulas de oscilador MDOF/SDOF amortiguado y degradación de rigidez.
  - Suite de pruebas automatizadas en `src/tests/` validando resonancia, amortiguamiento, efectividad de los 4 refuerzos y límites de colapso.

## Capabilities

### New Capabilities
- `shake-table-bench`: Banco de pruebas destructivo e interactivo multi-amenaza con mesa sísmica 3D, diales de esfuerzo en tiempo real, catálogo de refuerzos estructurales (muros de cortante, arriostramientos en X, CFRP, aisladores elastoméricos) y telemetría de degradación física y modos de falla según COVENIN 1756 y FEMA 356.

### Modified Capabilities
<!-- None -->

## Impact

- **Frontend / UI**:
  - Nuevo componente `ShakeTableBench.tsx` con lienzo Three.js (vía `@react-three/fiber` y `@react-three/drei` con `lazy()` para carga bajo demanda sin impacto en el bundle inicial).
  - Inclusión de pestaña de navegación en la cabecera de `src/App.tsx`.
- **Servicios y Lógica Física**:
  - Nuevo servicio `src/services/shakeTableEngine.ts` que implementa las ecuaciones de dinámica de estructuras (frecuencia circular $\omega_n$, período fundamental amortiguado $T_d$, factor de amplificación dinámica $DMF$, derivas admisibles COVENIN 1756 y degradación de rigidez post-fluencia).
- **Pruebas y Verificación**:
  - Ampliación de `src/tests/runAllTests.ts` con casos de prueba para resonancia sísmica, reducción de derivas por refuerzos y respuesta elastomérica.
- **Rendimiento y Licencia**:
  - 100% código abierto local, offline-first, sin APIs de pago externas, manteniendo la compatibilidad estricta con MIT y la suite de pruebas libre de fallos (`npm test` y `npm run lint`).
