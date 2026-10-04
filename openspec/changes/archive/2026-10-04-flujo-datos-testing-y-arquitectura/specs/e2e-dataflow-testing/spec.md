## ADDED Requirements

### Requirement: Pruebas automatizadas de flujo completo de datos
El sistema SHALL ejecutar una suite de pruebas automatizadas que valide el ciclo de vida de estudios, la detección de manipulaciones maliciosas, la integridad criptográfica y los endpoints HTTP.

#### Scenario: Detección de adulteración en estudios .siurprov
- **WHEN** un archivo `.siurprov` válido es alterado en sus datos de simulación sin regenerar el checksum
- **THEN** el motor de importación rechaza el paquete marcando el estado de checksum como `INVALID`

#### Scenario: Validación de consistencia API vs Motor local
- **WHEN** se ejecuta la simulación por HTTP en `/api/simulate/full` y localmente en memoria con los mismos parámetros
- **THEN** los valores de cortante basal (`designBaseShearKn`) y deriva máxima (`maxStoryDriftPercent`) coinciden de forma exacta

#### Scenario: Protección ante payloads HTTP anómalos
- **WHEN** se envía un payload JSON sintácticamente corrupto o con propiedades de contaminación de prototipo
- **THEN** el servidor responde con status 400 y mensaje defensivo sin exponer stack traces
