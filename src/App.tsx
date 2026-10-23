import { useCallback, useEffect, useState } from 'react'
import { Abertura, deveMostrarAbertura } from './components/Abertura'
import { Aviso } from './components/Aviso'
import { Contato, Rodape } from './components/Contato'
import { Hero } from './components/Hero'
import { BarraContato, Navegacao } from './components/Navegacao'
import { Competencias, Producao } from './components/Producao'
import { Projetos } from './components/Projetos'
import { ProjetosPessoais } from './components/ProjetosPessoais'
import { Trajetoria } from './components/Trajetoria'

function useRevela() {
  useEffect(() => {
    const raiz = document.documentElement
    if (!('IntersectionObserver' in window)) return
    raiz.classList.add('js-revela')
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visto')
            obs.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    document.querySelectorAll('.revela').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

// Onda que se espalha a partir do toque em botões com a classe "ripple"
function useOndaToque() {
  useEffect(() => {
    const aoTocar = (e: PointerEvent) => {
      const alvo = (e.target as HTMLElement).closest<HTMLElement>('.ripple')
      if (!alvo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const r = alvo.getBoundingClientRect()
      const onda = document.createElement('span')
      const tam = Math.max(r.width, r.height) * 2.2
      onda.className = 'onda-toque'
      onda.style.width = onda.style.height = `${tam}px`
      onda.style.left = `${e.clientX - r.left - tam / 2}px`
      onda.style.top = `${e.clientY - r.top - tam / 2}px`
      alvo.appendChild(onda)
      onda.addEventListener('animationend', () => onda.remove())
    }
    document.addEventListener('pointerdown', aoTocar)
    return () => document.removeEventListener('pointerdown', aoTocar)
  }, [])
}

export default function App() {
  const [abertura, setAbertura] = useState(deveMostrarAbertura)
  useRevela()
  useOndaToque()

  useEffect(() => {
    if (!abertura) document.documentElement.classList.remove('aguardando')
    // só na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const revelar = useCallback(() => document.documentElement.classList.remove('aguardando'), [])
  const fim = useCallback(() => setAbertura(false), [])

  return (
    <>
      {abertura && <Abertura aoRevelar={revelar} aoFim={fim} />}
      <div className="site mx-auto max-w-[440px]">
        <Navegacao />
        <main>
          <Hero />
          <Projetos />
          <ProjetosPessoais />
          <Trajetoria />
          <Producao />
          <Competencias />
          <Contato />
        </main>
        <Rodape />
        <BarraContato />
        <Aviso />
      </div>
    </>
  )
}
