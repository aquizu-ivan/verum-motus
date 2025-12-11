// src/ui/fullscreenController.js
// Control minimo de fullscreen para Verum Motus sin tocar el motor principal.

export function isFullscreenActive() {
  return Boolean(document.fullscreenElement);
}

export function enterFullscreen(element) {
  if (!element || isFullscreenActive()) return;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  }
}

export function exitFullscreen() {
  if (!isFullscreenActive()) return;
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

export function toggleFullscreen(element) {
  if (isFullscreenActive()) {
    exitFullscreen();
  } else {
    enterFullscreen(element);
  }
}

export function onFullscreenChange(handler) {
  document.addEventListener('fullscreenchange', handler);
}
