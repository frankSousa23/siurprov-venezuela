# Design

## Context
Ver `proposal.md` para la motivación general del cambio. El sistema SIURPROV posee dos módulos de análisis estructural que hasta ahora operaban de manera aislada: el Simulador 2D/3D (`src/components/Structure3DView.tsx`) y el Banco de Pruebas Dinámico (`src/components/ShakeTableBench.tsx`). La navegación global es orquestada en `src/App.tsx` mediante el estado `activeView`. Las estructuras diseñadas se persisten en `localStorage` mediante `src/services/studyStorage.ts`.

Para conectar ambos módulos de manera reactiva, se aprovechará el estado compartido en memoria mediante una función callback (`onSendToBench` / `importedBenchBuilding`) complementada con `localStorage` (`siurprov_active_bench_import`) para garantizar tolerancia a recargas y desacoplamiento limpio.

## Goals / Non-Goals

**Goals:**
- Sincronizar parámetros estructurales (número de pisos, masa por piso, rigidez lateral $k$, suelo COVENIN S1-S4) desde el Simulador hacia el Banco de Pruebas mediante un solo clic.
- Implementar un motor de Desafíos Sísmicos Históricos en `src/services/shakeTableEngine.ts` con eventos emblemáticos de Venezuela (Cariaco 1997, Caracas 1967, El Tocuyo 1950) con datos de PGA, frecuencia dominante y espectro elástico.
- Diseñar la gamificación con sistema de presupuesto virtual ($100,000 USD base), costo unitario por tipo de refuerzo (LRB, Muros, Arriostramientos, CFRP) y algoritmo de puntuación técnica basado en la mitigación de deriva y vidas salvadas.
- Proveer un Drawer colapsable para viewports móviles (< 640px) usando CSS Tailwind puro, permitiendo alternar entre el lienzo 3D a pantalla completa y el panel de control de excitación y refuerzos.
- Actualizar la suite en `src/tests/runAllTests.ts` con nuevos tests que cubran la transferencia intermodular y la coherencia de los retos sísmicos.

**Non-Goals:**
- No se reescribirá el motor de simulación 2D existente de Canvas HTML5.
- No se incorporarán dependencias externas pesadas o servicios cloud; todo opera de manera offline y determinista con TypeScript puro y React Three Fiber.
- No se alterará el esquema de base de datos ni los endpoints HTTP de la API REST de Express más allá de soportar las cargas útiles de los retos históricos.

## Decisions

### Decisión 1: Canal de Comunicación Intermodular (Callback + LocalStorage)
- **Alternativa A**: Context API global o Redux / Zustand.
- **Alternativa B (Elegida)**: Paso de propiedades y callback en `App.tsx` combinado con sincronización en `localStorage` (`siurprov_active_bench_import`).
- **Justificación**: Mantiene la arquitectura ligera del proyecto sin introducir nuevas dependencias de gestión de estado, respetando los estándares de código existentes y garantizando persistencia ante recarga accidental de la página.

### Decisión 2: Modelado Espectral de Sismos Históricos Venezolanos
- **Alternativa A**: Archivos pesados de series de tiempo de acelerogramas crudos (múltiples megabytes).
- **Alternativa B (Elegida)**: Definición paramétrica sintética basada en registros reales de FUNVISIS y la norma COVENIN 1756:
  - **Cariaco 1997 (Mw 6.9)**: Falla de San Sebastián / El Pilar, PGA 0.55g, alta energía impulsiva, $f \approx 2.5\text{ Hz}$.
  - **Caracas 1967 (Mw 6.6)**: Efecto de cuenca profunda en Los Palos Grandes, PGA 0.35g, período de suelo largo, $f \approx 1.2\text{ Hz}$.
  - **El Tocuyo 1950 (Mw 6.2)**: Falla de Boconó, sismo superficial de alta aceleración destructiva inmediata, PGA 0.48g, $f \approx 4.0\text{ Hz}$.
- **Justificación**: Carga instantánea (cero bytes adicionales de descarga), determinismo matemático para pruebas unitarias y ejecución en tiempo real en WebGL a 60 FPS.

### Decisión 3: Arquitectura del Drawer Responsive en Móvil
- **Alternativa A**: Múltiples modales emergentes superpuestos.
- **Alternativa B (Elegida)**: Pestaña o *Bottom Sheet Drawer* fijado al borde inferior (`bottom-0 w-full`) con transición `translate-y` colapsable mediante botón táctil (`min-h-[44px]`).
- **Justificación**: Maximiza el área de renderizado del lienzo WebGL en smartphones y tablets, evitando que los controles de ingeniería bloqueen la visualización de los modos de vibración del edificio.

## Risks / Trade-offs

- **[Riesgo] Disparidad en número de niveles entre el modelo del simulador (variable 1-10 pisos) y la mesa sísmica (por defecto 3 niveles en Three.js)**:
  - *Mitigación*: La mesa sísmica adaptará dinámicamente el renderizado de niveles de 1 hasta 6 pisos en Three.js agrupando placas y columnas según el número de niveles importado, o normalizando a la escala visual óptima del viewport.
- **[Riesgo] Saturación de memoria WebGL al cambiar repetidamente entre pestañas**:
  - *Mitigación*: Asegurar que los componentes Three.js desmonten adecuadamente geometrías y materiales, utilizando la carga perezosa y reutilización de contextos de renderizado.
- **[Riesgo] Exceso de dificultad o desbalanceo en el presupuesto de gamificación**:
  - *Mitigación*: Parametrizar los costos y presupuestos con márgenes holgados que premien la buena ingeniería (ej. instalar aislamiento basal en suelos rígidos o muros de cortante en edificios flexibles).
