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
    // Espacios para estados futuros (p.ej. RITMO_EMERGE, etc.).
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

  return {
    getCurrentPulseConfig,
  };
}
