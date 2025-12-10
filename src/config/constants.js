import { INTERNAL_STATES } from '../states/internalStates.js';
// src/config/constants.js
// Espacio para constantes globales de la obra: tiempos, intensidades, colores base, etc.
export const VM_VERSION = '0.1.0';

// Ritmo base de INERCIA_VIVA (estado inicial casi inmovil)
export const INERCIA_VIVA_FREQUENCY_HZ = 0.12;
export const INERCIA_VIVA_AMPLITUDE = 0.02;
export const INERCIA_VIVA_COLOR = 0xcfcfcf;

// Ritmo de PULSO_INICIAL (primer movimiento visible)
export const PULSO_INICIAL_FREQUENCY_HZ = 0.17;
export const PULSO_INICIAL_AMPLITUDE = 0.04;
export const PULSO_INICIAL_COLOR = 0xdadada;

// Ritmo de DESLIZAMIENTO_INTERNO (desplazamiento mas activo)
export const DESLIZAMIENTO_INTERNO_FREQUENCY_HZ = 0.25;
export const DESLIZAMIENTO_INTERNO_AMPLITUDE = 0.065;
export const DESLIZAMIENTO_INTERNO_COLOR = 0xe8e8e8;

// Ritmo de RITMO_EMERGE (pulso mas presente y definido, aun contenido)
export const RITMO_EMERGE_FREQUENCY_HZ = 0.36;
export const RITMO_EMERGE_AMPLITUDE = 0.09;
export const RITMO_EMERGE_COLOR = 0xf5f5f5;

// Ritmo de DISTORSION_APERTURA (tension controlada, exploracion de limite)
export const DISTORSION_APERTURA_FREQUENCY_HZ = 0.42;
export const DISTORSION_APERTURA_AMPLITUDE = 0.105;
export const DISTORSION_APERTURA_COLOR = 0xf8f8f8;

// Ritmo de QUIETUD_TENSA (asentamiento y sosten)
export const QUIETUD_TENSA_FREQUENCY_HZ = 0.22;
export const QUIETUD_TENSA_AMPLITUDE = 0.06;
export const QUIETUD_TENSA_COLOR = 0xededed;

// Tiempo que INERCIA_VIVA permanece antes del primer cambio interno
export const INITIAL_STATE_TRANSITION_DELAY_MS = 10000;
// Tiempo entre PULSO_INICIAL y DESLIZAMIENTO_INTERNO
export const PULSO_INICIAL_TO_DESLIZAMIENTO_DELAY_MS = 8000;
// Tiempo entre DESLIZAMIENTO_INTERNO y RITMO_EMERGE
export const DESLIZAMIENTO_INTERNO_TO_RITMO_EMERGE_DELAY_MS = 9000;
// Tiempo entre RITMO_EMERGE y DISTORSION_APERTURA
export const RITMO_EMERGE_TO_DISTORSION_DELAY_MS = 10000;
// Tiempo entre DISTORSION_APERTURA y QUIETUD_TENSA
export const DISTORSION_APERTURA_TO_QUIETUD_TENSA_DELAY_MS = 12000;

// Duracion de la transicion entre configuraciones del Pulso Interno (en segundos)
export const PULSE_CONFIG_TRANSITION_DURATION_S = 5.5;

// Parametros base del halo del Pulso Interno
export const PULSE_HALO_BASE_RADIUS = 0.18; // ligeramente mayor que la esfera base (0.1)
export const PULSE_HALO_BASE_SCALE = 0.96;
export const PULSE_HALO_SCALE_MULTIPLIER = 1.4;
export const PULSE_HALO_BASE_OPACITY = 0.28;
export const PULSE_HALO_OPACITY_VARIATION = 0.06;
export const PULSE_HALO_BASE_COLOR = 0x232937;
// Moduladores per-estado del halo (escala, opacidad y variacion de respiracion)
export const INERCIA_VIVA_HALO_SCALE_MULTIPLIER = 0.96;
export const INERCIA_VIVA_HALO_OPACITY = 0.18;
export const INERCIA_VIVA_HALO_VARIATION = 0.48;

export const PULSO_INICIAL_HALO_SCALE_MULTIPLIER = 1.03;
export const PULSO_INICIAL_HALO_OPACITY = 0.22;
export const PULSO_INICIAL_HALO_VARIATION = 0.62;

export const DESLIZAMIENTO_INTERNO_HALO_SCALE_MULTIPLIER = 1.11;
export const DESLIZAMIENTO_INTERNO_HALO_OPACITY = 0.26;
export const DESLIZAMIENTO_INTERNO_HALO_VARIATION = 0.78;

export const RITMO_EMERGE_HALO_SCALE_MULTIPLIER = 1.2;
export const RITMO_EMERGE_HALO_OPACITY = 0.3;
export const RITMO_EMERGE_HALO_VARIATION = 0.92;

export const DISTORSION_APERTURA_HALO_SCALE_MULTIPLIER = 1.28;
export const DISTORSION_APERTURA_HALO_OPACITY = 0.32;
export const DISTORSION_APERTURA_HALO_VARIATION = 1.05;

export const QUIETUD_TENSA_HALO_SCALE_MULTIPLIER = 1.18;
export const QUIETUD_TENSA_HALO_OPACITY = 0.24;
export const QUIETUD_TENSA_HALO_VARIATION = 0.62;

// Guardrail para limitar el pixel ratio del renderer en pantallas HiDPI.
export const MAX_PIXEL_RATIO = 2;

// Parametros base del campo externo (outer field)
export const OUTER_FIELD_BASE_RADIUS = 0.6;
export const OUTER_FIELD_BASE_SCALE = 1.45;
export const OUTER_FIELD_SCALE_MULTIPLIER = 1.15;
export const OUTER_FIELD_BASE_OPACITY = 0.24;
export const OUTER_FIELD_OPACITY_VARIATION = 0.025;
export const OUTER_FIELD_BASE_COLOR = 0x151821;

// Moduladores per-estado del campo externo (escala, opacidad, variacion)
export const INERCIA_VIVA_OUTER_FIELD_SCALE_MULTIPLIER = 1.0;
export const INERCIA_VIVA_OUTER_FIELD_OPACITY = 0.14;
export const INERCIA_VIVA_OUTER_FIELD_VARIATION = 0.3;

export const PULSO_INICIAL_OUTER_FIELD_SCALE_MULTIPLIER = 1.04;
export const PULSO_INICIAL_OUTER_FIELD_OPACITY = 0.17;
export const PULSO_INICIAL_OUTER_FIELD_VARIATION = 0.42;

export const DESLIZAMIENTO_INTERNO_OUTER_FIELD_SCALE_MULTIPLIER = 1.1;
export const DESLIZAMIENTO_INTERNO_OUTER_FIELD_OPACITY = 0.21;
export const DESLIZAMIENTO_INTERNO_OUTER_FIELD_VARIATION = 0.6;

export const RITMO_EMERGE_OUTER_FIELD_SCALE_MULTIPLIER = 1.16;
export const RITMO_EMERGE_OUTER_FIELD_OPACITY = 0.24;
export const RITMO_EMERGE_OUTER_FIELD_VARIATION = 0.72;

export const DISTORSION_APERTURA_OUTER_FIELD_SCALE_MULTIPLIER = 1.22;
export const DISTORSION_APERTURA_OUTER_FIELD_OPACITY = 0.26;
export const DISTORSION_APERTURA_OUTER_FIELD_VARIATION = 0.85;

export const QUIETUD_TENSA_OUTER_FIELD_SCALE_MULTIPLIER = 1.1;
export const QUIETUD_TENSA_OUTER_FIELD_OPACITY = 0.18;
export const QUIETUD_TENSA_OUTER_FIELD_VARIATION = 0.35;

// Config declarativa del campo externo por estado simbólico.
export const OUTER_FIELD_CONFIG_BY_STATE = {
  [INTERNAL_STATES.INERCIA_VIVA]: {
    scaleMultiplier: INERCIA_VIVA_OUTER_FIELD_SCALE_MULTIPLIER,
    opacity: INERCIA_VIVA_OUTER_FIELD_OPACITY,
    variation: INERCIA_VIVA_OUTER_FIELD_VARIATION,
  },
  [INTERNAL_STATES.PULSO_INICIAL]: {
    scaleMultiplier: PULSO_INICIAL_OUTER_FIELD_SCALE_MULTIPLIER,
    opacity: PULSO_INICIAL_OUTER_FIELD_OPACITY,
    variation: PULSO_INICIAL_OUTER_FIELD_VARIATION,
  },
  [INTERNAL_STATES.DESLIZAMIENTO_INTERNO]: {
    scaleMultiplier: DESLIZAMIENTO_INTERNO_OUTER_FIELD_SCALE_MULTIPLIER,
    opacity: DESLIZAMIENTO_INTERNO_OUTER_FIELD_OPACITY,
    variation: DESLIZAMIENTO_INTERNO_OUTER_FIELD_VARIATION,
  },
  [INTERNAL_STATES.RITMO_EMERGE]: {
    scaleMultiplier: RITMO_EMERGE_OUTER_FIELD_SCALE_MULTIPLIER,
    opacity: RITMO_EMERGE_OUTER_FIELD_OPACITY,
    variation: RITMO_EMERGE_OUTER_FIELD_VARIATION,
  },
  [INTERNAL_STATES.DISTORSION_APERTURA]: {
    scaleMultiplier: DISTORSION_APERTURA_OUTER_FIELD_SCALE_MULTIPLIER,
    opacity: DISTORSION_APERTURA_OUTER_FIELD_OPACITY,
    variation: DISTORSION_APERTURA_OUTER_FIELD_VARIATION,
  },
  [INTERNAL_STATES.QUIETUD_TENSA]: {
    scaleMultiplier: QUIETUD_TENSA_OUTER_FIELD_SCALE_MULTIPLIER,
    opacity: QUIETUD_TENSA_OUTER_FIELD_OPACITY,
    variation: QUIETUD_TENSA_OUTER_FIELD_VARIATION,
  },
};

