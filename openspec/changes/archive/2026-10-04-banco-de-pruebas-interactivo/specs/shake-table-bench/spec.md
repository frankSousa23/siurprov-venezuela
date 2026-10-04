# Spec Delta

## Purpose

Proporcionar un banco de pruebas destructivo e interactivo multi-amenaza con mesa sísmica 3D, diales de esfuerzo físico en tiempo real, catálogo de refuerzos estructurales y telemetría de daño y colapso según normas COVENIN 1756 y FEMA 356.

## ADDED Requirements

### Requirement: Mesa sísmica interactiva 3D con solicitaciones dinámicas
El sistema SHALL proporcionar una mesa sísmica 3D interactiva capaz de excitar la estructura en tiempo real variando aceleración máxima (PGA entre 0.05g y 1.20g), frecuencia de excitación (0.5 Hz a 10.0 Hz) y régimen de onda (armónica continua o pulso impulsivo de falla cercana).

#### Scenario: Ajuste dinámico de aceleración y frecuencia
- **WHEN** el usuario manipula los diales de aceleración sísmica o frecuencia de excitación
- **THEN** la base del simulador 3D oscila dinámicamente con la nueva amplitud y frecuencia sin reiniciar la sesión

#### Scenario: Detección de resonancia estructural
- **WHEN** la frecuencia de la mesa sísmica coincide con el período natural de vibración de la estructura ($f \approx 1/T_n \pm 10\%$)
- **THEN** la amplitud de desplazamiento de los pisos superiores se amplifica dinámicamente indicando estado de resonancia crítica

#### Scenario: Conmutación a pulso impulsivo de falla
- **WHEN** el usuario selecciona el modo de pulso de falla cercana
- **THEN** la mesa sísmica aplica un desplazamiento repentino asimétrico de gran energía cinética simulando efecto de directividad directa

### Requirement: Solicitaciones multi-amenaza combinadas
El sistema SHALL permitir combinar la vibración sísmica con empuje lateral continuo de viento huracanado y con pérdida de rigidez o asentamiento por licuefacción del suelo de soporte.

#### Scenario: Aplicación simultánea de viento extremo
- **WHEN** el usuario incrementa el dial de velocidad de viento a valores huracanados ($> 120\text{ km/h}$)
- **THEN** la superestructura experimenta un empuje lateral estático acumulativo que se suma a las oscilaciones inerciales

#### Scenario: Degradación del apoyo por licuefacción
- **WHEN** el usuario activa la condición de suelo licuable o socavado
- **THEN** la rigidez del apoyo basal disminuye, amplificando los cabeceos y deformaciones angulares de la cimentación

### Requirement: Catálogo interactivo de refuerzos estructurales
El sistema SHALL ofrecer una botonera de contramedidas estructurales para equipar o desequipar muros de cortante de concreto armado, arriostramientos de acero en X, encamisado de columnas con CFRP y aisladores elastoméricos en la base (LRB).

#### Scenario: Equipamiento de aisladores sísmicos de base (LRB)
- **WHEN** el usuario activa los aisladores elastoméricos de base
- **THEN** la superestructura se desacopla del movimiento del terreno, reduciendo las derivas de entrepiso y la aceleración en los pisos superiores en al menos un 50%

#### Scenario: Equipamiento de muros de cortante de concreto
- **WHEN** el usuario activa los muros de cortante de concreto armado
- **THEN** la rigidez lateral del modelo aumenta, reduciendo el período fundamental de vibración y restringiendo el desplazamiento lateral

#### Scenario: Equipamiento de arriostramientos en X y encamisado CFRP
- **WHEN** el usuario activa arriostramientos metálicos en X o encamisado CFRP
- **THEN** los elementos se renderizan visiblemente en la geometría 3D y aumentan la capacidad de disipación y ductilidad del modelo

#### Scenario: Retiro y combinación de refuerzos
- **WHEN** el usuario activa o desactiva cualquier combinación de los cuatro refuerzos
- **THEN** las propiedades de rigidez, amortiguamiento y capacidad se recalculan instantáneamente reflejándose en la telemetría

### Requirement: Telemetría de daño en tiempo real y detección de colapso
El sistema SHALL computar y presentar en tiempo real la deriva máxima de entrepiso ($\Delta/h$), el índice de daño de Park-Ang y el nivel de desempeño según COVENIN 1756 y FEMA 356 (Ocupación Inmediata, Seguridad de Vida, Prevención del Colapso y Colapso Estructural).

#### Scenario: Telemetría en régimen elástico admisible
- **WHEN** las derivas de entrepiso se mantienen por debajo del límite normativo COVENIN ($\Delta/h \le 0.012$)
- **THEN** el indicador de desempeño muestra color verde con estado "Ocupación Inmediata / Daño Leve"

#### Scenario: Advertencia y animación de colapso plástico
- **WHEN** las solicitaciones combinadas superan la capacidad última resistente y la deriva excede el umbral de colapso ($\Delta/h > 0.025$)
- **THEN** la interfaz visualiza alerta de colapso inminente y los elementos estructurales en 3D reflejan agrietamiento severo o deformación plástica permanente
