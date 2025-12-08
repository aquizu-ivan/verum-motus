# ARQUITECTURA DE VERUM MOTUS

## Vision tecnica
Verum Motus es una obra contemplativa del Octavo Arte centrada en el Pulso Interno como primer movimiento vivo. El sistema tecnico prioriza el lenguaje de estados y la composicion por capas sobre patrones de app tradicional. El foco actual es un lienzo silencioso donde un pulso minimo atraviesa su primer cambio de estado sin UI ni ornamentos.

## Estructura de carpetas y roles
- `core/`: engine y loop Three.js (escena/camara/renderer), registro de capas, resize.
- `layers/`: capas visuales independientes; cada una representa un fragmento del movimiento.
- `states/`: vocabulario interno (`internalStates`), `stateMachine` generica y orquestadores estado->parametros.
- `transitions/`: coordinadores/rituales que escuchan la maquina y aplican cambios a capas/escena.
- `utils/`: utilidades transversales (tiempo, helpers).
- `config/`: constantes globales (version, ritmo interno, delays).

Separacion de responsabilidades:
- engine = ensamblador + loop
- stateMachine = estado puro
- orquestador(es) = mapeo estado->parametros
- coordinador(es) = escucha de estados y aplicacion de parametros
- capas = visualizacion parametrizable y ciega al estado global

## Sistema de estados actuales
- `INERCIA_VIVA`: estado inicial, pulso minimo.
- `PULSO_INICIAL`: primer movimiento visible del Pulso Interno.
- `DESLIZAMIENTO_INTERNO`: desplazamiento interno sostenido.
- `RITMO_EMERGE`: presencia mas manifiesta, aun contemplativa.

Flujo:
```
INTERNAL_STATES
    -> stateMachine
    -> stateOrchestrator
    -> pulseStateCoordinator
    -> InnerPulseLayer
    -> engine (loop + render)
```

## Primer ritual interno: INERCIA_VIVA -> PULSO_INICIAL
- Arranque en `INERCIA_VIVA`.
- `pulseStateCoordinator` espera `INITIAL_STATE_TRANSITION_DELAY_MS` y dispara `stateMachine.setState(PULSO_INICIAL)`.
- La suscripcion del coordinador consulta el orquestador y aplica la nueva config con `InnerPulseLayer.applyPulseConfig`.
- La logica del ritual vive en `transitions/`; el engine se mantiene neutro y la capa solo reacciona a parametros.

## Patron de capas parametrizables (InnerPulseLayer)
InnerPulseLayer recibe `pulseConfig`, define defaults, implementa `init(scene)`, `update(deltaTime)` y `applyPulseConfig(config)`. Anima su movimiento con `deltaTime` y ajusta material/escala segun parametros sin conocer la maquina de estados. Este patron permite capas desacopladas y reconfigurables: reaccionan a cambios de estado a traves de coordinadores, no por acceso directo al estado global.

## Constantes del ritmo interno
- `INERCIA_VIVA_FREQUENCY_HZ`, `INERCIA_VIVA_AMPLITUDE`, `INERCIA_VIVA_COLOR`.
- `PULSO_INICIAL_FREQUENCY_HZ`, `PULSO_INICIAL_AMPLITUDE`, `PULSO_INICIAL_COLOR`.
- `DESLIZAMIENTO_INTERNO_FREQUENCY_HZ`, `DESLIZAMIENTO_INTERNO_AMPLITUDE`, `DESLIZAMIENTO_INTERNO_COLOR`.
- `RITMO_EMERGE_FREQUENCY_HZ`, `RITMO_EMERGE_AMPLITUDE`, `RITMO_EMERGE_COLOR`.
- `INITIAL_STATE_TRANSITION_DELAY_MS`, `PULSO_INICIAL_TO_DESLIZAMIENTO_DELAY_MS`, `DESLIZAMIENTO_INTERNO_TO_RITMO_EMERGE_DELAY_MS`.

Se centralizan en `config/constants.js` para ajustar el pulso en un solo lugar sin tocar orquestadores, coordinadores ni capas.

## Calibracion sensorial actual del Pulso + Halo
- `INERCIA_VIVA`: frecuencia lenta y micro-amplitud; color casi apagado. El halo respira apenas (escala base contenida y opacidad baja) para insinuar vida sin distraer.
- `PULSO_INICIAL`: frecuencia algo mas presente y amplitud leve; color mas definido. El halo acompana con un leve ensanchamiento y un brillo sutil que marca el primer latido visible.
- `DESLIZAMIENTO_INTERNO`: frecuencia fluida y amplitud media; color decidido. El halo expande y contrae con mayor variacion, sugiriendo movimiento sostenido y deslizante.
- `RITMO_EMERGE`: frecuencia clara pero contemplativa y amplitud amplia sin agresividad; color mas luminoso. El halo se siente como un campo energetico visible, con opacidad moderada y variacion amplia pero suave.

La progresion entre estados se manifiesta por cambios combinados de frecuencia, amplitud, color y respiracion del halo (escala, opacidad y variacion), todo parametrizado en `config/constants.js` sin tocar engine ni capas.

## Lineas de diseno para futuros estados y capas
- Mantener `core/engine.js` como ensamblador + loop, sin logica narrativa.
- Definir nuevos estados en `internalStates` y mapear sus parametros en orquestadores.
- Hacer capas siempre parametrizables (metodos tipo `applyConfig`), sin acceso directo a la stateMachine.
- Anadir rituales en `transitions/` (coordinadores/managers), nunca dentro del engine o las capas.
- Centralizar ritmos, delays y colores base en `config/constants.js`.
- Gestionar ciclo de vida: `dispose` de capas/coordinadores cuando cambien escenas o se reinicie el engine.
- Evitar timers dispersos; preferir secuencias coordinadas desde pocos puntos claros.

## Patron de capa sincronizada con el Pulso
- Recibe una `pulseConfig` inicial y mantiene estado `current/start/target` para los parametros que usa (frecuencia, amplitud, color, opacidad/escala segun la capa).
- Implementa `init(scene)`, `update(deltaTime)`, `applyPulseConfig(config)` para activar transiciones internas, `onResize(...)` (NO-OP si no aplica) y `dispose()` liberando geometria/materiales y retirando el mesh.
- Usa helpers compartidos (`lerp`, `clamp`, etc.) para interpolar de forma consistente durante `PULSE_CONFIG_TRANSITION_DURATION_S`.

## Patron de coordinador de Pulso
- Se alimenta de `stateMachine` y `stateOrchestrator`.
- Aplica configs a un conjunto de targets (`pulseTargets`) via `applyPulseConfig`.
- Gestiona rituales temporales (ej. delay inicial de transicion de estado) y expone `dispose()` para limpiar listeners y timers.
- A futuro, puede ser gestionado por un punto central de teardown para agrupar limpiezas de escena.

## Notas de ciclo de vida
- Cada capa/coordinador debe implementar `dispose()` (remover de la escena si corresponde y liberar geometry/material/listeners/timers).
- Un manager de lifecycle podria agregarse mas adelante para centralizar limpiezas, pero hoy el contrato individual es suficiente.

## Lifecycle de Verum Motus
### Checklist de lifecycle
- Capas nuevas: implementar `update(deltaTime)` y `dispose()`, registrarse via la funcion oficial del lifecycle para capas, confirmar que `disposeAllLifecycle()` invoca su `dispose()` y que dejan de figurar en la coleccion interna (sin referencias pendientes).
- Coordinadores nuevos: gestionar timers/listeners internos y limpiarlos en `dispose()`, registrarse via la funcion oficial del lifecycle para coordinadores, confirmar que `disposeAllLifecycle()` los invoca y desaparecen de la coleccion interna.
- Prueba manual sugerida: iniciar la obra (`bootstrapVerumMotus()`), dejarla correr unos instantes, llamar `dispose()` del handle publico y verificar que no haya errores en consola, que no aparezca el warning `[IAQUIZU][LIFECYCLE]` (ideal) y que el canvas se retire del DOM. Este checklist es parte del QA basico para cualquier ticket que agregue capas, coordinadores o rituales.

## Timeline del Pulso
- El recorrido se declara en PULSE_STATE_TIMELINE con segmentos (fromState, toState, delayMs).
- `pulseStateCoordinator` usa esa secuencia para programar el siguiente `setState` desde el estado actual y limpia su timer activo en `dispose()`.
- Permite anadir pasos futuros (p.ej. RITMO_EMERGE, DISTORSION_APERTURA) solo editando la timeline, sin complejizar el coordinador.

## Control temporal del Pulso
- En esta fase, la secuencia del Pulso la gobiernan PULSE_STATE_TIMELINE (declaracion de pasos) y `pulseStateCoordinator` (lee la timeline y dispara `setState`).
- `stateMachine.setState` para el Pulso no se llama manualmente ni desde otras piezas: cualquier cambio debe pasar por la timeline/coordinadores.
- Para extender la secuencia: 1) declarar el estado en `internalStates`, 2) asignarle parametros en `stateOrchestrator`, 3) agregar un segmento `{ fromState, toState, delayMs }` en `PULSE_STATE_TIMELINE`.

## Nuevas capas sincronizadas con el Pulso
- Deben ser ciegas al estado global: no leen `stateMachine`; reciben `pulseConfig` y/o coordinadores.
- Interpolan sus parametros con helpers compartidos (`lerp`, `clamp`) respetando `PULSE_CONFIG_TRANSITION_DURATION_S` para transiciones coherentes.
- Implementan `dispose()` retirando su mesh de la escena y liberando geometry/material; sin leaks de Three.js.

## Guardrails de performance y lifecycle
- Pixel ratio: usar `renderer.setPixelRatio` en valores prudentes (<= 2.0 salvo decision explicita) para evitar sobrecosto.
- Capas y timers: priorizar pocas entidades significativas; toda entidad con timers/listeners debe limpiar en `dispose()`.
- Teardown central: `core/lifecycleManager` registra coordinadores/capas y expone `disposeAllLifecycle()`; futuros resets o cambios de escena deben pasar por ahi para evitar fugas y estados inconsistentes.

## Handle de escena y teardown
- `bootstrapVerumMotus` devuelve un handle con `dispose()` pensado para rituales de reset/cambio de escena.
- Orden esperado al invocarlo: 1) detener el loop (`cancelAnimationFrame` + bandera), 2) remover el listener de `resize`, 3) llamar `disposeAllLifecycle()` para limpiar coordinadores y capas.
- Las capas/coordinadores no se autodestruyen: la orquestacion del apagado vive en este handle de escena; capas y coordinadores siguen ciegos al estado global.

## Guardrail de pixelRatio
- El renderer usa `setPixelRatio` clamped por `MAX_PIXEL_RATIO` para evitar resoluciones excesivas en pantallas HiDPI.
- Es una decision consciente para preservar performance y mantener el caracter contemplativo sin introducir artefactos visuales ni ruido extra.

## Estado y timeline ampliados
- Se incorpora `RITMO_EMERGE` como cuarta etapa del pulso tras `DESLIZAMIENTO_INTERNO`: pulso mas presente y definido, aun contenido.
- La timeline declarativa del Pulso queda: `INERCIA_VIVA -> PULSO_INICIAL -> DESLIZAMIENTO_INTERNO -> RITMO_EMERGE`, cada tramo con su delay configurado en `config/constants.js`.

## API publica de la escena
- `bootstrapVerumMotus(container)` monta la obra en el contenedor y devuelve un handle con:
  - `dispose()`: detiene el loop (`requestAnimationFrame`), remueve el listener de `resize`, llama `disposeAllLifecycle()` y retira el canvas.
  - `getCurrentInternalState()`: devuelve el estado interno actual (p.ej. INERCIA_VIVA, PULSO_INICIAL, DESLIZAMIENTO_INTERNO, RITMO_EMERGE).
- Contrato: `stateMachine.setState` no debe llamarse desde el exterior; los cambios de estado se orquestan via `PULSE_STATE_TIMELINE` y coordinadores/rituales autorizados.
- Integracion: para apagar la obra, invocar `dispose()` del handle; para consultar el punto del recorrido interno, usar `getCurrentInternalState()`.
