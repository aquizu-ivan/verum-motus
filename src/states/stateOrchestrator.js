// src/states/stateOrchestrator.js
// Orquestador simbolico: traduce el estado interno a parametros del Pulso Interno.
// No conoce Three.js ni manipula capas; solo expone configs derivadas del estado actual.
import { INTERNAL_STATES } from './internalStates.js';
import {
  INERCIA_VIVA_FREQUENCY_HZ,
  INERCIA_VIVA_AMPLITUDE,
  INERCIA_VIVA_COLOR,
  PULSO_INICIAL_FREQUENCY_HZ,
  PULSO_INICIAL_AMPLITUDE,
  PULSO_INICIAL_COLOR,
  DESLIZAMIENTO_INTERNO_FREQUENCY_HZ,
  DESLIZAMIENTO_INTERNO_AMPLITUDE,
  DESLIZAMIENTO_INTERNO_COLOR,
  RITMO_EMERGE_FREQUENCY_HZ,
  RITMO_EMERGE_AMPLITUDE,
  RITMO_EMERGE_COLOR,
  INERCIA_VIVA_HALO_SCALE_MULTIPLIER,
  INERCIA_VIVA_HALO_OPACITY,
  INERCIA_VIVA_HALO_VARIATION,
  PULSO_INICIAL_HALO_SCALE_MULTIPLIER,
  PULSO_INICIAL_HALO_OPACITY,
  PULSO_INICIAL_HALO_VARIATION,
  DESLIZAMIENTO_INTERNO_HALO_SCALE_MULTIPLIER,
  DESLIZAMIENTO_INTERNO_HALO_OPACITY,
  DESLIZAMIENTO_INTERNO_HALO_VARIATION,
  RITMO_EMERGE_HALO_SCALE_MULTIPLIER,
  RITMO_EMERGE_HALO_OPACITY,
  RITMO_EMERGE_HALO_VARIATION,
  INERCIA_VIVA_OUTER_FIELD_SCALE_MULTIPLIER,
  INERCIA_VIVA_OUTER_FIELD_OPACITY,
  INERCIA_VIVA_OUTER_FIELD_VARIATION,
  PULSO_INICIAL_OUTER_FIELD_SCALE_MULTIPLIER,
  PULSO_INICIAL_OUTER_FIELD_OPACITY,
  PULSO_INICIAL_OUTER_FIELD_VARIATION,
  DESLIZAMIENTO_INTERNO_OUTER_FIELD_SCALE_MULTIPLIER,
  DESLIZAMIENTO_INTERNO_OUTER_FIELD_OPACITY,
  DESLIZAMIENTO_INTERNO_OUTER_FIELD_VARIATION,
  RITMO_EMERGE_OUTER_FIELD_SCALE_MULTIPLIER,
  RITMO_EMERGE_OUTER_FIELD_OPACITY,
  RITMO_EMERGE_OUTER_FIELD_VARIATION,
} from '../config/constants.js';

export function createStateOrchestrator(stateMachine) {
  // Mapa de estados internos a parametros del Pulso Interno.
  const pulseConfigsByState = {
    [INTERNAL_STATES.INERCIA_VIVA]: {
      frequency: INERCIA_VIVA_FREQUENCY_HZ,
      amplitude: INERCIA_VIVA_AMPLITUDE,
      color: INERCIA_VIVA_COLOR,
    },
    [INTERNAL_STATES.PULSO_INICIAL]: {
      frequency: PULSO_INICIAL_FREQUENCY_HZ,
      amplitude: PULSO_INICIAL_AMPLITUDE,
      color: PULSO_INICIAL_COLOR,
    },
    [INTERNAL_STATES.DESLIZAMIENTO_INTERNO]: {
      frequency: DESLIZAMIENTO_INTERNO_FREQUENCY_HZ,
      amplitude: DESLIZAMIENTO_INTERNO_AMPLITUDE,
      color: DESLIZAMIENTO_INTERNO_COLOR,
    },
    [INTERNAL_STATES.RITMO_EMERGE]: {
      frequency: RITMO_EMERGE_FREQUENCY_HZ,
      amplitude: RITMO_EMERGE_AMPLITUDE,
      color: RITMO_EMERGE_COLOR,
    },
  };

  const haloConfigsByState = {
    [INTERNAL_STATES.INERCIA_VIVA]: {
      scaleMultiplier: INERCIA_VIVA_HALO_SCALE_MULTIPLIER,
      opacity: INERCIA_VIVA_HALO_OPACITY,
      variation: INERCIA_VIVA_HALO_VARIATION,
    },
    [INTERNAL_STATES.PULSO_INICIAL]: {
      scaleMultiplier: PULSO_INICIAL_HALO_SCALE_MULTIPLIER,
      opacity: PULSO_INICIAL_HALO_OPACITY,
      variation: PULSO_INICIAL_HALO_VARIATION,
    },
    [INTERNAL_STATES.DESLIZAMIENTO_INTERNO]: {
      scaleMultiplier: DESLIZAMIENTO_INTERNO_HALO_SCALE_MULTIPLIER,
      opacity: DESLIZAMIENTO_INTERNO_HALO_OPACITY,
      variation: DESLIZAMIENTO_INTERNO_HALO_VARIATION,
    },
    [INTERNAL_STATES.RITMO_EMERGE]: {
      scaleMultiplier: RITMO_EMERGE_HALO_SCALE_MULTIPLIER,
      opacity: RITMO_EMERGE_HALO_OPACITY,
      variation: RITMO_EMERGE_HALO_VARIATION,
    },
  };

  function getCurrentPulseConfig() {
    const currentState = stateMachine.getCurrentState();
    const config = pulseConfigsByState[currentState];
    if (config) {
      return config;
    }
    // Fallback seguro: usar INERCIA_VIVA como base si no hay config explicita.
    return pulseConfigsByState[INTERNAL_STATES.INERCIA_VIVA];
  }

  function getCurrentHaloConfig() {
    const currentState = stateMachine.getCurrentState();
    const config = haloConfigsByState[currentState];
    if (config) {
      return config;
    }
    return haloConfigsByState[INTERNAL_STATES.INERCIA_VIVA];
  }

  return {
    getCurrentPulseConfig,
    getCurrentHaloConfig,
  };
}
