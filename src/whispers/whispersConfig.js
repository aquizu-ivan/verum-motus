// src/whispers/whispersConfig.js
// Configuracion fija de susurros: textos oficiales y parametros temporales/espaciales.
import { INTERNAL_STATES } from '../states/internalStates.js';

export const WHISPER_TEXTS = {
  [INTERNAL_STATES.INERCIA_VIVA]:
    'El peso aparente se mantiene, pero las capas internas ya comienzan a desplazarse.',
  [INTERNAL_STATES.PULSO_INICIAL]:
    'El primer latido interrumpe la quietud y deja al silencio ligeramente abierto.',
  [INTERNAL_STATES.DESLIZAMIENTO_INTERNO]:
    'Un deslizamiento interno busca a ciegas el punto exacto donde el ritmo encaja.',
  [INTERNAL_STATES.RITMO_EMERGE]:
    'El movimiento encuentra su orden mínimo y deja de parecer ruido.',
  [INTERNAL_STATES.DISTORSION_APERTURA]:
    'La tensión se despliega en múltiples direcciones y ensancha los bordes del espacio.',
  [INTERNAL_STATES.QUIETUD_TENSA]:
    'La quietud contiene fuerzas activas que se sostienen sin derramarse.',
};

export const FINAL_WHISPER_TEXT =
  'El pulso deja ver el hilo que respira bajo cada variación.';

// Estados que consideramos como llegada a la fase final/estabilizada en esta version.
export const FINAL_WHISPER_STATES = [
  INTERNAL_STATES.RITMO_EMERGE,
  INTERNAL_STATES.QUIETUD_TENSA,
];

export const WHISPER_TIMING = {
  fadeInMs: 900,
  holdMs: 3800,
  fadeOutMs: 1500,
  finalFadeInMs: 1700,
  finalHoldMs: 8800,
  finalFadeOutMs: 2400,
  finalDelayMs: 8500,
  cooldownMs: 2200,
  minPhaseLeadMs: 1000,
  finalProgressThreshold: 0.85,
  defaultPhaseDurationMs: 10000,
};

export const WHISPER_FRAME = {
  marginPx: 44, // margen minimo respecto a los bordes externos
  innerExclusionRatio: 0.72, // rectangulo central a excluir respecto a ancho/alto (ligeramente mas compacto para orbitar cerca)
  finalPreferredYRatio: 0.88, // altura relativa preferida para el susurro final
  finalHorizontalSpreadRatio: 0.18, // dispersion horizontal (porcentaje) para el final
};

// Slots rituales: anchors relativos al viewport (0-1). Orbitan el nucleo en un anillo cercano, sin tocarlo ni ir al borde.
export const WHISPER_SLOTS = [
  { id: 'low-left-outer', anchorX: 0.3, anchorY: 0.88 },
  { id: 'low-right-outer', anchorX: 0.7, anchorY: 0.89 },
  { id: 'low-center-outer', anchorX: 0.5, anchorY: 0.92 },
  { id: 'lower-mid-left-outer', anchorX: 0.34, anchorY: 0.82 },
  { id: 'lower-mid-right-outer', anchorX: 0.66, anchorY: 0.83 },
  { id: 'mid-left-outer', anchorX: 0.24, anchorY: 0.76 },
  { id: 'mid-right-outer', anchorX: 0.76, anchorY: 0.76 },
];

// Slots preferidos para el susurro final (nobles, cercanos al centro-bajo/laterales medios).
export const FINAL_WHISPER_SLOTS = [
  { id: 'final-low-center-outer', anchorX: 0.5, anchorY: 0.94 },
  { id: 'final-low-left-outer', anchorX: 0.42, anchorY: 0.92 },
  { id: 'final-low-right-outer', anchorX: 0.58, anchorY: 0.92 },
  { id: 'final-mid-left-outer', anchorX: 0.36, anchorY: 0.84 },
  { id: 'final-mid-right-outer', anchorX: 0.64, anchorY: 0.84 },
];

// Timings diferenciados por fase (ajustan fades/hold respecto a base).
export const PHASE_TIMINGS = {
  [INTERNAL_STATES.INERCIA_VIVA]: { fadeInMs: 850, holdMs: 3200, fadeOutMs: 1400 },
  [INTERNAL_STATES.PULSO_INICIAL]: { fadeInMs: 880, holdMs: 3400, fadeOutMs: 1450 },
  [INTERNAL_STATES.DESLIZAMIENTO_INTERNO]: { fadeInMs: 900, holdMs: 3600, fadeOutMs: 1500 },
  [INTERNAL_STATES.RITMO_EMERGE]: { fadeInMs: 920, holdMs: 3800, fadeOutMs: 1550 },
  [INTERNAL_STATES.DISTORSION_APERTURA]: { fadeInMs: 940, holdMs: 4000, fadeOutMs: 1600 },
  [INTERNAL_STATES.QUIETUD_TENSA]: { fadeInMs: 920, holdMs: 4000, fadeOutMs: 1600 },
};

export const WHISPER_PHASE_WINDOWS = {
  [INTERNAL_STATES.INERCIA_VIVA]: [{ start: 0.25, end: 0.35 }],
  [INTERNAL_STATES.PULSO_INICIAL]: [{ start: 0.3, end: 0.4 }],
  [INTERNAL_STATES.DESLIZAMIENTO_INTERNO]: [
    { start: 0.2, end: 0.3 },
    { start: 0.65, end: 0.75 },
  ],
  [INTERNAL_STATES.RITMO_EMERGE]: [
    { start: 0.25, end: 0.35 },
    { start: 0.7, end: 0.8 },
  ],
  [INTERNAL_STATES.DISTORSION_APERTURA]: [
    { start: 0.3, end: 0.4 },
    { start: 0.75, end: 0.85 },
  ],
  [INTERNAL_STATES.QUIETUD_TENSA]: [{ start: 0.35, end: 0.45 }],
};
