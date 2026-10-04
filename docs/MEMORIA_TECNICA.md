# MEMORIA TÉCNICA, CICLO CREATIVO Y ARQUITECTURA DE SOFTWARE
## SIURPROV — Simulador Urbano de Proyección para Venezuela (v1.2)

**Autor:** Ing. Frank Sousa (`frankalfonso1988@gmail.com`)  
**Título Académico:** Ingeniero en Informática (UNERG, Promoción 2025)  
**Institución:** Universidad Nacional Experimental de los Llanos Centrales Rómulo Gallegos  
**Ubicación:** San Juan de los Morros, Estado Guárico, Venezuela  
**Licencia de Código:** MIT License (Open Source)  
**Licencia de Datos Geoespaciales:** CC BY-SA 4.0 (MapBiomas Venezuela / RAISG)  

---

## 1. RESUMEN EJECUTIVO Y PROPÓSITO INGENIERIL

**SIURPROV** nace como una plataforma de ingeniería computacional diseñada para democratizar el análisis de vulnerabilidad estructural, la detección de urbanismos y la proyección de desastres socionaturales en Venezuela. Su propósito central es fusionar la **Ingeniería en Informática** (arquitecturas reactivas, flujos de datos asíncronos y modelado numérico en TypeScript) con la **Ingeniería Civil y Geotécnica Venezolana** (Normas COVENIN 1756:2019, 1753:2006 y datos satelitales multitemporales de MapBiomas Venezuela).

El sistema permite auditar el territorio nacional, simular solicitaciones simultáneas (sismos, deslaves de detritos, inundaciones torrenciales y deslizamiento de laderas) y probar el emplazamiento de construcciones proyectadas para evaluar en tiempo real si resistirán o colapsarán con el paso del tiempo (1985–2050).

---

## 2. MATRIZ EXHAUSTIVA DE TECNOLOGÍAS IMPLEMENTADAS

| Componente | Tecnología | Versión | Rol Arquitectónico y Justificación Técnica |
| :--- | :--- | :--- | :--- |
| **Lenguaje Core** | TypeScript | 7.0+ | Tipado estático estricto, interfaces físicas y prevención de errores en tiempo de compilación. |
| **Librería UI** | React | 19.0.1 | Renderizado concurrente, hooks desacoplados y gestión reactiva de estado territorial. |
| **Bundler & Dev** | Vite | 8.3.0 | Empaquetado ultra-rápido, ESM nativo y middleware en caliente. |
| **Estilos & Diseño** | Tailwind CSS | 4.3.3 | Sistema de diseño atómico, tokens de ingeniería en modo oscuro y adaptabilidad 100% móvil. |
| **Motor Gráfico 2D/3D** | HTML5 Canvas | W3C Standard | Bucle de física estructural a 60 FPS con cálculo elasto-plástico y flujo de partículas. |
| **Motor Cartográfico** | SVG Dinámico | W3C Standard | Coordenadas WGS84, renderizado vectorial y sondeo interactivo de parcelas sin librerías privativas. |
| **Servidor / Backend** | Express | 4.21.2 | API REST para endpoints numéricos, especificación OpenAPI y proxy de peritaje forense. |
| **Inferencia IA** | @google/genai | 2.4.0 | Integración con modelos Gemini para auditorías forenses automatizadas en lenguaje natural. |
| **Estándar Geoespacial** | GeoJSON (RFC 7946) | IETF | Formato abierto de intercambio de datos compatible con QGIS, Google Earth y ArcGIS. |
| **Persistencia Local** | localStorage API | Web Storage | Resiliencia ante cortes eléctricos; guarda construcciones proyectadas en el navegador. |

---

## 3. MATRIZ LEGAL DE LICENCIAS Y PERMISOS DE USO

1. **Software SIURPROV (Licencia MIT)**:
   - Permite el uso, copia, modificación, distribución y sublicenciamiento gratuito sin regalías.
   - **Mención de cortesía**: se agradece mencionar al **Ing. Frank Sousa** (`frankalfonso1988@gmail.com`) y el repositorio `https://github.com/frankalfonso1988/SIURPROV` en trabajos derivados. No es una condición adicional de la licencia.
2. **Datos Geoespaciales de MapBiomas Venezuela & RAISG (CC BY-SA 4.0)**:
   - Los rásteres multitemporales de cobertura y uso del suelo corresponden a la iniciativa científica MapBiomas Venezuela y la Red Amazónica de Información Socioambiental Georreferenciada.
   - Su utilización en SIURPROV se realiza bajo los principios de atribución científica y educación pública abierta.
3. **Normas Técnicas Venezolanas (COVENIN / FONDONORMA)**:
   - Se implementan las formulaciones físico-matemáticas de **COVENIN 1756:2019** (*Edificaciones Sismorresistentes*), **COVENIN 1753:2006** (*Estructuras de Concreto Armado*) y **COVENIN 2002/2003** (*Acciones del Viento y Cargas*). Su aplicación en código abierto tiene fines estrictamente científicos, de prevención de riesgos y protección a la vida.
4. **Catálogo Sismológico FUNVISIS**:
   - Trazas de fallas activas (San Sebastián, Boconó, El Pilar, Oca-Ancón, La Victoria y Serranía del Interior) calibradas con la cartografía pública de la Fundación Venezolana de Investigaciones Sismológicas.

---

## 4. CICLO DE PROCESO CREATIVO Y ESCALABILIDAD EN 4 FASES

```
[FASE 1: Modelado Numérico COVENIN]
          │
          ▼
[FASE 2: Ingesta MapBiomas & Topografía]
          │
          ▼
[FASE 3: Emplazamiento & Simulación Dinámica]
          │
          ▼
[FASE 4: Resiliencia Offline & OpenAPI/Swagger]
```

- **Fase 1 (Fundamentos Físico-Matemáticos)**: Implementación determinista en TypeScript de espectros de respuesta elástica e inelástica ($S_a$), cortante basal ($V_0 = \frac{A_0 \cdot \alpha \cdot I}{R} \cdot W$), estabilidad de taludes por método de Bishop simplificado y empuje hidrodinámico de detritos.
- **Fase 2 (Ingesta Satelital MapBiomas & SIG)**: Cuantificación del coeficiente de escorrentía ponderado ($C$) en función de la deforestación y urbanización en cabeceras de cuencas entre 1985 y 2050.
- **Fase 3 (Emplazamiento de Nuevos Urbanismos)**: Desarrollo de la herramienta "Construir Aquí", que detecta al vuelo cota de elevación, pendiente, tipo de suelo y distancia a fallas en cualquier parcela de Venezuela.
- **Fase 4 (Resiliencia e Integración API)**: Arquitectura resiliente ante cortes eléctricos frecuentes (autoguardado en `localStorage`), consola interactiva OpenAPI / Swagger 3.0 y suite de pruebas automatizadas con el `SystemAuditorService`.

---

## 5. AUDITORÍA DE ROBUSTEZ Y RESILIENCIA DEL SISTEMA

1. **Tolerancia a Cortes Eléctricos (Offline First)**:
   - Todo el motor de cálculo físico y cartográfico corre 100% en el cliente sin requerir llamadas continuas al servidor.
   - Las construcciones creadas por el usuario persisten en memoria local serializada en JSON.
2. **Tolerancia a Fallos de Red / Ausencia de API Keys**:
   - Si no se cuenta con conexión a internet o credencial de Gemini para el endpoint `/api/audit`, el sistema conmuta instantáneamente a su **motor de peritaje determinista por reglas**, emitiendo un reporte técnico exacto y riguroso sin interrumpir la experiencia.
3. **Pruebas de Límites Numéricos (Boundary Condition Testing)**:
   - Aceleraciones sísmicas desde $0.05g$ hasta valores catastróficos de $1.20g$.
   - Pendientes desde $0^\circ$ (llanura) hasta $60^\circ$ (escarpe vertical).
   - Factores de Seguridad acotados matemáticamente ($FS > 0$) e Índices de Daño acotados en $0.0 \le DI \le 1.5$.

---

## 6. ESPECIFICACIÓN DE ENDPOINTS DE LA API (OPENAPI 3.0)

El backend de SIURPROV (`server.ts`) expone una API REST modular documentada bajo el estándar OpenAPI 3.0.3, accesible de forma interactiva a través de la pestaña **"Swagger API & Tests"**:

1. `POST /api/simulate/structural`:
   - **Propósito**: Cómputo sismorresistente según COVENIN 1756:2019.
   - **Entrada**: Parámetros sísmicos ($A_0$, $T_1$, $I$, $R$, peso total $W$, número de pisos).
   - **Salida**: Aceleración espectral $S_a$, cortante basal $V_0$, coeficiente sísmico $C_s$, deriva máxima de entrepiso y dictamen de conformidad.
2. `POST /api/simulate/slope`:
   - **Propósito**: Evaluación de estabilidad de taludes mediante Factor de Seguridad (Bishop / Talud Infinito).
   - **Entrada**: Ángulo de pendiente, cohesión del suelo, ángulo de fricción interna, porcentaje de saturación y coeficiente sísmico $k_h$.
   - **Salida**: Factor de Seguridad ($FS$), condición de estabilidad y presión de poros crítica $r_u$.
3. `POST /api/simulate/debris`:
   - **Propósito**: Modelado de fuerza de arrastre hidrodinámico, empuje hidrostático y colisión de bloques de aluvión (deslave).
   - **Entrada**: Calado de ola aluvial, velocidad del flujo, densidad de la matriz lodosa, diámetro de bolones y ancho de fachada expuesta.
   - **Salida**: Fuerza total de impacto ($kN$), desglose de componentes y severidad del daño.
4. `POST /api/audit`:
   - **Propósito**: Dictamen pericial forense automatizado.
   - **Estrategia Dual**: Inferencia generativa mediante Gemini 2.5 Flash con conmutación transparente a motor determinista por reglas de ingeniería civil si no hay conectividad o API key.
5. `GET /api/health`:
   - **Propósito**: Telemetría del sistema, tiempo de actividad (*uptime*), consumo de memoria RAM y estado de preparación offline.
6. `GET /api/openapi.json`:
   - **Propósito**: Contrato formal en formato JSON OpenAPI 3.0.3 para generación de clientes o auditoría en Swagger UI / Postman.

---

## 7. FACTIBILIDAD DE IMPLEMENTACIÓN Y TRANSFERENCIA TERRITORIAL

SIURPROV ha sido calibrado específicamente para reflejar la realidad física, geológica y geotécnica de las principales regiones urbanas de Venezuela:

| Región Auditada | Amenazas Críticas | Aportes & Factibilidad de Mejora Territorial |
| :--- | :--- | :--- |
| **San Juan de los Morros (UNERG, Guárico)** | Suelos expansivos, fallas de piedemonte (Serranía del Interior), laderas arcillosas inestables. | Zonificación geotécnica preventiva en el campus universitario UNERG, diseño de fundaciones profundas para mitigar arcillas expansivas y planificación de drenajes en quebradas urbanas. |
| **Gran Caracas & Litoral Central (La Guaira)** | Sismos mayores (Falla San Sebastián) y aluviones torrenciales en laderas escarpadas (Cuenca Ávila / Macizo El Ávila). | Monitoreo multitemporal con MapBiomas para detectar pérdida de cobertura en cabeceras de cuenca; dimensionamiento de presas de retención tipo Sabo y refuerzo de columnas en autoconstrucciones. |
| **Mérida & Cordillera Andina** | Sismicidad superficial severa (Falla Boconó) y deslizamientos rotacionales masivos. | Control estricto de derivas de entrepiso bajo COVENIN 1756; estabilización de taludes con anclajes activos y drenes californianos. |
| **Sucre & Golfo de Cariaco** | Sismo de falla de desgarre dextral (Falla El Pilar) en suelos marinos saturados S4. | Evaluación del potencial de licuefacción de suelos de playa; diseño estructural bajo ductilidad ND3 para evitar colapso de plantas bajas. |
| **Las Tejerías (Aragua)** | Avenidas torrenciales de detritos (Quebrada Los Patos) y deforestación en laderas. | Retiro perimetral obligatorio de edificaciones respecto al cauce activo; construcción de diques disipadores de energía. |
| **Zulia & Costa Oriental del Lago** | Hundimiento por subsidencia petrolera, licuefacción costera e inundaciones del Lago. | Mantenimiento de diques costeros y fundaciones flotantes con pilotes de fricción. |

---

## 8. ESTRATEGIA DE TESTING, QA Y ASERCIONES AUTOMATIZADAS

Para garantizar que el software no degrade con las futuras adiciones de código, el sistema incorpora el servicio `SystemAuditorService` (`src/services/systemAuditor.ts`), que ejecuta pruebas unitarias y de límites directamente en el navegador:

1. **Aserción de Período Fundamental T₁**:
   - Comprueba que $T_1 = C_t \cdot H_n^{0.75}$ retorne valores físicos estrictamente acotados ($0.65s \le T_1 \le 1.05s$ para 8 pisos).
2. **Aserción de Espectro de Diseño $S_a$ y Cortante Basal $V_0$**:
   - Verifica que el espectro inelástico no presente discontinuidades y que el cortante basal respete el umbral mínimo reglamentario.
3. **Aserción de Estabilidad de Taludes (Bishop)**:
   - Valida que en condición seca no saturada $FS \ge 1.40$ y que ante sismo y 95% de saturación el factor colapse a $FS < 1.00$.
4. **Aserción de Fuerza de Impacto de Aluvión**:
   - Comprueba que la fuerza calculada en kilonewtons coincida con los rangos empíricos documentados en la tragedia de Vargas de 1999 (500 a 5,000 kN).
5. **Aserción de Coordenadas Geográficas WGS84**:
   - Valida que las 12 regiones de Venezuela estén contenidas dentro del cuadrante geográfico nacional (Latitud 1°N a 13°N, Longitud -73.5°O a -59.5°O).
6. **Aserción de Resiliencia Eléctrica (localStorage Cache)**:
   - Prueba la capacidad del navegador para serializar y deserializar construcciones proyectadas en almacenamiento local sin depender de red.
7. **Aserción del Módulo Guárico / UNERG**:
   - Confirma la presencia del campus de la Universidad Rómulo Gallegos y los perfiles litológicos de San Juan de los Morros.

---

## 9. GUÍA DE TRANSFERENCIA Y TRABAJO LOCAL PARA EL ING. FRANK SOUSA

Para continuar el ciclo creativo cuando se disponga de fluido eléctrico en San Juan de los Morros y se clone el repositorio a la computadora local:

```bash
# 1. Clonar el repositorio oficial desde GitHub
git clone https://github.com/frankalfonso1988/SIURPROV.git
cd SIURPROV

# 2. Instalar dependencias con npm
npm install

# 3. Configurar variables de entorno (opcional para IA de Gemini)
cp .env.example .env
# Agregar tu clave si deseas habilitar dictámenes con IA avanzada:
# GEMINI_API_KEY="tu_clave_aqui"

# 4. Iniciar el servidor local
npm run dev

# 5. Ejecutar verificación de tipos y compilación limpia
npm run build
```

---

## 10. PIPELINE DE CI/CD Y AUDITORÍA DE SEGURIDAD EN TIEMPO REAL

Para garantizar que el software mantenga su calidad, rigurosidad física y seguridad cibernética cada vez que se suban cambios al repositorio en GitHub, se ha integrado un pipeline de Integración y Entrega Continua (**CI/CD**) en `.github/workflows/ci-cd.yml`:

1. **Compilación Estricta TypeScript (`tsc --noEmit`)**:
   - Comprueba tipado estricto en todos los módulos sin supresión insegura de advertencias.
2. **Suite Automatizada de Pruebas Físicas y de Límites (`npm test`)**:
   - Ejecuta `src/tests/runAllTests.ts` validando períodos fundamentales (Cap. 7 COVENIN 1756), aceleración espectral inelástica, factor de seguridad de taludes por Bishop, desplazamientos sísmicos Newmark y resistencia hidrodinámica a deslaves.
3. **Auditoría de Seguridad y SAST**:
   - Verificación de cabeceras HTTP de seguridad (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Content-Security-Policy`, `Permissions-Policy`).
   - Limitador de tasa de peticiones (*Rate Limiter*) en `/api/*` para proteger servidores expuestos contra denegación de servicio (DoS).
   - Sanitización de entradas contra XSS e inyecciones en `src/services/securitySanitizer.ts`.
   - Prevención de ataques de alteración de prototipo (*Prototype Pollution*) en objetos JSON.
   - Endpoint de auditoría en vivo `GET /api/security/audit` accesible desde el panel de arquitectura.
4. **Verificación Automatizada de la Mención al Autor**:
   - El pipeline verifica que los estudios incluyan la mención al **Ing. Frank Sousa** y al repositorio `https://github.com/frankalfonso1988/SIURPROV`.
5. **Empaquetado de Artefactos de Producción**:
   - Compilación optimizada mediante `npm run build` y empaquetado del directorio `dist/`.

---

## 11. ESPECIFICACIÓN DEL FORMATO DE ESTUDIOS INTEROPERABLES (.siurprov)

Los estudios de vulnerabilidad territorial computados con SIURPROV se empaquetan en formato abierto estructurado (`.siurprov` / JSON), garantizando que las simulaciones se realicen de manera **100% local**, pero que los estudios puedan exportarse, compartirse y abrirse en cualquier otra instancia del sistema (sea en otra computadora local o en un servidor en la nube):

- **Encabezado y Metadatos**: Incluye título, descripción, autoría formal, institución académica (UNERG), fecha ISO y enlace oficial al repositorio.
- **Suma de Comprobación Criptográfica (Checksum)**: Cada paquete exportado genera una firma determinística (`SIUR-XXXX`) que es validada al momento de la importación para asegurar que el archivo no haya sido corrompido ni adulterado.
- **Datos Territoriales y Físicos**:
  - Identificador de la región venezolana y sector urbano micro-escala.
  - Año de la proyección multitemporal de MapBiomas (1985-2050).
  - Parámetros sismorresistentes y geotécnicos (aceleración PGA, magnitud Mw, perfil de suelo S1-S4, ángulo de talud, lluvia acumulada).
  - Catálogo de edificaciones colocadas por el usuario con sus coordenadas relativas y daño computado.
  - Resumen pericial: derivas, Grado EMS-98, Nivel de Desempeño FEMA 356, estimación de pérdidas en USD y tiempo de inoperatividad funcional (*downtime*).
- **Mecanismos de Intercambio**:
  - Descarga directa de archivo `.siurprov`.
  - Token codificado portátil (Base64) para compartir de inmediato mediante correo o mensajería instantánea.

---

## 12. FACILIDAD DE USO Y RESILIENCIA PARA USUARIOS NO INFORMÁTICOS

Para permitir que evaluadores, profesores universitarios, estudiantes de ingeniería y técnicos de Protección Civil sin experiencia en programación puedan clonar y probar el sistema con facilidad:

- **Windows**: Script `start-local.bat` con doble clic automático que verifica Node.js, instala dependencias si faltan y abre el navegador predeterminado en `http://localhost:3000`.
- **Linux y macOS**: Script `start-local.sh` con salida en colores y verificación guiada.
- **Docker**: Archivo `docker-compose.yml` para despliegue en un solo comando: `docker compose up`.
- **Asistente en la Interfaz (Modal "Probar en Local")**:
  - Proporciona instrucciones paso a paso con botones de copia de comandos en 1 solo clic.
  - Incluye un widget de **Autodiagnóstico del Sistema en Tiempo Real** que comprueba soporte WebGL, LocalStorage, compatibilidad de navegador y conectividad con la API local.

---

*Documento formal elaborado para el repositorio oficial SIURPROV — San Juan de los Morros, Estado Guárico, Venezuela.*


