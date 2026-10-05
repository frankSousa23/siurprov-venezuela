# Proposal

## Why

Para proyectar a SIURPROV como una propuesta científica y de ingeniería civil madura y competitiva rumbo al **Premio MapBiomas 2027**, el sistema debe trascender la simulación en pantalla y ofrecer informes técnicos exportables con métricas multitemporales de cobertura y riesgo. Asimismo, debido a la realidad operativa de cortes eléctricos diarios prolongados en Venezuela, el sistema requiere un blindaje de persistencia reactiva que salve el estado de trabajo en tiempo real para que ningún apagón provoque pérdida de datos ni interrumpa el avance del usuario.

## What Changes

- **Persistencia Reactiva Continua y Tolerancia a Apagones (`crash-resilience-session`)**:
  - Monitoreo y auto-guardado en tiempo real en `localStorage` de cada modificación de estudio, coordenadas de edificios en el mapa territorial, parámetros de amenaza y estado del banco sísmico.
  - Detección de sesión interrumpida al iniciar la aplicación, ofreciendo al usuario restaurar instantáneamente el último estado de trabajo previo al corte eléctrico.
- **Generador y Exportador de Informes Técnicos Certificados (`mapbiomas-reporting`)**:
  - Módulo de generación de informes de ingeniería y riesgo territorial en formato estructurado (HTML modal e imprimible / Markdown exportable), integrando tablas de transición de cobertura MapBiomas (1985–2050), evolución del coeficiente de escorrentía $C$, cálculo de cortante basal COVENIN 1756, estimación de daños en USD y citas a RAISG.
- **Ampliación del Catálogo de Regiones Emblemáticas de Venezuela**:
  - Incorporación en `src/data/venezuelaRegions.ts` de nuevas regiones con series multitemporales y fallas sismogénicas calibradas: Los Andes (Mérida / Táchira - Falla de Boconó), Macizo Oriental (Sucre / Monagas - Falla de El Pilar), Costa Oriental del Lago de Maracaibo (Zulia - subsidencia e inundación lacustre) y Cuenca del Río Caroní (Bolívar - transición minera/forestal).
- **Ampliación de Pruebas Automatizadas CI/CD**:
  - Incorporación de **TEST-24** (Autoguardado, persistencia reactiva y recuperación tras fallo eléctrico) y **TEST-25** (Generador de memorias de cálculo e integridad de matrices multitemporales MapBiomas) en `src/tests/runAllTests.ts`.

## Capabilities

### New Capabilities
- `mapbiomas-reporting`: Generación, formateo y exportación de informes técnicos de ingeniería y riesgo territorial basados en transiciones de cobertura MapBiomas y normativas sismorresistentes COVENIN 1756.
- `crash-resilience-session`: Blindaje de sesión con almacenamiento reactivo continuo en el navegador y detección/recuperación automática de estado tras interrupciones repentinas de energía eléctrica.

### Modified Capabilities
<!-- No se modifican requisitos de especificaciones previas; se añaden capacidades modulares complementarias -->

## Impact

- **Código Afectado**:
  - `src/App.tsx`: Orquestación de auto-guardado en tiempo real y banner de recuperación tras apagón.
  - `src/data/venezuelaRegions.ts`: Nuevas regiones y matrices de series temporales MapBiomas.
  - `src/components/TechnicalReportModal.tsx`: Generación visual y exportación de informes formateados.
  - `src/services/studyStorage.ts`: Métodos de respaldo reactivo y generación de estructura de reporte técnico.
  - `src/tests/runAllTests.ts`: Incorporación de TEST-24 y TEST-25 (totalizando 25 pruebas).
- **Dependencias**: Cero dependencias npm nuevas. 100% código abierto y offline-first.
