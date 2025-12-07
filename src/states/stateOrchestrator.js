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
    [INTERNAL_STATES.PULSO_INICIAL]: {
      frequency: 1 / 3, // pulso mas presente: el doble de rapido que INERCIA_VIVA
      amplitude: 0.06, // el doble de amplitud: respiracion mas visible
      color: 0xefefef, // gris ligeramente mas claro
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
