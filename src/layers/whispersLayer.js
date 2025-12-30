// src/layers/whispersLayer.js
// Capa visual de susurros: dibuja textos suaves sobre la escena sin tocar el estado.
import { BaseLayer } from './baseLayer.js';
import {
  WHISPER_FINAL_STYLE,
  WHISPER_MASK,
  WHISPER_SAFE_ZONE,
  WHISPER_TYPOGRAPHY,
} from '../whispers/whispersConfig.js';
import {
  isWhisperQaEnabled,
  logWhisperDiagnostics,
  logWhisperLayout,
  logWhisperUiRect,
  logWhisperUiTarget,
  recordWhisperOverlap,
  setWhisperQaFontSize,
  updateWhisperQaPosition,
} from '../whispers/whispersQa.js';

const FONT_SIZE_CLAMP = `clamp(${WHISPER_TYPOGRAPHY.fontSizeClamp.minRem}rem, ${
  WHISPER_TYPOGRAPHY.fontSizeClamp.vw
}vw, ${WHISPER_TYPOGRAPHY.fontSizeClamp.maxRem}rem)`;
const LETTER_SPACING = `${WHISPER_TYPOGRAPHY.letterSpacingEm}em`;
const MAX_WIDTH = `${WHISPER_TYPOGRAPHY.maxWidthRem}rem`;
const FINAL_FONT_SCALE = WHISPER_FINAL_STYLE.fontSizeScale ?? 1;
const FINAL_LETTER_SPACING_SCALE = WHISPER_FINAL_STYLE.letterSpacingScale ?? 1;
const FINAL_FONT_SIZE_CLAMP = `clamp(${(
  WHISPER_TYPOGRAPHY.fontSizeClamp.minRem * FINAL_FONT_SCALE
).toFixed(3)}rem, ${(WHISPER_TYPOGRAPHY.fontSizeClamp.vw * FINAL_FONT_SCALE).toFixed(
  3
)}vw, ${(WHISPER_TYPOGRAPHY.fontSizeClamp.maxRem * FINAL_FONT_SCALE).toFixed(3)}rem)`;
const FINAL_LETTER_SPACING = `${(
  WHISPER_TYPOGRAPHY.letterSpacingEm * FINAL_LETTER_SPACING_SCALE
).toFixed(3)}em`;
const SUBTLE_TEXT_BLUR_PX = 0.2;

function isFullscreenMode() {
  if (typeof document === 'undefined') {
    return false;
  }
  if (document.documentElement?.classList?.contains('is-fullscreen')) {
    return true;
  }
  return Boolean(
    document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
  );
}

function getFullscreenElement() {
  if (typeof document === 'undefined') {
    return null;
  }
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
}

function resolveWhisperUiTarget() {
  if (typeof document === 'undefined') {
    return null;
  }
  return getFullscreenElement() || document.body;
}

function resolveSafeZone(viewportWidth, viewportHeight) {
  const minDim = Math.min(viewportWidth, viewportHeight);
  const radius =
    minDim * (WHISPER_SAFE_ZONE.radiusRatio ?? 0) + (WHISPER_SAFE_ZONE.paddingPx ?? 0);
  return {
    x: viewportWidth * 0.5,
    y: viewportHeight * 0.5,
    radius,
  };
}

function doesRectIntersectCircle(rect, circle) {
  const closestX = Math.max(rect.left, Math.min(circle.x, rect.right));
  const closestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

export class WhispersLayer extends BaseLayer {
  constructor({ getActiveWhispers }) {
    super();
    this.getActiveWhispers = getActiveWhispers;
    this.container = null;
    this.maskLayer = null;
    this.elements = new Map();
    this.debugLogged = false;
    this.handleFullscreenChange = null;
    this.uiTarget = null;
  }

  init() {
    const container = document.createElement('div');
    container.id = 'whispers-ui';
    container.className = 'whispers-ui';
    container.style.pointerEvents = 'none';
    container.style.color = 'rgb(226, 190, 118)';
    container.style.fontFamily = WHISPER_TYPOGRAPHY.fontFamily;
    container.style.fontSize = FONT_SIZE_CLAMP;
    container.style.lineHeight = '1.32';
    container.style.letterSpacing = LETTER_SPACING;
    container.style.textAlign = 'center';
    container.style.userSelect = 'none';
    container.style.background = 'transparent';
    container.style.border = 'none';
    container.style.boxShadow = 'none';
    container.style.filter = 'none';
    container.style.overflow = 'visible';
    container.style.maskImage = 'none';
    container.style.webkitMaskImage = 'none';
    container.style.clipPath = 'none';
    container.style.mixBlendMode = 'normal';

    const maskLayer = document.createElement('div');
    maskLayer.className = 'whispers-mask';
    maskLayer.style.position = 'fixed';
    maskLayer.style.left = '0';
    maskLayer.style.top = '0';
    maskLayer.style.width = '100%';
    maskLayer.style.height = '100%';
    maskLayer.style.inset = '0';
    maskLayer.style.pointerEvents = 'none';
    maskLayer.style.background = 'transparent';
    maskLayer.style.border = 'none';
    maskLayer.style.boxShadow = 'none';
    maskLayer.style.filter = 'none';
    maskLayer.style.zIndex = '2900';
    maskLayer.style.mixBlendMode = 'normal';

    const root = document.getElementById('verum-root');
    if (root) {
      root.appendChild(maskLayer);
    } else if (document.body) {
      document.body.appendChild(maskLayer);
    }

    this.container = container;
    this.maskLayer = maskLayer;
    this.ensureUiTarget();
    this.applyMask();

    this.handleFullscreenChange = () => {
      this.ensureUiTarget();
      this.applyMask();
    };
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(
      (eventName) => {
        document.addEventListener(eventName, this.handleFullscreenChange);
      }
    );
  }

  ensureUiTarget() {
    if (!this.container || typeof document === 'undefined') {
      return;
    }
    const target = resolveWhisperUiTarget();
    if (!target) {
      return;
    }
    if (this.container.parentElement !== target) {
      target.appendChild(this.container);
    }
    this.uiTarget = target;
  }

  applyMask() {
    if (!this.maskLayer || typeof window === 'undefined') {
      return;
    }
    if (isFullscreenMode()) {
      this.maskLayer.style.maskImage = 'none';
      this.maskLayer.style.webkitMaskImage = 'none';
      this.maskLayer.style.maskRepeat = 'no-repeat';
      this.maskLayer.style.webkitMaskRepeat = 'no-repeat';
      this.maskLayer.style.maskPosition = 'center';
      this.maskLayer.style.webkitMaskPosition = 'center';
      this.maskLayer.style.maskSize = '100% 100%';
      this.maskLayer.style.webkitMaskSize = '100% 100%';
      return;
    }
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minDim = Math.min(viewportWidth, viewportHeight);
    const innerRadius = minDim * (WHISPER_MASK.innerRatio ?? 0);
    const outerRadius = minDim * (WHISPER_MASK.outerRatio ?? 0);
    const fadeStep = Math.max(8, (outerRadius - innerRadius) * 0.2);
    const maskScaleX = Math.max(120, (viewportWidth / Math.max(1, viewportHeight)) * 100);
    const gradient = `radial-gradient(circle at center, transparent 0px, transparent ${innerRadius.toFixed(
      1
    )}px, rgba(0, 0, 0, 0.25) ${(innerRadius + fadeStep).toFixed(1)}px, rgba(0, 0, 0, 1) ${outerRadius.toFixed(
      1
    )}px)`;
    this.maskLayer.style.maskImage = gradient;
    this.maskLayer.style.webkitMaskImage = gradient;
    this.maskLayer.style.maskRepeat = 'no-repeat';
    this.maskLayer.style.webkitMaskRepeat = 'no-repeat';
    this.maskLayer.style.maskPosition = 'center';
    this.maskLayer.style.webkitMaskPosition = 'center';
    this.maskLayer.style.maskSize = `${maskScaleX}% 100%`;
    this.maskLayer.style.webkitMaskSize = `${maskScaleX}% 100%`;
  }

  update(/* deltaTime */) {
    if (!this.container || typeof this.getActiveWhispers !== 'function') {
      return;
    }

    const activeWhispers = this.getActiveWhispers() ?? [];
    const activeIds = new Set();
    const qaEnabled = isWhisperQaEnabled();

    for (const whisper of activeWhispers) {
      const isFinal = whisper.isPersistent === true;
      activeIds.add(whisper.id);
      let element = this.elements.get(whisper.id);

      if (!element) {
        element = document.createElement('div');
        element.style.position = 'relative';
        element.style.maxWidth = MAX_WIDTH;
        element.style.width = '100%';
        element.style.margin = '0 auto';
        element.style.textAlign = 'center';
        element.style.whiteSpace = 'pre-wrap';
        element.style.transform = 'translate3d(0, 0, 0)';
        element.style.transition = 'opacity 0.16s linear';
        element.style.background = 'transparent';
        element.style.border = 'none';
        element.style.boxShadow = 'none';
        element.style.overflow = 'visible';
        element.style.maskImage = 'none';
        element.style.webkitMaskImage = 'none';
        element.style.clipPath = 'none';
        element.style.letterSpacing = isFinal ? FINAL_LETTER_SPACING : LETTER_SPACING;
        element.className = 'whisper-text whisper-text--pearled';
        if (whisper.isFinal) {
          element.className = `${element.className} whisper-text--final`;
        }

        const primarySpan = document.createElement('span');
        primarySpan.className = 'whisper-pass whisper-pass--primary';
        primarySpan.style.display = 'block';
        primarySpan.style.textShadow = 'none';
        primarySpan.style.filter = `blur(${SUBTLE_TEXT_BLUR_PX}px)`;

        primarySpan.textContent = whisper.text;

        element.appendChild(primarySpan);

        this.elements.set(whisper.id, element);
        this.container.appendChild(element);
        if (qaEnabled) {
          const target = resolveWhisperUiTarget();
          logWhisperUiTarget({ id: whisper.id, target });
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => {
              if (this.container && this.container.isConnected) {
                logWhisperUiRect(this.container, whisper.id);
              }
            });
          } else if (this.container) {
            logWhisperUiRect(this.container, whisper.id);
          }
          logWhisperLayout(whisper, element);
          const shouldDiagnose =
            whisper.id === 'whisper-1' || whisper.isFinal === true || whisper.isPersistent === true;
          if (shouldDiagnose && typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (element.isConnected) {
                  logWhisperDiagnostics(element, whisper.id);
                }
              });
            });
          }
        }
      } else {
        const primarySpan = element.querySelector('.whisper-pass--primary');
        if (primarySpan) {
          if (primarySpan.textContent !== whisper.text) {
            primarySpan.textContent = whisper.text;
          }
          primarySpan.style.filter = `blur(${SUBTLE_TEXT_BLUR_PX}px)`;
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
      const jitterX = 0;
      const jitterY = Math.cos(jitterT * 1.4 + jitterSeed) * jitterRange * 0.66;

      const driftRange = whisper.driftRangePx ?? 0;
      const driftSpeed = whisper.driftSpeed ?? 0;
      const driftSeed = whisper.driftSeed ?? 0;
      const driftT = driftSpeed > 0 ? whisper.elapsedMs * driftSpeed : 0;
      const driftX = 0;
      const driftY = Math.cos(driftT * 0.9 + driftSeed) * driftRange * 0.35;

      element.style.opacity = `${Math.max(0, Math.min(1, whisper.opacity ?? 0))}`;
      element.style.fontSize = isFinal ? FINAL_FONT_SIZE_CLAMP : FONT_SIZE_CLAMP;
      element.style.lineHeight = `${WHISPER_TYPOGRAPHY.lineHeight}`;
      element.style.letterSpacing = isFinal ? FINAL_LETTER_SPACING : LETTER_SPACING;
      element.className = whisper.isFinal
        ? 'whisper-text whisper-text--pearled whisper-text--final'
        : 'whisper-text whisper-text--pearled';
      const offsetY = floatY + driftY + jitterY;
      element.style.transform = `translate3d(0, ${offsetY.toFixed(2)}px, 0)`;

      if (qaEnabled) {
        const rect = element.getBoundingClientRect();
        const measuredX = rect.left + rect.width * 0.5;
        const measuredY = rect.top + rect.height * 0.5;
        updateWhisperQaPosition(whisper, { x: measuredX, y: measuredY });
        if (whisper.__qaEntry && !Number.isFinite(whisper.__qaEntry.fontSizePx)) {
          const computed = window.getComputedStyle(element);
          const fontSizePx = Number.parseFloat(computed.fontSize);
          if (Number.isFinite(fontSizePx)) {
            setWhisperQaFontSize(whisper, fontSizePx);
          }
        }
        const safeZone = resolveSafeZone(window.innerWidth, window.innerHeight);
        const overlap = doesRectIntersectCircle(
          {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          },
          safeZone
        );
        recordWhisperOverlap(whisper, overlap);
      }

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
    this.applyMask();
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
    if (this.maskLayer && this.maskLayer.parentElement) {
      this.maskLayer.parentElement.removeChild(this.maskLayer);
    }
    this.maskLayer = null;
    this.uiTarget = null;

    if (this.handleFullscreenChange) {
      ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(
        (eventName) => {
          document.removeEventListener(eventName, this.handleFullscreenChange);
        }
      );
      this.handleFullscreenChange = null;
    }
  }
}
