# SIURPROV — Manual Maestro de Arquitectura, Ingeniería y Aprendizaje Autónomo

> **Documento de Formación Técnica y Referencia de Software**  
> **Proyecto:** SIURPROV (Simulador Urbano de Proyección para Venezuela)  
> **Autor del Proyecto:** Ing. Frank Sousa (Ingeniero en Informática, UNERG 2025, San Juan de los Morros, Estado Guárico, Venezuela)  
> **Propósito:** Servir como guía pedagógica interactiva para aprender ingeniería de software fullstack, comprender el flujo íntimo del código, auditar cambios en GitHub Desktop, independizarse del uso obligatorio de suscripciones pagas de IA y preparar entrevistas laborales técnicas con solvencia.

---

## 1. Visión Panorámica y Mapa de Flujo del Sistema

SIURPROV es un sistema de grado de ingeniería civil e informática que combina simulación sísmica y multi-amenaza conforme a la norma sismorresistente **COVENIN 1756**, dinámica estructural **FEMA 356**, renderizado tridimensional interactivo con **Three.js** y un backend **Express** blindado con cabeceras de seguridad y criptografía.

El siguiente diagrama en texto plano (ASCII) resume el flujo de datos y las cuatro capas del sistema:

```
+-----------------------------------------------------------------------------------------------+
|                                    CAPA 1: NAVEGADOR / UI REACT                               |
|                                                                                               |
|   +---------------------------------------------------------------------------------------+   |
|   |                       src/App.tsx (Orquestador Raíz y Enrutador)                      |   |
|   |   - Mantiene el estado global: activeTab ('canvas' | 'shake-table' | 'map' | etc.)    |   |
|   |   - Estado compartido: importedBenchBuilding (edificio transferido al banco).         |   |
|   |   - Callbacks: handleSendToBench() y handleClearBenchImport().                         |   |
|   +-------------------------------------------+-------------------------------------------+   |
|                                               |                                               |
|               +-------------------------------+-------------------------------+               |
|               |                                                               |               |
|               v                                                               v               |
|   +---------------------------------------+       +---------------------------------------+   |
|   | src/components/CanvasSimulator.tsx    |       | src/components/ShakeTableBench.tsx    |   |
|   | (Simulador Estructural 2D/3D)         |       | (Banco de Pruebas Dinámico 3D)        |   |
|   |                                       |       |                                       |   |
|   | - Modela pisos, pórticos, viento y    | Export| - Recibe edificio transferido.        |   |
|   |   amenazas de suelo / inundación.     | ----> | - Simula frecuencias, resonancia DMF, |   |
|   | - Botón [🚀 Probar en Banco Sísmico]. |       |   aislamiento basal y sismos hist.    |   |
|   +-------------------+-------------------+       +-------------------+-------------------+   |
|                       |                                               |                       |
|                       +-----------------------+-----------------------+                       |
|                                               |                                               |
|                                               v                                               |
+-----------------------------------------------------------------------------------------------+
|                                 CAPA 2: SERVICIOS Y MOTORES PUROS                             |
|                                                                                               |
|   +-----------------------------------+   +-----------------------------------------------+   |
|   | src/services/structuralEngine.ts  |   | src/services/shakeTableEngine.ts              |   |
|   | - Fórmulas COVENIN 1756           |   | - Dinámica de osciladores acoplados           |   |
|   | - Período T1, Sa, Cortante Basal  |   | - Aislamiento LRB, CFRP, Muros, Arriostram.   |   |
|   | - Análisis P-Delta de 2do orden   |   | - Catálogo de Sismos Venezolanos y Retos      |   |
|   +-----------------------------------+   +-----------------------------------------------+   |
|   +-----------------------------------+   +-----------------------------------------------+   |
|   | src/services/studyStorage.ts      |   | src/services/securitySanitizer.ts             |   |
|   | - Empaquetado de estudios en JSON |   | - Sanitización XSS de cadenas de texto        |   |
|   | - Checksum SHA-256 y Base64       |   | - Bloqueo de Prototype Pollution (__proto__)  |   |
|   +-----------------------------------+   +-----------------------------------------------+   |
+-----------------------------------------------+-----------------------------------------------+
                                                | Peticiones HTTP /api/... (Fetch nativo)
                                                v
+-----------------------------------------------------------------------------------------------+
|                                    CAPA 3: SERVIDOR BACKEND                                   |
|                                                                                               |
|   +---------------------------------------------------------------------------------------+   |
|   |                   server.ts & src/server/app.ts (Node.js + Express)                   |   |
|   |   - Middlewares: helmet (cabeceras CSP/HSTS), cors (orígenes controlados),            |   |
|   |     express-rate-limit (defensa contra saturación DoS de 100 req/15min).              |   |
|   |   - Endpoint /api/simulate/full: Cálculo réplica en backend para clientes pesados.    |   |
|   |   - Endpoint /api/study/validate: Verificación de firma criptográfica de archivos.   |   |
|   |   - Endpoint /api/health & /api/security/audit: Monitoreo y diagnóstico del sistema.   |   |
|   +---------------------------------------------------------------------------------------+   |
+-----------------------------------------------+-----------------------------------------------+
                                                ^
                                                | Valida contratos, física y seguridad
+-----------------------------------------------+-----------------------------------------------+
|                                   CAPA 4: CI/CD & TESTING LOCAL                               |
|                                                                                               |
|   src/tests/runAllTests.ts: Batería integral de 23 pruebas ejecutadas con tsx en Node.js.     |
|   Verifica física COVENIN, estabilidad de taludes, defensas XSS, criptografía y dinámica.     |
+-----------------------------------------------------------------------------------------------+
```

---

## 2. Los Patrones de Arquitectura de Software Aplicados

Comprender los nombres y propósitos de los patrones utilizados te permitirá explicar el código con vocabulario técnico profesional:

### Patrón 1: Arquitectura Limpia y Separación de Responsabilidades (Clean Architecture)
- **¿Qué es?**: Las reglas de cálculo y física no deben depender del framework visual (React) ni de la pantalla.
- **En SIURPROV**: Archivos como `src/services/structuralEngine.ts` y `src/services/shakeTableEngine.ts` contienen **funciones puras**: reciben parámetros numéricos (`pgaG`, `massKg`, `heightM`) y devuelven estructuras numéricas (`drift`, `shearBaseKn`, `performanceLevel`).
- **Beneficio profesional**: Si mañana se decide cambiar React por Vue, Svelte, una app móvil en React Native o un script de terminal, los motores de cálculo no sufren ningún cambio. Además, se prueban en milisegundos con `npm test` sin necesidad de levantar un navegador.

### Patrón 2: Elevación del Estado (State Lifting)
- **¿Qué es?**: En React, los componentes hijos no pueden pasarse datos horizontalmente de forma directa. Si el componente A (`CanvasSimulator`) genera un dato que necesita el componente B (`ShakeTableBench`), el dato debe «elevarse» al padre común más cercano (`App.tsx`).
- **En SIURPROV**:
  1. `CanvasSimulator` define la función `handleExportToBench()`, empaquetando el edificio en un `ImportedBuildingConfig`.
  2. Llama a la prop `onSendToBench(config)`.
  3. En `App.tsx`, la función `handleSendToBench` recibe el objeto, lo guarda en el estado reactivo `importedBenchBuilding`, lo respalda en `localStorage` con la clave `siurprov_active_bench_import` y cambia la pestaña activa a `'shake-table'`.
  4. `App.tsx` le inyecta `importedBenchBuilding` a `ShakeTableBench` mediante sus props.

### Patrón 3: Persistencia Defensiva Offline-First con Integridad Criptográfica
- **¿Qué es?**: La aplicación debe funcionar sin conexión a internet, pero no puede confiar ciegamente en lo que el usuario guarde o modifique en su disco local.
- **En SIURPROV**: En `src/services/studyStorage.ts`:
  1. Los datos del estudio se serializan en JSON normalizado.
  2. Se calcula un hash criptográfico **SHA-256** de la carga útil (`payloadHash`).
  3. Si un usuario abre las herramientas de desarrollador o edita el archivo `.siurprov` a mano alterando un valor, al intentar importarlo el método `importStudyFromBase64()` recalcula el hash; si no coincide, aborta la carga notificando que el archivo fue manipulado.

### Patrón 4: Loop de Animación y Desacoplamiento Gráfico en Three.js
- **¿Qué es?**: Los modelos 3D se dibujan a 60 cuadros por segundo (FPS). Si el estado de React se actualizara 60 veces por segundo con `setState`, la aplicación colapsaría por exceso de re-renderizados (*re-render thrashing*).
- **En SIURPROV**: Three.js maneja su propio bucle en `useFrame((state, delta) => { ... })`. La oscilación se aplica directamente a las propiedades `.position.x` o `.rotation.z` de las mallas (`ref.current`), mientras que React solo se entera de los cambios cuando el usuario mueve un dial o cuando se emite una telemetría periódica.

---

## 3. Guía de Lectura Inversa en GitHub Desktop (Aprender de los Diffs)

Cuando abras GitHub Desktop o revises un commit en Git, **no leas el código en el orden en que aparece en la pantalla**. Sigue esta técnica de 4 pasos:

1. **Paso 1: Identifica las Interfaces de Datos (`src/types/index.ts` o `services/*.ts`)**
   - Pregúntate: *«¿Qué forma tienen los datos nuevos?»*.
   - Por ejemplo, al leer la interfaz `HistoricalQuakeChallenge`, descubres que un reto sísmico tiene `magnitudeMw`, `pgaG`, `budgetUsd` y `baseOccupants`. Entendiendo el dato, ya sabes qué información viajará por todo el sistema.

2. **Paso 2: Lee las Funciones Puras en `src/services/`**
   - Pregúntate: *«¿Qué entra a esta función y qué sale de ella?»*.
   - Por ejemplo, `evaluateChallenge(challenge, retrofits)` recibe el reto y los refuerzos activos, descuenta los costos del presupuesto y devuelve si el edificio sobrevivió o colapsó. Es matemática pura sin distracciones visuales.

3. **Paso 3: Observa la Conexión de Estado en la UI (`src/components/`)**
   - Pregúntate: *«¿Qué botón o evento del usuario llama a esta función?»*.
   - Busca los manejadores `onClick` o `onChange`. Verás cómo un clic en `[🚀 Probar en Banco Sísmico]` dispara el callback y cómo los `useState` guardan la respuesta.

4. **Paso 4: Lee los Tests en `src/tests/runAllTests.ts`**
   - La prueba es el ejemplo perfecto de uso. En TEST-22 y TEST-23 puedes ver en menos de 20 líneas de código cómo se instancia el objeto, cómo se llama al motor y qué afirmaciones (`throw new Error(...)`) garantizan que el código funciona.

---

## 4. Independencia Tecnológica: Desarrollar sin Suscripciones de Pago

No necesitas pagar una suscripción de 20 USD mensuales para seguir creando software o aprendiendo. El ecosistema moderno de código abierto te ofrece todas las herramientas de forma gratuita:

### A. Modelos Locales en tu PC con Ollama (100% Offline y Gratis)
1. Descarga e instala [Ollama](https://ollama.com/) en tu computadora.
2. Abre una terminal (PowerShell o Bash) y ejecuta:
   ```bash
   ollama run qwen2.5-coder:7b
   ```
   *(O bien `ollama run deepseek-coder:6.7b`)*.
3. Este modelo vive en tu disco duro, corre en tu procesador/tarjeta gráfica, no requiere conexión a internet y puedes hacerle preguntas sobre código, sintaxis de TypeScript o algoritmos sin límites ni costos.

### B. Capas Gratuitas de APIs (Free Tiers)
- **Google AI Studio (Gemini API Free Tier)**: Ofrece acceso gratuito a modelos Gemini con límites generosos por minuto sin requerir tarjeta de crédito.
- **Groq Cloud (Console)**: Ofrece inferencia ultrarrápida gratuita de modelos abiertos (Llama 3.3, Qwen) compatible con la API de OpenAI.

### C. El Compilador y la Terminal como tus Mejores Mentores
Aprender a interpretar los mensajes de la terminal es la habilidad que distingue a un desarrollador profesional:

- **Comprobación de Tipos**:
  ```bash
  npm run lint
  # O directamente: npx tsc --noEmit
  ```
  TypeScript examina cada variable, cada argumento y cada retorno. Si dice: `Property 'pgaG' is missing in type...`, no necesitas una IA para saber qué arreglar: te está indicando exactamente la línea y la propiedad faltante.

- **Batería de Pruebas Automatizadas**:
  ```bash
  npm test
  ```
  Al ejecutar este comando, tus 23 pruebas corren en menos de 2 segundos. Si modificas algo y un test falla, la terminal te indicará el motivo exacto (por ejemplo: *«El detector de resonancia no se activó a f = fn»*).

- **Herramientas de Desarrollador del Navegador (`F12`)**:
  - Pestaña **Console**: Revela advertencias de React, errores de sintaxis o promesas no resueltas.
  - Pestaña **Network**: Muestra las llamadas que hace el navegador a `/api/simulate/full`, su tiempo de respuesta y el código de estado HTTP (200 OK, 429 Too Many Requests, 500 Error).

---

## 5. Banco de 10 Preguntas y Respuestas para Entrevistas Laborales

Cuando te postules a un trabajo de desarrollador Frontend, Backend o Fullstack (medio tiempo o tiempo completo), puedes presentar este proyecto en tu portafolio. Estas son las 10 preguntas técnicas clave que los entrevistadores suelen hacer y cómo responderlas basándote en SIURPROV:

### 1. ¿Cómo estructuraste la arquitectura del proyecto y por qué?
> *«Apliqué una arquitectura desacoplada en cuatro capas inspirada en Clean Architecture: la capa de dominio contiene motores de cálculo puro en TypeScript sin dependencias del DOM ni de React; la capa de presentación orquesta vistas en React 19 y Three.js; la capa de backend en Express ofrece cálculo réplica y validación criptográfica; y una suite automatizada de 23 pruebas valida la física y seguridad en CI/CD. Esto garantiza que la lógica matemática sea 100% reutilizable y testeable de forma aislada.»*

### 2. ¿Cómo resolviste la comunicación entre componentes que no tienen relación directa de padre-hijo?
> *«Utilicé el patrón de elevación de estado (State Lifting) centralizado en `App.tsx`. Cuando el simulador 2D/3D empaqueta una estructura para el banco de pruebas, no intenta escribir directamente en el banco; en su lugar, invoca un callback hacia `App.tsx`, quien actualiza su estado reactivo, persiste una copia en `localStorage` para tolerar recargas y le suministra la estructura al banco sísmico mediante props.»*

### 3. ¿Cómo evitaste problemas de rendimiento al renderizar escenas 3D en React con Three.js?
> *«Desacoplé el bucle de renderizado gráfico de la reactividad de React. En lugar de actualizar el estado de React a 60 FPS con `useState` (lo que saturaría el reconciliador de React), utilicé el hook `useFrame` de `@react-three/fiber` para mutar directamente las matrices de transformación y posiciones de los meshes en WebGL mediante referencias (`useRef`), reservando los estados de React únicamente para eventos discretos como el movimiento de diales o botones de refuerzo.»*

### 4. ¿Qué medidas de ciberseguridad implementaste en el cliente y en el servidor?
> *«Implementé defensa en profundidad: en el servidor utilicé Helmet para inyectar cabeceras de seguridad HTTP estrictas (CSP, HSTS, X-Content-Type-Options), CORS restrictivo y limitador de peticiones (Rate Limiting de 100 peticiones por cada 15 minutos). En el cliente, desarrollé un servicio `SecuritySanitizer` que purga ataques XSS e impide la contaminación de prototipos (`Prototype Pollution`) eliminando llaves peligrosas como `__proto__` o `constructor` al cargar archivos externos.»*

### 5. ¿Cómo garantizas la integridad de los datos guardados por el usuario sin depender de una base de datos central?
> *«Utilizo una arquitectura offline-first con verificación criptográfica. Al guardar o exportar un estudio, el sistema empaqueta los parámetros del suelo y de la estructura y computa un hash SHA-256 de la carga útil. Al importar el archivo codificado en Base64, el sistema recalcula el hash antes de deserializarlo; si el contenido fue adulterado o corrompido, la firma no coincide y el estudio es rechazado automáticamente.»*

### 6. ¿Qué diferencia técnica hay entre una función pura y una con efectos secundarios (Side Effects)?
> *«Una función pura, como `computeFundamentalPeriod` en `structuralEngine.ts`, dada la misma entrada siempre devuelve exactamente la misma salida y no altera nada fuera de su ámbito (no modifica el DOM, no hace peticiones de red ni altera variables globales). Un efecto secundario es cualquier interacción con el exterior, como guardar en `localStorage`, escuchar eventos de teclado o hacer peticiones `fetch`, los cuales en React se aíslan deliberadamente dentro de hooks `useEffect`.»*

### 7. ¿Cómo abordaste el desarrollo responsive para pantallas táctiles y móviles?
> *«En el banco de pruebas dinámico, una pantalla móvil pequeña (< 640px) no tiene espacio para mostrar simultáneamente los diales de aceleración, la botonera de refuerzo y el lienzo 3D. Diseñé un panel colapsable inferior tipo 'Bottom Sheet Drawer' táctil con tirador deslizante (`overflow-y-auto`). Cuando el usuario ajusta parámetros, despliega el cajón; cuando desea inspeccionar la oscilación tridimensional, lo colapsa con un toque, liberando el 100% del viewport.»*

### 8. ¿Por qué decidiste escribir pruebas unitarias personalizadas en lugar de depender únicamente de pruebas manuales en el navegador?
> *«En software de ingeniería sismorresistente, una pequeña variación en una fórmula puede comprometer vidas humanas o arrojar resultados absurdos. Creé una batería de 23 pruebas automatizadas (`npm test`) que se ejecutan en menos de 2 segundos en el entorno de integración continua (CI/CD). Estas pruebas validan casos límite: resonancia crítica a $f = f_n$, comportamiento ante viento huracanado de 150 km/h, factores de seguridad de taludes saturados según el método de Bishop y defensa contra payloads maliciosos.»*

### 9. ¿Cómo manejas el ciclo de vida de los datos al sincronizar cliente y servidor?
> *«Diseñé el endpoint `/api/simulate/full` en Express para que consuma exactamente el mismo motor de física `StructuralSimulationEngine` que el cliente. En la prueba TEST-16, el sistema ejecuta la simulación localmente y simultáneamente hace una petición HTTP al servidor con los mismos parámetros, comprobando mediante aserciones que la deriva, la aceleración espectral y el cortante basal calculados por el servidor coincidan con una tolerancia de 0.001 con el cliente.»*

### 10. ¿Cómo planificas y gestionas cambios complejos en un equipo de desarrollo?
> *«Utilizo la metodología basada en especificaciones abiertas (OpenSpec) con el flujo `spec-driven`. Cada cambio se descompone en: 1) `proposal.md` para justificar el valor de negocio y el alcance, 2) especificaciones ejecutables con escenarios `WHEN / THEN`, 3) `design.md` para documentar compensaciones técnicas y decisiones de arquitectura, y 4) `tasks.md` con verificación atómica. Esto evita la deuda técnica y garantiza que el código nuevo esté siempre respaldado por pruebas.»*

---

## 6. Puntos de Expansión y Escalabilidad Futura

Si en el futuro deseas seguir expandiendo este proyecto (con o sin ayuda de herramientas de desarrollo), estas son las rutas naturales de evolución:

1. **Integración con Modelos Digitales de Elevación (DEM)**:
   - Conectar capas GeoTIFF del Instituto Geográfico de Venezuela para calcular pendientes reales de terreno en cualquier municipio del país.
2. **Exportación de Informes Profesionales en PDF**:
   - Incorporar generación de memorias de cálculo en formato PDF descargable con firmas digitales y gráficos vectoriales de los espectros elásticos.
3. **Ampliación de Tipologías Estructurales**:
   - Añadir estructuras de mampostería confinada tradicional, perfiles tubulares estructurales (Conduven) y galpones industriales de acero.
4. **Modo Multijugador Educativo**:
   - Permitir que varios estudiantes compitan simultáneamente en una sala WebSocket para diseñar el refuerzo más económico y eficiente frente a un sismo histórico.

---
*Fin del Manual de Arquitectura y Aprendizaje Autónomo de SIURPROV.*
