## ADDED Requirements

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
