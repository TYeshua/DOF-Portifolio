import { useEffect, useRef } from 'react'
import { trajetoria } from '../data'
import { TituloRevelado } from './ui'

// Linha do tempo horizontal: a seção fica presa na tela e a rolagem vertical
// move os cartões para o lado, como uma coluna avançando no poço.
export function Trajetoria() {
  const secao = useRef<HTMLElement>(null)
  const trilho = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const s = secao.current
    const t = trilho.current
    if (!s || !t) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      s.classList.add('sem-fixar')
      return
    }
    let quadro = 0
    const medir = () => {
      const extra = Math.max(0, t.scrollWidth - t.clientWidth)
      s.style.setProperty('--extra', `${extra}px`)
      return extra
    }
    let extra = medir()
    const atualizar = () => {
      quadro = 0
      const r = s.getBoundingClientRect()
      const curso = s.offsetHeight - window.innerHeight
      const p = curso > 0 ? Math.min(1, Math.max(0, -r.top / curso)) : 0
      t.style.transform = `translate3d(${-p * extra}px,0,0)`
      s.style.setProperty('--p', p.toFixed(4))
      Array.from(t.children).forEach((c, i) => {
        const el = c as HTMLElement
        const centro = el.offsetLeft + el.offsetWidth / 2 - p * extra
        const d = Math.abs(centro - t.clientWidth / 2) / t.clientWidth
        el.style.setProperty('--foco', Math.max(0, 1 - d * 1.6).toFixed(3))
        el.dataset.ativo = String(d < 0.3 || (i === 0 && p < 0.05))
      })
    }
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar)
    }
    const aoRedimensionar = () => {
      extra = medir()
      aoRolar()
    }
    atualizar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRedimensionar)
    document.fonts?.ready.then(aoRedimensionar)
    return () => {
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRedimensionar)
    }
  }, [])

  return (
    <section ref={secao} id="trajetoria" aria-labelledby="trajetoria-titulo" className="trajetoria relative">
      <div className="trajetoria-palco sticky flex flex-col justify-center gap-6 overflow-hidden">
        <header className="gutter revela revela-titulo flex flex-col gap-1.5">
          <p className="label flex items-center gap-2 text-accent-ink">
            <span aria-hidden className="traco-rotulo h-px w-6 bg-accent" />
            Trajetória
          </p>
          <h2 id="trajetoria-titulo" className="display text-[2.15rem] leading-[1.05]">
            <TituloRevelado texto="Pesquisa, liderança e formação" />
          </h2>
        </header>

        <div className="gutter relative">
          {/* Linha do tempo com marcador que avança */}
          <div aria-hidden className="relative mb-4 h-6">
            <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
            <span className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-accent" style={{ width: 'calc(var(--p, 0) * 100%)' }} />
            <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_5px_color-mix(in_oklab,var(--accent)_22%,transparent)]" style={{ left: 'calc(var(--p, 0) * 100%)' }} />
            <span className="absolute -top-1 left-0 font-mono text-[0.66rem] text-muted">2022</span>
            <span className="absolute -top-1 right-0 font-mono text-[0.66rem] text-muted">2027</span>
          </div>
          <ol ref={trilho} className="trajetoria-trilho flex gap-3 will-change-transform">
            {trajetoria.map((t, i) => (
              <li key={t.cargo} className="trajetoria-cartao w-[78%] shrink-0" data-ativo={i === 0}>
                <article className="flex h-full flex-col gap-2 rounded-[22px] border border-line bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <span className="tabular rounded-full bg-sunken px-2.5 py-1 font-mono text-[0.72rem] text-ink">{t.periodo}</span>
                    <span aria-hidden className={`size-2.5 rounded-full ${i < 2 ? 'bg-accent' : 'border-2 border-steel'}`} />
                  </div>
                  <h3 className="display mt-2 text-[1.3rem] leading-[1.15]">{t.cargo}</h3>
                  <p className="text-[0.9rem] font-medium text-accent-ink">{t.local}</p>
                  <p className="text-[0.92rem] leading-relaxed text-muted">{t.texto}</p>
                  <span className="mt-auto pt-3 font-mono text-[0.7rem] text-muted">
                    {String(i + 1).padStart(2, '0')} / {String(trajetoria.length).padStart(2, '0')}
                  </span>
                </article>
              </li>
            ))}
          </ol>
        </div>
        <p aria-hidden className="gutter dica-rolagem font-mono text-[0.7rem] text-muted">Continue rolando ↓ a linha do tempo anda para o lado</p>
      </div>
    </section>
  )
}
