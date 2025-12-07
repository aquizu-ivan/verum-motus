// src/layers/innerPulseLayer.js
import { BaseLayer } from './baseLayer.js';
import { Mesh, SphereGeometry, MeshBasicMaterial } from 'three';

export class InnerPulseLayer extends BaseLayer {
  constructor() {
    super();
    this.mesh = null;
    this.elapsedTime = 0;
    this.baseScale = 1;
  }

  init(scene) {
    // Forma minima en el origen; presencia sutil sobre el fondo negro.
    const geometry = new SphereGeometry(0.1, 24, 24);
    const material = new MeshBasicMaterial({ color: 0xdddddd });
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
    this.elapsedTime += deltaSeconds;

    const frequency = 1 / 6; // ~1 ciclo cada 6 segundos
    const amplitude = 0.03; // variacion suave alrededor de la escala base
    const scaleOffset = Math.sin(this.elapsedTime * 2 * Math.PI * frequency) * amplitude;
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
