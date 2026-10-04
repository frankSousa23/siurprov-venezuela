# Spec Delta

## ADDED Requirements

### Requirement: Transferencia directa de estructura al banco de pruebas dinámico
El sistema SHALL proporcionar un botón de acción en la vista del simulador estructural que empaquete la configuración del edificio actual y transicione fluidamente a la pestaña del Banco de Pruebas Dinámico.

#### Scenario: Pulsar botón de probar en banco sísmico
- **WHEN** el usuario hace clic en el botón "Probar en Banco Sísmico" en la interfaz del simulador
- **THEN** la aplicación empaqueta el número de niveles, masa, rigidez lateral y tipo de suelo COVENIN actual, cambia la pestaña activa a "shake-table" y muestra la superestructura lista para excitación dinámica

#### Scenario: Validación de datos antes de transferir
- **WHEN** los parámetros del edificio en el simulador están en proceso de cálculo o edición
- **THEN** el sistema valida que los valores de rigidez y masa sean coherentes antes de despachar la estructura al banco de pruebas
