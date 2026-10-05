# crash-resilience-session Specification

## Purpose

Respaldo reactivo continuo en almacenamiento local y recuperación automática del estado de trabajo ante cortes imprevistos de energía eléctrica.

## Requirements

### Requirement: Respaldo continuo reactivo ante cortes de energía
El sistema SHALL persistir de forma continua en `localStorage` las modificaciones del estudio activo, edificios georreferenciados en el mapa, parámetros de amenaza y ajustes del banco de pruebas dinámico.

#### Scenario: Guardado automático de parámetros en tiempo real
- **WHEN** el usuario modifica un parámetro, coloca una edificación o altera la amenaza en el lienzo
- **THEN** la aplicación serializa y actualiza la clave de auto-recuperación local en menos de 500ms sin bloquear la interfaz

#### Scenario: Detección de sesión interrumpida por corte eléctrico
- **WHEN** la aplicación se carga en el navegador y detecta una sesión guardada con menos de 24 horas de antigüedad que no fue cerrada formalmente
- **THEN** se muestra un aviso visible informando de la sesión disponible y ofreciendo el botón de restauración inmediata

### Requirement: Restauración atómica del estado de trabajo
El sistema SHALL restaurar con un solo clic todos los parámetros del estudio, vista activa y elementos colocados en el mapa tal como se encontraban antes de la interrupción.

#### Scenario: Restauración exitosa del estado
- **WHEN** el usuario hace clic en el botón de restaurar sesión previa
- **THEN** el sistema recarga las edificaciones en el mapa, la región seleccionada, el año y el estado del simulador sin errores de consola
