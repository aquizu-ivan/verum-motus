// src/transitions/pulseStateCoordinator.js
// Coordina el estado interno con la configuracion del Pulso Interno.
// Escucha la stateMachine, consulta el orquestador y aplica la config a la capa.
import { INTERNAL_STATES } from '../states/internalStates.js';
import {
  INITIAL_STATE_TRANSITION_DELAY_MS,
  PULSO_INICIAL_TO_DESLIZAMIENTO_DELAY_MS,
} from '../config/constants.js';

// Coordina el estado interno con la configuracion del Pulso Interno.
// Escucha la stateMachine, consulta el orquestador y aplica la config a todos los targets de pulso.
export function createPulseStateCoordinator({ stateMachine, stateOrchestrator, pulseTargets }) {
  let secondTransitionTimerId = null;

  function handleStateChange(prevState, nextState) {
    const pulseConfig = stateOrchestrator.getCurrentPulseConfig();
    pulseTargets.forEach((target) => {
      if (target && typeof target.applyPulseConfig === 'function') {
        target.applyPulseConfig(pulseConfig);
      }
    });

    if (nextState === INTERNAL_STATES.PULSO_INICIAL && !secondTransitionTimerId) {
      secondTransitionTimerId = setTimeout(() => {
        stateMachine.setState(INTERNAL_STATES.DESLIZAMIENTO_INTERNO);
      }, PULSO_INICIAL_TO_DESLIZAMIENTO_DELAY_MS);
    }
  }

  const unsubscribe = stateMachine.subscribe(handleStateChange);

  const transitionTimerId = setTimeout(() => {
    stateMachine.setState(INTERNAL_STATES.PULSO_INICIAL);
  }, INITIAL_STATE_TRANSITION_DELAY_MS); // Primer cambio interno: INERCIA_VIVA -> PULSO_INICIAL tras el delay inicial.

  return {
    dispose() {
      unsubscribe();
      clearTimeout(transitionTimerId);
      if (secondTransitionTimerId) {
        clearTimeout(secondTransitionTimerId);
      }
    },
  };
}
