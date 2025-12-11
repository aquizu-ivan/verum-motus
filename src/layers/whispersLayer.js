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
    container.style.color = 'rgba(220, 220, 220, 0.7)';
    container.style.fontFamily =
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    container.style.fontSize = '0.9rem';
    container.style.lineHeight = '1.35';
    container.style.letterSpacing = '0.025em';
    container.style.userSelect = 'none';
    container.style.background = 'transparent';
    container.style.border = 'none';
    container.style.boxShadow = 'none';

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
        element.style.maxWidth = '26rem';
        element.style.textAlign = 'left';
        element.style.whiteSpace = 'pre-wrap';
        element.style.transform = 'translate3d(-50%, -50%, 0)';
        element.style.transition = 'opacity 0.12s linear';
        element.style.background = 'transparent';
        element.style.border = 'none';
        element.style.boxShadow = 'none';
        element.style.letterSpacing = '0.028em';
        element.className = 'whisper-text whisper-text--pearled';
        if (whisper.isFinal) {
          element.className = `${element.className} whisper-text--final`;
        }
        element.textContent = whisper.text;
        this.elements.set(whisper.id, element);
        this.container.appendChild(element);
      } else if (element.textContent !== whisper.text) {
        element.textContent = whisper.text;
      }

      const totalDuration = whisper.totalDurationMs || whisper.fadeInMs + whisper.holdMs + whisper.fadeOutMs;
      const progress = totalDuration > 0 ? Math.min(1, Math.max(0, whisper.elapsedMs / totalDuration)) : 0;
      const motionRange = whisper.motionRangePx ?? 8;
      const deltaY = Math.sin(progress * Math.PI) * motionRange;

      element.style.left = `${whisper.position.x}px`;
      element.style.top = `${whisper.position.y}px`;
      element.style.opacity = `${Math.max(0, Math.min(1, whisper.opacity ?? 0))}`;
      element.style.fontSize = whisper.isFinal ? '0.95rem' : '0.9rem';
      element.style.lineHeight = whisper.isFinal ? '1.38' : '1.35';
      element.className = whisper.isFinal
        ? 'whisper-text whisper-text--pearled whisper-text--final'
        : 'whisper-text whisper-text--pearled';
      element.style.transform = `translate3d(-50%, -50%, 0) translateY(${deltaY.toFixed(2)}px)`;
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
