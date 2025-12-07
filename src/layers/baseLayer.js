// src/layers/baseLayer.js
/**
 * Patron base de una capa en Verum Motus.
 *
 * Metodos esperados (opcionales segun la implementacion concreta):
 * - init(scene): se llama una vez al registrar la capa.
 * - update(deltaTime): se llama en cada frame; deltaTime esta en milisegundos.
 *   Si se requiere en segundos: const deltaSeconds = deltaTime / 1000.
 * - onResize(width, height): notificacion de cambio de viewport.
 * - dispose(): liberar recursos asignados por la capa.
 */
export class BaseLayer {
  init(/* scene */) {}
  update(/* deltaTime */) {}
  onResize(/* width, height */) {}
  dispose() {}
}
