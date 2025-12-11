// src/whispers/whispersSystem.js
// Lógica de disparo y gestión de susurros según fase y tiempo en fase.
import {
  WHISPER_TEXTS,
  FINAL_WHISPER_TEXT,
  FINAL_WHISPER_STATES,
  WHISPER_TIMING,
  WHISPER_FRAME,
  WHISPER_SLOTS,
  FINAL_WHISPER_SLOTS,
  PHASE_TIMINGS,
  WHISPER_PHASE_WINDOWS,
} from './whispersConfig.js';
import { PHASE_DURATION_MS } from '../config/constants.js';
import {
  resetWhispersForRun,
  hasFinalWhisperTriggered,
  markFinalWhisperTriggered,
  hasActiveWhisper,
  hasPhaseWindowTriggered,
  markPhaseWindowTriggered,
  registerActiveWhisper,
  unregisterActiveWhisper,
} from './whispersState.js';

let activeWhispers = [];
let whisperIdCounter = 0;
let lastSlotId = null;
let lastFinalSlotId = null;
let cooldownMs = 0;

export function resetWhispersSystem() {
  activeWhispers = [];
  whisperIdCounter = 0;
  lastSlotId = null;
  lastFinalSlotId = null;
  cooldownMs = 0;
  resetWhispersForRun();
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function resolveSlotPosition(slot, viewportWidth, viewportHeight) {
  const margin = WHISPER_FRAME.marginPx;
  const x = Math.min(viewportWidth - margin, Math.max(margin, slot.anchorX * viewportWidth));
  const y = Math.min(viewportHeight - margin, Math.max(margin, slot.anchorY * viewportHeight));
  return { x, y };
}

function pickSlot(slots, lastIdRefSetter, lastId) {
  if (!slots || slots.length === 0) {
    return null;
  }
  const available = slots.length > 1 ? slots.filter((slot) => slot.id !== lastId) : slots;
  const slot = available[Math.floor(Math.random() * available.length)];
  if (typeof lastIdRefSetter === 'function') {
    lastIdRefSetter(slot.id);
  }
  return slot;
}

function pickWhisperPosition(viewportWidth, viewportHeight, { isFinal } = {}) {
  if (isFinal) {
    const slot = pickSlot(
      FINAL_WHISPER_SLOTS,
      (id) => {
        lastFinalSlotId = id;
      },
      lastFinalSlotId
    );
    if (slot) {
      return resolveSlotPosition(slot, viewportWidth, viewportHeight);
    }
  }
  const slot = pickSlot(
    WHISPER_SLOTS,
    (id) => {
      lastSlotId = id;
    },
    lastSlotId
  );
  if (slot) {
    return resolveSlotPosition(slot, viewportWidth, viewportHeight);
  }

  // Fallback defensivo: mantener un punto seguro lejos del centro.
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  return {
    x: centerX + randomInRange(-centerX * 0.25, centerX * 0.25),
    y: centerY + randomInRange(viewportHeight * 0.25, viewportHeight * 0.4),
  };
}

function computeOpacity(whisper) {
  const totalDuration = whisper.totalDurationMs ?? whisper.fadeInMs + whisper.holdMs + whisper.fadeOutMs;
  const maxOpacity = whisper.maxOpacity ?? 1;
  const elapsed = whisper.elapsedMs;
  if (elapsed <= 0) return 0;
  if (elapsed < whisper.fadeInMs) {
    return (elapsed / whisper.fadeInMs) * maxOpacity;
  }
  if (elapsed < whisper.fadeInMs + whisper.holdMs) {
    return maxOpacity;
  }
  const fadeOutElapsed = elapsed - whisper.fadeInMs - whisper.holdMs;
  if (fadeOutElapsed < whisper.fadeOutMs) {
    return (1 - fadeOutElapsed / whisper.fadeOutMs) * maxOpacity;
  }
  if (elapsed >= totalDuration) {
    return 0;
  }
  return 0;
}

function advanceActiveWhispers(deltaTime) {
  const next = [];
  for (const whisper of activeWhispers) {
    whisper.elapsedMs += deltaTime;
    whisper.opacity = computeOpacity(whisper);
    const totalDuration = whisper.totalDurationMs ?? whisper.fadeInMs + whisper.holdMs + whisper.fadeOutMs;
    if (whisper.elapsedMs <= totalDuration + 50) {
      next.push(whisper);
    } else {
      unregisterActiveWhisper(whisper.id);
      const nextCooldown = whisper.isFinal ? 0 : WHISPER_TIMING.cooldownMs ?? 0;
      cooldownMs = Math.max(cooldownMs, nextCooldown);
    }
  }
  activeWhispers = next;
}

function resolveTimings(phaseId, isFinal) {
  if (isFinal) {
    return {
      fadeInMs: WHISPER_TIMING.finalFadeInMs,
      holdMs: WHISPER_TIMING.finalHoldMs,
      fadeOutMs: WHISPER_TIMING.finalFadeOutMs,
    };
  }
  const phaseTiming = PHASE_TIMINGS[phaseId];
  if (phaseTiming) {
    return phaseTiming;
  }
  return {
    fadeInMs: WHISPER_TIMING.fadeInMs,
    holdMs: WHISPER_TIMING.holdMs,
    fadeOutMs: WHISPER_TIMING.fadeOutMs,
  };
}

function spawnWhisper({ text, viewportWidth, viewportHeight, isFinal, phaseId }) {
  const position = pickWhisperPosition(viewportWidth, viewportHeight, { isFinal });
  const timings = resolveTimings(phaseId, isFinal);

  const whisper = {
    id: `whisper-${++whisperIdCounter}`,
    text,
    position,
    isFinal: Boolean(isFinal),
    fadeInMs: timings.fadeInMs,
    holdMs: timings.holdMs,
    fadeOutMs: timings.fadeOutMs,
    elapsedMs: 0,
    opacity: 0,
    totalDurationMs:
      timings.fadeInMs + timings.holdMs + timings.fadeOutMs,
    maxOpacity: isFinal ? 0.8 : 0.7,
    motionRangePx: isFinal ? 4.5 : 2.5,
  };

  activeWhispers.push(whisper);
  registerActiveWhisper(whisper.id);
}

function isFinalPhase(phaseId) {
  return FINAL_WHISPER_STATES.includes(phaseId);
}

function clamp01(value) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function isProgressInsideWindow(progress, window) {
  if (!window) return false;
  const start = clamp01(window.start ?? 0);
  const end = clamp01(window.end ?? 0);
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  return progress >= min && progress <= max;
}

function getPhaseDurationMs(phaseId) {
  if (phaseId && typeof PHASE_DURATION_MS[phaseId] === 'number') {
    return PHASE_DURATION_MS[phaseId];
  }
  return WHISPER_TIMING.defaultPhaseDurationMs;
}

export function updateWhispers(deltaTime, context = {}) {
  const {
    phaseId,
    phaseElapsedMs = 0,
    viewportWidth = window.innerWidth,
    viewportHeight = window.innerHeight,
  } = context;

  cooldownMs = Math.max(0, cooldownMs - deltaTime);
  advanceActiveWhispers(deltaTime);

  const phaseDurationMs = getPhaseDurationMs(phaseId);
  const progress = clamp01(phaseDurationMs > 0 ? phaseElapsedMs / phaseDurationMs : 0);
  const hasMinLead = phaseElapsedMs >= WHISPER_TIMING.minPhaseLeadMs;
  const freeToTrigger = !hasActiveWhisper() && cooldownMs <= 0 && !hasFinalWhisperTriggered();

  if (phaseId && WHISPER_TEXTS[phaseId] && hasMinLead && freeToTrigger) {
    const windows = WHISPER_PHASE_WINDOWS[phaseId] ?? [];
    for (let i = 0; i < windows.length; i += 1) {
      if (!hasPhaseWindowTriggered(phaseId, i) && isProgressInsideWindow(progress, windows[i])) {
        spawnWhisper({
          text: WHISPER_TEXTS[phaseId],
          viewportWidth,
          viewportHeight,
          isFinal: false,
          phaseId,
        });
        markPhaseWindowTriggered(phaseId, i);
        break;
      }
    }
  }

  if (
    !hasFinalWhisperTriggered() &&
    FINAL_WHISPER_TEXT &&
    phaseId &&
    isFinalPhase(phaseId) &&
    hasMinLead &&
    progress >= WHISPER_TIMING.finalProgressThreshold &&
    !hasActiveWhisper() &&
    cooldownMs <= 0
  ) {
    spawnWhisper({
      text: FINAL_WHISPER_TEXT,
      viewportWidth,
      viewportHeight,
      isFinal: true,
      phaseId,
    });
    markFinalWhisperTriggered();
  }
}

export function getActiveWhispers() {
  return activeWhispers;
}
