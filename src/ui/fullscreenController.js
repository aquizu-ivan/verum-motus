// src/ui/fullscreenController.js
// Control minimo de fullscreen para Verum Motus sin tocar el motor principal.

const FULLSCREEN_EVENTS = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
];

export function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
}

export function isFullscreenActive() {
  return Boolean(getFullscreenElement());
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
  FULLSCREEN_EVENTS.forEach((eventName) => {
    document.addEventListener(eventName, handler);
  });
}
