# Tasks

## 1. Motor de Dinámica Estructural y Pruebas Unitarias

- [x] 1.1 Implementar `src/services/shakeTableEngine.ts` con el cálculo dinámico analítico de osciladores amortiguados bajo excitación en la base (frecuencia natural $\omega_n$, período amortiguado $T_d$, factor de amplificación dinámica $DMF$, pulso impulsivo de falla y derivas de entrepiso según COVENIN 1756) y verificar mediante ejecución sin errores de tipos.
- [x] 1.2 Modelar en `shakeTableEngine.ts` los 4 tipos de refuerzo estructural (muros de cortante, arriostramientos en X, encamisado CFRP y aisladores de base LRB) con factores de modificación de rigidez, masa, amortiguamiento y ductilidad según FEMA 356, verificando con pruebas unitarias en `src/tests/runAllTests.ts`.
- [x] 1.3 Incorporar en `src/tests/runAllTests.ts` casos de prueba automatizados para resonancia estructural ($DMF$ máximo cuando $f \approx f_n$), efectividad de aislamiento basal (reducción de aceleración $> 50\%$), mitigación por muros/arriostramientos y umbrales de daño de Park-Ang, verificando que `npm test` pase al 100%.

## 2. Componente de Mesa Sísmica 3D Interactiva y Telemetría

- [x] 2.1 Crear el componente `src/components/ShakeTableBench.tsx` con lienzo Three.js (`@react-three/fiber` y `@react-three/drei`), renderizando la mesa vibratoria, pórticos estructurales en 3D, deformación dinámica en `useFrame` y mallas visuales para los 4 refuerzos (paneles de muro, cruces en X de acero, envoltura CFRP de columnas y aisladores LRB en la base).
- [x] 2.2 Diseñar el panel de control interactivo con diales de solicitación física (aceleración sísmica PGA de 0.05g a 1.20g, frecuencia de 0.5 a 10 Hz, onda armónica vs. pulso impulsivo, velocidad de viento y socavación/licuefacción de apoyo), selectores de refuerzo conmutable y presets de prueba destructiva ("Resonancia Crítica", "Pulso de Falla", "Sismo Caracas 1967", "Suelo Licuable").
- [x] 2.3 Implementar el tablero de telemetría en tiempo real dentro de `ShakeTableBench.tsx`, presentando derivas de entrepiso ($\Delta/h$), aceleración en el tope, factor de amplificación dinámica, nivel de desempeño normativo COVENIN 1756 / FEMA 356 y respuesta visual de agrietamiento o colapso plástico.

## 3. Integración en App y Verificación de Flujo

- [x] 3.1 Integrar `ShakeTableBench` en `src/App.tsx` con carga diferida (`React.lazy`), extender el tipo `activeView` para soportar `'bench'`, y añadir el botón de acceso en la barra de navegación superior con icono temático.
- [x] 3.2 Ejecutar `npm run lint` (`tsc --noEmit`) y `npm test` verificando que no existan errores de tipos, advertencias de TypeScript ni regresiones en las suites existentes.
- [x] 3.3 Validar en el navegador la carga de la vista 3D del Banco de Pruebas, la respuesta fluida a los diales, la alternancia de los 4 refuerzos y la actualización dinámica de la telemetría.
