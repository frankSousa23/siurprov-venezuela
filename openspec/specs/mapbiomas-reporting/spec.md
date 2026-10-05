# mapbiomas-reporting Specification

## Purpose

Generación, renderizado interactivo y exportación de informes técnicos de ingeniería y riesgo territorial basados en métricas multitemporales de MapBiomas Venezuela y COVENIN 1756.

## Requirements

### Requirement: Generación de informe técnico estructurado multitemporal
El sistema SHALL compilar y presentar un informe técnico consolidado que combine métricas de transición de suelo de MapBiomas (1985–2050), evolución del coeficiente de escorrentía $C$, demanda sísmica COVENIN 1756 y pérdida económica estimada.

#### Scenario: Apertura del informe técnico desde el mapa o simulador
- **WHEN** el usuario pulsa la acción de generar reporte técnico en la interfaz
- **THEN** el sistema abre una vista modal detallada con tablas multitemporales, factores de seguridad y cálculo de pérdidas sin depender de conexión a internet

#### Scenario: Exportación del informe en formato Markdown e impresión
- **WHEN** el usuario selecciona descargar o imprimir el informe generado
- **THEN** la aplicación produce una versión limpia en Markdown formateado con metadatos académicos listos para su exportación a PDF

### Requirement: Trazabilidad y atribución a MapBiomas y RAISG
El sistema SHALL incluir en todo reporte generado las citas formales a la Red Amazónica de Información Socioambiental Georreferenciada (RAISG), la Colección MapBiomas Venezuela y la autoría de ingeniería.

#### Scenario: Verificación de fuentes de datos en el reporte
- **WHEN** se genera un informe técnico
- **THEN** el pie del reporte incluye la atribución a MapBiomas Venezuela, el enlace al repositorio oficial y la mención al autor
