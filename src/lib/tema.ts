import { useSyncExternalStore } from 'react'

// Tema do site. Sem escolha salva, segue o celular; ao tocar no botão,
// a escolha (claro ou escuro) fica guardada neste navegador.
export type Tema = 'claro' | 'escuro'

const consulta = () => window.matchMedia('(prefers-color-scheme: dark)')
const ouvintes = new Set<() => void>()

function lerSalvo(): Tema | null {
  try {
    const t = localStorage.getItem('tema')
    return t === 'claro' || t === 'escuro' ? t : null
  } catch {
    return null
  }
}

let escolhido: Tema | null = typeof window === 'undefined' ? null : lerSalvo()

function aplicar() {
  const raiz = document.documentElement
  if (escolhido) raiz.dataset.theme = escolhido === 'escuro' ? 'dark' : 'light'
  else delete raiz.dataset.theme
}
if (typeof window !== 'undefined') {
  aplicar()
  consulta().addEventListener('change', () => ouvintes.forEach((f) => f()))
}

const efetivo = (): Tema => escolhido ?? (consulta().matches ? 'escuro' : 'claro')

export function definirTema(t: Tema) {
  escolhido = t
  try {
    localStorage.setItem('tema', t)
  } catch {
    /* armazenamento indisponível */
  }
  aplicar()
  ouvintes.forEach((f) => f())
}

export function useTema(): Tema {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f)
      return () => ouvintes.delete(f)
    },
    efetivo,
    () => 'claro',
  )
}
