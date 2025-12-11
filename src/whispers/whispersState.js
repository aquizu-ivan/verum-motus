// src/whispers/whispersState.js
// Estado interno del sistema de susurros para un pase de Verum Motus.

const triggeredPhaseWindows = new Map();
let finalTriggered = false;
const activeWhispers = new Set();

export function resetWhispersForRun() {
  triggeredPhaseWindows.clear();
  finalTriggered = false;
  activeWhispers.clear();
}

export function markPhaseWindowTriggered(phaseId, windowIndex) {
  if (!phaseId || typeof windowIndex !== 'number') return;
  const entry = triggeredPhaseWindows.get(phaseId) ?? new Set();
  entry.add(windowIndex);
  triggeredPhaseWindows.set(phaseId, entry);
}

export function hasPhaseWindowTriggered(phaseId, windowIndex) {
  if (!phaseId || typeof windowIndex !== 'number') return false;
  const entry = triggeredPhaseWindows.get(phaseId);
  if (!entry) return false;
  return entry.has(windowIndex);
}

export function markFinalWhisperTriggered() {
  finalTriggered = true;
}

export function hasFinalWhisperTriggered() {
  return finalTriggered;
}

export function hasActiveWhisper() {
  return activeWhispers.size > 0;
}

export function registerActiveWhisper(whisperId) {
  if (!whisperId) return;
  activeWhispers.add(whisperId);
}

export function unregisterActiveWhisper(whisperId) {
  if (!whisperId) return;
  activeWhispers.delete(whisperId);
}
