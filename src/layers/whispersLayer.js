// src/layers/whispersLayer.js
// Capa visual de susurros: dibuja textos suaves sobre la escena sin tocar el estado.
import { BaseLayer } from './baseLayer.js';
import { WHISPER_VISUAL } from '../whispers/whispersConfig.js';

export class WhispersLayer extends BaseLayer {
  constructor({ getActiveWhispers }) {
    super();
    this.getActiveWhispers = getActiveWhispers;
    this.container = null;
    this.elements = new Map();
    this.debugLogged = false;
  }

  init() {
    const container = document.createElement('div');
    container.className = 'whispers-overlay';
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    container.style.color = 'rgb(226, 190, 118)';
    container.style.fontFamily =
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    container.style.fontSize = 'clamp(1.24rem, 1.85vw, 1.56rem)';
    container.style.lineHeight = '1.32';
    container.style.letterSpacing = '0.06em';
    container.style.userSelect = 'none';
    container.style.background = 'transparent';
    container.style.border = 'none';
    container.style.boxShadow = 'none';
    container.style.filter = 'none';
    container.style.zIndex = '3000';
    container.style.mixBlendMode = 'normal';

    const root = document.getElementById('verum-root');
    if (root) {
      root.appendChild(container);
    } else {
      document.body.appendChild(container);
    }

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
        element.style.maxWidth = '28rem';
        element.style.textAlign = 'left';
        element.style.whiteSpace = 'pre-wrap';
        element.style.transform = 'translate3d(-50%, -50%, 0)';
        element.style.transition = 'opacity 0.16s linear';
        element.style.background = 'transparent';
        element.style.border = 'none';
        element.style.boxShadow = 'none';
        element.style.letterSpacing = '0.06em';
        element.className = 'whisper-text whisper-text--pearled';
        if (whisper.isFinal) {
          element.className = `${element.className} whisper-text--final`;
        }

        const blurPeak = Math.max(WHISPER_VISUAL.blurPeakPx ?? 1.4, 0);
        const blurEdge = Math.max(WHISPER_VISUAL.blurEdgePx ?? 3.2, blurPeak);
        const auraBlur = Math.max(WHISPER_VISUAL.auraBlurPx ?? blurEdge + 1, blurEdge);
        const opacityFactor = Math.max(0, Math.min(1, whisper.opacity ?? 0));
        const blurPx = blurPeak + (1 - opacityFactor) * (blurEdge - blurPeak);
        const auraBlurPx = auraBlur + (1 - opacityFactor) * 0.4;
        const auraOpacityMultiplier = WHISPER_VISUAL.auraOpacityMultiplier ?? 0.26;

        const primarySpan = document.createElement('span');
        primarySpan.className = 'whisper-pass whisper-pass--primary';
        primarySpan.style.display = 'block';
        primarySpan.style.textShadow =
          '0 0 18px rgba(0, 0, 0, 0.42), 0 0 12px rgba(226, 190, 118, 0.22)';
        primarySpan.style.filter = `blur(${blurPx.toFixed(2)}px)`;
        primarySpan.dataset.alpha = opacityFactor.toFixed(2);
        primarySpan.dataset.blur = blurPx.toFixed(2);

        const ghostSpan = document.createElement('span');
        ghostSpan.className = 'whisper-pass whisper-pass--ghost';
        ghostSpan.style.display = 'block';
        ghostSpan.style.transform = 'translate3d(0.9px, 0.45px, 0)';
        ghostSpan.style.opacity = (opacityFactor * auraOpacityMultiplier).toFixed(2);
        ghostSpan.style.textShadow =
          '0 0 16px rgba(0, 0, 0, 0.45), 0 0 22px rgba(226, 190, 118, 0.22)';
        ghostSpan.style.filter = `blur(${auraBlurPx.toFixed(2)}px)`;
        ghostSpan.dataset.blur = auraBlurPx.toFixed(2);

        primarySpan.textContent = whisper.text;
        ghostSpan.textContent = whisper.text;

        element.appendChild(primarySpan);
        element.appendChild(ghostSpan);

        this.elements.set(whisper.id, element);
        this.container.appendChild(element);
      } else {
        const primarySpan = element.querySelector('.whisper-pass--primary');
        const ghostSpan = element.querySelector('.whisper-pass--ghost');
        const blurPeak = Math.max(WHISPER_VISUAL.blurPeakPx ?? 1.4, 0);
        const blurEdge = Math.max(WHISPER_VISUAL.blurEdgePx ?? 3.2, blurPeak);
        const auraBlur = Math.max(WHISPER_VISUAL.auraBlurPx ?? blurEdge + 1, blurEdge);
        const auraOpacityMultiplier = WHISPER_VISUAL.auraOpacityMultiplier ?? 0.26;
        const opacityFactor = Math.max(0, Math.min(1, whisper.opacity ?? 0));
        const blurPx = blurPeak + (1 - opacityFactor) * (blurEdge - blurPeak);
        const auraBlurPx = auraBlur + (1 - opacityFactor) * 0.4;
        if (primarySpan) {
          if (primarySpan.textContent !== whisper.text) {
            primarySpan.textContent = whisper.text;
          }
          primarySpan.style.filter = `blur(${blurPx.toFixed(2)}px)`;
          primarySpan.dataset.alpha = opacityFactor.toFixed(2);
          primarySpan.dataset.blur = blurPx.toFixed(2);
        }
        if (ghostSpan) {
          if (ghostSpan.textContent !== whisper.text) {
            ghostSpan.textContent = whisper.text;
          }
          ghostSpan.style.filter = `blur(${auraBlurPx.toFixed(2)}px)`;
          ghostSpan.style.opacity = (opacityFactor * auraOpacityMultiplier).toFixed(2);
          ghostSpan.dataset.blur = auraBlurPx.toFixed(2);
        }
      }

      const totalDuration =
        whisper.totalDurationMs || whisper.fadeInMs + whisper.holdMs + whisper.fadeOutMs;
      const progress =
        totalDuration > 0 ? Math.min(1, Math.max(0, whisper.elapsedMs / totalDuration)) : 0;
      const motionRange = whisper.motionRangePx ?? 5;
      const floatY = Math.sin(progress * Math.PI) * motionRange;

      const jitterRange = whisper.jitterRangePx ?? 0;
      const jitterSpeed = whisper.jitterSpeed ?? 0;
      const jitterSeed = whisper.jitterSeed ?? 0;
      const jitterT = jitterSpeed > 0 ? whisper.elapsedMs * jitterSpeed : 0;
      const jitterX = Math.sin(jitterT + jitterSeed) * jitterRange;
      const jitterY = Math.cos(jitterT * 1.4 + jitterSeed) * jitterRange * 0.66;

      element.style.left = `${whisper.position.x}px`;
      element.style.top = `${whisper.position.y}px`;
      element.style.opacity = `${Math.max(0, Math.min(1, whisper.opacity ?? 0))}`;
      element.style.fontSize = 'clamp(1.24rem, 1.85vw, 1.56rem)';
      element.style.lineHeight = '1.34';
      element.className = whisper.isFinal
        ? 'whisper-text whisper-text--pearled whisper-text--final'
        : 'whisper-text whisper-text--pearled';
      element.style.transform = `translate3d(-50%, -50%, 0) translate(${jitterX.toFixed(
        2
      )}px, ${(floatY + jitterY).toFixed(2)}px)`;

      if (element.dataset) {
        element.dataset.alpha = `${Math.max(0, Math.min(1, whisper.opacity ?? 0)).toFixed(2)}`;
      }

      const debugFlag =
        typeof window !== 'undefined' && window.__VM_DEBUG_WHISPERS__ === true;
      if (debugFlag && !this.debugLogged) {
        const computed = window.getComputedStyle(element);
        // eslint-disable-next-line no-console
        console.log('[WHISPERS][DEBUG]', {
          opacity: computed.opacity,
          filter: computed.filter,
          color: computed.color,
          zIndex: computed.zIndex,
          alphaDataset: element.dataset.alpha,
          blurDataset: element.querySelector('.whisper-pass--primary')?.dataset.blur,
        });
        this.debugLogged = true;
      }
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
