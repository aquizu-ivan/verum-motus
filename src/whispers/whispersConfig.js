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
  marginPx: 28, // margen mínimo respecto a los bordes externos
  innerExclusionRatio: 0.34, // rectángulo central a excluir respecto a ancho/alto (ligeramente más compacto para orbitar cerca)
  finalPreferredYRatio: 0.78, // altura relativa preferida para el susurro final
  finalHorizontalSpreadRatio: 0.12, // dispersión horizontal (porcentaje) para el final
};

// Slots rituales: anchors relativos al viewport (0-1). Orbitan el núcleo en un anillo cercano, sin tocarlo ni ir al borde.
export const WHISPER_SLOTS = [
  { id: 'top-left-orbit', anchorX: 0.32, anchorY: 0.26 },
  { id: 'top-right-orbit', anchorX: 0.68, anchorY: 0.27 },
  { id: 'upper-mid-left', anchorX: 0.28, anchorY: 0.38 },
  { id: 'upper-mid-right', anchorX: 0.72, anchorY: 0.39 },
  { id: 'mid-inner-left', anchorX: 0.44, anchorY: 0.36 },
  { id: 'mid-inner-right', anchorX: 0.56, anchorY: 0.64 },
  { id: 'lower-mid-left', anchorX: 0.3, anchorY: 0.62 },
  { id: 'lower-mid-right', anchorX: 0.7, anchorY: 0.64 },
  { id: 'low-left-orbit', anchorX: 0.35, anchorY: 0.72 },
  { id: 'low-right-orbit', anchorX: 0.65, anchorY: 0.74 },
];

// Slots preferidos para el susurro final (nobles, cercanos al centro-bajo/laterales medios).
export const FINAL_WHISPER_SLOTS = [
  { id: 'final-mid-low-center', anchorX: 0.5, anchorY: 0.7 },
  { id: 'final-low-left-inner', anchorX: 0.44, anchorY: 0.72 },
  { id: 'final-low-right-inner', anchorX: 0.56, anchorY: 0.72 },
  { id: 'final-mid-right', anchorX: 0.6, anchorY: 0.64 },
  { id: 'final-mid-left', anchorX: 0.4, anchorY: 0.64 },
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
