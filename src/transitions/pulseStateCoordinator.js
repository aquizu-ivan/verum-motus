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
  CONSCIOUSNESS_PHASES,
  GOLDEN_TINT_COLOR,
  GOLDEN_TINT_STRENGTH,
  GOLDEN_INTENSITY_MIN,
  GOLDEN_INTENSITY_MAX,
  GOLDEN_INTENSITY_MIN_FINAL,
  PULSE_AMPLITUDE_MIN,
  PULSE_AMPLITUDE_MAX,
} from '../config/constants.js';
import {
  scheduleMicroEventsForState,
  clearAllMicroEventTimers,
} from './pulseMicroEvents.js';

// Coordina el estado interno con la configuracion del Pulso Interno.
// Escucha la stateMachine, consulta el orquestador y aplica la config a todos los targets de pulso.
export function createPulseStateCoordinator({ stateMachine, stateOrchestrator, pulseTargets }) {
  let activeTransitionTimerId = null;
  const microEventTimers = [];
  let goldenAwakened = false;
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

    const isConsciousnessPhase = CONSCIOUSNESS_PHASES.includes(nextState);
    if (isConsciousnessPhase && !goldenAwakened) {
      goldenAwakened = true;
    }

    const normalizeAmplitude = (value) => {
      const min = PULSE_AMPLITUDE_MIN ?? 0;
      const max = PULSE_AMPLITUDE_MAX ?? 1;
      const span = Math.max(0.0001, max - min);
      const clamped = Math.max(0, Math.min(1, (value - min) / span));
      // Easing suave para evitar saltos bruscos
      return clamped * clamped;
    };

    const computeGoldenStrength = (configs) => {
      const hasPhaseFactor = isConsciousnessPhase || goldenAwakened;
      if (!hasPhaseFactor) return 0;
      const amp = configs?.pulseConfig?.amplitude ?? pulseConfig?.amplitude ?? 0;
      const eased = normalizeAmplitude(amp);
      let min = GOLDEN_INTENSITY_MIN ?? 0;
      const isFinalStablePhase = nextState === INTERNAL_STATES.QUIETUD_TENSA;
      if (isFinalStablePhase && typeof GOLDEN_INTENSITY_MIN_FINAL === 'number') {
        min = Math.max(min, GOLDEN_INTENSITY_MIN_FINAL);
      }
      const max = GOLDEN_INTENSITY_MAX ?? GOLDEN_TINT_STRENGTH ?? 0.2;
      return min + eased * Math.max(0, max - min);
    };

    const applyConfigs = (configs) => {
      const {
        pulseConfig: nextPulse = pulseConfig,
        haloConfig: nextHalo = haloConfig,
        fieldConfig: nextField = outerFieldConfig,
      } = configs || {};
      const goldenStrength = computeGoldenStrength({ pulseConfig: nextPulse });
      pulseTargets.forEach((target) => {
        if (target && typeof target.applyPulseConfig === 'function') {
          target.applyPulseConfig(nextPulse);
        }
        if (target && typeof target.applyHaloConfig === 'function') {
          target.applyHaloConfig(nextHalo);
        }
        if (target && typeof target.applyOuterFieldConfig === 'function') {
          target.applyOuterFieldConfig(nextField);
        }
        if (target && typeof target.setGoldenTint === 'function') {
          target.setGoldenTint({
            color: GOLDEN_TINT_COLOR,
            strength: goldenStrength,
          });
        }
      });
    };

    applyConfigs({ pulseConfig, haloConfig, fieldConfig: outerFieldConfig });

    clearAllMicroEventTimers(microEventTimers);
    const baseConfigs = {
      pulseConfig,
      haloConfig,
      fieldConfig: outerFieldConfig,
    };

    scheduleMicroEventsForState(
      nextState,
      baseConfigs,
      {
        applyOverride: (overrideConfigs) => applyConfigs(overrideConfigs),
        restoreBase: () => applyConfigs(baseConfigs),
      },
      microEventTimers
    );

    scheduleNextFrom(nextState);
  }

  const unsubscribe = stateMachine.subscribe(handleStateChange);

  handleStateChange(stateMachine.getCurrentState(), stateMachine.getCurrentState());

  return {
    dispose() {
      unsubscribe();
      clearAllMicroEventTimers(microEventTimers);
      if (activeTransitionTimerId) {
        clearTimeout(activeTransitionTimerId);
      }
    },
  };
}
