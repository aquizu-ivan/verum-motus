// src/transitions/pulseStateCoordinator.js
// Coordina el estado interno con la configuracion del Pulso Interno.
// Escucha la stateMachine, consulta el orquestador y aplica la config a la capa.
import { INTERNAL_STATES } from '../states/internalStates.js';
import { PULSE_STATE_TIMELINE } from './pulseTimeline.js';
import {
  DISTORSION_APERTURA_FREQUENCY_HZ,
  DISTORSION_APERTURA_AMPLITUDE,
  DISTORSION_APERTURA_COLOR,
  QUIETUD_TENSA_FREQUENCY_HZ,
  QUIETUD_TENSA_AMPLITUDE,
  QUIETUD_TENSA_COLOR,
  DISTORSION_APERTURA_HALO_SCALE_MULTIPLIER,
  DISTORSION_APERTURA_HALO_OPACITY,
  DISTORSION_APERTURA_HALO_VARIATION,
  QUIETUD_TENSA_HALO_SCALE_MULTIPLIER,
  QUIETUD_TENSA_HALO_OPACITY,
  QUIETUD_TENSA_HALO_VARIATION,
  OUTER_FIELD_CONFIG_BY_STATE,
} from '../config/constants.js';

// Coordina el estado interno con la configuracion del Pulso Interno.
// Escucha la stateMachine, consulta el orquestador y aplica la config a todos los targets de pulso.
export function createPulseStateCoordinator({ stateMachine, stateOrchestrator, pulseTargets }) {
  let activeTransitionTimerId = null;
  const pulseOverrides = {
    [INTERNAL_STATES.DISTORSION_APERTURA]: {
      frequency: DISTORSION_APERTURA_FREQUENCY_HZ,
      amplitude: DISTORSION_APERTURA_AMPLITUDE,
      color: DISTORSION_APERTURA_COLOR,
    },
    [INTERNAL_STATES.QUIETUD_TENSA]: {
      frequency: QUIETUD_TENSA_FREQUENCY_HZ,
      amplitude: QUIETUD_TENSA_AMPLITUDE,
      color: QUIETUD_TENSA_COLOR,
    },
  };

  const haloOverrides = {
    [INTERNAL_STATES.DISTORSION_APERTURA]: {
      scaleMultiplier: DISTORSION_APERTURA_HALO_SCALE_MULTIPLIER,
      opacity: DISTORSION_APERTURA_HALO_OPACITY,
      variation: DISTORSION_APERTURA_HALO_VARIATION,
    },
    [INTERNAL_STATES.QUIETUD_TENSA]: {
      scaleMultiplier: QUIETUD_TENSA_HALO_SCALE_MULTIPLIER,
      opacity: QUIETUD_TENSA_HALO_OPACITY,
      variation: QUIETUD_TENSA_HALO_VARIATION,
    },
  };

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

  function resolvePulseConfig(state) {
    return pulseOverrides[state] ?? stateOrchestrator.getCurrentPulseConfig();
  }

  function resolveHaloConfig(state) {
    return haloOverrides[state] ?? stateOrchestrator.getCurrentHaloConfig();
  }

  function resolveOuterFieldConfig(state) {
    return OUTER_FIELD_CONFIG_BY_STATE[state];
  }

  function handleStateChange(prevState, nextState) {
    const pulseConfig = resolvePulseConfig(nextState);
    const haloConfig = resolveHaloConfig(nextState);
    const outerFieldConfig = resolveOuterFieldConfig(nextState);
    pulseTargets.forEach((target) => {
      if (target && typeof target.applyPulseConfig === 'function') {
        target.applyPulseConfig(pulseConfig);
      }
      if (target && typeof target.applyHaloConfig === 'function') {
        target.applyHaloConfig(haloConfig);
      }
      if (target && typeof target.applyOuterFieldConfig === 'function') {
        target.applyOuterFieldConfig(outerFieldConfig);
      }
    });

    scheduleNextFrom(nextState);
  }

  const unsubscribe = stateMachine.subscribe(handleStateChange);

  handleStateChange(stateMachine.getCurrentState(), stateMachine.getCurrentState());

  return {
    dispose() {
      unsubscribe();
      if (activeTransitionTimerId) {
        clearTimeout(activeTransitionTimerId);
      }
    },
  };
}
