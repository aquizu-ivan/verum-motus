import './style.css'
import { bootstrapVerumMotus } from './core/engine.js'
import {
  toggleFullscreen,
  isFullscreenActive,
  onFullscreenChange,
} from './ui/fullscreenController.js'

const root = document.getElementById('verum-root')
if (!root) {
  throw new Error('Contenedor raíz #verum-root no encontrado para Verum Motus')
}

let app = document.getElementById('app')
if (!app) {
  app = document.createElement('div')
  app.id = 'app'
}

if (!root.contains(app)) {
  root.appendChild(app)
}

const fullscreenButton = document.createElement('button')
fullscreenButton.type = 'button'
fullscreenButton.className = 'vm-fullscreen-toggle'
fullscreenButton.setAttribute('aria-label', 'Activar pantalla completa')
fullscreenButton.textContent = 'pantalla completa'
root.appendChild(fullscreenButton)

function syncFullscreenState() {
  const active = isFullscreenActive() && document.fullscreenElement === root
  if (active) {
    root.classList.add('is-fullscreen')
  } else {
    root.classList.remove('is-fullscreen')
  }
  fullscreenButton.setAttribute(
    'aria-label',
    active ? 'Salir de pantalla completa' : 'Activar pantalla completa'
  )
  fullscreenButton.textContent = active ? 'salir' : 'pantalla completa'
}

fullscreenButton.addEventListener('click', () => {
  toggleFullscreen(root)
})

document.addEventListener('keydown', (event) => {
  if (event.key && event.key.toLowerCase() === 'f') {
    toggleFullscreen(root)
  }
})

onFullscreenChange(syncFullscreenState)
syncFullscreenState()

bootstrapVerumMotus()
