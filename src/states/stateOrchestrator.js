// src/states/stateOrchestrator.js
// Orquestador simbolico: traduce el estado interno a parametros del Pulso Interno.
// No conoce Three.js ni manipula capas; solo expone configs derivadas del estado actual.
import { INTERNAL_STATES } from './internalStates.js';

export function createStateOrchestrator(stateMachine) {
  const pulseConfigsByState = {
    [INTERNAL_STATES.INERCIA_VIVA]: {
      frequency: 1 / 6, // ~1 ciclo cada 6 segundos
      amplitude: 0.03, // variacion minima de escala
      color: 0xdddddd, // gris suave actual
    },
    // Espacios para estados futuros (p.ej. PULSO_INICIAL, RITMO_EMERGE, etc.).
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
