// src/config/constants.js
// Espacio para constantes globales de la obra: tiempos, intensidades, colores base, etc.
export const VM_VERSION = '0.1.0';

// Ritmo base de INERCIA_VIVA (estado inicial casi inmovil)
export const INERCIA_VIVA_FREQUENCY_HZ = 1 / 6;
export const INERCIA_VIVA_AMPLITUDE = 0.03;
export const INERCIA_VIVA_COLOR = 0xdddddd;

// Ritmo de PULSO_INICIAL (primer movimiento visible)
export const PULSO_INICIAL_FREQUENCY_HZ = 1 / 3;
export const PULSO_INICIAL_AMPLITUDE = 0.06;
export const PULSO_INICIAL_COLOR = 0xefefef;

// Tiempo que INERCIA_VIVA permanece antes del primer cambio interno
export const INITIAL_STATE_TRANSITION_DELAY_MS = 10000;

// Duracion de la transicion entre configuraciones del Pulso Interno (en segundos)
export const PULSE_CONFIG_TRANSITION_DURATION_S = 4;

// Parametros base del halo del Pulso Interno
export const PULSE_HALO_BASE_RADIUS = 0.2; // ligeramente mayor que la esfera base (0.1)
export const PULSE_HALO_BASE_SCALE = 1.0;
export const PULSE_HALO_SCALE_MULTIPLIER = 1.5;
export const PULSE_HALO_BASE_OPACITY = 0.18;
export const PULSE_HALO_OPACITY_VARIATION = 0.06;
