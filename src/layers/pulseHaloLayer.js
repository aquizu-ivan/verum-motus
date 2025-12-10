// src/layers/pulseHaloLayer.js
import { BaseLayer } from './baseLayer.js';
import { Mesh, CircleGeometry, MeshBasicMaterial, Color, CanvasTexture } from 'three';
import {
  INERCIA_VIVA_FREQUENCY_HZ,
  INERCIA_VIVA_AMPLITUDE,
  INERCIA_VIVA_COLOR,
  PULSE_CONFIG_TRANSITION_DURATION_S,
  PULSE_HALO_BASE_RADIUS,
  PULSE_HALO_BASE_SCALE,
  PULSE_HALO_SCALE_MULTIPLIER,
  PULSE_HALO_BASE_OPACITY,
  PULSE_HALO_OPACITY_VARIATION,
  INERCIA_VIVA_HALO_SCALE_MULTIPLIER,
  INERCIA_VIVA_HALO_OPACITY,
  INERCIA_VIVA_HALO_VARIATION,
  PULSE_HALO_BASE_COLOR,
} from '../config/constants.js';
import { lerp, clamp } from '../utils/interpolation.js';

export class PulseHaloLayer extends BaseLayer {
  constructor(pulseConfig) {
    super();
    const frequency = pulseConfig?.frequency ?? INERCIA_VIVA_FREQUENCY_HZ;
    const amplitude = pulseConfig?.amplitude ?? INERCIA_VIVA_AMPLITUDE;
    const colorHex = pulseConfig?.color ?? INERCIA_VIVA_COLOR;

    this.currentFrequency = frequency;
    this.startFrequency = frequency;
    this.targetFrequency = frequency;

    this.currentAmplitude = amplitude;
    this.startAmplitude = amplitude;
    this.targetAmplitude = amplitude;

    const initialColor = new Color(colorHex);
    this.currentColor = initialColor.clone();
    this.startColor = initialColor.clone();
    this.targetColor = initialColor.clone();

    this.transitionElapsed = 0;
    this.isTransitioning = false;
    this.elapsedTime = 0;
    this.mesh = null;

    this.haloScaleMultiplier = INERCIA_VIVA_HALO_SCALE_MULTIPLIER;
    this.haloOpacityBase = INERCIA_VIVA_HALO_OPACITY;
    this.haloVariationMultiplier = INERCIA_VIVA_HALO_VARIATION;
    this.tintColor = new Color(PULSE_HALO_BASE_COLOR);
    this.gradientTexture = null;
  }

  createGradientTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const innerRadius = size * 0.2;
    const midRadius = size * 0.44;
    const outerRadius = size * 0.5;

    const gradient = ctx.createRadialGradient(
      center,
      center,
      innerRadius,
      center,
      center,
      outerRadius
    );
    gradient.addColorStop(0, 'rgba(255,255,255,0.12)');
    gradient.addColorStop(midRadius / outerRadius - 0.08, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(midRadius / outerRadius + 0.02, 'rgba(255,255,255,0.92)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    return texture;
  }

  init(scene) {
    const geometry = new CircleGeometry(PULSE_HALO_BASE_RADIUS, 64);
    if (!this.gradientTexture) {
      this.gradientTexture = this.createGradientTexture();
    }
    const material = new MeshBasicMaterial({
      color: this.tintColor.clone(),
      transparent: true,
      opacity: this.haloOpacityBase ?? PULSE_HALO_BASE_OPACITY,
      depthWrite: false,
      map: this.gradientTexture,
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, 0, 0);

    this.mesh = mesh;
    scene.add(this.mesh);
  }

  update(deltaTime) {
    if (!this.mesh) {
      return;
    }

    const deltaSeconds = deltaTime / 1000;

    if (this.isTransitioning) {
      this.transitionElapsed += deltaSeconds;
      const t = clamp(this.transitionElapsed / PULSE_CONFIG_TRANSITION_DURATION_S, 0, 1);

      this.currentFrequency = lerp(this.startFrequency, this.targetFrequency, t);
      this.currentAmplitude = lerp(this.startAmplitude, this.targetAmplitude, t);
      this.currentColor.lerpColors(this.startColor, this.targetColor, t);

      if (t >= 1) {
        this.currentFrequency = this.targetFrequency;
        this.currentAmplitude = this.targetAmplitude;
        this.currentColor.copy(this.targetColor);
        this.isTransitioning = false;
      }
    }

    this.elapsedTime += deltaSeconds;
    const pulse = Math.sin(2 * Math.PI * this.currentFrequency * this.elapsedTime);

    const scaleBase = PULSE_HALO_BASE_SCALE * this.haloScaleMultiplier;
    const scaleOffset =
      pulse * this.currentAmplitude * PULSE_HALO_SCALE_MULTIPLIER * this.haloVariationMultiplier;
    const scale = scaleBase + scaleOffset;
    this.mesh.scale.set(scale, scale, scale);

    const opacityBase = this.haloOpacityBase ?? PULSE_HALO_BASE_OPACITY;
    const opacityOffset = pulse * PULSE_HALO_OPACITY_VARIATION * this.haloVariationMultiplier;
    const nextOpacity = clamp(opacityBase + opacityOffset, 0, 1);

    if (this.mesh.material) {
      const tinted = this.currentColor.clone().lerp(this.tintColor, 0.65);
      this.mesh.material.color.copy(tinted);
      this.mesh.material.opacity = nextOpacity;
    }
  }

  applyPulseConfig(pulseConfig) {
    const frequency = pulseConfig?.frequency ?? INERCIA_VIVA_FREQUENCY_HZ;
    const amplitude = pulseConfig?.amplitude ?? INERCIA_VIVA_AMPLITUDE;
    const colorHex = pulseConfig?.color ?? INERCIA_VIVA_COLOR;

    this.startFrequency = this.currentFrequency;
    this.startAmplitude = this.currentAmplitude;
    this.startColor.copy(this.currentColor);

    this.targetFrequency = frequency;
    this.targetAmplitude = amplitude;
    this.targetColor.set(colorHex);

    this.transitionElapsed = 0;
    this.isTransitioning = true;
  }

  applyHaloConfig(haloConfig) {
    if (!haloConfig) {
      this.haloScaleMultiplier = INERCIA_VIVA_HALO_SCALE_MULTIPLIER;
      this.haloOpacityBase = INERCIA_VIVA_HALO_OPACITY;
      this.haloVariationMultiplier = INERCIA_VIVA_HALO_VARIATION;
      return;
    }

    this.haloScaleMultiplier = haloConfig.scaleMultiplier ?? this.haloScaleMultiplier;
    this.haloOpacityBase = haloConfig.opacity ?? this.haloOpacityBase;
    this.haloVariationMultiplier = haloConfig.variation ?? this.haloVariationMultiplier;
  }

  onResize(/* width, height */) {
    // Sin logica de resize especifica para el halo en este estado.
  }

  dispose() {
    if (!this.mesh) {
      return;
    }

    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }

    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }

    if (this.mesh.material) {
      this.mesh.material.dispose();
    }

    this.mesh = null;
  }
}
