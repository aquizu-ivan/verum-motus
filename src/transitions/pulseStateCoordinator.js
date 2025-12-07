// src/transitions/pulseStateCoordinator.js
// Coordina el estado interno con la configuracion del Pulso Interno.
// Escucha la stateMachine, consulta el orquestador y aplica la config a la capa.

export function createPulseStateCoordinator({ stateMachine, stateOrchestrator, innerPulseLayer }) {
  function handleStateChange(prevState, nextState) {
    const pulseConfig = stateOrchestrator.getCurrentPulseConfig();
    innerPulseLayer.applyPulseConfig(pulseConfig);
  }

  const unsubscribe = stateMachine.subscribe(handleStateChange);

  return {
    dispose() {
      unsubscribe();
    },
  };
}
