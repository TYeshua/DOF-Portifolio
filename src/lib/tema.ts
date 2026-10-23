import { useSyncExternalStore } from 'react'

// Tema do site. Toda visita começa no escuro, independente do tema do celular.
// O botão troca o tema, e a escolha vale só até fechar a aba (sessionStorage):
// a próxima visita volta a abrir no escuro. O index.html já sai com data-theme="dark",
// para a tela clara não piscar antes do JavaScript carregar.
export type Tema = 'claro' | 'escuro'

const ouvintes = new Set<() => void>()

function lerSessao(): Tema | null {
  try {
    // Versões anteriores guardavam a escolha para sempre; não vale mais.
    localStorage.removeItem('tema')
    const t = sessionStorage.getItem('tema')
    return t === 'claro' || t === 'escuro' ? t : null
  } catch {
    return null
  }
}

let atual: Tema = (typeof window !== 'undefined' && lerSessao()) || 'escuro'

function aplicar() {
  const raiz = document.documentElement
  raiz.dataset.theme = atual === 'escuro' ? 'dark' : 'light'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', atual === 'escuro' ? '#121212' : '#f4f1ea')
}
if (typeof window !== 'undefined') aplicar()

export function definirTema(t: Tema) {
  atual = t
  try {
    sessionStorage.setItem('tema', t)
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
    () => atual,
    () => 'escuro',
  )
}
