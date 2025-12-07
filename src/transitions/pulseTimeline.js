// src/transitions/pulseTimeline.js
import { INTERNAL_STATES } from '../states/internalStates.js';
import {
  INITIAL_STATE_TRANSITION_DELAY_MS,
  PULSO_INICIAL_TO_DESLIZAMIENTO_DELAY_MS,
} from '../config/constants.js';

// Secuencia declarativa del recorrido del Pulso: estado origen, destino y delay relativo.
export const PULSE_STATE_TIMELINE = [
  {
    fromState: INTERNAL_STATES.INERCIA_VIVA,
    toState: INTERNAL_STATES.PULSO_INICIAL,
    delayMs: INITIAL_STATE_TRANSITION_DELAY_MS,
  },
  {
    fromState: INTERNAL_STATES.PULSO_INICIAL,
    toState: INTERNAL_STATES.DESLIZAMIENTO_INTERNO,
    delayMs: PULSO_INICIAL_TO_DESLIZAMIENTO_DELAY_MS,
  },
];
