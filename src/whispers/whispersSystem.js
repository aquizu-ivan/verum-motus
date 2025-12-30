// src/whispers/whispersSystem.js
// Logica de disparo y gestion de susurros segun tNormalized del recorrido completo.
import {
  WHISPER_BASELINE,
  WHISPER_FINAL_TEXT,
  WHISPER_FINAL_STYLE,
  WHISPER_SCHEDULE,
  WHISPER_WINDOW_RATIO,
  WHISPER_ENVELOPE,
  WHISPER_SAFE_ZONE,
  WHISPER_TYPOGRAPHY,
  WHISPER_VISUAL,
  WHISPER_FRAME,
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
import {
  initWhisperQa,
  isWhisperQaEnabled,
  markWhisperQaRemoval,
  registerWhisperQa,
} from './whispersQa.js';

const DEBUG_FORCE_VISIBLE = false; // DEBUG ONLY: set true para forzar un susurro visible al inicio
const DEBUG_WHISPER_TEXT = 'DEBUG';
const DEBUG_WHISPER_DURATION_MS = 2000;
const DEBUG_WHISPER_OPACITY = 0.35;
const DEBUG_WHISPER_BLUR_PX = 3;
const DEBUG_WHISPER_OFFSET = { x: 0.5, y: 0.5 }; // centro relativo del viewport

let activeWhispers = [];
let totalElapsedMs = 0;
let debugInjected = false;
let finalWhisperSpawned = false;

// Fuente de verdad de duracion de transicion: PHASE_DURATION_MS (actualmente 61000 ms).
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
  totalElapsedMs = 0;
  debugInjected = false;
  finalWhisperSpawned = false;
  resetWhispersForRun();
}

function getMaxWhisperHeight(viewportWidth) {
  let maxHeight = 0;
  for (const entry of WHISPER_SCHEDULE) {
    const bounds = estimateWhisperBoundsPx(entry.text, viewportWidth);
    if (bounds && bounds.height > maxHeight) {
      maxHeight = bounds.height;
    }
  }
  if (WHISPER_FINAL_TEXT) {
    const bounds = estimateWhisperBoundsPx(WHISPER_FINAL_TEXT, viewportWidth);
    if (bounds && bounds.height > maxHeight) {
      maxHeight = bounds.height;
    }
  }
  return maxHeight;
}

function resolveBaselineY(viewportWidth, viewportHeight) {
  const ratio = WHISPER_BASELINE.yRatio ?? 0.62;
  const margin = WHISPER_FRAME.marginPx ?? 0;
  const safeZone = resolveSafeZone(viewportWidth, viewportHeight);
  const halfHeight = getMaxWhisperHeight(viewportWidth) * 0.5;
  const minY = safeZone.y + safeZone.radius + halfHeight + 2;
  const baseY = viewportHeight * ratio;
  return clamp(Math.max(baseY, minY), margin, viewportHeight - margin);
}

let measureContext = null;

function getMeasureContext() {
  if (measureContext) return measureContext;
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  measureContext = canvas.getContext('2d');
  return measureContext;
}

function getRootFontSizePx() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 16;
  const root = document.documentElement;
  if (!root) return 16;
  const fontSize = window.getComputedStyle(root).fontSize;
  const parsed = Number.parseFloat(fontSize);
  return Number.isFinite(parsed) ? parsed : 16;
}

function resolveWhisperFontSizePx(viewportWidth) {
  const clampConfig = WHISPER_TYPOGRAPHY.fontSizeClamp ?? {};
  const minRem = clampConfig.minRem ?? 1;
  const maxRem = clampConfig.maxRem ?? minRem;
  const vw = clampConfig.vw ?? 0;
  const rootPx = getRootFontSizePx();
  const minPx = minRem * rootPx;
  const maxPx = maxRem * rootPx;
  const vwPx = (vw / 100) * viewportWidth;
  return Math.min(maxPx, Math.max(minPx, vwPx));
}

function estimateWhisperBoundsPx(text, viewportWidth) {
  if (!text) return null;
  const context = getMeasureContext();
  if (!context) return null;
  const fontSizePx = resolveWhisperFontSizePx(viewportWidth);
  const letterSpacingPx = fontSizePx * (WHISPER_TYPOGRAPHY.letterSpacingEm ?? 0);
  const maxWidthPx = (WHISPER_TYPOGRAPHY.maxWidthRem ?? 0) * getRootFontSizePx();
  context.font = `${fontSizePx}px ${WHISPER_TYPOGRAPHY.fontFamily}`;
  const metrics = context.measureText(text);
  const rawWidth = metrics.width + letterSpacingPx * Math.max(0, text.length - 1);
  const width = maxWidthPx > 0 ? Math.min(rawWidth, maxWidthPx) : rawWidth;
  const lines = maxWidthPx > 0 ? Math.max(1, Math.ceil(rawWidth / maxWidthPx)) : 1;
  const height = lines * fontSizePx * (WHISPER_TYPOGRAPHY.lineHeight ?? 1);
  return { width, height };
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

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function getRectFromCenter(position, bounds) {
  const halfWidth = bounds.width * 0.5;
  const halfHeight = bounds.height * 0.5;
  return {
    left: position.x - halfWidth,
    right: position.x + halfWidth,
    top: position.y - halfHeight,
    bottom: position.y + halfHeight,
  };
}

function doesRectIntersectCircle(rect, circle) {
  const closestX = clamp(circle.x, rect.left, rect.right);
  const closestY = clamp(circle.y, rect.top, rect.bottom);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function resolveSafeWhisperPosition(position, bounds, viewportWidth, viewportHeight, baselineY) {
  const centerX = viewportWidth * 0.5;
  if (!bounds) {
    return { x: centerX, y: baselineY };
  }
  const safeZone = resolveSafeZone(viewportWidth, viewportHeight);
  const margin = WHISPER_FRAME.marginPx ?? 0;
  let y = clamp(baselineY, margin, viewportHeight - margin);
  const rect = getRectFromCenter({ x: centerX, y }, bounds);
  if (doesRectIntersectCircle(rect, safeZone)) {
    const halfHeight = bounds.height * 0.5;
    const minY = safeZone.y + safeZone.radius + halfHeight + 2;
    y = clamp(Math.max(y, minY), margin, viewportHeight - margin);
  }

  return { x: centerX, y };
}

function pickWhisperPosition(viewportWidth, viewportHeight, baselineY) {
  const margin = WHISPER_FRAME.marginPx ?? 0;
  const x = viewportWidth * 0.5;
  const y = clamp(baselineY, margin, viewportHeight - margin);
  return { x, y };
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
      markWhisperQaRemoval(whisper);
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

  const bounds = estimateWhisperBoundsPx(scheduleEntry.text, viewportWidth);
  const baselineY = resolveBaselineY(viewportWidth, viewportHeight);
  const initialPosition = pickWhisperPosition(viewportWidth, viewportHeight, baselineY);
  const position = resolveSafeWhisperPosition(
    initialPosition,
    bounds,
    viewportWidth,
    viewportHeight,
    baselineY
  );
  const timings = resolveEnvelopeDurations(totalDurationMs);

  const whisper = {
    id: scheduleEntry.id,
    text: scheduleEntry.text,
    position,
    boundsPx: bounds,
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
    driftRangePx: WHISPER_VISUAL.driftRangePx,
    driftSpeed: WHISPER_VISUAL.driftSpeed,
    driftSeed: Math.random() * Math.PI * 2,
  };

  if (isWhisperQaEnabled()) {
    registerWhisperQa(whisper, 'scheduled');
  }

  activeWhispers.push(whisper);
  registerActiveWhisper(whisper.id);
}

function spawnDebugWhisper(viewportWidth, viewportHeight) {
  const { x, y } = DEBUG_WHISPER_OFFSET;
  const baselineY = resolveBaselineY(viewportWidth, viewportHeight);
  const initialPosition = {
    x: viewportWidth * x,
    y: baselineY,
  };
  const bounds = estimateWhisperBoundsPx(DEBUG_WHISPER_TEXT, viewportWidth);
  const position = resolveSafeWhisperPosition(
    initialPosition,
    bounds,
    viewportWidth,
    viewportHeight,
    baselineY
  );
  const whisper = {
    id: 'whisper-debug',
    text: DEBUG_WHISPER_TEXT,
    position,
    boundsPx: bounds,
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
    driftRangePx: WHISPER_VISUAL.driftRangePx,
    driftSpeed: WHISPER_VISUAL.driftSpeed,
    driftSeed: Math.random() * Math.PI * 2,
    blurPx: DEBUG_WHISPER_BLUR_PX,
    isDebug: true,
  };

  if (isWhisperQaEnabled()) {
    registerWhisperQa(whisper, 'debug');
  }

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

function areAllScheduleWindowsTriggered() {
  return WHISPER_SCHEDULE.every((_, index) => hasScheduleWindowTriggered(index));
}

function spawnFinalWhisper({ viewportWidth, viewportHeight, totalDurationMs }) {
  if (!WHISPER_FINAL_TEXT) return;
  const bounds = estimateWhisperBoundsPx(WHISPER_FINAL_TEXT, viewportWidth);
  const baselineY = resolveBaselineY(viewportWidth, viewportHeight);
  const initialPosition = pickWhisperPosition(viewportWidth, viewportHeight, baselineY);
  const position = resolveSafeWhisperPosition(
    initialPosition,
    bounds,
    viewportWidth,
    viewportHeight,
    baselineY
  );
  const timings = resolveEnvelopeDurations(totalDurationMs);

  const whisper = {
    id: 'whisper-final',
    text: WHISPER_FINAL_TEXT,
    position,
    boundsPx: bounds,
    fadeInMs: timings.fadeInMs,
    holdMs: Number.POSITIVE_INFINITY,
    fadeOutMs: 0,
    totalDurationMs: Number.POSITIVE_INFINITY,
    elapsedMs: 0,
    opacity: 0,
    maxOpacity: WHISPER_FINAL_STYLE.maxOpacity ?? WHISPER_VISUAL.maxOpacity,
    motionRangePx: 0,
    jitterRangePx: 0,
    jitterSpeed: 0,
    jitterSeed: Math.random() * Math.PI * 2,
    driftRangePx: 0,
    driftSpeed: 0,
    driftSeed: Math.random() * Math.PI * 2,
    isPersistent: true,
  };

  if (isWhisperQaEnabled()) {
    registerWhisperQa(whisper, 'final');
  }

  activeWhispers.push(whisper);
  registerActiveWhisper(whisper.id);
}

export function updateWhispers(deltaTime, context = {}) {
  const { viewportWidth = window.innerWidth, viewportHeight = window.innerHeight } = context;

  if (isWhisperQaEnabled()) {
    initWhisperQa();
  }

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

  if (
    !finalWhisperSpawned &&
    TOTAL_DURATION_MS > 0 &&
    areAllScheduleWindowsTriggered() &&
    !hasActiveWhisper()
  ) {
    spawnFinalWhisper({
      viewportWidth,
      viewportHeight,
      totalDurationMs: TOTAL_DURATION_MS,
    });
    finalWhisperSpawned = true;
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


