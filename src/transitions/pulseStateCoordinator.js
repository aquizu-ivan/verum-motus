// src/transitions/pulseStateCoordinator.js
// Coordina el estado interno con la configuracion del Pulso Interno.
// Escucha la stateMachine, consulta el orquestador y aplica la config a la capa.
import { INTERNAL_STATES } from '../states/internalStates.js';
import { INITIAL_STATE_TRANSITION_DELAY_MS } from '../config/constants.js';

export function createPulseStateCoordinator({ stateMachine, stateOrchestrator, innerPulseLayer }) {
  function handleStateChange(prevState, nextState) {
    const pulseConfig = stateOrchestrator.getCurrentPulseConfig();
    innerPulseLayer.applyPulseConfig(pulseConfig);
  }

  const unsubscribe = stateMachine.subscribe(handleStateChange);

  const transitionTimerId = setTimeout(() => {
    stateMachine.setState(INTERNAL_STATES.PULSO_INICIAL);
  }, INITIAL_STATE_TRANSITION_DELAY_MS); // Primer cambio interno: INERCIA_VIVA -> PULSO_INICIAL tras el delay inicial.

  return {
    dispose() {
      unsubscribe();
      clearTimeout(transitionTimerId);
    },
  };
}
