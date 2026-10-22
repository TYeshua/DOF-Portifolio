import { useEffect } from 'react'
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

export default function App() {
  useRevela()
  return (
    <div className="mx-auto max-w-[440px]">
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
    </div>
  )
}
