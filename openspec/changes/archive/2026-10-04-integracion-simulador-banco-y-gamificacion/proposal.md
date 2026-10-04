# Proposal

## Why
Actualmente, el Simulador Físico 2D/3D y el Banco de Pruebas Dinámico Sísmico funcionan en pestañas independientes sin comunicación directa de estado: cuando un usuario define una estructura (número de niveles, tipología estructural, tipo de suelo COVENIN) en el simulador, debe volver a calibrarla manualmente en el banco de pruebas. Asimismo, el banco de pruebas carece de un sistema de desafíos interactivos contextualizados en la sismicidad histórica venezolana con métricas de costo/beneficio y gamificación pedagógica, y en pantallas móviles los paneles de control fijos solapan la visualización 3D de la superestructura.

Esta propuesta unifica el flujo de trabajo entre ambos módulos mediante transferencia de estado en memoria y persistencia local, incorpora un modo de desafíos sismorresistentes históricos (Cariaco 1997, Caracas 1967, El Tocuyo 1950) con presupuesto de refuerzo y puntuación de supervivencia, y optimiza la experiencia responsive en dispositivos móviles mediante un cajón inferior (*bottom sheet drawer*) colapsable.

## What Changes
- **Transferencia directa Simulador ➔ Banco de Pruebas**: Se incorpora un botón de acción rápida `[Probar en Banco Sísmico]` en la barra de control del Simulador 2D/3D que transfiere la configuración estructural (niveles, masa, rigidez, suelo COVENIN) hacia la mesa vibradora sin recargar la página.
- **Modo Desafíos Históricos y Gamificación**: Se implementa en el Banco de Pruebas un selector de sismos históricos de Venezuela (Cariaco 1997 Mw 6.9, Caracas 1967 Mw 6.6, El Tocuyo 1950 Mw 6.2) con espectros calibrados, presupuesto de mitigación ($ virtual para instalar aisladores LRB, muros o CFRP) y cálculo de puntuación de desempeño (Supervivencia, Daño Residual Park-Ang, Eficiencia de Costo).
- **Control Responsive Colapsable en Móviles**: Se refactoriza la disposición de controles en dispositivos con viewport móvil (< 640px) para alojar los diales sísmicos y botones de refuerzo en un Drawer inferior deslizable, evitando que la superestructura 3D sea obstruida.
- **Ampliación de Pruebas Automatizadas**: Se extienden los tests unitarios e integrados en `src/tests/runAllTests.ts` para validar la transferencia de datos entre módulos, la integridad de los sismos históricos y las fórmulas de puntuación de la gamificación.

## Capabilities

### New Capabilities
<!-- No se requieren capacidades aisladas nuevas, se expanden las capacidades duraderas existentes -->

### Modified Capabilities
- `shake-table-bench`: Se añaden requerimientos de importación de estado desde el simulador, modo de desafíos históricos venezolanos con gamificación (puntuación y presupuesto) y adaptación responsive para controles móviles.
- `structure-3d-view`: Se añade el requerimiento de transferencia directa de geometría y parámetros geotécnicos hacia el banco de pruebas sísmico.

## Impact
- **Código afectado**:
  - `src/components/ShakeTableBench.tsx`: Inclusión del Drawer móvil, selector de desafíos históricos, medidor de presupuesto y puntuación gamificada, y receptor de parámetros importados.
  - `src/components/Structure3DView.tsx` / `src/App.tsx`: Botón de acción para despachar la estructura actual al Banco de Pruebas y navegación automática de pestaña.
  - `src/services/shakeTableEngine.ts`: Incorporación de acelerogramas/espectros históricos venezolanos y lógica de evaluación de retos.
  - `src/tests/runAllTests.ts`: Nuevos casos de prueba (TEST-22 y TEST-23) para flujo intermodular y gamificación.
- **Rendimiento y dependencias**: 100% código abierto y local, sin librerías externas de pago, compatible con Three.js / React 19 y ejecutable en modo offline.
