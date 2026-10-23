import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, MoveHorizontal } from 'lucide-react'
import { trajetoria } from '../data'
import { Regua, TituloRevelado } from './ui'

// Linha do tempo: os cartões deslizam com o dedo, em rolagem horizontal nativa com encaixe.
// A página nunca fica presa, então não há conflito entre rolar para baixo e para o lado.
const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Trajetoria() {
  const secao = useRef<HTMLElement>(null)
  const trilho = useRef<HTMLOListElement>(null)
  const centros = useRef<number[]>([])
  const [atual, setAtual] = useState(0)
  const n = trajetoria.length

  useEffect(() => {
    const s = secao.current
    const t = trilho.current
    if (!s || !t) return
    const itens = Array.from(t.children) as HTMLElement[]
    let largura = 1
    let quadro = 0

    // Lê o layout uma vez (e a cada redimensionamento), nunca durante a rolagem
    const medir = () => {
      largura = t.clientWidth || 1
      centros.current = itens.map((el) => el.offsetLeft + el.offsetWidth / 2)
    }

    const atualizar = () => {
      quadro = 0
      const max = t.scrollWidth - largura
      s.style.setProperty('--p', (max > 0 ? Math.min(1, t.scrollLeft / max) : 0).toFixed(4))
      let melhor = 0
      let menor = Infinity
      itens.forEach((el, i) => {
        const d = Math.abs(centros.current[i] - t.scrollLeft - largura / 2) / largura
        el.style.setProperty('--foco', Math.max(0, 1 - d * 1.6).toFixed(3))
        if (d < menor) {
          menor = d
          melhor = i
        }
      })
      itens.forEach((el, i) => (el.dataset.ativo = String(i === melhor)))
      setAtual(melhor)
    }
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar)
    }
    const aoRedimensionar = () => {
      medir()
      aoRolar()
    }

    medir()
    atualizar()
    t.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRedimensionar)
    document.fonts?.ready.then(aoRedimensionar)

    // Os cartões "espiam" para o lado uma vez, mostrando que deslizam
    let obs: IntersectionObserver | undefined
    if (!reduzMovimento()) {
      obs = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return
          obs?.disconnect()
          if (t.scrollLeft < 4) t.classList.add('espia')
        },
        { threshold: 0.6 },
      )
      obs.observe(t)
    }

    return () => {
      cancelAnimationFrame(quadro)
      t.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRedimensionar)
      obs?.disconnect()
      t.classList.remove('espia')
    }
  }, [])

  const ir = useCallback(
    (i: number) => {
      const t = trilho.current
      if (!t) return
      const k = Math.max(0, Math.min(n - 1, i))
      t.scrollTo({ left: centros.current[k] - t.clientWidth / 2, behavior: reduzMovimento() ? 'auto' : 'smooth' })
    },
    [n],
  )

  return (
    <section ref={secao} id="trajetoria" aria-labelledby="trajetoria-titulo" className="trajetoria gutter flex flex-col gap-5 py-14">
      <header className="revela revela-titulo flex flex-col gap-4">
        <Regua rotulo="Trajetória" nota="2022 – 2027" />
        <h2 id="trajetoria-titulo" className="display text-[2.15rem] leading-[1.05]">
          <TituloRevelado texto="Pesquisa, liderança e formação" />
        </h2>
        <p aria-hidden className="flex items-center gap-2 text-[0.85rem] text-muted">
          <MoveHorizontal size={16} className="dica-icone shrink-0 text-accent-ink" />
          Arraste os cartões para o lado.
        </p>
      </header>

      <div>
        {/* Linha do tempo com marcador que avança */}
        <div aria-hidden className="mb-4 flex flex-col gap-1.5">
          <div className="flex justify-between font-mono text-[0.66rem] text-muted">
            <span>2022</span>
            <span>2027</span>
          </div>
          <div className="relative mx-1.5 h-3">
            <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
            <span className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-accent" style={{ width: 'calc(var(--p, 0) * 100%)' }} />
            <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_5px_color-mix(in_oklab,var(--accent)_22%,transparent)]" style={{ left: 'calc(var(--p, 0) * 100%)' }} />
          </div>
        </div>
        <ol ref={trilho} className="trajetoria-trilho relative flex gap-3" aria-label="Linha do tempo">
          {trajetoria.map((t, i) => (
            <li key={t.cargo} className="trajetoria-cartao w-[80%] shrink-0 snap-center" data-ativo={i === 0}>
              <article className="flex h-full flex-col gap-2 rounded-[18px] border border-line bg-surface p-5">
                <div className="flex items-center justify-between">
                  <span className="tabular rounded-full bg-sunken px-2.5 py-1 font-mono text-[0.72rem] text-ink">{t.periodo}</span>
                  <span aria-hidden className={`size-2.5 rounded-full ${i < 2 ? 'bg-accent' : 'border-2 border-steel'}`} />
                </div>
                <h3 className="display mt-2 text-[1.3rem] leading-[1.15]">{t.cargo}</h3>
                <p className="text-[0.9rem] font-medium text-accent-ink">{t.local}</p>
                <p className="justo text-[0.92rem] leading-relaxed text-muted">{t.texto}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="tabular font-mono text-[0.8rem] text-muted">
          <span className="text-ink">{String(atual + 1).padStart(2, '0')}</span> / {String(n).padStart(2, '0')}
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => ir(atual - 1)} disabled={atual === 0} aria-label="Etapa anterior" className="ripple grid size-11 place-items-center rounded-full border border-line bg-surface transition active:scale-90 disabled:opacity-35">
            <ArrowLeft size={18} />
          </button>
          <button type="button" onClick={() => ir(atual + 1)} disabled={atual === n - 1} aria-label="Próxima etapa" className="ripple grid size-11 place-items-center rounded-full bg-ink text-bg transition active:scale-90 disabled:opacity-35">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}
