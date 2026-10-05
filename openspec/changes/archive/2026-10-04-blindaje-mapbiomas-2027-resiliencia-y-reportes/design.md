# Design

## Context

Véase `proposal.md`. Para posicionar a SIURPROV como una postulación científica madura al **Premio MapBiomas 2027** y adaptarse a la realidad operativa de cortes eléctricos diarios en Venezuela, el sistema debe blindar la persistencia de datos y generar reportes técnicos reproducibles.

## Goals / Non-Goals

**Goals:**
- **Auto-Guardado Continuo y Recuperación ante Apagones**: Crear un snapshot reactivo en `localStorage` (`siurprov_crash_recovery_snapshot`) con debounce de 300ms que registre la región, año, escenario, tipología, suelo y edificios en el mapa. Mostrar un banner en `App.tsx` al arrancar si se detecta una sesión interrumpida.
- **Generador de Informes Técnicos Certificados**: Implementar un método puro de formateo de reporte técnico en `studyStorage.ts` y enriquecer `TechnicalReportModal.tsx` para permitir visualizar, imprimir (PDF nativo) y descargar en Markdown un informe formal con métricas MapBiomas (1985–2050), escorrentía $C$, evaluación sísmica COVENIN 1756 y pérdidas económicas.
- **Ampliación de Regiones Geoespaciales**: Extender `src/data/venezuelaRegions.ts` con cuatro regiones emblemáticas de alto riesgo:
  1. *Los Andes (Mérida / Táchira)*: Falla de Boconó, pendientes extremas y alta sismicidad.
  2. *Macizo Oriental (Sucre / Monagas)*: Falla de El Pilar, eventos históricos (Cariaco) y licuefacción costera.
  3. *Costa Oriental del Lago (Zulia - Cabimas/Lagunillas)*: Subsidencia por extracción de petróleo e inundación lacustre.
  4. *Cuenca del Río Caroní (Bolívar - Guayana)*: Dinámica de deforestación, sabanización y minería.
- **Automatización de Pruebas**: Crear TEST-24 (persistencia reactiva y recuperación tras fallo eléctrico) y TEST-25 (generador de reporte e integridad de matrices multitemporales MapBiomas) en `src/tests/runAllTests.ts`.

**Non-Goals:**
- No implementar bases de datos en la nube ni servicios con credenciales pagas.
- No alterar las fórmulas físicas ni los umbrales normativos de los motores existentes.

## Decisions

### 1. Mecanismo de Snapshot en LocalStorage con Flag de Salida Limpia
- **Decisión**: Guardar el estado activo bajo la clave `siurprov_crash_recovery_snapshot` cada vez que el usuario modifica un parámetro o añade un edificio, marcando `isDirty: true`. Cuando el usuario cierra la sesión formalmente o crea un estudio nuevo, se marca `isDirty: false`. Si la aplicación arranca y encuentra `isDirty: true`, deduce que ocurrió un corte de energía o cierre intempestivo y ofrece la recuperación.
- **Razón**: Máxima ligereza (cero dependencias externas) y compatibilidad universal en cualquier navegador offline.

### 2. Generación Isomórfica de Informes Técnicos
- **Decisión**: Implementar `StudyStorageService.generateTechnicalReport(studyPackage)` como una función pura que devuelve tanto el texto Markdown estructurado como los datos tabulares. `TechnicalReportModal.tsx` renderiza estos datos con estilos de imprenta (`@media print`) y permite copiar o descargar el `.md` para adjuntarlo como anexo académico.
- **Razón**: Permite validar la generación del reporte en la suite CI/CD (`npm test`) y asegura portabilidad total sin librerías pesadas de PDF que inflen el bundle.

### 3. Calibración Rigurosa de Nuevas Regiones con Datos MapBiomas RAISG
- **Decisión**: Cada nueva región añadida a `VENEZUELA_REGIONS` incluirá su serie multitemporal completa (1985, 1995, 2005, 2015, 2023, 2030, 2040, 2050), con hectáreas de bosque, suelo urbano, laderas informales, coeficiente medio de escorrentía $C$, pendiente media y parámetros sísmicos COVENIN ($A_0$, perfil por defecto).
- **Razón**: Permite al evaluador comparar cualquier zona del territorio nacional y estudiar el impacto del cambio de uso del suelo a lo largo de 65 años de proyección.

## Risks / Trade-offs

- **[Riesgo: Sobreescritura no deseada de un estudio al restaurar snapshot]**  
  → *Mitigación*: El banner de restauración solicita confirmación explícita mediante botones claros `[Restaurar Sesión]` o `[Descartar]`, sin forzar la carga de forma destructiva.
- **[Riesgo: Tamaño del archivo de regiones]**  
  → *Mitigación*: Mantener los datos como objetos TypeScript estáticos tipados sin overhead de parsing en tiempo de ejecución.
