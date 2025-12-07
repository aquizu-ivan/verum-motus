// src/layers/innerPulseLayer.js
import { BaseLayer } from './baseLayer.js';
import { Mesh, SphereGeometry, MeshBasicMaterial } from 'three';

export class InnerPulseLayer extends BaseLayer {
  constructor(pulseConfig) {
    super();
    this.mesh = null;
    this.elapsedTime = 0;
    this.baseScale = 1;

    this.frequency = pulseConfig?.frequency ?? 1 / 6;
    this.amplitude = pulseConfig?.amplitude ?? 0.03;
    this.color = pulseConfig?.color ?? 0xdddddd;
  }

  init(scene) {
    // Forma minima en el origen; presencia sutil sobre el fondo negro.
    const geometry = new SphereGeometry(0.1, 24, 24);
    const material = new MeshBasicMaterial({ color: this.color });
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

    const scaleOffset = Math.sin(this.elapsedTime * 2 * Math.PI * this.frequency) * this.amplitude;
    const scale = this.baseScale + scaleOffset;

    this.mesh.scale.set(scale, scale, scale);
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
