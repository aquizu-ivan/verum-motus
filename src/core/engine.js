// src/core/engine.js
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';

export function bootstrapVerumMotus() {
  // Escena base silenciosa; luego se conectaran capas y estados.
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

  appElement.innerHTML = '';
  appElement.appendChild(renderer.domElement);

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}
