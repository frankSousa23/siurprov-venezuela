# shake-table-bench Specification

## Purpose
Proporcionar un banco de pruebas destructivo e interactivo multi-amenaza con mesa sísmica 3D, diales de esfuerzo físico en tiempo real, catálogo de refuerzos estructurales y telemetría de daño y colapso según normas COVENIN 1756 y FEMA 356.

## Requirements

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

### Requirement: Importación de geometría y suelo desde el simulador estructural
El sistema SHALL permitir recibir e inicializar en el Banco de Pruebas Dinámico la configuración de pisos, masa de entrepiso, rigidez lateral y tipo de suelo COVENIN transferidos desde el módulo de Simulación 2D/3D o el catálogo de estudios.

#### Scenario: Carga de estructura transferida desde el simulador
- **WHEN** el usuario pulsa la acción de transferir al banco de pruebas en el simulador
- **THEN** la mesa sísmica se inicializa con el número exacto de niveles, perfil de masa y suelo recibidos, mostrando una notificación de sincronización exitosa

#### Scenario: Persistencia y respaldo en almacenamiento local
- **WHEN** se transfieren nuevos parámetros estructurales al banco de pruebas
- **THEN** los valores se almacenan en el estado de la sesión y en la clave de persistencia local correspondiente para tolerar recargas de página

### Requirement: Modo desafíos sismorresistentes históricos de Venezuela y gamificación
El sistema SHALL incorporar un selector de sismos históricos documentados de Venezuela (Cariaco 1997 Mw 6.9, Caracas 1967 Mw 6.6, El Tocuyo 1950 Mw 6.2) con acelerogramas o espectros característicos, asignando al usuario un presupuesto virtual para refuerzos y calculando una puntuación basada en vidas salvadas y mitigación de daño Park-Ang.

#### Scenario: Selección de reto sísmico histórico
- **WHEN** el usuario activa el modo de desafío y selecciona el sismo histórico de Cariaco 1997
- **THEN** la mesa sísmica adopta automáticamente el PGA calibrado (0.55g), la frecuencia dominante y la firma impulsiva de dicho evento

#### Scenario: Gestión de presupuesto de refuerzo
- **WHEN** el usuario añade o remueve contramedidas estructurales (aisladores LRB, muros de cortante, encamisado CFRP) en modo desafío
- **THEN** el costo acumulado se descuenta del presupuesto virtual disponible, impidiendo instalar refuerzos que excedan el límite financiero asignado

#### Scenario: Evaluación de supervivencia y puntuación final
- **WHEN** culmina la excitación del sismo histórico bajo prueba
- **THEN** el sistema evalúa el índice de daño Park-Ang final y emite un puntaje de ingeniería (Calificación A+, A, B, C o Colapso) y un resumen de vidas protegidas y eficiencia presupuestaria

### Requirement: Drawer colapsable de telemetría y controles en vista móvil
El sistema SHALL adaptar los diales de control sísmico y la botonera de refuerzo en viewports móviles (< 640px) dentro de un panel inferior colapsable (*bottom sheet drawer*), garantizando visualización libre del modelo 3D.

#### Scenario: Despliegue y ocultamiento del cajón de controles
- **WHEN** el usuario visualiza el banco de pruebas en un dispositivo móvil y presiona el tirador del cajón de controles
- **THEN** el panel se expande para manipular los diales de solicitación y se colapsa para inspeccionar la oscilación 3D completa de la superestructura
