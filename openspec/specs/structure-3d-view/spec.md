# structure-3d-view Specification

## Purpose
Visualización tridimensional interactiva y orbitable del edificio, estrato de suelo y amenazas multi-amenaza, permitiendo inspección geométrica y transferencia de parámetros al banco dinámico de pruebas.

## Requirements

### Requirement: Vista 3D orbitable del simulador
El sistema SHALL ofrecer una vista 3D del edificio, el suelo en capas y las amenazas activas, con cámara orbitable y conmutador a la vista 2D.

#### Scenario: Orbitar la estructura
- **WHEN** el usuario arrastra el ratón sobre la vista 3D
- **THEN** la cámara orbita alrededor de la estructura sin reiniciar la simulación

#### Scenario: Alternar entre 3D y 2D
- **WHEN** el usuario pulsa "2D" y luego "3D"
- **THEN** ambas vistas se renderizan correctamente y sin errores de consola

#### Scenario: Reflejo de amenazas
- **WHEN** hay sismo, viento, inundación o aluvión activos
- **THEN** la vista 3D muestra oscilación del terreno y del edificio, nivel de agua y bloques de detritos

### Requirement: Transferencia directa de estructura al banco de pruebas dinámico
El sistema SHALL proporcionar un botón de acción en la vista del simulador estructural que empaquete la configuración del edificio actual y transicione fluidamente a la pestaña del Banco de Pruebas Dinámico.

#### Scenario: Pulsar botón de probar en banco sísmico
- **WHEN** el usuario hace clic en el botón "Probar en Banco Sísmico" en la interfaz del simulador
- **THEN** la aplicación empaqueta el número de niveles, masa, rigidez lateral y tipo de suelo COVENIN actual, cambia la pestaña activa a "shake-table" y muestra la superestructura lista para excitación dinámica

#### Scenario: Validación de datos antes de transferir
- **WHEN** los parámetros del edificio en el simulador están en proceso de cálculo o edición
- **THEN** el sistema valida que los valores de rigidez y masa sean coherentes antes de despachar la estructura al banco de pruebas
