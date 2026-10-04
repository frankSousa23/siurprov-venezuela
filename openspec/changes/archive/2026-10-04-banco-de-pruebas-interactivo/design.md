# Design

## Context

SIURPROV cuenta con componentes de simulación física estática y espectral (`structuralEngine.ts`), vistas 2D sobre Canvas y una vista 3D orbital preliminar (`Structure3DView.tsx`). Sin embargo, no dispone de un banco de ensayos dinámicos interactivo ("Shake Table") donde el usuario pueda manipular en vivo las frecuencias armónicas, aceleraciones del suelo y amenazas acopladas, ni experimentar de forma gamificada con contramedidas de refuerzo estructural (muros de cortante, arriostramientos en X, encamisado CFRP y aisladores de base). Para más detalles sobre la motivación, véase `proposal.md` y `specs/shake-table-bench/spec.md`.

## Goals / Non-Goals

**Goals:**
- Proporcionar una mesa sísmica interactiva 3D con oscilación física continua en tiempo real mediante Three.js y React Three Fiber.
- Permitir la manipulación fluida de diales y deslizadores para: aceleración máxima del suelo (PGA), frecuencia de excitación ($f$ en Hz), velocidad de viento (km/h) y licuefacción/pérdida de soporte del suelo.
- Implementar un catálogo interactivo de 4 refuerzos estructurales conmutables (muros de cortante, arriostramientos de acero en X, encamisado CFRP de columnas y aisladores elastoméricos LRB en la base) con representación visual 3D inmediata y recalculo dinámico de propiedades mecánicas.
- Presentar telemetría en tiempo real: deriva de entrepiso ($\Delta/h$), factor de amplificación dinámica ($DMF$), índice de daño y alerta de colapso plástico según COVENIN 1756 y FEMA 356.
- Desarrollar un motor matemático puro y desacoplado (`src/services/shakeTableEngine.ts`) con cobertura de pruebas unitarias al 100% en `src/tests/runAllTests.ts`.
- Incorporar presets de ensayo rápido (p. ej. "Resonancia Crítica", "Pulso de Falla Cercana", "Viento Huracanado", "Licuefacción Basal").

**Non-Goals:**
- No se implementará un solver de elementos finitos no lineal por paso de tiempo pesado (tipo OpenSees nativo o WebAssembly voluminoso), manteniendo el sistema 100% en TypeScript ligero en el navegador.
- No se añadirán servicios en la nube ni APIs propietarias; el sistema funciona de modo completamente offline y local.

## Decisions

### 1. Motor dinámico analítico en TypeScript (`src/services/shakeTableEngine.ts`)
- **Decisión**: Utilizar la formulación analítica exacta de osciladores dinámicos amortiguados bajo excitación en la base para calcular la respuesta en estado estacionario y transitorio:
  $$\omega_n = \sqrt{\frac{k_{eff}}{m_{eff}}}, \quad \xi_{eff}, \quad DMF = \frac{1}{\sqrt{(1 - \beta^2)^2 + (2\xi \beta)^2}}$$
  donde $\beta = \omega / \omega_n$.
- **Razón**: Permite ejecutar cálculos a 60 FPS en el cliente con cero latencia y garantiza que los algoritmos puedan ejecutarse en Node/headless durante `npm test` sin requerir contexto WebGL.
- **Alternativas**:
  - *Integración numérica por diferencias finitas en cada frame*: Puede sufrir inestabilidades numéricas si el delta de tiempo fluctúa.
  - *Solvers externos C++ compilados a WASM*: Aumentaría el tamaño del bundle, complicaría la construcción y violaría la simplicidad de mantenimiento.

### 2. Arquitectura de Escena 3D (`src/components/ShakeTableBench.tsx`)
- **Decisión**: Construir el componente usando `@react-three/fiber` y `@react-three/drei` con `React.lazy` para carga diferida.
- **Detalle de modelado**:
  - Base móvil (mesa vibratoria) que oscila horizontalmente según $x_g(t) = A_0 \sin(2\pi f t)$.
  - Superestructura modular de pórticos de concreto con vigas y columnas.
  - Refuerzos representados visualmente:
    - Muros de cortante: paneles sólidos de concreto con textura de hormigón entre columnas.
    - Arriostramientos en X: tubulares metálicos amarillos/rojos cruzados en las bahías.
    - CFRP: recubrimiento negro fibra de carbono brillante en las zonas de confinamiento de columnas.
    - Aisladores LRB: cilindros elastoméricos de caucho y plomo intercalados entre la mesa sísmica y el primer nivel.
- **Alternativas**: Renderizar en 2D Canvas exclusivamente. Descartado porque el usuario solicitó explícitamente simuladores 3D más interactivos y gamificados.

### 3. Matriz de Modificación de Rigidez y Amortiguamiento
- **Decisión**: Cada refuerzo aplica factores de modificación rigurosos según literatura sismorresistente (FEMA 356, ATC-40 y COVENIN 1756):
  - **Muros de cortante**: Incremento de rigidez $k \times 2.8$, aumento de masa $+20\%$, amortiguamiento $\xi + 2\%$. Reduce derivas drásticamente pero rigidiza la estructura elevando su frecuencia natural.
  - **Arriostramientos en X**: Incremento de rigidez $k \times 1.9$, masa $+5\%$, amortiguamiento $\xi + 4\%$.
  - **Encamisado CFRP**: Confinamiento de columnas sin aporte masivo de rigidez lateral, incrementa la ductilidad y la deriva última admisible $\Delta_u$ en $+75\%$, evitando la rotura frágil por cortante.
  - **Aisladores LRB en la base**: Desacopla la superestructura; el período fundamental se traslada a $T \approx 2.0\text{ s}$ ($f_n \approx 0.5\text{ Hz}$), disipando energía con $\xi = 18\%$, lo que mitiga las aceleraciones y fuerzas inerciales en la superestructura en más del $60\%$.

### 4. Integración en `src/App.tsx` y Navegación
- **Decisión**: Extender el tipo `activeView` para incluir `'bench'` y añadir el botón correspondiente en la barra de navegación superior con icono temático (`Activity` o `Hammer` / `Wrench`), permitiendo alternar fluidamente entre el Banco de Pruebas, el Simulador Físico, el Visor MapBiomas y la Escuela.

## Risks / Trade-offs

- **[Riesgo] Sobrecarga de GPU/CPU en dispositivos móviles o equipos sin aceleración de hardware.**
  → *Mitigación*: Geometrías low-poly optimizadas (boxGeometry y cylinderGeometry primitivas), sombras deshabilitadas por defecto y limitación de fps con `useFrame` sin re-renders innecesarios de React.
- **[Riesgo] Fluctuación visual de colapso plástico en Three.js.**
  → *Mitigación*: Aplicar interpolación suave (lerp) en las deformaciones y rotaciones nodales, activando efectos de alerta con partículas o cambio de color de materiales (de gris/azul a rojo fuego cuando $\Delta/h > 0.025$).

## Migration Plan

- La adición es completamente modular y no rompe ninguna funcionalidad existente ni modifica contratos previos.
- No hay migraciones de base de datos ni breaking changes.

## Open Questions

- *Ninguna pregunta abierta*: El alcance, las fórmulas y la integración visual están plenamente delimitados.
