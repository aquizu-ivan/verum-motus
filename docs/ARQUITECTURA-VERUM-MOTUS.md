# ARQUITECTURA DE VERUM MOTUS

## Visión técnica
Verum Motus es una obra contemplativa del Octavo Arte centrada en el Pulso Interno como primer movimiento vivo. El sistema técnico prioriza el lenguaje de estados y la composición por capas sobre patrones de app tradicional. El foco actual es un lienzo silencioso donde un pulso mínimo atraviesa su primer cambio de estado sin UI ni ornamentos.

## Estructura de carpetas y roles
- `core/`: engine y loop Three.js (escena/cámara/renderer), registro de capas, resize.
- `layers/`: capas visuales independientes; cada una representa un fragmento del movimiento.
- `states/`: vocabulario interno (`internalStates`), `stateMachine` genérica y orquestadores estado→parámetros.
- `transitions/`: coordinadores/rituales que escuchan la máquina y aplican cambios a capas/escena.
- `utils/`: utilidades transversales (tiempo, helpers).
- `config/`: constantes globales (versión, ritmo interno, delays).

Separación de responsabilidades:
- engine = ensamblador + loop
- stateMachine = estado puro
- orquestador(es) = mapeo estado→parámetros
- coordinador(es) = escucha de estados y aplicación de parámetros
- capas = visualización parametrizable y ciega al estado global

## Sistema de estados actuales
- `INERCIA_VIVA`: estado inicial, pulso mínimo.
- `PULSO_INICIAL`: primer movimiento visible del Pulso Interno.

Flujo:
```
INTERNAL_STATES
    → stateMachine
    → stateOrchestrator
    → pulseStateCoordinator
    → InnerPulseLayer
    → engine (loop + render)
```

## Primer ritual interno: INERCIA_VIVA → PULSO_INICIAL
- Arranque en `INERCIA_VIVA`.
- `pulseStateCoordinator` espera `INITIAL_STATE_TRANSITION_DELAY_MS` (~10s).
- Dispara `stateMachine.setState(PULSO_INICIAL)`.
- La suscripción del coordinador consulta el orquestador y aplica la nueva config con `InnerPulseLayer.applyPulseConfig`.
- La lógica del ritual vive en `transitions/`; el engine se mantiene neutro y la capa solo reacciona a parámetros.

## Patrón de capas parametrizables (InnerPulseLayer)
InnerPulseLayer recibe `pulseConfig`, define defaults, implementa `init(scene)`, `update(deltaTime)` y `applyPulseConfig(config)`. Anima su movimiento con `deltaTime` y ajusta material/escala según parámetros sin conocer la máquina de estados. Este patrón permite capas desacopladas y reconfigurables: reaccionan a cambios de estado a través de coordinadores, no por acceso directo al estado global.

## Constantes del ritmo interno
- `INERCIA_VIVA_FREQUENCY_HZ`, `INERCIA_VIVA_AMPLITUDE`, `INERCIA_VIVA_COLOR`.
- `PULSO_INICIAL_FREQUENCY_HZ`, `PULSO_INICIAL_AMPLITUDE`, `PULSO_INICIAL_COLOR`.
- `INITIAL_STATE_TRANSITION_DELAY_MS`.

Se centralizan en `config/constants.js` para ajustar el pulso en un solo lugar sin tocar orquestadores, coordinadores ni capas.

## Líneas de diseño para futuros estados y capas
- Mantener `core/engine.js` como ensamblador + loop, sin lógica narrativa.
- Definir nuevos estados en `internalStates` y mapear sus parámetros en orquestadores.
- Hacer capas siempre parametrizables (métodos tipo `applyConfig`), sin acceso directo a la stateMachine.
- Añadir rituales en `transitions/` (coordinadores/managers), nunca dentro del engine o las capas.
- Centralizar ritmos, delays y colores base en `config/constants.js`.
- Gestionar ciclo de vida: `dispose` de capas/coordinadores cuando cambien escenas o se reinicie el engine.
- Evitar timers dispersos; preferir secuencias coordinadas desde pocos puntos claros.

## PatrÇün de capa sincronizada con el Pulso
- Recibe una `pulseConfig` inicial y mantiene estado `current/start/target` para los parÇ­metros que usa (frecuencia, amplitud, color, opacidad/escala segÇ§n la capa).
- Implementa `init(scene)`, `update(deltaTime)`, `applyPulseConfig(config)` para activar transiciones internas, `onResize(...)` (NO-OP si no aplica) y `dispose()` liberando geometrÇ­as/materiales y retirando el mesh.
- Usa helpers compartidos (`lerp`, `clamp`, etc.) para interpolar de forma consistente durante `PULSE_CONFIG_TRANSITION_DURATION_S`.

## PatrÇün de coordinador de Pulso
- Se alimenta de `stateMachine` y `stateOrchestrator`.
- Aplica configs a un conjunto de targets (`pulseTargets`) via `applyPulseConfig`.
- Gestiona rituales temporales (ej. delay inicial de transiciÇün de estado) y expone `dispose()` para limpiar listeners y timers.
- A futuro, puede ser gestionado por un punto central de teardown para agrupar limpiezas de escena.

## Notas de ciclo de vida
- Cada capa/coordinador debe implementar `dispose()` (remover de la escena si corresponde y liberar geometry/material/listeners/timers).
- Un manager de lifecycle podrÇ­ agregarse mÇås adelante para centralizar limpiezas, pero hoy el contrato individual es suficiente.
