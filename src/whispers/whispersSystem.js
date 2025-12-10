// src/whispers/whispersSystem.js
// Lógica de disparo y gestión de susurros según fase y tiempo en fase.
import {
  WHISPER_TEXTS,
  FINAL_WHISPER_TEXT,
  FINAL_WHISPER_STATES,
  WHISPER_TIMING,
  WHISPER_FRAME,
} from './whispersConfig.js';
import {
  resetWhispersForRun,
  hasPhaseWhisperTriggered,
  markPhaseWhisperTriggered,
  getPhaseTriggerOffset,
  setPhaseTriggerOffset,
  hasFinalWhisperTriggered,
  markFinalWhisperTriggered,
} from './whispersState.js';

let activeWhispers = [];
let whisperIdCounter = 0;

export function resetWhispersSystem() {
  activeWhispers = [];
  whisperIdCounter = 0;
  resetWhispersForRun();
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function ensurePhaseOffset(phaseId) {
  const existing = getPhaseTriggerOffset(phaseId);
  if (typeof existing === 'number') {
    return existing;
  }
  const { min, max } = WHISPER_TIMING.phaseTriggerOffsetRangeMs;
  const offset = randomInRange(min, max);
  setPhaseTriggerOffset(phaseId, offset);
  return offset;
}

function pickBandPosition(band) {
  const [xMin, xMax] = band.x;
  const [yMin, yMax] = band.y;
  return {
    x: randomInRange(xMin, xMax),
    y: randomInRange(yMin, yMax),
  };
}

function pickRandomWhisperPosition(viewportWidth, viewportHeight) {
  const margin = WHISPER_FRAME.marginPx;
  const innerWidth = viewportWidth * WHISPER_FRAME.innerExclusionRatio;
  const innerHeight = viewportHeight * WHISPER_FRAME.innerExclusionRatio;
  const halfInnerWidth = innerWidth / 2;
  const halfInnerHeight = innerHeight / 2;
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;

  const bands = [
    {
      // Borde superior
      x: [margin, viewportWidth - margin],
      y: [margin, centerY - halfInnerHeight - margin],
    },
    {
      // Borde inferior
      x: [margin, viewportWidth - margin],
      y: [centerY + halfInnerHeight + margin, viewportHeight - margin],
    },
    {
      // Borde izquierdo
      x: [margin, centerX - halfInnerWidth - margin],
      y: [margin, viewportHeight - margin],
    },
    {
      // Borde derecho
      x: [centerX + halfInnerWidth + margin, viewportWidth - margin],
      y: [margin, viewportHeight - margin],
    },
  ];

  const usableBands = bands.filter((band) => {
    const width = band.x[1] - band.x[0];
    const height = band.y[1] - band.y[0];
    return width > 48 && height > 32;
  });

  if (usableBands.length === 0) {
    // Fallback defensivo: usar centro desplazado suave.
    return {
      x: centerX + randomInRange(-centerX * 0.25, centerX * 0.25),
      y: centerY + randomInRange(-centerY * 0.25, centerY * 0.25),
    };
  }

  const band = usableBands[Math.floor(Math.random() * usableBands.length)];
  return pickBandPosition(band);
}

function pickFinalPosition(viewportWidth, viewportHeight) {
  const baseX = viewportWidth * 0.5;
  const spread = viewportWidth * WHISPER_FRAME.finalHorizontalSpreadRatio;
  const y = viewportHeight * WHISPER_FRAME.finalPreferredYRatio;
  return {
    x: baseX + randomInRange(-spread, spread),
    y,
  };
}

function computeOpacity(whisper) {
  const totalVisible =
    whisper.fadeInMs + whisper.holdMs + whisper.fadeOutMs;
  const elapsed = whisper.elapsedMs;

  if (elapsed <= 0) return 0;
  if (elapsed < whisper.fadeInMs) {
    return elapsed / whisper.fadeInMs;
  }
  if (elapsed < whisper.fadeInMs + whisper.holdMs) {
    return 1;
  }
  const fadeOutElapsed = elapsed - whisper.fadeInMs - whisper.holdMs;
  if (fadeOutElapsed < whisper.fadeOutMs) {
    return 1 - fadeOutElapsed / whisper.fadeOutMs;
  }
  if (elapsed >= totalVisible) {
    return 0;
  }
  return 0;
}

function advanceActiveWhispers(deltaTime) {
  const next = [];
  for (const whisper of activeWhispers) {
    whisper.elapsedMs += deltaTime;
    whisper.opacity = computeOpacity(whisper);
    const totalVisible = whisper.fadeInMs + whisper.holdMs + whisper.fadeOutMs;
    if (whisper.elapsedMs <= totalVisible + 50) {
      next.push(whisper);
    }
  }
  activeWhispers = next;
}

function spawnWhisper({ text, viewportWidth, viewportHeight, isFinal }) {
  const position = isFinal
    ? pickFinalPosition(viewportWidth, viewportHeight)
    : pickRandomWhisperPosition(viewportWidth, viewportHeight);

  const whisper = {
    id: `whisper-${++whisperIdCounter}`,
    text,
    position,
    isFinal: Boolean(isFinal),
    fadeInMs: isFinal ? WHISPER_TIMING.finalFadeInMs : WHISPER_TIMING.fadeInMs,
    holdMs: isFinal ? WHISPER_TIMING.finalHoldMs : WHISPER_TIMING.holdMs,
    fadeOutMs: isFinal ? WHISPER_TIMING.finalFadeOutMs : WHISPER_TIMING.fadeOutMs,
    elapsedMs: 0,
    opacity: 0,
  };

  activeWhispers.push(whisper);
}

function isFinalPhase(phaseId) {
  return FINAL_WHISPER_STATES.includes(phaseId);
}

export function updateWhispers(deltaTime, context = {}) {
  const {
    phaseId,
    phaseElapsedMs = 0,
    viewportWidth = window.innerWidth,
    viewportHeight = window.innerHeight,
  } = context;

  if (phaseId && WHISPER_TEXTS[phaseId] && !hasPhaseWhisperTriggered(phaseId)) {
    const triggerOffset = ensurePhaseOffset(phaseId);
    if (phaseElapsedMs >= triggerOffset) {
      spawnWhisper({
        text: WHISPER_TEXTS[phaseId],
        viewportWidth,
        viewportHeight,
        isFinal: false,
      });
      markPhaseWhisperTriggered(phaseId);
    }
  }

  if (
    !hasFinalWhisperTriggered() &&
    FINAL_WHISPER_TEXT &&
    phaseId &&
    isFinalPhase(phaseId) &&
    phaseElapsedMs >= WHISPER_TIMING.finalDelayMs
  ) {
    spawnWhisper({
      text: FINAL_WHISPER_TEXT,
      viewportWidth,
      viewportHeight,
      isFinal: true,
    });
    markFinalWhisperTriggered();
  }

  advanceActiveWhispers(deltaTime);
}

export function getActiveWhispers() {
  return activeWhispers;
}
