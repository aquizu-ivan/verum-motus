// src/config/constants.js
// Espacio para constantes globales de la obra: tiempos, intensidades, colores base, etc.
export const VM_VERSION = '0.1.0';

// Ritmo base de INERCIA_VIVA (estado inicial casi inmovil)
export const INERCIA_VIVA_FREQUENCY_HZ = 0.12;
export const INERCIA_VIVA_AMPLITUDE = 0.02;
export const INERCIA_VIVA_COLOR = 0xcfcfcf;

// Ritmo de PULSO_INICIAL (primer movimiento visible)
export const PULSO_INICIAL_FREQUENCY_HZ = 0.18;
export const PULSO_INICIAL_AMPLITUDE = 0.045;
export const PULSO_INICIAL_COLOR = 0xdadada;

// Ritmo de DESLIZAMIENTO_INTERNO (desplazamiento mas activo)
export const DESLIZAMIENTO_INTERNO_FREQUENCY_HZ = 0.28;
export const DESLIZAMIENTO_INTERNO_AMPLITUDE = 0.075;
export const DESLIZAMIENTO_INTERNO_COLOR = 0xe8e8e8;

// Ritmo de RITMO_EMERGE (pulso mas presente y definido, aun contenido)
export const RITMO_EMERGE_FREQUENCY_HZ = 0.42;
export const RITMO_EMERGE_AMPLITUDE = 0.1;
export const RITMO_EMERGE_COLOR = 0xf5f5f5;

// Tiempo que INERCIA_VIVA permanece antes del primer cambio interno
export const INITIAL_STATE_TRANSITION_DELAY_MS = 10000;
// Tiempo entre PULSO_INICIAL y DESLIZAMIENTO_INTERNO
export const PULSO_INICIAL_TO_DESLIZAMIENTO_DELAY_MS = 8000;
// Tiempo entre DESLIZAMIENTO_INTERNO y RITMO_EMERGE
export const DESLIZAMIENTO_INTERNO_TO_RITMO_EMERGE_DELAY_MS = 9000;

// Duracion de la transicion entre configuraciones del Pulso Interno (en segundos)
export const PULSE_CONFIG_TRANSITION_DURATION_S = 4;

// Parametros base del halo del Pulso Interno
export const PULSE_HALO_BASE_RADIUS = 0.18; // ligeramente mayor que la esfera base (0.1)
export const PULSE_HALO_BASE_SCALE = 0.96;
export const PULSE_HALO_SCALE_MULTIPLIER = 1.4;
export const PULSE_HALO_BASE_OPACITY = 0.14;
export const PULSE_HALO_OPACITY_VARIATION = 0.05;

// Guardrail para limitar el pixel ratio del renderer en pantallas HiDPI.
export const MAX_PIXEL_RATIO = 2;
