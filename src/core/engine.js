// src/core/engine.js
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import { now } from '../utils/time.js';
import { InnerPulseLayer } from '../layers/innerPulseLayer.js';
import { INTERNAL_STATES } from '../states/internalStates.js';
import { createStateMachine } from '../states/stateMachine.js';

export function bootstrapVerumMotus() {
  // Escena base silenciosa; luego se conectaran capas y estados.
  const layers = [];

  const appElement = document.getElementById('app');
  if (!appElement) {
    throw new Error('Elemento raiz #app no encontrado para Verum Motus');
  }

  const scene = new Scene();

  const width = window.innerWidth;
  const height = window.innerHeight;

  const camera = new PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 5;

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setClearColor(0x000000, 1); // lienzo negro, sin ruido visual

  const stateMachine = createStateMachine({
    initialState: INTERNAL_STATES.INERCIA_VIVA,
    allowedStates: Object.values(INTERNAL_STATES),
  });
  // Estado interno global de Verum Motus; mas adelante modularemos capas y transiciones desde aqui.

  appElement.innerHTML = '';
  appElement.appendChild(renderer.domElement);

  function registerLayer(layer) {
    // Se usara para agregar capas (ej. Pulso Interno); cada capa recibe la escena para poblarla.
    layers.push(layer);
    if (typeof layer.init === 'function') {
      layer.init(scene);
    }
  }

  const innerPulseLayer = new InnerPulseLayer();
  registerLayer(innerPulseLayer);

  let lastTime = now();

  function animate() {
    requestAnimationFrame(animate);

    const currentTime = now();
    const deltaTime = currentTime - lastTime; // deltaTime en milisegundos; usar deltaTime / 1000 para segundos.
    lastTime = currentTime;

    for (const layer of layers) {
      if (typeof layer.update === 'function') {
        layer.update(deltaTime);
      }
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);

    for (const layer of layers) {
      if (typeof layer.onResize === 'function') {
        layer.onResize(newWidth, newHeight);
      }
    }
  });
}
