# SIURPROV - Simulador Urbano de Proyección para Venezuela

> **Plataforma interactiva geoespacial y de ingeniería civil para el análisis multi-amenaza, detección de urbanismos, simulación de construcciones proyectadas y existentes en el mapa a través del tiempo con datos de MapBiomas Venezuela.**

![Licencia MIT](https://img.shields.io/badge/License-MIT-emerald.svg)
![CI/CD Status](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions%20Passing-brightgreen.svg)
![Security](https://img.shields.io/badge/Security-Multi--Layer%20Audit%20Compliant-blue.svg)
![Portabilidad](https://img.shields.io/badge/Estudios-.siurprov%20Portable-amber.svg)
![Región](https://img.shields.io/badge/Regi%C3%B3n-Venezuela-yellow.svg)
![MapBiomas](https://img.shields.io/badge/Datos-MapBiomas%20Venezuela%20%7C%20RAISG-green.svg)

---

## 🌎 Propósito del Proyecto

**SIURPROV** (Simulador Urbano de Proyección para Venezuela) nace con el objetivo de democratizar la toma de decisiones territoriales y la ingeniería civil en Venezuela, integrando:

1. **Datos Geoespaciales Multitemporales de MapBiomas Venezuela**:
   - Seguimiento histórico de transiciones de suelo (1985–2023) y proyecciones a 2030, 2040 y 2050.
   - Cálculo del incremento en el coeficiente de escorrentía $C$ por pérdida de cobertura vegetal y avance de la urbanización informal en laderas.
2. **Simulación Física Multi-Amenaza Local en Tiempo Real**:
   - Sismos y terremotos según **COVENIN 1756:2019** (Zonas sísmicas 1 a 7, perfiles de suelo S1 a S4, espectros de aceleración, cortante basal $V_0$, derivas de entrepiso y análisis de segundo orden $P-\Delta$).
   - Aluviones y flujos de detritos (deslaves) con cálculo de empuje hidrodinámico y transporte de rocas.
   - Inundaciones y saturación freática.
   - Evaluación de estabilidad de taludes mediante factor de seguridad ($FS$ Bishop) y desplazamientos Newmark.
   - Evaluaciones de desempeño estructural según **FEMA 356 / ASCE 41**, estimación de días de inoperatividad (*downtime*) y cálculo de pérdidas económicas en USD.
3. **Portabilidad de Estudios Territoriales (`.siurprov`)**:
   - Los estudios computados localmente pueden exportarse en paquetes `.siurprov` (JSON con suma de comprobación criptográfica), importarse y compartirse libremente entre computadoras locales y despliegues en la nube sin pérdida de información ni dependencias privativas.
4. **Resiliencia y Facilidad de Uso para Todo Público**:
   - Diseñado para ser probado de forma sencilla hasta por personas con pocos conocimientos informáticos mediante scripts ejecutables con 1 solo clic.

---

## 🚀 Instalación y Pruebas Locales con 1 Solo Clic (Para Todo Público)

El proyecto incluye lanzadores automáticos para que cualquier estudiante, profesor de la UNERG, técnico de Protección Civil o evaluador pueda probarlo en su computadora:

### Opción 1: En Windows (Doble Clic)
1. Descargue o clone el repositorio en su computadora.
2. Haga **doble clic** sobre el archivo **`start-local.bat`**.
3. El script comprobará Node.js, instalará las dependencias si faltan, ejecutará el autodiagnóstico y **abrirá automáticamente el navegador en `http://localhost:3000`**.

### Opción 2: En Linux / macOS (1 Línea en Terminal)
```bash
./start-local.sh
```
El script verificará el entorno y abrirá su navegador predeterminado.

### Opción 3: Con Docker (Cero Instalación)
```bash
docker compose up
```

### Opción 4: Comandos Tradicionales
```bash
# 1. Clonar el repositorio
git clone https://github.com/frankalfonso1988/SIURPROV.git
cd SIURPROV

# 2. Instalar dependencias
npm install

# 3. Ejecutar suite de pruebas de integridad sismorresistente y seguridad
npm test

# 4. Iniciar el servidor local
npm run dev
```

---

## 🛡️ CI/CD & Auditoría de Seguridad Automatizada

El proyecto cuenta con un flujo completo de Integración y Entrega Continua (**CI/CD**) configurado en `.github/workflows/ci-cd.yml` que se dispara automáticamente en cada `push` o `pull_request` a GitHub:

1. **🔍 TypeScript Strict Typecheck & Linter**:
   - Validación estricta con `tsc --noEmit` sin supresiones inseguras de tipos (`any`).
2. **🧪 Civil Engineering & Boundary Test Suite (`npm test`)**:
   - Verifica períodos fundamentales, cortante basal COVENIN 1756, estabilidad de taludes Bishop y desplazamientos sísmicos Newmark.
3. **🛡️ Security Audit & SAST**:
   - Auditoría de vulnerabilidades con `npm audit`.
   - **Sanitización contra XSS e inyección de código**: escape de caracteres peligrosos en inputs del usuario.
   - **Defensa contra Prototype Pollution**: bloqueo de inyecciones en archivos de estudio `.siurprov`.
   - **Cuadrante Geoespacial WGS84**: restricción estricta dentro del territorio venezolano (0.5°N a 13.5°N, -74°O a -59°O).
   - **Verificación de Cabeceras HTTP de Seguridad**: CSP, X-Content-Type-Options, X-Frame-Options, Rate Limiter para prevenir DoS.
   - **Auditoría en Vivo**: Endpoint `/api/security/audit` para inspeccionar el estado del sistema en funcionamiento.
4. **⚖️ Verificación de Mención al Autor (MIT License)**:
   - Comprobación automatizada de que los estudios mencionen al autor y al repositorio.
5. **🚀 Production Build & Packaging**:
   - Generación de artefactos optimizados `dist/`.

---

## 📂 Formato de Estudio Interoperable (`.siurprov`)

Los estudios pueden ser exportados desde el botón **"Estudios (.siurprov)"** en la barra superior o desde el mapa interactivo:

```json
{
  "fileType": "SIURPROV_STUDY",
  "version": "1.3",
  "metadata": {
    "title": "Tragedia de Vargas 1999 (Macuto - Caraballeda)",
    "author": "Ing. Frank Sousa (frankalfonso1988@gmail.com)",
    "officialRepo": "https://github.com/frankalfonso1988/SIURPROV",
    "license": "MIT License",
    "checksum": "SIUR-VARGAS-1999"
  },
  "studyData": {
    "regionId": "caracas-vargas",
    "selectedYear": 1999,
    "scenario": { ... },
    "userPlacedBuildings": [ ... ],
    "computedEvaluationSummary": { ... }
  }
}
```

- **Checksum Criptográfico Determinístico**: asegura que ningún archivo sea manipulado o corrompido durante el intercambio entre computadoras locales o servidores en la nube.
- **Intercambio por Token Portátil (Base64)**: permite compartir estudios directamente por mensaje de texto, correo o portapapeles.

---

## 📚 Guía de Arquitectura, Ingeniería y Aprendizaje Autónomo

Para estudiantes, ingenieros y desarrolladores que deseen comprender a fondo el funcionamiento del código, auditar cambios en GitHub Desktop, preparar entrevistas técnicas o continuar desarrollando sin depender de suscripciones pagas de IA:

👉 **Consulte el manual maestro:** [`docs/ARQUITECTURA_Y_APRENDIZAJE.md`](docs/ARQUITECTURA_Y_APRENDIZAJE.md)

**Contenido pedagógico incluido:**
- 🗺️ **Mapa de 4 capas**: Presentación React 19/Three.js, Motores de Cálculo Puro COVENIN/FEMA, Backend Express blindado y CI/CD.
- 🏛️ **Patrones de Software**: *Clean Architecture*, Elevación de Estado (*State Lifting*), Funciones Puras e Integridad Criptográfica Offline-First.
- 🔍 **Lectura Inversa de Diffs**: Cómo auditar commits en GitHub Desktop (Tipos ➔ Servicios ➔ UI ➔ Tests) para aprender programando.
- ⚡ **Desarrollo sin Costos**: Configuración paso a paso de modelos locales gratuitos con **Ollama** (`qwen2.5-coder:7b`) y depuración autónoma con el compilador (`npx tsc --noEmit`) y la suite (`npm test`).
- 💼 **Banco de 10 Preguntas y Respuestas para Entrevistas Laborales**: Justificaciones de diseño para defender este proyecto en procesos de selección técnica.

---

## 👤 Autor y Contacto

- **Autor:** Ing. Frank Sousa (`frankalfonso1988@gmail.com`)
- **Grado Académico:** Ingeniero en Informática (UNERG, Promoción 2025)
- **Alma Máter:** Universidad Nacional Experimental de los Llanos Centrales Rómulo Gallegos (UNERG)
- **Ciudad:** San Juan de los Morros, Estado Guárico, Venezuela
- **Repositorio Oficial:** [github.com/frankalfonso1988/SIURPROV](https://github.com/frankalfonso1988/SIURPROV)
- **Licencia:** MIT (Open Source)
- **Memoria Técnica y Arquitectura:** Consulte [`docs/MEMORIA_TECNICA.md`](docs/MEMORIA_TECNICA.md) para el informe exhaustivo de ingeniería de software, matrices legales y suite de testing.

---

## 📜 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** estándar (ver [LICENSE](LICENSE)).

Se agradece, sin que sea requisito, mencionar al autor original (**Ing. Frank Sousa**) y el repositorio (https://github.com/frankalfonso1988/SIURPROV) en trabajos derivados.
