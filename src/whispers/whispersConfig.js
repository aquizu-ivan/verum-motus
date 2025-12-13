// src/whispers/whispersConfig.js
// Configuracion fija de susurros: textos oficiales y parametros temporales/espaciales.

export const WHISPER_TEXTS = [
  'El movimiento verdadero aparece.',
  'La dirección interna no se negocia.',
  'Silencio que ordena la forma.',
];

export const WHISPER_SCHEDULE = [
  { id: 'whisper-1', center: 1 / 6, text: WHISPER_TEXTS[0] },
  { id: 'whisper-2', center: 1 / 2, text: WHISPER_TEXTS[1] },
  { id: 'whisper-3', center: 5 / 6, text: WHISPER_TEXTS[2] },
];

// Ventana total por susurro = totalDuration * WHISPER_WINDOW_RATIO (3 ventanas => 1/3 del tiempo total)
export const WHISPER_WINDOW_RATIO = 1 / 9;

export const WHISPER_ENVELOPE = {
  fadeInRatio: 0.48,
  fadeOutRatio: 0.48,
};

export const WHISPER_VISUAL = {
  maxOpacity: 0.74,
  baseMotionRangePx: 5.5,
  jitterRangePx: 4,
  jitterSpeed: 0.0012,
  blurEdgePx: 2.1,
  blurPeakPx: 0.9,
  auraBlurPx: 3.8,
  auraOpacityMultiplier: 0.23,
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
