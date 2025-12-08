// src/core/lifecycleManager.js
// Registro central de entidades con ciclo de vida del Pulso.
const registeredLayers = [];
const registeredCoordinators = [];

/**
 * Registra una capa en el lifecycle.
 * Contrato: la capa debe implementar update(deltaTime), dispose()
 * y permanecer ciega al estado global (recibe parametros via coordinadores).
 */
export function registerLayerForLifecycle(layer) {
  registeredLayers.push(layer);
}

/**
 * Registra un coordinador en el lifecycle.
 * Contrato: el coordinador debe gestionar sus timers/listeners internos,
 * implementar dispose() para limpiarlos y ser la unica fuente de setState autorizado.
 */
export function registerCoordinatorForLifecycle(coordinator) {
  registeredCoordinators.push(coordinator);
}

/**
 * Apaga el lifecycle en orden: primero coordinadores (cortan timers/listeners),
 * luego capas (liberan geometria/material/meshes).
 * Guardrail: si despues del apagado quedan entidades registradas, se loggea
 * un warning para detectar problemas de registro/teardown.
 */
export function disposeAllLifecycle() {
  const coordinatorsToDispose = registeredCoordinators.splice(0, registeredCoordinators.length);
  for (const coordinator of coordinatorsToDispose) {
    if (coordinator && typeof coordinator.dispose === 'function') {
      coordinator.dispose();
    }
  }

  const layersToDispose = registeredLayers.splice(0, registeredLayers.length);
  for (const layer of layersToDispose) {
    if (layer && typeof layer.dispose === 'function') {
      layer.dispose();
    }
  }

  if (registeredCoordinators.length > 0 || registeredLayers.length > 0) {
    console.warn(
      '[IAQUIZU][LIFECYCLE] Quedaron capas y/o coordinadores registrados despues de disposeAllLifecycle(). ' +
        'Revisar registro y teardown del lifecycle en Verum Motus.'
    );
  }

  registeredCoordinators.length = 0;
  registeredLayers.length = 0;
}
