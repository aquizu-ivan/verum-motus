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
  fadeInMs: 1200,
  holdMs: 5200,
  fadeOutMs: 1700,
  finalFadeInMs: 1500,
  finalHoldMs: 7200,
  finalFadeOutMs: 2100,
  finalDelayMs: 6500,
};

export const WHISPER_FRAME = {
  marginPx: 28, // margen mínimo respecto a los bordes externos
  innerExclusionRatio: 0.38, // rectángulo central a excluir respecto a ancho/alto
  finalPreferredYRatio: 0.78, // altura relativa preferida para el susurro final
  finalHorizontalSpreadRatio: 0.12, // dispersión horizontal (porcentaje) para el final
};
