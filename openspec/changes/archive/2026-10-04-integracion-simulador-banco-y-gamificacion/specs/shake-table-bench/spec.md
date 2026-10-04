# Spec Delta

## ADDED Requirements

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
