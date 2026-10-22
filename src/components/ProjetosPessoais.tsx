import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { projetosPessoais, type ProjetoPessoal } from '../data'
import { Galeria } from './Galeria'
import { Contador, Secao } from './ui'

const corArea: Record<ProjetoPessoal['area'], string> = {
  'Óleo e gás': 'bg-accent',
  Energia: 'bg-good',
  Software: 'bg-steel',
}

function Cartao({ p, i, ativo }: { p: ProjetoPessoal; i: number; ativo: boolean }) {
  return (
    <article className="carrossel-cartao flex h-full flex-col gap-4 rounded-[24px] border border-line bg-surface p-5" aria-roledescription="slide" aria-label={`${i + 1} de ${projetosPessoais.length}: ${p.titulo}`}>
      <header className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3 font-mono text-[0.72rem] text-muted">
          <span className="inline-flex items-center gap-1.5 text-ink">
            <span aria-hidden className={`size-2 rounded-full ${corArea[p.area]}`} />
            {p.area}
          </span>
          <span className="tabular">{p.ano}</span>
        </div>
        <h3 className="display text-[1.42rem] leading-[1.1]">{p.titulo}</h3>
        <p className="text-[0.9rem] text-muted">{p.subtitulo}</p>
      </header>

      <Galeria titulo={p.titulo} telas={p.telas} ativo={ativo} />

      <p className="text-[0.95rem] leading-relaxed">{p.resumo}</p>

      {p.numeros && (
        <div className="grid grid-cols-3 rounded-xl border border-line">
          {p.numeros.map((n, k) => (
            <div key={n.rotulo} className={`flex min-w-0 flex-col gap-1 px-3 py-3 ${k > 0 ? 'border-l border-line' : ''}`}>
              <span className="display tabular text-[1.3rem] leading-none text-accent-ink">
                <Contador valor={n.valor} ativo={ativo} />
              </span>
              <span className="text-[0.72rem] leading-snug text-muted">{n.rotulo}</span>
            </div>
          ))}
        </div>
      )}

      <ul className="flex flex-col gap-1.5 text-[0.9rem]">
        {p.pontos.map((t) => (
          <li key={t} className="flex gap-2.5">
            <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <ul className="mt-auto flex flex-wrap gap-1.5" aria-label="Tecnologias">
        {p.tags.map((t) => (
          <li key={t} className="rounded-md bg-sunken px-2 py-0.5 font-mono text-[0.72rem] text-muted">
            {t}
          </li>
        ))}
      </ul>
      {p.nota && <p className="text-[0.74rem] leading-snug text-muted">{p.nota}</p>}
    </article>
  )
}

export function ProjetosPessoais() {
  const trilho = useRef<HTMLDivElement>(null)
  const chips = useRef<HTMLDivElement>(null)
  const [atual, setAtual] = useState(0)
  const [indicador, setIndicador] = useState({ x: 0, w: 0 })
  const n = projetosPessoais.length

  // Escala e brilho de cada cartão conforme a distância do centro
  useEffect(() => {
    const el = trilho.current
    if (!el) return
    let quadro = 0
    const atualizar = () => {
      quadro = 0
      const centro = el.scrollLeft + el.clientWidth / 2
      let melhor = 0
      let menor = Infinity
      Array.from(el.children).forEach((c, i) => {
        const h = c as HTMLElement
        const d = (h.offsetLeft + h.offsetWidth / 2 - centro) / h.offsetWidth
        h.style.setProperty('--ad', Math.min(1, Math.abs(d)).toFixed(3))
        h.style.setProperty('--d', Math.max(-1, Math.min(1, d)).toFixed(3))
        if (Math.abs(d) < menor) {
          menor = Math.abs(d)
          melhor = i
        }
      })
      setAtual(melhor)
    }
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar)
    }
    atualizar()
    el.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)
    return () => {
      el.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
    }
  }, [])

  useEffect(() => {
    const b = chips.current?.children[atual] as HTMLElement | undefined
    if (!b || !chips.current) return
    setIndicador({ x: b.offsetLeft, w: b.offsetWidth })
    chips.current.scrollTo({ left: b.offsetLeft - 24, behavior: 'smooth' })
  }, [atual])

  const ir = (i: number) => {
    const el = trilho.current
    const alvo = el?.children[Math.max(0, Math.min(n - 1, i))] as HTMLElement | undefined
    if (!el || !alvo) return
    el.scrollTo({ left: alvo.offsetLeft - (el.clientWidth - alvo.offsetWidth) / 2, behavior: 'smooth' })
  }

  return (
    <Secao id="projetos" rotulo={`Projetos pessoais · ${n}`} titulo="Por conta própria">
      <p className="revela -mt-2 max-w-[38ch] text-[0.97rem] text-muted">
        Feitos fora das bolsas, para aprender e testar ideias de Digital Oilfield. Deslize para o lado.
      </p>

      <div ref={chips} className="relative -mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Projetos">
        {projetosPessoais.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={atual === i}
            onClick={() => ir(i)}
            className={`relative z-[1] shrink-0 rounded-full px-3.5 py-2 text-[0.84rem] font-medium transition-colors duration-300 ${atual === i ? 'text-bg' : 'text-muted hover:text-ink'}`}
          >
            {p.curto}
          </button>
        ))}
        <span aria-hidden className="indicador absolute left-0 top-0 h-full rounded-full bg-ink" style={{ width: indicador.w, transform: `translateX(${indicador.x}px)` }} />
      </div>

      <div
        ref={trilho}
        className="carrossel -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[7%] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carrossel"
        aria-label="Projetos pessoais"
      >
        {projetosPessoais.map((p, i) => (
          <div key={p.id} className="carrossel-item w-[86%] shrink-0 snap-center">
            <Cartao p={p} i={i} ativo={atual === i} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="tabular font-mono text-[0.8rem] text-muted">
          <span className="text-ink">{String(atual + 1).padStart(2, '0')}</span> / {String(n).padStart(2, '0')}
        </span>
        <span className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-line">
          <span className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-500" style={{ width: `${((atual + 1) / n) * 100}%` }} />
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => ir(atual - 1)} disabled={atual === 0} aria-label="Projeto anterior" className="ripple grid size-11 place-items-center rounded-full border border-line bg-surface transition active:scale-90 disabled:opacity-35">
            <ArrowLeft size={18} />
          </button>
          <button type="button" onClick={() => ir(atual + 1)} disabled={atual === n - 1} aria-label="Próximo projeto" className="ripple grid size-11 place-items-center rounded-full bg-ink text-bg transition active:scale-90 disabled:opacity-35">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </Secao>
  )
}
