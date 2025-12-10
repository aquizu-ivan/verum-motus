// src/core/engine.js
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import { now } from '../utils/time.js';
import { InnerPulseLayer } from '../layers/innerPulseLayer.js';
import { PulseHaloLayer } from '../layers/pulseHaloLayer.js';
import { WhispersLayer } from '../layers/whispersLayer.js';
import { INTERNAL_STATES } from '../states/internalStates.js';
import { createStateMachine } from '../states/stateMachine.js';
import { createStateOrchestrator } from '../states/stateOrchestrator.js';
import { createPulseStateCoordinator } from '../transitions/pulseStateCoordinator.js';
import {
  registerLayerForLifecycle,
  registerCoordinatorForLifecycle,
  disposeAllLifecycle,
} from './lifecycleManager.js';
import { MAX_PIXEL_RATIO } from '../config/constants.js';
import {
  getActiveWhispers,
  resetWhispersSystem,
  updateWhispers,
} from '../whispers/whispersSystem.js';

export function bootstrapVerumMotus() {
  // Escena base silenciosa; luego se conectaran capas y estados.
  const layers = [];
  let animationFrameId = null;
  let isRunning = true;

  const appElement = document.getElementById('app');
  if (!appElement) {
    throw new Error('Elemento raiz #app no encontrado para Verum Motus');
  }

  const scene = new Scene();

  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  const camera = new PerspectiveCamera(45, viewportWidth / viewportHeight, 0.1, 100);
  camera.position.z = 5;

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(viewportWidth, viewportHeight);
  const devicePixelRatio = window.devicePixelRatio || 1;
  const pixelRatio = Math.min(devicePixelRatio, MAX_PIXEL_RATIO);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 1); // lienzo negro, sin ruido visual

  const stateMachine = createStateMachine({
    initialState: INTERNAL_STATES.INERCIA_VIVA,
    allowedStates: Object.values(INTERNAL_STATES),
  });
  // Estado interno global de Verum Motus; mas adelante modularemos capas y transiciones desde aqui.

  const stateOrchestrator = createStateOrchestrator(stateMachine);
  // El orquestador expone configuraciones derivadas del estado (p.ej. Pulso Interno); se conectara en bloques siguientes.

  let currentInternalState = stateMachine.getCurrentState();
  let phaseElapsedMs = 0;
  const unsubscribeInternalState = stateMachine.subscribe((prevState, nextState) => {
    if (prevState !== nextState) {
      phaseElapsedMs = 0;
      currentInternalState = nextState;
    }
  });

  resetWhispersSystem();

  appElement.innerHTML = '';
  appElement.appendChild(renderer.domElement);

  function registerLayer(layer) {
    // Se usara para agregar capas (ej. Pulso Interno); cada capa recibe la escena para poblarla.
    layers.push(layer);
    if (typeof layer.init === 'function') {
      layer.init(scene);
    }
  }

  const pulseConfig = stateOrchestrator.getCurrentPulseConfig();
  const haloConfig = stateOrchestrator.getCurrentHaloConfig();

  const innerPulseLayer = new InnerPulseLayer(pulseConfig);
  registerLayer(innerPulseLayer);
  registerLayerForLifecycle(innerPulseLayer);

  const haloLayer = new PulseHaloLayer(pulseConfig);
  registerLayer(haloLayer);
  registerLayerForLifecycle(haloLayer);

  const whispersLayer = new WhispersLayer({
    getActiveWhispers,
  });
  registerLayer(whispersLayer);
  registerLayerForLifecycle(whispersLayer);

  const pulseTargets = [innerPulseLayer, haloLayer];
  const pulseCoordinator = createPulseStateCoordinator({
    stateMachine,
    stateOrchestrator,
    pulseTargets,
  });
  registerCoordinatorForLifecycle(pulseCoordinator);
  // El coordinador conecta cambios de estado con la capa; dispose() se usara en teardown si se requiere.

  let lastTime = now();

  function animate() {
    if (!isRunning) {
      return;
    }

    const currentTime = now();
    const deltaTime = currentTime - lastTime; // deltaTime en milisegundos; usar deltaTime / 1000 para segundos.
    lastTime = currentTime;
    phaseElapsedMs += deltaTime;

    updateWhispers(deltaTime, {
      phaseId: currentInternalState,
      phaseElapsedMs,
      viewportWidth,
      viewportHeight,
    });

    for (const layer of layers) {
      if (typeof layer.update === 'function') {
        layer.update(deltaTime);
      }
    }

    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  }
  animationFrameId = requestAnimationFrame(animate);

  function handleResize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;

    camera.aspect = viewportWidth / viewportHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewportWidth, viewportHeight);

    for (const layer of layers) {
      if (typeof layer.onResize === 'function') {
        layer.onResize(viewportWidth, viewportHeight);
      }
    }
  }

  window.addEventListener('resize', handleResize);

  function getCurrentInternalState() {
    return stateMachine.getCurrentState();
  }

  return {
    dispose() {
      isRunning = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (unsubscribeInternalState) {
        unsubscribeInternalState();
      }
      window.removeEventListener('resize', handleResize);
      disposeAllLifecycle();
      if (renderer.domElement?.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    },
    getCurrentInternalState,
  };
}
