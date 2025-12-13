// src/whispers/whispersState.js
// Estado interno del sistema de susurros para un pase de Verum Motus.

const triggeredScheduleWindows = new Set();
const activeWhispers = new Set();

export function resetWhispersForRun() {
  triggeredScheduleWindows.clear();
  activeWhispers.clear();
}

export function markScheduleWindowTriggered(index) {
  if (typeof index !== 'number') return;
  triggeredScheduleWindows.add(index);
}

export function hasScheduleWindowTriggered(index) {
  if (typeof index !== 'number') return false;
  return triggeredScheduleWindows.has(index);
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
