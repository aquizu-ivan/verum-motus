// src/layers/whispersLayer.js
// Capa visual de susurros: dibuja textos suaves sobre la escena sin tocar el estado.
import { BaseLayer } from './baseLayer.js';

export class WhispersLayer extends BaseLayer {
  constructor({ getActiveWhispers }) {
    super();
    this.getActiveWhispers = getActiveWhispers;
    this.container = null;
    this.elements = new Map();
  }

  init() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.color = '#d6d6d6';
    container.style.fontFamily = '"Gill Sans", "Helvetica Neue", Arial, sans-serif';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.5';
    container.style.letterSpacing = '0.02em';
    container.style.userSelect = 'none';

    document.body.appendChild(container);

    this.container = container;
  }

  update(/* deltaTime */) {
    if (!this.container || typeof this.getActiveWhispers !== 'function') {
      return;
    }

    const activeWhispers = this.getActiveWhispers() ?? [];
    const activeIds = new Set();

    for (const whisper of activeWhispers) {
      activeIds.add(whisper.id);
      let element = this.elements.get(whisper.id);

      if (!element) {
        element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.maxWidth = '360px';
        element.style.textAlign = 'left';
        element.style.whiteSpace = 'pre-wrap';
        element.style.transform = 'translate(-50%, -50%)';
        element.style.transition = 'opacity 0.1s linear';
        element.textContent = whisper.text;
        this.elements.set(whisper.id, element);
        this.container.appendChild(element);
      } else if (element.textContent !== whisper.text) {
        element.textContent = whisper.text;
      }

      element.style.left = `${whisper.position.x}px`;
      element.style.top = `${whisper.position.y}px`;
      element.style.opacity = `${Math.max(0, Math.min(1, whisper.opacity ?? 0))}`;
      element.style.fontSize = whisper.isFinal ? '13px' : '12px';
      element.style.color = whisper.isFinal ? '#e1e1e1' : '#cfcfcf';
    }

    // Retirar nodos que ya no estan activos
    for (const [id, element] of this.elements.entries()) {
      if (!activeIds.has(id)) {
        if (element.parentElement) {
          element.parentElement.removeChild(element);
        }
        this.elements.delete(id);
      }
    }
  }

  onResize(/* width, height */) {
    // Overlay ya es full viewport; no requiere ajustes en esta version.
  }

  dispose() {
    for (const [, element] of this.elements) {
      if (element.parentElement) {
        element.parentElement.removeChild(element);
      }
    }
    this.elements.clear();

    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
    this.container = null;
  }
}
