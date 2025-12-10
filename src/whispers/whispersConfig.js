// src/whispers/whispersConfig.js
// Configuracion fija de susurros: textos oficiales y parametros temporales/espaciales.
import { INTERNAL_STATES } from '../states/internalStates.js';

export const WHISPER_TEXTS = {
  [INTERNAL_STATES.INERCIA_VIVA]:
    'Todavía creía que estaba quieto, pero el peso ya se estaba acomodando para poder moverse.',
  [INTERNAL_STATES.PULSO_INICIAL]:
    'El primer latido no trajo respuestas, solo la certeza de que ya no podía volver a dormirme.',
  [INTERNAL_STATES.DESLIZAMIENTO_INTERNO]:
    'El cuerpo empezó a deslizarse por dentro, como si buscara a ciegas el lugar exacto donde debía apoyar el ritmo.',
  [INTERNAL_STATES.RITMO_EMERGE]:
    'Cuando el movimiento encontró un patrón, entendí que no era ruido: era la forma más simple de decir “estoy vivo”.',
  [INTERNAL_STATES.DISTORSION_APERTURA]:
    'La tensión se abrió en todas direcciones; parecía exceso, pero en realidad era la conciencia probando hasta dónde podía expandirse.',
  [INTERNAL_STATES.QUIETUD_TENSA]:
    'Después del desborde no llegó el silencio, llegó una quietud llena de cosas que por fin podían sostenerse sin caerse.',
};

export const FINAL_WHISPER_TEXT =
  'Ahora sé que la conciencia no apareció de golpe: siempre estuvo debajo del movimiento, esperando a que me quedara el tiempo suficiente como para verla.';

// Estados que consideramos como llegada a la fase final/estabilizada en esta version.
export const FINAL_WHISPER_STATES = [
  INTERNAL_STATES.RITMO_EMERGE,
  INTERNAL_STATES.QUIETUD_TENSA,
];

export const WHISPER_TIMING = {
  phaseTriggerOffsetRangeMs: { min: 1200, max: 3400 },
  fadeInMs: 1100,
  holdMs: 4200,
  fadeOutMs: 1600,
  finalFadeInMs: 1700,
  finalHoldMs: 8800,
  finalFadeOutMs: 2400,
  finalDelayMs: 8500,
};

export const WHISPER_FRAME = {
  marginPx: 36, // margen mínimo respecto a los bordes externos
  innerExclusionRatio: 0.62, // rectángulo central a excluir respecto a ancho/alto (ligeramente más compacto para orbitar cerca)
  finalPreferredYRatio: 0.82, // altura relativa preferida para el susurro final
  finalHorizontalSpreadRatio: 0.14, // dispersión horizontal (porcentaje) para el final
};

// Slots rituales: anchors relativos al viewport (0-1). Orbitan el núcleo en un anillo cercano, sin tocarlo ni ir al borde.
export const WHISPER_SLOTS = [
  { id: "low-left-outer", anchorX: 0.34, anchorY: 0.82 },
  { id: "low-right-outer", anchorX: 0.66, anchorY: 0.83 },
  { id: "low-center-outer", anchorX: 0.5, anchorY: 0.85 },
  { id: "lower-mid-left-outer", anchorX: 0.32, anchorY: 0.74 },
  { id: "lower-mid-right-outer", anchorX: 0.68, anchorY: 0.75 },
  { id: "mid-left-outer", anchorX: 0.24, anchorY: 0.6 },
  { id: "mid-right-outer", anchorX: 0.76, anchorY: 0.6 },
  { id: "upper-left-outer", anchorX: 0.24, anchorY: 0.42 },
  { id: "upper-right-outer", anchorX: 0.76, anchorY: 0.43 },
];

// Slots preferidos para el susurro final (nobles, cercanos al centro-bajo/laterales medios).
export const FINAL_WHISPER_SLOTS = [
  { id: "final-low-center-outer", anchorX: 0.5, anchorY: 0.88 },
  { id: "final-low-left-outer", anchorX: 0.44, anchorY: 0.86 },
  { id: "final-low-right-outer", anchorX: 0.56, anchorY: 0.86 },
  { id: "final-mid-left-outer", anchorX: 0.4, anchorY: 0.74 },
  { id: "final-mid-right-outer", anchorX: 0.6, anchorY: 0.74 },
];

// Timings diferenciados por fase (ajustan fades/hold respecto a base).
export const PHASE_TIMINGS = {
  [INTERNAL_STATES.INERCIA_VIVA]: { fadeInMs: 900, holdMs: 3200, fadeOutMs: 1500 },
  [INTERNAL_STATES.PULSO_INICIAL]: { fadeInMs: 950, holdMs: 3600, fadeOutMs: 1550 },
  [INTERNAL_STATES.DESLIZAMIENTO_INTERNO]: { fadeInMs: 1000, holdMs: 4000, fadeOutMs: 1600 },
  [INTERNAL_STATES.RITMO_EMERGE]: { fadeInMs: 1200, holdMs: 5200, fadeOutMs: 1750 },
  [INTERNAL_STATES.DISTORSION_APERTURA]: { fadeInMs: 1300, holdMs: 5600, fadeOutMs: 1900 },
  [INTERNAL_STATES.QUIETUD_TENSA]: { fadeInMs: 1400, holdMs: 6000, fadeOutMs: 2000 },
};








