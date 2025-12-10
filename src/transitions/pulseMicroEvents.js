// src/transitions/pulseMicroEvents.js
// Gestión de microeventos raros: pequeños gestos temporales sobre pulso/halo/campo sin nuevos loops.
import { MICROEVENTS_CONFIG_BY_STATE } from '../config/constants.js';

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function buildOverride(baseConfigs, deltas = {}) {
  const { pulseConfig, haloConfig, fieldConfig } = baseConfigs;
  return {
    pulseConfig: pulseConfig
      ? {
          ...pulseConfig,
          amplitude:
            (pulseConfig.amplitude ?? 0) + (deltas.pulseAmpDelta ?? 0),
          frequency:
            (pulseConfig.frequency ?? 0) + (deltas.pulseFreqDelta ?? 0),
          color: pulseConfig.color,
        }
      : undefined,
    haloConfig: haloConfig
      ? {
          ...haloConfig,
          opacity:
            (haloConfig.opacity ?? 0) + (deltas.haloOpacityDelta ?? 0),
          scaleMultiplier:
            (haloConfig.scaleMultiplier ?? 0) + (deltas.haloScaleDelta ?? 0),
          variation: haloConfig.variation,
        }
      : undefined,
    fieldConfig: fieldConfig
      ? {
          ...fieldConfig,
          variation:
            (fieldConfig.variation ?? 0) + (deltas.fieldVariationDelta ?? 0),
          scaleMultiplier: fieldConfig.scaleMultiplier,
          opacity: fieldConfig.opacity,
        }
      : undefined,
  };
}

export function clearAllMicroEventTimers(registry) {
  if (!registry) return;
  while (registry.length) {
    const id = registry.pop();
    clearTimeout(id);
  }
}

export function scheduleMicroEventsForState(state, baseConfigs, hooks, timersRegistry) {
  const config = MICROEVENTS_CONFIG_BY_STATE[state];
  if (!config || config.maxEventsPerCycle <= 0) {
    return;
  }

  const eventsCount = Math.max(1, Math.min(3, config.maxEventsPerCycle));

  for (let i = 0; i < eventsCount; i += 1) {
    const offset = randomInRange(config.minOffsetMs, config.maxOffsetMs);
    const startTimerId = setTimeout(() => {
      const override = buildOverride(baseConfigs, config);
      if (hooks?.applyOverride) {
        hooks.applyOverride(override);
      }
      const endTimerId = setTimeout(() => {
        if (hooks?.restoreBase) {
          hooks.restoreBase();
        }
      }, config.eventDurationMs);
      timersRegistry.push(endTimerId);
    }, offset);
    timersRegistry.push(startTimerId);
  }
}
