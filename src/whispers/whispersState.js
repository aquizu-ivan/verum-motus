// src/whispers/whispersState.js
// Estado interno del sistema de susurros para un pase de Verum Motus.

const triggeredPhases = new Set();
const phaseOffsets = new Map();
let finalTriggered = false;

export function resetWhispersForRun() {
  triggeredPhases.clear();
  phaseOffsets.clear();
  finalTriggered = false;
}

export function markPhaseWhisperTriggered(phaseId) {
  if (!phaseId) return;
  triggeredPhases.add(phaseId);
}

export function hasPhaseWhisperTriggered(phaseId) {
  if (!phaseId) return false;
  return triggeredPhases.has(phaseId);
}

export function setPhaseTriggerOffset(phaseId, offsetMs) {
  if (!phaseId || typeof offsetMs !== 'number') return;
  phaseOffsets.set(phaseId, offsetMs);
}

export function getPhaseTriggerOffset(phaseId) {
  if (!phaseId) return undefined;
  return phaseOffsets.get(phaseId);
}

export function markFinalWhisperTriggered() {
  finalTriggered = true;
}

export function hasFinalWhisperTriggered() {
  return finalTriggered;
}
