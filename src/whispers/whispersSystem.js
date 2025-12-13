// src/whispers/whispersSystem.js
// Logica de disparo y gestion de susurros segun tNormalized del recorrido completo.
import {
  WHISPER_SCHEDULE,
  WHISPER_WINDOW_RATIO,
  WHISPER_ENVELOPE,
  WHISPER_VISUAL,
  WHISPER_FRAME,
  WHISPER_SLOTS,
} from './whispersConfig.js';
import { PHASE_DURATION_MS } from '../config/constants.js';
import {
  resetWhispersForRun,
  hasActiveWhisper,
  hasScheduleWindowTriggered,
  markScheduleWindowTriggered,
  registerActiveWhisper,
  unregisterActiveWhisper,
} from './whispersState.js';

const DEBUG_FORCE_VISIBLE = false; // DEBUG ONLY: set true para forzar un susurro visible al inicio
const DEBUG_WHISPER_TEXT = 'DEBUG';
const DEBUG_WHISPER_DURATION_MS = 2000;
const DEBUG_WHISPER_OPACITY = 0.35;
const DEBUG_WHISPER_BLUR_PX = 3;
const DEBUG_WHISPER_OFFSET = { x: 0.5, y: 0.5 }; // centro relativo del viewport

let activeWhispers = [];
let lastSlotId = null;
let totalElapsedMs = 0;
let debugInjected = false;

const TOTAL_DURATION_MS = Object.values(PHASE_DURATION_MS).reduce((acc, value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return acc;
  return acc + value;
}, 0);

const SCHEDULE_WINDOWS = WHISPER_SCHEDULE.map((entry) => {
  const halfWindow = WHISPER_WINDOW_RATIO / 2;
  return {
    start: clamp01(entry.center - halfWindow),
    end: clamp01(entry.center + halfWindow),
  };
});

export function resetWhispersSystem() {
  activeWhispers = [];
  lastSlotId = null;
  totalElapsedMs = 0;
  debugInjected = false;
  resetWhispersForRun();
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function resolveSlotPosition(slot, viewportWidth, viewportHeight) {
  const margin = WHISPER_FRAME.marginPx;
  const safeBaseX = viewportWidth * 0.5;
  const safeBaseY = viewportHeight * 0.82;
  const driftX = (slot.anchorX - 0.5) * 20; // max ~10px horizontal
  const driftY = Math.max(-3, Math.min(3, (slot.anchorY - 0.5) * 6)); // ±3px vertical
  const minY = viewportHeight * 0.78;
  const maxY = viewportHeight * 0.88;
  const x = Math.min(viewportWidth - margin, Math.max(margin, safeBaseX + driftX));
  const unclampedY = safeBaseY + driftY;
  const yClamped = Math.min(maxY, Math.max(minY, unclampedY));
  const y = Math.min(viewportHeight - margin, Math.max(margin, yClamped));
  return { x, y };
}

function pickSlot(slots) {
  if (!slots || slots.length === 0) {
    return null;
  }
  const available = slots.length > 1 ? slots.filter((slot) => slot.id !== lastSlotId) : slots;
  const slot = available[Math.floor(Math.random() * available.length)];
  lastSlotId = slot.id;
  return slot;
}

function pickWhisperPosition(viewportWidth, viewportHeight) {
  const slot = pickSlot(WHISPER_SLOTS);
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

function clamp01(value) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function smoothStep01(t) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function computeOpacity(whisper) {
  const totalDuration =
    whisper.totalDurationMs ?? whisper.fadeInMs + whisper.holdMs + whisper.fadeOutMs;
  const maxOpacity = whisper.maxOpacity ?? WHISPER_VISUAL.maxOpacity;
  const elapsed = whisper.elapsedMs;
  if (elapsed <= 0) return 0;
  if (elapsed < whisper.fadeInMs) {
    return smoothStep01(elapsed / whisper.fadeInMs) * maxOpacity;
  }
  if (elapsed < whisper.fadeInMs + whisper.holdMs) {
    return maxOpacity;
  }
  const fadeOutElapsed = elapsed - whisper.fadeInMs - whisper.holdMs;
  if (fadeOutElapsed < whisper.fadeOutMs) {
    return (1 - smoothStep01(fadeOutElapsed / whisper.fadeOutMs)) * maxOpacity;
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
    const totalDuration =
      whisper.totalDurationMs ?? whisper.fadeInMs + whisper.holdMs + whisper.fadeOutMs;
    if (whisper.elapsedMs <= totalDuration + 50) {
      next.push(whisper);
    } else {
      unregisterActiveWhisper(whisper.id);
    }
  }
  activeWhispers = next;
}

function resolveEnvelopeDurations(totalDurationMs) {
  const windowDurationMs = totalDurationMs * WHISPER_WINDOW_RATIO;
  const fadeInMs = windowDurationMs * WHISPER_ENVELOPE.fadeInRatio;
  const fadeOutMs = windowDurationMs * WHISPER_ENVELOPE.fadeOutRatio;
  const holdMs = Math.max(0, windowDurationMs - fadeInMs - fadeOutMs);
  return {
    fadeInMs,
    holdMs,
    fadeOutMs,
    totalDurationMs: fadeInMs + holdMs + fadeOutMs,
  };
}

function spawnScheduledWhisper({ scheduleIndex, viewportWidth, viewportHeight, totalDurationMs }) {
  const scheduleEntry = WHISPER_SCHEDULE[scheduleIndex];
  if (!scheduleEntry) return;

  const position = pickWhisperPosition(viewportWidth, viewportHeight);
  const timings = resolveEnvelopeDurations(totalDurationMs);

  const whisper = {
    id: scheduleEntry.id,
    text: scheduleEntry.text,
    position,
    fadeInMs: timings.fadeInMs,
    holdMs: timings.holdMs,
    fadeOutMs: timings.fadeOutMs,
    totalDurationMs: timings.totalDurationMs,
    elapsedMs: 0,
    opacity: 0,
    maxOpacity: WHISPER_VISUAL.maxOpacity,
    motionRangePx: WHISPER_VISUAL.baseMotionRangePx,
    jitterRangePx: WHISPER_VISUAL.jitterRangePx,
    jitterSpeed: WHISPER_VISUAL.jitterSpeed,
    jitterSeed: Math.random() * Math.PI * 2,
  };

  activeWhispers.push(whisper);
  registerActiveWhisper(whisper.id);
}

function spawnDebugWhisper(viewportWidth, viewportHeight) {
  const { x, y } = DEBUG_WHISPER_OFFSET;
  const position = {
    x: viewportWidth * x,
    y: viewportHeight * y,
  };
  const whisper = {
    id: 'whisper-debug',
    text: DEBUG_WHISPER_TEXT,
    position,
    fadeInMs: DEBUG_WHISPER_DURATION_MS * 0.2,
    holdMs: DEBUG_WHISPER_DURATION_MS * 0.4,
    fadeOutMs: DEBUG_WHISPER_DURATION_MS * 0.4,
    totalDurationMs: DEBUG_WHISPER_DURATION_MS,
    elapsedMs: 0,
    opacity: 0,
    maxOpacity: DEBUG_WHISPER_OPACITY,
    motionRangePx: WHISPER_VISUAL.baseMotionRangePx * 0.4,
    jitterRangePx: 0.4,
    jitterSpeed: WHISPER_VISUAL.jitterSpeed * 0.8,
    jitterSeed: Math.random() * Math.PI * 2,
    blurPx: DEBUG_WHISPER_BLUR_PX,
    isDebug: true,
  };

  activeWhispers.push(whisper);
  registerActiveWhisper(whisper.id);
}

function isProgressInsideWindow(progress, window) {
  if (!window) return false;
  const start = clamp01(window.start ?? 0);
  const end = clamp01(window.end ?? 0);
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  return progress >= min && progress <= max;
}

function findAvailableWindowIndex(normalizedProgress) {
  for (let i = 0; i < WHISPER_SCHEDULE.length; i += 1) {
    if (hasScheduleWindowTriggered(i)) continue;
    if (isProgressInsideWindow(normalizedProgress, SCHEDULE_WINDOWS[i])) {
      return i;
    }
  }
  return null;
}

export function updateWhispers(deltaTime, context = {}) {
  const { viewportWidth = window.innerWidth, viewportHeight = window.innerHeight } = context;

  totalElapsedMs += deltaTime;
  advanceActiveWhispers(deltaTime);

  const debugFlag =
    DEBUG_FORCE_VISIBLE ||
    (typeof window !== 'undefined' && window.__VM_DEBUG_WHISPERS__ === true);
  if (!debugInjected && debugFlag) {
    spawnDebugWhisper(viewportWidth, viewportHeight);
    debugInjected = true;
    return;
  }

  if (TOTAL_DURATION_MS <= 0 || hasActiveWhisper()) {
    return;
  }

  const normalizedTime = clamp01(totalElapsedMs / TOTAL_DURATION_MS);
  const scheduleIndex = findAvailableWindowIndex(normalizedTime);

  if (scheduleIndex !== null) {
    spawnScheduledWhisper({
      scheduleIndex,
      viewportWidth,
      viewportHeight,
      totalDurationMs: TOTAL_DURATION_MS,
    });
    markScheduleWindowTriggered(scheduleIndex);
  }
}

export function getActiveWhispers() {
  return activeWhispers;
}
