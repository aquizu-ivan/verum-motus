// src/layers/innerPulseLayer.js
import { BaseLayer } from './baseLayer.js';
import { Mesh, SphereGeometry, MeshBasicMaterial, Color } from 'three';
import {
  INERCIA_VIVA_FREQUENCY_HZ,
  INERCIA_VIVA_AMPLITUDE,
  INERCIA_VIVA_COLOR,
  PULSE_CONFIG_TRANSITION_DURATION_S,
} from '../config/constants.js';

export class InnerPulseLayer extends BaseLayer {
  constructor(pulseConfig) {
    super();
    this.mesh = null;
    this.elapsedTime = 0;
    this.baseScale = 1;

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
  }

  init(scene) {
    // Forma minima en el origen; presencia sutil sobre el fondo negro.
    const geometry = new SphereGeometry(0.1, 24, 24);
    const material = new MeshBasicMaterial({ color: this.currentColor });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, 0, 0);

    this.mesh = mesh;
    scene.add(this.mesh);
  }

  update(deltaTime) {
    if (!this.mesh) {
      return;
    }
    const deltaSeconds = deltaTime / 1000; // deltaTime llega en ms
    this.elapsedTime += deltaSeconds;

    if (this.isTransitioning) {
      this.transitionElapsed += deltaSeconds;
      const t = Math.min(this.transitionElapsed / PULSE_CONFIG_TRANSITION_DURATION_S, 1);
      const lerp = (a, b, tValue) => a + (b - a) * tValue;

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

    const scaleOffset = Math.sin(this.elapsedTime * 2 * Math.PI * this.currentFrequency) * this.currentAmplitude;
    const scale = this.baseScale + scaleOffset;

    this.mesh.scale.set(scale, scale, scale);

    if (this.mesh.material) {
      this.mesh.material.color.copy(this.currentColor);
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

  onResize(/* width, height */) {
    // Esta capa no depende del viewport en este estado.
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
