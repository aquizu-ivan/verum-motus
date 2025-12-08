// src/core/lifecycleManager.js
// Registro central de entidades con ciclo de vida del Pulso.
const registeredLayers = [];
const registeredCoordinators = [];

export function registerLayerForLifecycle(layer) {
  registeredLayers.push(layer);
}

export function registerCoordinatorForLifecycle(coordinator) {
  registeredCoordinators.push(coordinator);
}

export function disposeAllLifecycle() {
  // Coordinadores primero: limpian timers/listeners.
  for (const coordinator of registeredCoordinators) {
    if (coordinator && typeof coordinator.dispose === 'function') {
      coordinator.dispose();
    }
  }

  // Capas despues: liberan geometria/material/meshes.
  for (const layer of registeredLayers) {
    if (layer && typeof layer.dispose === 'function') {
      layer.dispose();
    }
  }

  registeredCoordinators.length = 0;
  registeredLayers.length = 0;
}
