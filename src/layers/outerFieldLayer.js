// src/layers/outerFieldLayer.js
import { BaseLayer } from './baseLayer.js';
import { Mesh, RingGeometry, MeshBasicMaterial, Color, DoubleSide, CanvasTexture } from 'three';
import {
  INERCIA_VIVA_FREQUENCY_HZ,
  INERCIA_VIVA_AMPLITUDE,
  INERCIA_VIVA_COLOR,
  PULSE_CONFIG_TRANSITION_DURATION_S,
  OUTER_FIELD_BASE_RADIUS,
  OUTER_FIELD_BASE_SCALE,
  OUTER_FIELD_SCALE_MULTIPLIER,
  OUTER_FIELD_BASE_OPACITY,
  OUTER_FIELD_OPACITY_VARIATION,
  INERCIA_VIVA_OUTER_FIELD_SCALE_MULTIPLIER,
  INERCIA_VIVA_OUTER_FIELD_OPACITY,
  INERCIA_VIVA_OUTER_FIELD_VARIATION,
  OUTER_FIELD_BASE_COLOR,
  GOLDEN_TINT_COLOR,
} from '../config/constants.js';
import { lerp, clamp } from '../utils/interpolation.js';

export class OuterFieldLayer extends BaseLayer {
  constructor(pulseConfig, outerFieldConfig) {
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
    this.outerFieldTime = 0;
    this.phaseOffset = Math.PI / 3;
    this.mesh = null;

    this.outerScaleMultiplier =
      outerFieldConfig?.scaleMultiplier ?? INERCIA_VIVA_OUTER_FIELD_SCALE_MULTIPLIER;
    this.outerOpacityBase = outerFieldConfig?.opacity ?? INERCIA_VIVA_OUTER_FIELD_OPACITY;
    this.outerVariationMultiplier =
      outerFieldConfig?.variation ?? INERCIA_VIVA_OUTER_FIELD_VARIATION;

    this.darkReference = new Color(0x000000);
    this.tintColor = new Color(OUTER_FIELD_BASE_COLOR);
    this.gradientTexture = null;
    this.goldenTintColor = new Color(GOLDEN_TINT_COLOR);
    this.goldenTintStrength = 0;
  }

  createGradientTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const innerRadius = size * 0.3;
    const coreRadius = size * 0.42;
    const outerRadius = size * 0.5;

    const gradient = ctx.createRadialGradient(
      center,
      center,
      innerRadius,
      center,
      center,
      outerRadius
    );
    const innerBand = innerRadius / outerRadius;
    const midBand = coreRadius / outerRadius;
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(innerBand * 0.8, 'rgba(0,0,0,0.08)');
    gradient.addColorStop(midBand - 0.05, 'rgba(255,255,255,0.65)');
    gradient.addColorStop(midBand + 0.08, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    return texture;
  }

  init(scene) {
    const innerRadius = OUTER_FIELD_BASE_RADIUS * 0.72;
    const outerRadius = OUTER_FIELD_BASE_RADIUS;
    const geometry = new RingGeometry(innerRadius, outerRadius, 96);
    if (!this.gradientTexture) {
      this.gradientTexture = this.createGradientTexture();
    }
    const material = new MeshBasicMaterial({
      color: this.tintColor.clone(),
      transparent: true,
      opacity: this.outerOpacityBase ?? OUTER_FIELD_BASE_OPACITY,
      side: DoubleSide,
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
    this.outerFieldTime += deltaSeconds;

    const effectiveFrequency = this.currentFrequency * 0.35;
    const phase = 2 * Math.PI * effectiveFrequency * this.outerFieldTime + this.phaseOffset;
    const pulse = Math.sin(phase);
    const effectiveAmplitude = this.currentAmplitude * 0.55;

    const scaleBase = OUTER_FIELD_BASE_SCALE * this.outerScaleMultiplier;
    const scaleOffset =
      pulse * effectiveAmplitude * OUTER_FIELD_SCALE_MULTIPLIER * this.outerVariationMultiplier;
    const scale = scaleBase + scaleOffset;
    this.mesh.scale.set(scale, scale, scale);

    const opacityBase = this.outerOpacityBase ?? OUTER_FIELD_BASE_OPACITY;
    const opacityOffset =
      pulse * OUTER_FIELD_OPACITY_VARIATION * this.outerVariationMultiplier;
    const nextOpacity = clamp(opacityBase + opacityOffset, 0, 1);

    if (this.mesh.material) {
      const tinted = this.currentColor.clone().lerp(this.tintColor, 0.7);
      if (this.goldenTintStrength > 0) {
        tinted.lerp(this.goldenTintColor, clamp(this.goldenTintStrength, 0, 0.4));
      }
      const dimColor = tinted.lerp(this.darkReference, 0.25);
      const opacityBoost = clamp(this.goldenTintStrength * 0.12, 0, 0.18);
      this.mesh.material.color.copy(dimColor);
      this.mesh.material.opacity = clamp(nextOpacity + opacityBoost, 0, 1);
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

  applyOuterFieldConfig(outerFieldConfig) {
    if (!outerFieldConfig) {
      this.outerScaleMultiplier = INERCIA_VIVA_OUTER_FIELD_SCALE_MULTIPLIER;
      this.outerOpacityBase = INERCIA_VIVA_OUTER_FIELD_OPACITY;
      this.outerVariationMultiplier = INERCIA_VIVA_OUTER_FIELD_VARIATION;
      return;
    }
    this.outerScaleMultiplier =
      outerFieldConfig.scaleMultiplier ?? this.outerScaleMultiplier;
    this.outerOpacityBase = outerFieldConfig.opacity ?? this.outerOpacityBase;
    this.outerVariationMultiplier =
      outerFieldConfig.variation ?? this.outerVariationMultiplier;
  }

  setGoldenTint({ color = GOLDEN_TINT_COLOR, strength = 0 } = {}) {
    if (color) {
      this.goldenTintColor.set(color);
    }
    this.goldenTintStrength = clamp(strength, 0, 0.35);
  }

  onResize(/* width, height */) {
    // No hay logica especifica de resize para el campo externo en esta fase.
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
