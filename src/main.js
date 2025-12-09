import './style.css'
import { bootstrapVerumMotus } from './core/engine.js'

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

bootstrapVerumMotus()
