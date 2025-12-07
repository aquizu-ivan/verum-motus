// src/states/stateMachine.js
// Maquina de estados simbolica; no conoce Three.js ni capas, solo gestiona el estado interno.
// Orquesta transiciones narrativas notificando a listeners con (prevState, nextState).

export function createStateMachine({ initialState, allowedStates }) {
  if (!Array.isArray(allowedStates) || allowedStates.length === 0) {
    throw new Error('State machine requiere allowedStates no vacio');
  }
  if (!allowedStates.includes(initialState)) {
    throw new Error(`Estado inicial invalido: ${initialState}`);
  }

  let currentState = initialState;
  const listeners = [];

  function getCurrentState() {
    return currentState;
  }

  function setState(nextState) {
    if (nextState === currentState) {
      return;
    }
    if (!allowedStates.includes(nextState)) {
      console.warn(`Intento de estado no permitido: ${nextState}`);
      return;
    }

    const prevState = currentState;
    currentState = nextState;

    // Notificar listeners con la transicion ocurrida.
    for (const listener of listeners) {
      listener(prevState, nextState);
    }
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener debe ser una funcion');
    }
    listeners.push(listener);
    return () => unsubscribe(listener);
  }

  function unsubscribe(listener) {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  return {
    getCurrentState,
    setState,
    subscribe,
    unsubscribe,
  };
}
