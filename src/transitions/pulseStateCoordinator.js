// src/transitions/pulseStateCoordinator.js
// Coordina el estado interno con la configuracion del Pulso Interno.
// Escucha la stateMachine, consulta el orquestador y aplica la config a la capa.
import { INTERNAL_STATES } from '../states/internalStates.js';

export function createPulseStateCoordinator({ stateMachine, stateOrchestrator, innerPulseLayer }) {
  function handleStateChange(prevState, nextState) {
    const pulseConfig = stateOrchestrator.getCurrentPulseConfig();
    innerPulseLayer.applyPulseConfig(pulseConfig);
  }

  const unsubscribe = stateMachine.subscribe(handleStateChange);

  const INITIAL_TRANSITION_DELAY_MS = 10000; // Primer ritual: pasar de INERCIA_VIVA a PULSO_INICIAL tras ~10s.
  const transitionTimerId = setTimeout(() => {
    stateMachine.setState(INTERNAL_STATES.PULSO_INICIAL);
  }, INITIAL_TRANSITION_DELAY_MS);

  return {
    dispose() {
      unsubscribe();
      clearTimeout(transitionTimerId);
    },
  };
}
