# Design

## Context

SIURPROV se compone de una arquitectura desacoplada en cuatro capas fundamentales:
1. **Motores de Cálculo Puro** (`src/services/`): Sin dependencias del DOM ni de React, ejecutables tanto en navegador como en Node.js.
2. **Presentación Reactiva y 3D** (`src/components/`, `src/App.tsx`): Orquestación de estado, Three.js / React Three Fiber y retroalimentación interactiva.
3. **Servidor y API REST** (`src/server/app.ts`, `server.ts`): Endpoints de validación, auditoría de seguridad y cálculo espejado.
4. **Batería de Pruebas Automatizadas** (`src/tests/runAllTests.ts`): 23 pruebas CI/CD que verifican física, criptografía y contratos.

Para que esta base sirva como trampolín de aprendizaje y defensa profesional, la documentación debe articularse en dos niveles: un manual conceptual maestro en Markdown y anotaciones técnicas JSDoc directamente en el código fuente.

## Goals / Non-Goals

**Goals:**
- Elaborar `docs/ARQUITECTURA_Y_APRENDIZAJE.md` como guía integral para comprender el sistema, estudiar patrones de desarrollo y preparar entrevistas técnicas.
- Documentar exhaustivamente con JSDoc los métodos y estructuras de los servicios (`structuralEngine.ts`, `shakeTableEngine.ts`, `studyStorage.ts`, `securitySanitizer.ts`), explicando conceptos de COVENIN 1756, FEMA 356 y defensa en profundidad.
- Documentar en los componentes clave (`App.tsx`, `CanvasSimulator.tsx`, `ShakeTableBench.tsx`) cómo funciona la elevación de estado (State Lifting), los hooks de ciclo de vida (`useEffect`, `useCallback`) y el loop de animación de Three.js.
- Explicar en `src/server/app.ts` las medidas de hardening de seguridad (Helmet, CORS, Rate Limit) y la validación cruzada.
- Actualizar `README.md` con un mapa mental del flujo de desarrollo y consejos prácticos para programar sin costos usando modelos locales y la terminal.

**Non-Goals:**
- No refactorizar ni modificar la lógica matemática, los umbrales de sismo ni las fórmulas de cálculo.
- No instalar nuevas dependencias de terceros en `package.json`.
- No alterar los contratos de API ni los payloads esperados.

## Decisions

### 1. Dualidad Documental: Manual Didáctico + JSDoc en el Código
- **Decisión**: Crear un documento global de arquitectura (`docs/ARQUITECTURA_Y_APRENDIZAJE.md`) y enriquecer el código fuente con bloques JSDoc estandarizados.
- **Razón**: Los tooltips del editor asisten al programador mientras navega por los archivos, mientras que el documento Markdown permite una lectura continua y reflexiva antes de abrir el editor.
- **Alternativas consideradas**: Crear solo un archivo wiki externo (se desincroniza del código rápidamente) o poner solo comentarios inline (dificulta tener una visión de conjunto).

### 2. Formato de Comentarios JSDoc Enfocados en el «Por Qué» y el «Cómo Interactúa»
- **Decisión**: Cada bloque comentado debe responder tres preguntas clave:
  1. ¿Qué problema resuelve este componente o método?
  2. ¿Con qué otros módulos o capas se conecta?
  3. ¿Cómo puede un desarrollador extender o escalar esta funcionalidad en el futuro?
- **Razón**: Comentar solo la sintaxis («esta función suma A y B») es redundante; el verdadero valor pedagógico radica en el contexto arquitectónico y de ingeniería.

### 3. Guía de Independencia de Modelos de Lenguaje
- **Decisión**: Incluir en la documentación una sección detallada sobre cómo trabajar con modelos locales abiertos (Ollama con Qwen 2.5 Coder) y cómo apoyarse en la consola del navegador, TypeScript (`npx tsc --noEmit`) y la batería de pruebas (`npm test`) para resolver problemas sin costo.
- **Razón**: Empoderar al desarrollador para que no quede bloqueado por falta de presupuesto o créditos de suscripción.

## Risks / Trade-offs

- **[Riesgo: Sobrecargar visualmente los archivos con comentarios extensos]**  
  → *Mitigación*: Ubicar los comentarios JSDoc en las declaraciones de interfaces, clases y funciones principales, utilizando explicaciones concisas y esquemáticas, manteniendo el cuerpo de las funciones limpio y legible.
- **[Riesgo: Desincronización ante cambios futuros]**  
  → *Mitigación*: Documentar invariantes y decisiones de diseño duraderas (Clean Architecture, desacoplamiento de estado) en lugar de detalles efímeros de implementación.
