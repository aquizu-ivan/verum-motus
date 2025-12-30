// src/whispers/whispersConfig.js
// Configuracion fija de susurros: textos oficiales y parametros temporales/espaciales.

export const WHISPER_TEXTS = [
  'Algo empieza a moverse en el silencio.',
  'La presencia se reconoce por primera vez.',
  'El ritmo propio aparece, sin esfuerzo.',
];

export const WHISPER_FINAL_TEXT = 'La energía fluye libremente.';

export const WHISPER_SCHEDULE = [
  { id: 'whisper-1', center: 1 / 6, text: WHISPER_TEXTS[0] },
  { id: 'whisper-2', center: 1 / 2, text: WHISPER_TEXTS[1] },
  { id: 'whisper-3', center: 5 / 6, text: WHISPER_TEXTS[2] },
];

// Ventana total por susurro = totalDuration * WHISPER_WINDOW_RATIO (3 ventanas => cubrir 0-100% del tiempo total)
export const WHISPER_WINDOW_RATIO = 1 / 3;

export const WHISPER_ENVELOPE = {
  fadeInRatio: 0.5,
  fadeOutRatio: 0.5,
};

export const WHISPER_VISUAL = {
  maxOpacity: 0.814,
  baseMotionRangePx: 1.4,
  jitterRangePx: 0,
  jitterSpeed: 0,
  driftRangePx: 2.4,
  driftSpeed: 0.00006,
  blurEdgePx: 2.1,
  blurPeakPx: 0.9,
  auraBlurPx: 3.8,
  auraOpacityMultiplier: 0.16,
};

export const WHISPER_TYPOGRAPHY = {
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSizeClamp: {
    minRem: 1.364,
    vw: 2.035,
    maxRem: 1.716,
  },
  lineHeight: 1.34,
  letterSpacingEm: 0.066,
  maxWidthRem: 28,
};

export const WHISPER_FINAL_STYLE = {
  maxOpacity: 0.82,
  fontSizeScale: 0.95,
  letterSpacingScale: 1.02,
};

export const WHISPER_BASELINE = {
  yRatio: 0.62,
  variationPx: 0,
  centerAxisExclusionPx: 0,
};

export const WHISPER_SAFE_ZONE = {
  radiusRatio: 0.22,
  paddingPx: 24,
};

export const WHISPER_RING = {
  radiusRatios: [0.38, 0.42, 0.46],
  anglesDeg: [30, 150, 210, 330],
};

export const WHISPER_MASK = {
  innerRatio: 0.22,
  outerRatio: 0.46,
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








