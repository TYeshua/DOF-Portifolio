import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './index.css'
import App from './App.tsx'
import { deveMostrarAbertura } from './components/Abertura'

if (deveMostrarAbertura()) document.documentElement.classList.add('aguardando')

// Modo offline (public/sw.js). Só no site publicado, não no desenvolvimento nem em arquivo local.
if (import.meta.env.PROD && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        const urls = performance
          .getEntriesByType('resource')
          .map((r) => r.name)
          .filter((u) => u.startsWith(location.origin))
        reg.active?.postMessage({ tipo: 'guardar', urls })
      })
      .catch(() => {
        /* sem modo offline; o site funciona normalmente */
      })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
