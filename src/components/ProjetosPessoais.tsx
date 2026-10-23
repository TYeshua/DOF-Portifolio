import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Images } from 'lucide-react'
import { projetosPessoais, type ProjetoPessoal } from '../data'
import { Folha } from './Folha'
import { Galeria, Miniatura } from './Galeria'
import { Contador, Secao } from './ui'

const corArea: Record<ProjetoPessoal['area'], string> = {
  'Óleo e gás': 'bg-accent',
  Energia: 'bg-good',
  Software: 'bg-steel',
}

function Meta({ p }: { p: ProjetoPessoal }) {
  return (
    <div className="flex items-center justify-between gap-3 font-mono text-[0.72rem] text-muted">
      <span className="inline-flex items-center gap-1.5 text-ink">
        <span aria-hidden className={`size-2 rounded-full ${corArea[p.area]}`} />
        {p.area}
      </span>
      <span className="tabular">{p.ano}</span>
    </div>
  )
}

// Cartão curto do carrossel: capa, título e subtítulo. Tocar abre os detalhes.
function Cartao({ p, aoAbrir }: { p: ProjetoPessoal; aoAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={aoAbrir}
      aria-haspopup="dialog"
      className="group flex h-full w-full flex-col gap-3 rounded-[22px] border border-line bg-surface p-3.5 text-left transition-[border-color,transform] duration-300 hover:border-steel active:scale-[0.985]"
    >
      <span className="relative flex h-[156px] items-center justify-center overflow-hidden rounded-2xl bg-sunken p-3">
        <Miniatura tela={p.telas[0]} altura={128} />
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-panel/80 px-2 py-0.5 font-mono text-[0.66rem] text-on-panel backdrop-blur">
          <Images aria-hidden size={12} />
          {p.telas.length}
        </span>
      </span>
      <span className="flex flex-col gap-1.5 px-1">
        <Meta p={p} />
        <span className="display text-[1.3rem] leading-[1.12]">{p.titulo}</span>
        <span className="line-clamp-2 text-[0.88rem] leading-snug text-muted">{p.subtitulo}</span>
      </span>
      <span className="mx-1 mt-auto flex items-center justify-between border-t border-line pt-3 text-[0.9rem] font-medium">
        Ver detalhes e telas
        <ArrowUpRight aria-hidden size={17} className="text-accent-ink transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </button>
  )
}

// Conteúdo completo do projeto, dentro da folha que sobe da parte de baixo
function Detalhes({ p, aberto }: { p: ProjetoPessoal; aberto: boolean }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Meta p={p} />
        <p className="text-[0.95rem] leading-snug text-muted">{p.subtitulo}</p>
      </div>

      <Galeria titulo={p.titulo} telas={p.telas} ativo={aberto} altura={250} />

      <p className="justo text-[0.97rem] leading-relaxed">{p.resumo}</p>

      {p.numeros && (
        <div className="grid grid-cols-3 rounded-xl border border-line">
          {p.numeros.map((n, k) => (
            <div key={n.rotulo} className={`flex min-w-0 flex-col gap-1 px-3 py-3 ${k > 0 ? 'border-l border-line' : ''}`}>
              <span className="display tabular text-[1.3rem] leading-none text-accent-ink">
                <Contador valor={n.valor} ativo={aberto} />
              </span>
              <span className="text-[0.72rem] leading-snug text-muted">{n.rotulo}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <h4 className="text-[0.95rem] font-semibold">O que o projeto faz</h4>
        <ul className="flex flex-col gap-2 text-[0.92rem]">
          {p.pontos.map((t) => (
            <li key={t} className="flex gap-2.5">
              <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex flex-wrap gap-1.5" aria-label="Tecnologias">
        {p.tags.map((t) => (
          <li key={t} className="rounded-md bg-sunken px-2 py-0.5 font-mono text-[0.72rem] text-muted">
            {t}
          </li>
        ))}
      </ul>
      {p.nota && <p className="text-[0.76rem] leading-snug text-muted">{p.nota}</p>}
    </div>
  )
}

export function ProjetosPessoais() {
  const trilho = useRef<HTMLDivElement>(null)
  const chips = useRef<HTMLDivElement>(null)
  const conteudo = useRef<HTMLDivElement>(null)
  const [atual, setAtual] = useState(0)
  const [indicador, setIndicador] = useState({ x: 0, w: 0 })
  const [aberto, setAberto] = useState(false)
  // Projeto mostrado na folha; continua montado enquanto ela desce ao fechar
  const [sel, setSel] = useState(0)
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

  const ir = useCallback(
    (i: number, comportamento: ScrollBehavior = 'smooth') => {
      const el = trilho.current
      const alvo = el?.children[Math.max(0, Math.min(n - 1, i))] as HTMLElement | undefined
      if (!el || !alvo) return
      el.scrollTo({ left: alvo.offsetLeft - (el.clientWidth - alvo.offsetWidth) / 2, behavior: comportamento })
    },
    [n],
  )

  const abrir = (i: number) => {
    setSel(i)
    setAberto(true)
  }
  // Trocar de projeto dentro da folha: volta ao topo e alinha o carrossel por trás
  const trocar = (i: number) => {
    setSel(i)
    ir(i, 'auto')
    conteudo.current?.parentElement?.scrollTo({ top: 0 })
  }
  const fechar = useCallback(() => setAberto(false), [])
  const p = projetosPessoais[sel]

  return (
    <Secao id="projetos" rotulo="Projetos pessoais" nota={`${n} projetos`} titulo="Por conta própria">
      <p className="justo revela -mt-1 text-[0.97rem] text-muted">
        Feitos fora das bolsas, para aprender e testar ideias de Digital Oilfield. Deslize para o lado e toque num projeto para ver os detalhes.
      </p>

      <div ref={chips} className="relative -mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Projetos">
        {projetosPessoais.map((q, i) => (
          <button
            key={q.id}
            type="button"
            role="tab"
            aria-selected={atual === i}
            onClick={() => ir(i)}
            className={`relative z-[1] shrink-0 rounded-full px-3.5 py-2 text-[0.84rem] font-medium transition-colors duration-300 ${atual === i ? 'text-bg' : 'text-muted hover:text-ink'}`}
          >
            {q.curto}
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
        {projetosPessoais.map((q, i) => (
          <div key={q.id} className="carrossel-item w-[86%] shrink-0 snap-center" role="group" aria-roledescription="slide" aria-label={`${i + 1} de ${n}: ${q.titulo}`}>
            <Cartao p={q} aoAbrir={() => abrir(i)} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="tabular font-mono text-[0.8rem] text-muted">
          <span className="text-ink">{String(atual + 1).padStart(2, '0')}</span> / {String(n).padStart(2, '0')}
        </span>
        <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-line">
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

      <Folha aberta={aberto} titulo={p.titulo} aoFechar={fechar}>
        <div ref={conteudo}>
          <Detalhes key={p.id} p={p} aberto={aberto} />
          <nav aria-label="Outros projetos" className="mt-7 grid grid-cols-2 gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => trocar(sel - 1)}
              disabled={sel === 0}
              className="flex min-h-14 flex-col items-start justify-center gap-0.5 rounded-xl border border-line bg-surface px-3 text-left transition active:scale-[0.98] disabled:opacity-35"
            >
              <span className="inline-flex items-center gap-1 text-[0.72rem] text-muted">
                <ArrowLeft aria-hidden size={13} /> Anterior
              </span>
              <span className="line-clamp-1 text-[0.85rem] font-medium">{sel > 0 ? projetosPessoais[sel - 1].curto : '—'}</span>
            </button>
            <button
              type="button"
              onClick={() => trocar(sel + 1)}
              disabled={sel === n - 1}
              className="flex min-h-14 flex-col items-end justify-center gap-0.5 rounded-xl border border-line bg-surface px-3 text-right transition active:scale-[0.98] disabled:opacity-35"
            >
              <span className="inline-flex items-center gap-1 text-[0.72rem] text-muted">
                Próximo <ArrowRight aria-hidden size={13} />
              </span>
              <span className="line-clamp-1 text-[0.85rem] font-medium">{sel < n - 1 ? projetosPessoais[sel + 1].curto : '—'}</span>
            </button>
          </nav>
        </div>
      </Folha>
    </Secao>
  )
}
