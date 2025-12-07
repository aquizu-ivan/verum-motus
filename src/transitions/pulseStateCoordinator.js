// src/transitions/pulseStateCoordinator.js
// Coordina el estado interno con la configuracion del Pulso Interno.
// Escucha la stateMachine, consulta el orquestador y aplica la config a la capa.
import { INTERNAL_STATES } from '../states/internalStates.js';
import { PULSE_STATE_TIMELINE } from './pulseTimeline.js';

// Coordina el estado interno con la configuracion del Pulso Interno.
// Escucha la stateMachine, consulta el orquestador y aplica la config a todos los targets de pulso.
export function createPulseStateCoordinator({ stateMachine, stateOrchestrator, pulseTargets }) {
  let activeTransitionTimerId = null;

  function scheduleNextFrom(currentState) {
    const step = PULSE_STATE_TIMELINE.find((segment) => segment.fromState === currentState);
    if (!step) {
      return;
    }
    if (activeTransitionTimerId) {
      clearTimeout(activeTransitionTimerId);
    }
    activeTransitionTimerId = setTimeout(() => {
      stateMachine.setState(step.toState);
    }, step.delayMs);
  }

  function handleStateChange(prevState, nextState) {
    const pulseConfig = stateOrchestrator.getCurrentPulseConfig();
    pulseTargets.forEach((target) => {
      if (target && typeof target.applyPulseConfig === 'function') {
        target.applyPulseConfig(pulseConfig);
      }
    });

    scheduleNextFrom(nextState);
  }

  const unsubscribe = stateMachine.subscribe(handleStateChange);

  scheduleNextFrom(stateMachine.getCurrentState());

  return {
    dispose() {
      unsubscribe();
      if (activeTransitionTimerId) {
        clearTimeout(activeTransitionTimerId);
      }
    },
  };
}
